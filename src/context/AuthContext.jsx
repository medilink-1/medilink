import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabaseClient'
import { seedDemoDataIfNeeded } from '../lib/seedDemoData'

const AuthContext = createContext(undefined)

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  // Loads this user's profile row -- and, if one doesn't exist, creates it
  // from the auth user's own metadata before giving up. A missing row here
  // is always a symptom of something upstream: the sign-up flow's own
  // profile insert can be silently rejected by RLS if it runs before the
  // session is fully established (e.g. while email confirmation is
  // pending), or the row can vanish if an account was deleted and the
  // browser still holds a session for it. Either way, a signed-in user
  // should never be permanently stuck with no profile, so this self-heals
  // instead of surfacing a confusing "foreign key" error the next time the
  // app tries to write anything tied to their profile.
  const loadProfile = useCallback(async (userId, authUser) => {
    if (!userId) {
      setProfile(null)
      return
    }
    let { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle()

    if (!error && !data) {
      const meta = authUser?.user_metadata || {}
      const created = await supabase
        .from('profiles')
        .upsert({ id: userId, full_name: meta.full_name || null, email: authUser?.email || null, role: 'Patient' })
        .select()
        .single()
      data = created.data
      error = created.error
      if (!error) await seedDemoDataIfNeeded(userId)
    }

    setProfile(error ? null : data)
  }, [])

  useEffect(() => {
    let mounted = true

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!mounted) return
      setSession(session)
      loadProfile(session?.user?.id, session?.user)
      setLoading(false)
    })

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      loadProfile(session?.user?.id, session?.user)
    })

    return () => {
      mounted = false
      listener.subscription.unsubscribe()
    }
  }, [loadProfile])

  const signUp = async ({ email, password, fullName }) => {
    // Explicit emailRedirectTo so the "confirm your email" link lands back
    // on this exact deployment (origin + base path, e.g. GitHub Pages'
    // /medilink/ subpath) instead of falling back to whatever "Site URL"
    // happens to be configured in the Supabase dashboard -- without this,
    // confirmation links can 404 on project sites served from a subpath.
    const emailRedirectTo = `${window.location.origin}${import.meta.env.BASE_URL}`
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName }, emailRedirectTo },
    })
    if (error) throw error

    // Create the matching profile row. If email confirmation is on, this
    // still runs because signUp returns a user immediately.
    if (data.user) {
      await supabase.from('profiles').upsert({
        id: data.user.id,
        full_name: fullName,
        email,
        role: 'Patient',
      })
      // Populate the account with the demo longitudinal health record
      // described in the MediLink brief, so the prototype is immediately
      // browsable end to end.
      await seedDemoDataIfNeeded(data.user.id)
    }
    return data
  }

  const signIn = async ({ email, password }) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
    if (data.user) await seedDemoDataIfNeeded(data.user.id)
    return data
  }

  const signOut = async () => {
    await supabase.auth.signOut()
  }

  const value = {
    session,
    user: session?.user ?? null,
    profile,
    loading,
    signUp,
    signIn,
    signOut,
    refreshProfile: () => loadProfile(session?.user?.id),
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (ctx === undefined) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
