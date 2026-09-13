import { test, describe } from 'node:test'
import assert from 'node:assert/strict'
import { getMedicationReminders } from './medicationReminders.js'

const DAY_MS = 24 * 60 * 60 * 1000

function startedDaysAgo(days) {
  return new Date(Date.now() - days * DAY_MS).toISOString()
}

describe('getMedicationReminders', () => {
  test('reminds within the window before a course ends', () => {
    const reminders = getMedicationReminders([
      { id: '1', name: 'Amoxicillin', status: 'active', duration: '7 days', created_at: startedDaysAgo(5) },
    ])
    assert.equal(reminders.length, 1)
    assert.equal(reminders[0].daysLeft, 2)
    assert.match(reminders[0].text, /ends in 2 days/)
  })

  test('uses singular "day" when exactly one day remains', () => {
    const reminders = getMedicationReminders([
      { id: '1', name: 'Amoxicillin', status: 'active', duration: '7 days', created_at: startedDaysAgo(6) },
    ])
    assert.match(reminders[0].text, /ends in 1 day\b/)
  })

  test('says "ends today" when the course ends today', () => {
    const reminders = getMedicationReminders([
      { id: '1', name: 'Amoxicillin', status: 'active', duration: '7 days', created_at: startedDaysAgo(7) },
    ])
    assert.match(reminders[0].text, /ends today/)
  })

  test('stays silent once a course is far in the past (outside the review window)', () => {
    const reminders = getMedicationReminders([
      { id: '1', name: 'Amoxicillin', status: 'active', duration: '7 days', created_at: startedDaysAgo(20) },
    ])
    assert.equal(reminders.length, 0)
  })

  test('stays silent long before a course is due to end', () => {
    const reminders = getMedicationReminders([
      { id: '1', name: 'Amoxicillin', status: 'active', duration: '30 days', created_at: startedDaysAgo(1) },
    ])
    assert.equal(reminders.length, 0)
  })

  test('never guesses at a duration it cannot parse', () => {
    const reminders = getMedicationReminders([
      { id: '1', name: 'Metformin', status: 'active', duration: 'ongoing', created_at: startedDaysAgo(1) },
      { id: '2', name: 'Amlodipine', status: 'active', duration: null, created_at: startedDaysAgo(1) },
    ])
    assert.equal(reminders.length, 0)
  })

  test('ignores discontinued or completed medications even inside the window', () => {
    const reminders = getMedicationReminders([
      { id: '1', name: 'Amoxicillin', status: 'discontinued', duration: '7 days', created_at: startedDaysAgo(7) },
      { id: '2', name: 'Ibuprofen', status: 'completed', duration: '7 days', created_at: startedDaysAgo(7) },
    ])
    assert.equal(reminders.length, 0)
  })
})
