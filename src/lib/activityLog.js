import { supabase } from './supabaseClient.js'

// Best-effort activity logging: writes a row to activity_log so the
// patient can see, on their Data & Privacy page, what's happened to
// their own account (profile edits, share links created/revoked).
// This is a client-side convenience log, not a security control, so a
// failure here (e.g. the activity_log migration hasn't been run yet
// in this Supabase project) is swallowed rather than surfaced --
// nothing else about the app should ever depend on it succeeding.
export async function logActivity(userId, eventType, detail = null) {
  if (!userId || !eventType) return
  try {
    await supabase.from('activity_log').insert({ user_id: userId, event_type: eventType, detail })
  } catch {
    // Ignored -- see note above.
  }
}

export { describeActivity } from './activityLabels.js'
