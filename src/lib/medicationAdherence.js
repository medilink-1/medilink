// Pure helpers for the daily medication adherence checklist: a simple
// once-a-day "did I take this medicine today" checkbox, computed from
// medication_doses rows (one row per medication per calendar day).
//
// This is deliberately coarse -- one checkbox per medication per day,
// regardless of how many times a day it's actually taken -- and is a
// separate feature from the automatic course-end reminders in
// medicationReminders.js (which watch a course's end date, not daily
// adherence).

export function todayDateStr(now = new Date()) {
  // Local calendar date, not UTC, so "today" matches the date on the
  // patient's own clock rather than shifting at UTC midnight.
  const y = now.getFullYear()
  const m = String(now.getMonth() + 1).padStart(2, '0')
  const d = String(now.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function isTakenOn(doses, medicationId, dateStr) {
  return doses.some((d) => d.medication_id === medicationId && d.dose_date === dateStr && d.taken_at)
}

/**
 * Counts consecutive days (ending today, or yesterday if today hasn't
 * been marked yet) that a medication's dose was recorded as taken. An
 * unmarked "today" doesn't zero out an otherwise-intact streak, since
 * the day isn't over yet.
 */
export function getStreak(doses, medicationId, referenceDateStr = todayDateStr()) {
  const takenDates = new Set(
    doses.filter((d) => d.medication_id === medicationId && d.taken_at).map((d) => d.dose_date)
  )
  let streak = 0
  const cursor = new Date(`${referenceDateStr}T00:00:00`)
  if (!takenDates.has(referenceDateStr)) {
    cursor.setDate(cursor.getDate() - 1)
  }
  // Cap the walk-back so a very old/empty dataset can't loop forever.
  for (let i = 0; i < 3650; i += 1) {
    const key = todayDateStr(cursor)
    if (!takenDates.has(key)) break
    streak += 1
    cursor.setDate(cursor.getDate() - 1)
  }
  return streak
}

/**
 * @param {any[]} medications
 * @param {any[]} doses
 * @param {string} dateStr
 * @returns {{items: {medicationId: string, name: string, dose: string|null, taken: boolean, streak: number}[], takenCount: number, total: number}}
 */
export function getChecklist(medications = [], doses = [], dateStr = todayDateStr()) {
  const active = medications.filter((m) => m.status === 'active')
  const items = active.map((m) => ({
    medicationId: m.id,
    name: m.name,
    dose: m.dose || null,
    taken: isTakenOn(doses, m.id, dateStr),
    streak: getStreak(doses, m.id, dateStr),
  }))
  return {
    items,
    takenCount: items.filter((i) => i.taken).length,
    total: items.length,
  }
}
