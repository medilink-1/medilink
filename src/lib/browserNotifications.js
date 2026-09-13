// Browser-native "desktop" notifications for reminders (course-end
// medication reminders, vaccination due/scheduled notices). This is
// deliberately scoped to the standard Notification API -- a local,
// permission-gated popup the browser shows while MediLink is open (or,
// on some platforms, briefly after) -- not a true server push or email
// notification. Sending an actual push/email notification needs a
// backend with a third-party provider key (e.g. web-push, an email
// service) that this client-side app does not have and should not
// pretend to have.

const STORAGE_KEY_ENABLED = 'medilink_notifications_enabled'
const STORAGE_KEY_SEEN = 'medilink_notified_ids'
const MAX_SEEN_HISTORY = 200

export function isNotificationSupported() {
  return typeof window !== 'undefined' && 'Notification' in window
}

export function getNotificationPreference() {
  try {
    return typeof localStorage !== 'undefined' && localStorage.getItem(STORAGE_KEY_ENABLED) === 'true'
  } catch {
    return false
  }
}

export function setNotificationPreference(enabled) {
  try {
    localStorage.setItem(STORAGE_KEY_ENABLED, enabled ? 'true' : 'false')
  } catch {
    // Private browsing / storage blocked -- the preference just won't persist.
  }
}

export async function requestNotificationPermission() {
  if (!isNotificationSupported()) return 'unsupported'
  if (Notification.permission === 'granted') return 'granted'
  if (Notification.permission === 'denied') return 'denied'
  return Notification.requestPermission()
}

function getSeenIds() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_SEEN)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function rememberSeen(seenIds, newIds) {
  const merged = [...seenIds, ...newIds]
  // Cap growth so this never becomes an unbounded localStorage entry.
  return merged.slice(-MAX_SEEN_HISTORY)
}

/**
 * @param {string[]} seenIds
 * @param {{id: string}[]} items
 * @returns {{id: string}[]} items not already present in seenIds
 */
export function pickUnnotified(seenIds, items) {
  const seen = new Set(seenIds)
  return items.filter((item) => !seen.has(item.id))
}

// Shows a browser notification for each reminder not already notified
// about, and remembers which ones it has shown so the same reminder
// doesn't pop up again on every page load. Does nothing if the browser
// doesn't support notifications, permission hasn't been granted, or
// the patient has turned this off.
export function notifyNewReminders(items) {
  if (!isNotificationSupported()) return
  if (Notification.permission !== 'granted') return
  if (!getNotificationPreference()) return

  const seenIds = getSeenIds()
  const fresh = pickUnnotified(seenIds, items)
  if (fresh.length === 0) return

  fresh.forEach((item) => {
    try {
      // eslint-disable-next-line no-new
      new Notification('MediLink', { body: item.text, tag: item.id })
    } catch {
      // Some browsers restrict `new Notification()` in certain
      // contexts (e.g. requiring a service worker) -- fail silently
      // rather than crashing the app over a nice-to-have.
    }
  })

  try {
    localStorage.setItem(STORAGE_KEY_SEEN, JSON.stringify(rememberSeen(seenIds, fresh.map((i) => i.id))))
  } catch {
    // Non-fatal -- worst case, an already-shown reminder pops up again next time.
  }
}
