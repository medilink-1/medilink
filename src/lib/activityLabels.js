// Human-readable label for each activity_log event_type: the ones this
// app writes client-side (profile edits, share link create/revoke,
// Emergency QR set/revoke), plus the ones the get_shared_health_summary()
// SQL function writes on behalf of an anonymous visitor (share_link /
// emergency_qr viewed, and their *_pin_failed counterparts).
//
// Deliberately its own file with no other imports, so it can be unit
// tested without pulling in the Supabase client (see activityLog.js).
const EVENT_LABELS = {
  profile_updated: 'Profile updated',
  share_link_created: 'Share link created',
  share_link_revoked: 'Share link revoked',
  share_link_viewed: 'Share link viewed',
  share_link_pin_failed: 'Share link: incorrect PIN entered',
  emergency_qr_created: 'Emergency QR PIN set',
  emergency_qr_revoked: 'Emergency QR turned off',
  emergency_qr_viewed: 'Emergency QR viewed',
  emergency_qr_pin_failed: 'Emergency QR: incorrect PIN entered',
}

export function describeActivity(entry) {
  return EVENT_LABELS[entry.event_type] || entry.event_type
}
