import { test, describe } from 'node:test'
import assert from 'node:assert/strict'
import { analyzeMedication } from './medicationSafety.js'

const empty = { allergies: [], conditions: [], labResults: [], medications: [] }

function checkFor(report, title) {
  return report.checks.find((c) => c.title === title)
}

describe('analyzeMedication — honesty-first "not evaluated" behavior', () => {
  test('a medicine outside the reference database is NOT EVALUATED, never a false all-clear', () => {
    const report = analyzeMedication('Totally Unlisted Medicine', empty)
    assert.equal(report.overallRisk, 'LOW')
    assert.equal(checkFor(report, 'Drug Allergy Check').status, 'NOT EVALUATED')
    assert.equal(checkFor(report, 'Drug–Disease Contraindication Check').status, 'NOT EVALUATED')
    assert.equal(checkFor(report, 'Therapeutic Duplication').status, 'NOT EVALUATED')
    assert.equal(checkFor(report, 'Renal Function Review').status, 'NOT EVALUATED')
    assert.equal(checkFor(report, 'Drug–Drug Interaction Check').status, 'PARTIAL CHECK ONLY')
    assert.match(report.summaryMessage, /not yet in MediLink's reference database/)
  })

  test('a recognized medicine with a clean profile reports LOW risk, not silence', () => {
    const report = analyzeMedication('Atorvastatin', empty)
    assert.equal(report.overallRisk, 'LOW')
    assert.match(report.summaryMessage, /No alert identified/)
  })
})

describe('analyzeMedication — allergy conflicts', () => {
  test('flags a documented penicillin allergy against a penicillin-class antibiotic', () => {
    const report = analyzeMedication('Amoxicillin', {
      ...empty,
      allergies: [{ name: 'Penicillin' }],
    })
    assert.equal(checkFor(report, 'Drug Allergy Check').status, 'HIGH RISK')
    assert.equal(report.overallRisk, 'HIGH')
  })

  test('does not flag an unrelated allergy', () => {
    const report = analyzeMedication('Amoxicillin', {
      ...empty,
      allergies: [{ name: 'Peanuts' }],
    })
    assert.equal(checkFor(report, 'Drug Allergy Check').status, 'NO ALERT')
    assert.equal(report.overallRisk, 'LOW')
  })
})

describe('analyzeMedication — drug-drug interactions', () => {
  test('flags a HIGH-risk class interaction (NSAID + Anticoagulant)', () => {
    const report = analyzeMedication('Ibuprofen', {
      ...empty,
      medications: [{ name: 'Warfarin', status: 'active' }],
    })
    assert.equal(checkFor(report, 'Drug–Drug Interaction Check').status, 'HIGH RISK')
    assert.equal(report.overallRisk, 'HIGH')
  })

  test('flags a same-name duplicate already on the active medication list', () => {
    const report = analyzeMedication('Metformin', {
      ...empty,
      medications: [{ name: 'Metformin', status: 'active' }],
    })
    assert.equal(checkFor(report, 'Drug–Drug Interaction Check').status, 'REVIEW')
    assert.equal(report.overallRisk, 'MODERATE')
  })
})

describe('analyzeMedication — drug-disease contraindications', () => {
  test('flags ACE inhibitors as HIGH risk against a pregnancy condition', () => {
    const report = analyzeMedication('Enalapril', {
      ...empty,
      conditions: [{ name: 'Pregnancy' }],
    })
    assert.equal(checkFor(report, 'Drug–Disease Contraindication Check').status, 'HIGH RISK')
    assert.equal(report.overallRisk, 'HIGH')
  })
})

describe('analyzeMedication — therapeutic duplication', () => {
  test('flags two active medications in the same class (ARB + ARB)', () => {
    const report = analyzeMedication('Losartan', {
      ...empty,
      medications: [{ name: 'Telmisartan', status: 'active' }],
    })
    assert.equal(checkFor(report, 'Therapeutic Duplication').status, 'MODERATE RISK')
    assert.equal(report.overallRisk, 'MODERATE')
  })
})

describe('analyzeMedication — newer drug classes wired into existing rules', () => {
  test('flags a Direct Oral Anticoagulant + NSAID combination as HIGH risk', () => {
    const report = analyzeMedication('Rivaroxaban', {
      ...empty,
      medications: [{ name: 'Ibuprofen', status: 'active' }],
    })
    assert.equal(checkFor(report, 'Drug–Drug Interaction Check').status, 'HIGH RISK')
    assert.equal(report.overallRisk, 'HIGH')
  })

  test('flags a Benzodiazepine + Opioid combination as HIGH risk', () => {
    const report = analyzeMedication('Alprazolam', {
      ...empty,
      medications: [{ name: 'Tramadol', status: 'active' }],
    })
    assert.equal(checkFor(report, 'Drug–Drug Interaction Check').status, 'HIGH RISK')
    assert.equal(report.overallRisk, 'HIGH')
  })

  test('flags a Nitrate + PDE5 Inhibitor combination as HIGH risk', () => {
    const report = analyzeMedication('Sildenafil', {
      ...empty,
      medications: [{ name: 'Isosorbide Mononitrate', status: 'active' }],
    })
    assert.equal(checkFor(report, 'Drug–Drug Interaction Check').status, 'HIGH RISK')
    assert.equal(report.overallRisk, 'HIGH')
  })

  test('flags reduced eGFR against an SGLT2 inhibitor', () => {
    const report = analyzeMedication('Dapagliflozin', {
      ...empty,
      labResults: [{ test_name: 'eGFR', value: '30' }],
    })
    assert.equal(checkFor(report, 'Renal Function Review').status, 'CAUTION')
    assert.equal(report.overallRisk, 'CAUTION')
  })
})

describe('analyzeMedication — renal dosing', () => {
  test('flags reduced eGFR against a renally-dosed medicine', () => {
    const report = analyzeMedication('Metformin', {
      ...empty,
      labResults: [{ test_name: 'eGFR', value: '30' }],
    })
    assert.equal(checkFor(report, 'Renal Function Review').status, 'DOSE REVIEW')
    assert.equal(report.overallRisk, 'MODERATE')
  })

  test('does not flag renal risk when eGFR is above the threshold', () => {
    const report = analyzeMedication('Metformin', {
      ...empty,
      labResults: [{ test_name: 'eGFR', value: '90' }],
    })
    assert.equal(checkFor(report, 'Renal Function Review').status, 'NO ALERT')
  })
})
