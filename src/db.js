import { supabase } from './supabaseClient'

async function hashPin(pin) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(pin))
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('')
}

/* ─── Users ─────────────────────────────────────────────────────────────── */

export async function getUsers() {
  const { data, error } = await supabase
    .from('users')
    .select('id, name, lang, skin, created_at')
    .order('created_at', { ascending: true })
  if (error) { console.error('getUsers:', error); return [] }
  return data || []
}

export async function createUser({ name, pin, lang = 'en', skin = 'green' }) {
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
  const { error } = await supabase
    .from('users')
    .update({ lang, skin })
    .eq('id', userId)
  if (error) console.error('updateUserPrefs:', error)
}

/* ─── Daily logs ─────────────────────────────────────────────────────────── */

export async function getUserData(userId) {
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
  const { data, error } = await supabase
    .from('presets')
    .select('*')
    .eq('user_id', userId)
    .order('saved_at', { ascending: false })
  if (error) { console.error('getPresets:', error); return [] }
  return data || []
}

export async function addPreset(userId, preset) {
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
  // normalise field names to match local usage
  return { ...data, slotId: data.slot_id }
}

export async function deletePreset(id) {
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
        // already uploaded or no base64 to upload
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
