import { test, describe } from 'node:test'
import assert from 'node:assert/strict'
import { todayDateStr, isTakenOn, getStreak, getChecklist } from './medicationAdherence.js'

const DAY_MS = 24 * 60 * 60 * 1000

function daysAgoStr(days, from = new Date()) {
  return todayDateStr(new Date(from.getTime() - days * DAY_MS))
}

describe('todayDateStr', () => {
  test('formats as YYYY-MM-DD using local calendar fields', () => {
    const d = new Date(2026, 2, 5) // March 5, 2026 (month is 0-indexed)
    assert.equal(todayDateStr(d), '2026-03-05')
  })
})

describe('isTakenOn', () => {
  test('true when a dose row for that medication/date has taken_at set', () => {
    const doses = [{ medication_id: 'm1', dose_date: '2026-01-01', taken_at: '2026-01-01T09:00:00Z' }]
    assert.equal(isTakenOn(doses, 'm1', '2026-01-01'), true)
  })

  test('false when no matching row exists', () => {
    const doses = [{ medication_id: 'm1', dose_date: '2026-01-01', taken_at: '2026-01-01T09:00:00Z' }]
    assert.equal(isTakenOn(doses, 'm1', '2026-01-02'), false)
    assert.equal(isTakenOn(doses, 'm2', '2026-01-01'), false)
  })

  test('false when the row exists but taken_at is null (unmarked)', () => {
    const doses = [{ medication_id: 'm1', dose_date: '2026-01-01', taken_at: null }]
    assert.equal(isTakenOn(doses, 'm1', '2026-01-01'), false)
  })
})

describe('getStreak', () => {
  test('counts consecutive taken days ending today', () => {
    const today = new Date()
    const doses = [0, 1, 2].map((n) => ({ medication_id: 'm1', dose_date: daysAgoStr(n, today), taken_at: 'x' }))
    assert.equal(getStreak(doses, 'm1', todayDateStr(today)), 3)
  })

  test('a gap stops the streak', () => {
    const today = new Date()
    const doses = [0, 1, 3].map((n) => ({ medication_id: 'm1', dose_date: daysAgoStr(n, today), taken_at: 'x' }))
    assert.equal(getStreak(doses, 'm1', todayDateStr(today)), 2)
  })

  test('an unmarked today does not zero out an intact streak from prior days', () => {
    const today = new Date()
    const doses = [1, 2, 3].map((n) => ({ medication_id: 'm1', dose_date: daysAgoStr(n, today), taken_at: 'x' }))
    assert.equal(getStreak(doses, 'm1', todayDateStr(today)), 3)
  })

  test('zero when nothing has ever been marked', () => {
    assert.equal(getStreak([], 'm1', '2026-01-01'), 0)
  })
})

describe('getChecklist', () => {
  test('only includes active medications', () => {
    const meds = [
      { id: 'm1', name: 'Metformin', dose: '500mg', status: 'active' },
      { id: 'm2', name: 'Amoxicillin', dose: '250mg', status: 'completed' },
    ]
    const { items, total } = getChecklist(meds, [], '2026-01-01')
    assert.equal(total, 1)
    assert.equal(items[0].name, 'Metformin')
  })

  test('reports takenCount and per-item taken/streak state', () => {
    const meds = [
      { id: 'm1', name: 'Metformin', dose: '500mg', status: 'active' },
      { id: 'm2', name: 'Amlodipine', dose: '5mg', status: 'active' },
    ]
    const doses = [{ medication_id: 'm1', dose_date: '2026-01-01', taken_at: 'x' }]
    const { items, takenCount, total } = getChecklist(meds, doses, '2026-01-01')
    assert.equal(total, 2)
    assert.equal(takenCount, 1)
    const m1 = items.find((i) => i.medicationId === 'm1')
    const m2 = items.find((i) => i.medicationId === 'm2')
    assert.equal(m1.taken, true)
    assert.equal(m2.taken, false)
  })
})
