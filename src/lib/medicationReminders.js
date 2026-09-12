// Computes simple, honest medication reminders from a medication's
// recorded `duration` (free text, e.g. "7 days") and its `created_at`
// timestamp. Durations MediLink cannot parse (e.g. "until symptoms
// resolve", "ongoing") are silently skipped rather than guessed at --
// no reminder is better than a wrong one.

const UNIT_MS = {
  day: 24 * 60 * 60 * 1000,
  week: 7 * 24 * 60 * 60 * 1000,
  month: 30 * 24 * 60 * 60 * 1000, // approximate on purpose
}

function parseDurationMs(duration) {
  if (!duration) return null
  const match = duration.match(/(\d+)\s*(day|week|month)s?/i)
  if (!match) return null
  const amount = parseInt(match[1], 10)
  const unit = match[2].toLowerCase()
  return amount * UNIT_MS[unit]
}

/**
 * @param {any[]} medications
 * @returns {{id: string, medicationId: string, name: string, daysLeft: number, text: string}[]}
 */
export function getMedicationReminders(medications = []) {
  const now = Date.now()
  return medications
    .filter((m) => m.status === 'active' && m.created_at)
    .map((m) => {
      const durationMs = parseDurationMs(m.duration)
      if (durationMs === null) return null
      const endDate = new Date(m.created_at).getTime() + durationMs
      const daysLeft = Math.ceil((endDate - now) / (24 * 60 * 60 * 1000))
      // Only surface reminders in a tight window around the course end --
      // far in the future or long past isn't a "reminder" anymore.
      if (daysLeft > 3 || daysLeft < -3) return null
      const text =
        daysLeft > 0
          ? `Your course of ${m.name} ends in ${daysLeft} day${daysLeft === 1 ? '' : 's'} — plan a refill or review with your doctor.`
          : daysLeft === 0
          ? `Your course of ${m.name} ends today — plan a refill or review with your doctor.`
          : `Your course of ${m.name} may have ended — review whether to continue, stop, or refill.`
      return { id: `med-${m.id}`, medicationId: m.id, name: m.name, daysLeft, text }
    })
    .filter(Boolean)
}
