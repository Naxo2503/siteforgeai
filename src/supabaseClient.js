import { createClient } from '@supabase/supabase-js'

// ═══════════════════════════════════════════════════
// REMPLACE CES VALEURS par celles de ton projet Supabase
// Dashboard → Settings → API
// ═══════════════════════════════════════════════════
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'VITE_SUPABASE_URL'
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'VITE_SUPABASE_ANON_KEY'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
