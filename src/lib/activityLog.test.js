import { test, describe } from 'node:test'
import assert from 'node:assert/strict'
import { describeActivity } from './activityLabels.js'

describe('describeActivity', () => {
  test('maps known event types to a readable label', () => {
    assert.equal(describeActivity({ event_type: 'profile_updated' }), 'Profile updated')
    assert.equal(describeActivity({ event_type: 'emergency_qr_viewed' }), 'Emergency QR viewed')
  })

  test('falls back to the raw event_type for anything unrecognized', () => {
    assert.equal(describeActivity({ event_type: 'something_new' }), 'something_new')
  })
})
