import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    detectSessionInUrl: true,
    persistSession: true,
    flowType: 'implicit',
  },
})

type AuthCallback = (event: string, session: any) => void
let authCallback: AuthCallback | null = null

supabase.auth.onAuthStateChange((event, session) => {
  console.log('Auth event:', event)
  if (authCallback) {
    authCallback(event, session)
  }
})

export function setAuthCallback(cb: AuthCallback) {
  authCallback = cb
}

export function clearAuthCallback() {
  authCallback = null
}