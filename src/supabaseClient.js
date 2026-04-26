import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const key = import.meta.env.VITE_SUPABASE_ANON_KEY

export const isSupabaseConfigured = !!(
  url && key &&
  url.startsWith('https://') &&
  !url.includes('your-project')
)

export const supabase = isSupabaseConfigured ? createClient(url, key) : null
