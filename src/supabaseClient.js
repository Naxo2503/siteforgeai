import { createClient } from '@supabase/supabase-js'

// ═══════════════════════════════════════════════════
// REMPLACE CES VALEURS par celles de ton projet Supabase
// Dashboard → Settings → API
// ═══════════════════════════════════════════════════
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://XXXXXX.supabase.co'
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyXXXXXX'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
