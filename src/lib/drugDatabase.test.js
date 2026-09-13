import { test, describe } from 'node:test'
import assert from 'node:assert/strict'
import { findDrug, DRUG_DATABASE } from './drugDatabase.js'

describe('findDrug', () => {
  test('matches an exact medicine name, case-insensitively', () => {
    assert.equal(findDrug('Amoxicillin')?.name, 'Amoxicillin')
    assert.equal(findDrug('AMOXICILLIN')?.name, 'Amoxicillin')
    assert.equal(findDrug('amoxicillin')?.name, 'Amoxicillin')
  })

  test('matches a known brand alias', () => {
    assert.equal(findDrug('amoxil')?.name, 'Amoxicillin')
    assert.equal(findDrug('Crocin')?.name, 'Paracetamol')
    assert.equal(findDrug('dolo')?.name, 'Paracetamol')
  })

  test('falls back to a substring match for dosage/brand suffixes', () => {
    // "Dolo 650" isn't a literal alias, but "dolo" appears inside it.
    assert.equal(findDrug('Dolo 650')?.name, 'Paracetamol')
  })

  test('returns null for a medicine outside the reference database', () => {
    assert.equal(findDrug('Definitely Not A Real Medicine XYZ'), null)
  })

  test('returns null for empty, null, or undefined input', () => {
    assert.equal(findDrug(''), null)
    assert.equal(findDrug(null), null)
    assert.equal(findDrug(undefined), null)
  })

  test('every database entry resolves to itself by its own exact name', () => {
    for (const drug of DRUG_DATABASE) {
      assert.equal(findDrug(drug.name)?.name, drug.name, `expected findDrug('${drug.name}') to resolve`)
    }
  })
})
