import { supabase, isSupabaseConfigured } from './supabaseClient'

/* ─── PIN hashing ─────────────────────────────────────────────────────────── */

async function hashPin(pin) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(pin))
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('')
}

/* ─── localStorage fallback ──────────────────────────────────────────────── */
// Used automatically when VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY are not set.

function lsGet(key, def = null) {
  try { return JSON.parse(localStorage.getItem(`tracky-db-${key}`) ?? 'null') ?? def } catch { return def }
}
function lsSet(key, val) {
  try { localStorage.setItem(`tracky-db-${key}`, JSON.stringify(val)) } catch {}
}

async function ls_getUsers() {
  return lsGet('users', [])
}

async function ls_createUser({ name, pin, lang = 'en', skin = 'green' }) {
  const users = lsGet('users', [])
  if (users.find(u => u.name.toLowerCase() === name.toLowerCase()))
    throw new Error('Name already taken')
  const pin_hash = await hashPin(pin)
  const user = { id: Date.now().toString(), name, pin_hash, lang, skin, created_at: new Date().toISOString() }
  lsSet('users', [...users, user])
  const { pin_hash: _h, ...safe } = user
  return safe
}

async function ls_verifyUser(userId, pin) {
  const pin_hash = await hashPin(pin)
  const user = lsGet('users', []).find(u => u.id === userId && u.pin_hash === pin_hash)
  if (!user) return null
  const { pin_hash: _h, ...safe } = user
  return safe
}

async function ls_updateUserPrefs(userId, prefs) {
  const users = lsGet('users', []).map(u => u.id === userId ? { ...u, ...prefs } : u)
  lsSet('users', users)
}

async function ls_getUserData(userId) {
  return lsGet(`data-${userId}`, {})
}

async function ls_saveDayData(userId, date, dayData) {
  const data = lsGet(`data-${userId}`, {})
  lsSet(`data-${userId}`, { ...data, [date]: dayData })
}

async function ls_getPresets(userId) {
  return lsGet(`presets-${userId}`, [])
}

async function ls_addPreset(userId, preset) {
  const presets = lsGet(`presets-${userId}`, [])
  const newPreset = {
    ...preset,
    id: Date.now().toString(),
    user_id: userId,
    slotId: preset.slotId,
    saved_at: new Date().toISOString(),
  }
  lsSet(`presets-${userId}`, [newPreset, ...presets])
  return newPreset
}

async function ls_deletePreset(presetId) {
  for (const key of Object.keys(localStorage)) {
    if (!key.startsWith('tracky-db-presets-')) continue
    try {
      const presets = JSON.parse(localStorage.getItem(key) || '[]')
      const filtered = presets.filter(p => p.id !== presetId)
      if (filtered.length !== presets.length) {
        localStorage.setItem(key, JSON.stringify(filtered))
        return
      }
    } catch {}
  }
}

/* ─── Users ─────────────────────────────────────────────────────────────── */

export async function getUsers() {
  if (!isSupabaseConfigured) return ls_getUsers()
  const { data, error } = await supabase
    .from('users')
    .select('id, name, lang, skin, created_at')
    .order('created_at', { ascending: true })
  if (error) { console.error('getUsers:', error); return [] }
  return data || []
}

export async function createUser({ name, pin, lang = 'en', skin = 'green' }) {
  if (!isSupabaseConfigured) return ls_createUser({ name, pin, lang, skin })
  const id = Date.now().toString()
  const pin_hash = await hashPin(pin)
  const { data, error } = await supabase
    .from('users')
    .insert({ id, name, pin_hash, lang, skin })
    .select('id, name, lang, skin, created_at')
    .single()
  if (error) throw new Error(error.message)
  return data
}

export async function verifyUser(userId, pin) {
  if (!isSupabaseConfigured) return ls_verifyUser(userId, pin)
  const pin_hash = await hashPin(pin)
  const { data, error } = await supabase
    .from('users')
    .select('id, name, lang, skin, created_at')
    .eq('id', userId)
    .eq('pin_hash', pin_hash)
    .single()
  if (error || !data) return null
  return data
}

export async function updateUserPrefs(userId, { lang, skin }) {
  if (!isSupabaseConfigured) return ls_updateUserPrefs(userId, { lang, skin })
  const { error } = await supabase
    .from('users')
    .update({ lang, skin })
    .eq('id', userId)
  if (error) console.error('updateUserPrefs:', error)
}

/* ─── Daily logs ─────────────────────────────────────────────────────────── */

export async function getUserData(userId) {
  if (!isSupabaseConfigured) return ls_getUserData(userId)
  const { data, error } = await supabase
    .from('daily_logs')
    .select('date, meals, workout, weight')
    .eq('user_id', userId)
  if (error) { console.error('getUserData:', error); return {} }
  return Object.fromEntries(
    (data || []).map(row => [
      row.date,
      { meals: row.meals || {}, workout: row.workout || {}, weight: row.weight || '' }
    ])
  )
}

export async function saveDayData(userId, date, dayData) {
  if (!isSupabaseConfigured) return ls_saveDayData(userId, date, dayData)
  const processedDay = await _uploadPhotosInDay(userId, date, dayData)
  const { error } = await supabase
    .from('daily_logs')
    .upsert(
      {
        user_id: userId,
        date,
        meals: processedDay.meals || {},
        workout: processedDay.workout || null,
        weight: processedDay.weight || null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id,date' }
    )
  if (error) console.error('saveDayData:', error)
}

/* ─── Presets ────────────────────────────────────────────────────────────── */

export async function getPresets(userId) {
  if (!isSupabaseConfigured) return ls_getPresets(userId)
  const { data, error } = await supabase
    .from('presets')
    .select('*')
    .eq('user_id', userId)
    .order('saved_at', { ascending: false })
  if (error) { console.error('getPresets:', error); return [] }
  return data || []
}

export async function addPreset(userId, preset) {
  if (!isSupabaseConfigured) return ls_addPreset(userId, preset)
  const { data, error } = await supabase
    .from('presets')
    .insert({
      user_id: userId,
      name: preset.name,
      slot_id: preset.slotId,
      description: preset.description || '',
      ingredients: preset.ingredients || [],
      totals: preset.totals || {},
      saved_at: new Date().toISOString(),
    })
    .select()
    .single()
  if (error) throw new Error(error.message)
  return { ...data, slotId: data.slot_id }
}

export async function deletePreset(id) {
  if (!isSupabaseConfigured) return ls_deletePreset(id)
  const { error } = await supabase.from('presets').delete().eq('id', id)
  if (error) console.error('deletePreset:', error)
}

/* ─── Photos (Supabase Storage) ──────────────────────────────────────────── */

export async function uploadPhoto(userId, date, slotId, base64) {
  const path = `${userId}/${date}/${slotId}/${Date.now()}.jpg`
  const blob = await fetch(`data:image/jpeg;base64,${base64}`).then(r => r.blob())
  const { error } = await supabase.storage
    .from('meal-photos')
    .upload(path, blob, { contentType: 'image/jpeg', upsert: false })
  if (error) throw new Error(error.message)
  const { data } = supabase.storage.from('meal-photos').getPublicUrl(path)
  return data.publicUrl
}

/* ─── Internal helpers ───────────────────────────────────────────────────── */

async function _uploadPhotosInDay(userId, date, dayData) {
  const meals = dayData.meals || {}
  const updatedMeals = {}

  for (const [slotId, entry] of Object.entries(meals)) {
    if (!entry?.photos?.length) { updatedMeals[slotId] = entry; continue }

    const updatedPhotos = await Promise.all(
      entry.photos.map(async photo => {
        if (photo.url || !photo.base64) {
          const { base64: _b, imageUrl: _i, mediaType: _m, ...rest } = photo
          return rest
        }
        try {
          const url = await uploadPhoto(userId, date, slotId, photo.base64)
          const { base64: _b, imageUrl: _i, mediaType: _m, ...rest } = photo
          return { ...rest, url }
        } catch (e) {
          console.error('Photo upload failed, keeping base64:', e)
          return photo
        }
      })
    )
    updatedMeals[slotId] = { ...entry, photos: updatedPhotos }
  }

  return { ...dayData, meals: updatedMeals }
}
