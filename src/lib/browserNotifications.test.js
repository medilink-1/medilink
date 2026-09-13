import { test, describe } from 'node:test'
import assert from 'node:assert/strict'
import { pickUnnotified } from './browserNotifications.js'

describe('pickUnnotified', () => {
  test('keeps items whose id is not in the seen list', () => {
    const items = [{ id: 'a', text: 'A' }, { id: 'b', text: 'B' }]
    assert.deepEqual(pickUnnotified(['a'], items), [{ id: 'b', text: 'B' }])
  })

  test('returns everything when nothing has been seen yet', () => {
    const items = [{ id: 'a' }, { id: 'b' }]
    assert.equal(pickUnnotified([], items).length, 2)
  })

  test('returns nothing when everything has already been seen', () => {
    const items = [{ id: 'a' }, { id: 'b' }]
    assert.equal(pickUnnotified(['a', 'b'], items).length, 0)
  })
})
