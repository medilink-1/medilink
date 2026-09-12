// Rule-based demonstration engine for the Medication Safety module.
// This is a prototype only -- NOT a validated clinical drug-interaction
// system. It runs entirely in the browser against the patient's own
// allergies / conditions / lab values / current medications.

const RISK_ORDER = { LOW: 0, CAUTION: 1, MODERATE: 2, HIGH: 3 }

function findMatch(list, keyword) {
  return list.find((item) => item.name?.toLowerCase().includes(keyword.toLowerCase()))
}

function getLabValue(labResults, testName) {
  const match = labResults.find((l) => l.test_name.toLowerCase() === testName.toLowerCase())
  return match ? parseFloat(match.value) : null
}

/**
 * @param {string} medicineName
 * @param {{allergies: any[], conditions: any[], labResults: any[], medications: any[]}} context
 */
export function analyzeMedication(medicineName, context) {
  const { allergies = [], conditions = [], labResults = [], medications = [] } = context
  const name = medicineName.trim().toLowerCase()
  const egfr = getLabValue(labResults, 'eGFR')

  const checks = []
  let overallRisk = 'LOW'

  const raise = (risk) => {
    if (RISK_ORDER[risk] > RISK_ORDER[overallRisk]) overallRisk = risk
  }

  // 1. Drug allergy check
  const penicillinFamily = ['amoxicillin', 'ampicillin', 'penicillin']
  const allergyHit = penicillinFamily.some((p) => name.includes(p)) && findMatch(allergies, 'penicillin')
  if (allergyHit) {
    checks.push({
      title: 'Drug Allergy Check',
      status: 'HIGH RISK',
      result: 'Potential allergy-related risk detected.',
      explanation: `Patient has a documented ${findMatch(allergies, 'penicillin').name} allergy. Clinical review is recommended before prescribing or dispensing.`,
    })
    raise('HIGH')
  } else {
    checks.push({
      title: 'Drug Allergy Check',
      status: 'NO ALERT',
      result: 'No documented allergy conflict for this medicine.',
    })
  }

  // 2. Drug-drug interaction check (demo: flag if same medicine already active)
  const duplicate = medications.find((m) => m.name.toLowerCase() === name && m.status === 'active')
  if (duplicate) {
    checks.push({
      title: 'Drug\u2013Drug Interaction Check',
      status: 'REVIEW',
      result: 'Medicine already appears in the current medication list.',
      explanation: 'Confirm this is not an unintended duplicate order.',
    })
    raise('MODERATE')
  } else {
    checks.push({
      title: 'Drug\u2013Drug Interaction Check',
      status: 'NO MAJOR DEMO ALERT',
      result: `Compared against ${medications.map((m) => m.name).join(', ') || 'current medication list'}.`,
    })
  }

  // 3. Drug-disease contraindication check
  const ckd = findMatch(conditions, 'kidney')
  const nsaids = ['ibuprofen', 'naproxen', 'diclofenac']
  if (nsaids.some((n) => name.includes(n)) && ckd) {
    checks.push({
      title: 'Drug\u2013Disease Contraindication Check',
      status: 'CAUTION',
      result: `Patient has documented ${ckd.name}.`,
      explanation: 'NSAIDs should be used cautiously in renal impairment. Renal function should be reviewed.',
    })
    raise('CAUTION')
  } else {
    checks.push({
      title: 'Drug\u2013Disease Contraindication Check',
      status: 'REVIEW',
      result: 'Review patient-specific clinical condition and indication.',
    })
  }

  // 4. Therapeutic duplication -- NOT actually implemented in this demo.
  checks.push({
    title: 'Therapeutic Duplication',
    status: 'NOT EVALUATED',
    result: 'This prototype does not check therapeutic-class duplication yet. Treat as unassessed, not as a confirmed all-clear.',
  })

  // 5. Renal function review
  if (name.includes('metformin') && egfr !== null && egfr < 60) {
    checks.push({
      title: 'Renal Function Review',
      status: 'DOSE REVIEW',
      result: `eGFR: ${egfr} mL/min/1.73m²`,
      explanation: 'Renal function should be considered during medication selection and dosing.',
    })
    raise('MODERATE')
  } else if (nsaids.some((n) => name.includes(n)) && egfr !== null && egfr < 60) {
    checks.push({
      title: 'Renal Function Review',
      status: 'DOSE REVIEW',
      result: `eGFR: ${egfr} mL/min/1.73m²`,
      explanation: 'Renal function should be considered before selecting an NSAID.',
    })
    raise('CAUTION')
  } else {
    checks.push({
      title: 'Renal Function Review',
      status: 'NO DEMO ALERT',
      result: egfr !== null ? `eGFR on file: ${egfr} mL/min/1.73m²` : 'No eGFR on file.',
    })
  }

  // 6. Hepatic function review -- NOT actually implemented in this demo.
  checks.push({
    title: 'Hepatic Function Review',
    status: 'NOT EVALUATED',
    result: 'This prototype does not model liver function tests. Treat as unassessed, not as a confirmed all-clear.',
  })

  // 7. Previous ADR history -- NOT actually implemented in this demo.
  checks.push({
    title: 'Previous ADR History',
    status: 'NOT EVALUATED',
    result: 'This prototype does not track prior adverse drug reactions. Treat as unassessed, not as a confirmed all-clear.',
  })

  const summaryMessage =
    overallRisk === 'HIGH'
      ? 'Potential medication-related safety concerns identified. Healthcare professional review recommended.'
      : overallRisk === 'MODERATE'
      ? 'Some medication-related considerations identified. Review recommended before dispensing.'
      : overallRisk === 'CAUTION'
      ? 'Minor considerations identified. Clinical judgment advised.'
      : 'No demo-specific safety alert configured. Review patient clinical profile.'

  return { medicine: medicineName, overallRisk, checks, summaryMessage }
}
