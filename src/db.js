import { supabase, isSupabaseConfigured } from './supabaseClient'

async function hashPin(pin) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(pin))
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('')
}

function lsGet(key, fallback = null) {
  try { return JSON.parse(localStorage.getItem(`tracky-db-${key}`) ?? 'null') ?? fallback }
  catch { return fallback }
}

function lsSet(key, value) {
  try { localStorage.setItem(`tracky-db-${key}`, JSON.stringify(value)) } catch {}
}

async function localUsers() { return lsGet('users', []) }

async function localCreateUser({ name, pin, lang = 'en', skin = 'forest' }) {
  const users = lsGet('users', [])
  if (users.some(u => u.name.toLowerCase() === name.toLowerCase())) throw new Error('Name already taken')
  const user = {
    id: Date.now().toString(),
    name,
    pin_hash: await hashPin(pin),
    lang,
    skin,
    created_at: new Date().toISOString(),
  }
  lsSet('users', [...users, user])
  const { pin_hash: _, ...safe } = user
  return safe
}

async function localVerifyUser(userId, pin) {
  const pinHash = await hashPin(pin)
  const user = lsGet('users', []).find(u => u.id === userId && u.pin_hash === pinHash)
  if (!user) return null
  const { pin_hash: _, ...safe } = user
  return safe
}

async function localUpdateUserPrefs(userId, prefs) {
  lsSet('users', lsGet('users', []).map(u => u.id === userId ? { ...u, ...prefs } : u))
}

async function localGetUserData(userId) { return lsGet(`data-${userId}`, {}) }

async function localSaveDayData(userId, date, dayData) {
  const data = lsGet(`data-${userId}`, {})
  const next = { ...data, [date]: dayData }
  lsSet(`data-${userId}`, next)
  return dayData
}

export async function getUsers() {
  if (!isSupabaseConfigured) return localUsers()
  try {
    const { data, error } = await supabase
      .from('users')
      .select('id, name, lang, skin, created_at')
      .order('created_at', { ascending: true })
    if (error) throw error
    const remote = data || []
    const local = await localUsers()
    const ids = new Set(remote.map(u => u.id))
    return [...remote, ...local.filter(u => !ids.has(u.id))]
  } catch (error) {
    console.warn('Supabase getUsers failed, using localStorage:', error.message)
    return localUsers()
  }
}

export async function createUser({ name, pin, lang = 'en', skin = 'forest' }) {
  if (!isSupabaseConfigured) return localCreateUser({ name, pin, lang, skin })
  try {
    const id = Date.now().toString()
    const pin_hash = await hashPin(pin)
    const { data, error } = await supabase
      .from('users')
      .insert({ id, name, pin_hash, lang, skin })
      .select('id, name, lang, skin, created_at')
      .single()
    if (error) throw error
    return data
  } catch (error) {
    console.warn('Supabase createUser failed, using localStorage:', error.message)
    return localCreateUser({ name, pin, lang, skin })
  }
}

export async function verifyUser(userId, pin) {
  if (!isSupabaseConfigured) return localVerifyUser(userId, pin)
  try {
    const pin_hash = await hashPin(pin)
    const { data, error } = await supabase
      .from('users')
      .select('id, name, lang, skin, created_at')
      .eq('id', userId)
      .eq('pin_hash', pin_hash)
      .single()
    if (error && error.code !== 'PGRST116') throw error
    if (data) return data
    return localVerifyUser(userId, pin)
  } catch (error) {
    console.warn('Supabase verifyUser failed, using localStorage:', error.message)
    return localVerifyUser(userId, pin)
  }
}

export async function updateUserPrefs(userId, prefs) {
  if (!isSupabaseConfigured) return localUpdateUserPrefs(userId, prefs)
  try {
    const { error } = await supabase.from('users').update(prefs).eq('id', userId)
    if (error) throw error
  } catch (error) {
    console.warn('Supabase updateUserPrefs failed, using localStorage:', error.message)
    return localUpdateUserPrefs(userId, prefs)
  }
}

export async function getUserData(userId) {
  if (!isSupabaseConfigured) return localGetUserData(userId)
  try {
    const { data, error } = await supabase
      .from('daily_logs')
      .select('date, meals, workout, weight')
      .eq('user_id', userId)
    if (error) throw error
    return Object.fromEntries((data || []).map(row => [row.date, {
      meals: row.meals || {},
      workout: row.workout || null,
      workouts: Array.isArray(row.workout) ? row.workout : undefined,
      weight: row.weight || '',
    }]))
  } catch (error) {
    console.warn('Supabase getUserData failed, using localStorage:', error.message)
    return localGetUserData(userId)
  }
}

export async function saveDayData(userId, date, dayData) {
  if (!isSupabaseConfigured) return localSaveDayData(userId, date, dayData)
  try {
    const processed = await uploadNewMealPhotos(userId, date, dayData)
    const { error } = await supabase
      .from('daily_logs')
      .upsert({
        user_id: userId,
        date,
        meals: processed.meals || {},
        workout: processed.workouts || [],
        weight: processed.weight || null,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id,date' })
    if (error) throw error
    return processed
  } catch (error) {
    console.warn('Supabase saveDayData failed, using localStorage:', error.message)
    return localSaveDayData(userId, date, dayData)
  }
}

async function uploadNewMealPhotos(userId, date, dayData) {
  const meals = dayData.meals || {}
  const updatedMeals = {}

  for (const [mealId, meal] of Object.entries(meals)) {
    const photos = meal?.photos || []
    const uploaded = []
    for (const photo of photos) {
      if (photo.url || !photo.base64) {
        const { base64: _, imageUrl: __, ...rest } = photo
        uploaded.push(rest)
        continue
      }
      try {
        const url = await uploadPhoto(userId, date, mealId, photo)
        uploaded.push({ url, mediaType: 'image/jpeg' })
      } catch (error) {
        console.error('Photo upload failed; keeping local image:', error)
        uploaded.push(photo)
      }
    }
    updatedMeals[mealId] = { ...meal, photos: uploaded }
  }

  return { ...dayData, meals: updatedMeals }
}

async function uploadPhoto(userId, date, mealId, photo) {
  const path = `${userId}/${date}/${mealId}/${Date.now()}.jpg`
  const blob = await fetch(`data:${photo.mediaType || 'image/jpeg'};base64,${photo.base64}`).then(r => r.blob())
  const { error } = await supabase.storage
    .from('meal-photos')
    .upload(path, blob, { contentType: 'image/jpeg', upsert: false })
  if (error) throw error
  const { data } = supabase.storage.from('meal-photos').getPublicUrl(path)
  return data.publicUrl
}
