import { createClient } from '@supabase/supabase-js'

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')

  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const expectedToken = process.env.TRACKY_HEALTH_SYNC_TOKEN
  const suppliedToken = req.headers.authorization?.replace(/^Bearer\s+/i, '') || req.body?.token
  if (!expectedToken || suppliedToken !== expectedToken) {
    return res.status(401).json({ error: 'Invalid sync token' })
  }

  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!supabaseUrl || !serviceKey) {
    return res.status(500).json({ error: 'Health sync is not configured' })
  }

  const { userId, date, weight, workouts } = req.body || {}
  if (!userId || !date) return res.status(400).json({ error: 'Missing userId or date' })

  const supabase = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })

  try {
    const { data: existing, error: readError } = await supabase
      .from('daily_logs')
      .select('meals, workout, weight')
      .eq('user_id', userId)
      .eq('date', date)
      .maybeSingle()

    if (readError) throw readError

    const nextWorkouts = Array.isArray(workouts)
      ? workouts.map((workout, index) => ({
          id: workout.id || `health-${date}-${index}-${workout.time || ''}`,
          type: workout.type || 'Workout',
          duration: workout.duration || '',
          time: workout.time || '',
          source: 'Apple Health',
        }))
      : (Array.isArray(existing?.workout) ? existing.workout : existing?.workout?.type ? [existing.workout] : [])

    const payload = {
      user_id: userId,
      date,
      meals: existing?.meals || {},
      workout: nextWorkouts,
      weight: weight !== undefined && weight !== null && weight !== '' ? String(weight) : (existing?.weight || null),
      updated_at: new Date().toISOString(),
    }

    const { error: writeError } = await supabase
      .from('daily_logs')
      .upsert(payload, { onConflict: 'user_id,date' })

    if (writeError) throw writeError

    return res.status(200).json({
      success: true,
      date,
      synced: {
        weight: payload.weight,
        workouts: nextWorkouts.length,
      },
    })
  } catch (error) {
    console.error('Health sync failed:', error)
    return res.status(500).json({ error: error.message || 'Health sync failed' })
  }
}
