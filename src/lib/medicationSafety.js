// Rule-based demonstration engine for the Medication Safety module.
// This is a prototype only -- NOT a validated clinical drug-interaction
// system. It runs entirely in the browser against the patient's own
// allergies / conditions / lab values / current medications, cross-
// referenced against the curated (and necessarily incomplete) medicine
// reference table in ./drugDatabase.js. A medicine that is not in that
// table is always treated as "not evaluated" -- never as a false
// "no risk" -- so coverage can grow over time without ever having
// silently claimed more than it checked.

import { INTERACTION_RULES, CONTRAINDICATION_RULES, findDrug } from './drugDatabase'

const RISK_ORDER = { LOW: 0, CAUTION: 1, MODERATE: 2, HIGH: 3 }

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
  const drug = findDrug(medicineName)

  // Other currently-active medications (excluding this one by exact name),
  // resolved against the reference database where possible.
  const otherActive = medications.filter((m) => m.status === 'active' && m.name.trim().toLowerCase() !== name)
  const otherActiveDrugs = otherActive
    .map((m) => ({ raw: m, drug: findDrug(m.name) }))
    .filter((x) => x.drug)

  const checks = []
  let overallRisk = 'LOW'
  const raise = (risk) => {
    if (RISK_ORDER[risk] > RISK_ORDER[overallRisk]) overallRisk = risk
  }

  // 1. Drug allergy check
  if (!drug) {
    checks.push({
      title: 'Drug Allergy Check',
      status: 'NOT EVALUATED',
      result: `"${medicineName}" is not in MediLink's reference list. Treat as unassessed, not as a confirmed all-clear.`,
    })
  } else if (drug.allergyGroup && allergies.some((a) => a.name?.toLowerCase().includes(drug.allergyGroup))) {
    const matched = allergies.find((a) => a.name?.toLowerCase().includes(drug.allergyGroup))
    checks.push({
      title: 'Drug Allergy Check',
      status: 'HIGH RISK',
      result: 'Potential allergy-related risk detected.',
      explanation: `Patient has a documented ${matched.name} allergy, and ${drug.name} is a ${drug.drugClass}. Clinical review is recommended before prescribing or dispensing.`,
    })
    raise('HIGH')
  } else {
    checks.push({
      title: 'Drug Allergy Check',
      status: 'NO ALERT',
      result: 'No documented allergy conflict for this medicine.',
    })
  }

  // 2. Drug-drug interaction check: exact-name duplicate + class-level interactions
  const duplicateByName = medications.find((m) => m.name.trim().toLowerCase() === name && m.status === 'active')
  const classInteractions = drug
    ? otherActiveDrugs
        .map(({ raw, drug: otherDrug }) => {
          if (otherDrug.drugClass === drug.drugClass) return null // surfaced by Therapeutic Duplication instead
          const rule = INTERACTION_RULES.find(
            (r) => r.classes.includes(drug.drugClass) && r.classes.includes(otherDrug.drugClass)
          )
          return rule ? { with: raw.name, rule } : null
        })
        .filter(Boolean)
    : []

  if (classInteractions.length > 0) {
    const worst = classInteractions.reduce(
      (acc, x) => (RISK_ORDER[x.rule.severity] > RISK_ORDER[acc] ? x.rule.severity : acc),
      'CAUTION'
    )
    const notes = classInteractions.map((x) => `With ${x.with}: ${x.rule.note}`)
    if (duplicateByName) notes.unshift('Medicine already appears in the current medication list — confirm this is not an unintended duplicate order.')
    checks.push({
      title: 'Drug–Drug Interaction Check',
      status: `${worst} RISK`,
      result: notes.join(' '),
    })
    raise(worst)
  } else if (duplicateByName) {
    checks.push({
      title: 'Drug–Drug Interaction Check',
      status: 'REVIEW',
      result: 'Medicine already appears in the current medication list.',
      explanation: 'Confirm this is not an unintended duplicate order.',
    })
    raise('MODERATE')
  } else {
    checks.push({
      title: 'Drug–Drug Interaction Check',
      status: drug ? 'NO ALERT' : 'PARTIAL CHECK ONLY',
      result: drug
        ? `Compared against ${otherActive.map((m) => m.name).join(', ') || 'current medication list'} — no known class-level interaction found.`
        : `"${medicineName}" is not in the reference database, so only an exact-name duplicate check could be run.`,
    })
  }

  // 3. Drug-disease contraindication check
  if (!drug) {
    checks.push({
      title: 'Drug–Disease Contraindication Check',
      status: 'NOT EVALUATED',
      result: `"${medicineName}" is not in MediLink's reference list. Treat as unassessed, not as a confirmed all-clear.`,
    })
  } else {
    const matches = CONTRAINDICATION_RULES.filter(
      (r) => r.classes.includes(drug.drugClass) && conditions.some((c) => c.name?.toLowerCase().includes(r.conditionKeyword))
    )
    if (matches.length > 0) {
      const worst = matches.reduce((acc, r) => (RISK_ORDER[r.severity] > RISK_ORDER[acc] ? r.severity : acc), 'LOW')
      checks.push({
        title: 'Drug–Disease Contraindication Check',
        status: `${worst} RISK`,
        result: matches.map((r) => r.note).join(' '),
      })
      raise(worst)
    } else {
      checks.push({
        title: 'Drug–Disease Contraindication Check',
        status: 'NO ALERT',
        result: `No known contraindication between ${drug.drugClass} and the patient's documented conditions.`,
      })
    }
  }

  // 4. Therapeutic duplication -- now genuinely evaluated when the medicine
  //    (and at least one other active medication) is in the reference database.
  if (!drug) {
    checks.push({
      title: 'Therapeutic Duplication',
      status: 'NOT EVALUATED',
      result: `"${medicineName}" is not in MediLink's reference list, so therapeutic-class duplication could not be checked. Treat as unassessed, not as a confirmed all-clear.`,
    })
  } else {
    const sameClass = otherActiveDrugs.find((x) => x.drug.drugClass === drug.drugClass)
    if (sameClass) {
      checks.push({
        title: 'Therapeutic Duplication',
        status: 'MODERATE RISK',
        result: `${sameClass.raw.name} is already active and belongs to the same class (${drug.drugClass}).`,
      })
      raise('MODERATE')
    } else {
      checks.push({
        title: 'Therapeutic Duplication',
        status: 'NO ALERT',
        result: `No other active medication in the same class (${drug.drugClass}).`,
      })
    }
  }

  // 5. Renal function review
  if (drug?.renal && egfr !== null && egfr < drug.renal.threshold) {
    checks.push({
      title: 'Renal Function Review',
      status: drug.renal.severity === 'MODERATE' ? 'DOSE REVIEW' : 'CAUTION',
      result: `eGFR: ${egfr} mL/min/1.73m²`,
      explanation: drug.renal.note,
    })
    raise(drug.renal.severity)
  } else if (!drug) {
    checks.push({
      title: 'Renal Function Review',
      status: 'NOT EVALUATED',
      result: `"${medicineName}" is not in MediLink's reference list, so renal-dosing relevance could not be assessed.`,
    })
  } else {
    checks.push({
      title: 'Renal Function Review',
      status: 'NO ALERT',
      result:
        egfr !== null
          ? `eGFR on file: ${egfr} mL/min/1.73m² — no renal precaution flagged for this medicine class.`
          : 'No eGFR on file.',
    })
  }

  // 6. Hepatic function review -- not modeled (no liver-function lab tracked yet).
  checks.push({
    title: 'Hepatic Function Review',
    status: 'NOT EVALUATED',
    result: 'This prototype does not model liver function tests. Treat as unassessed, not as a confirmed all-clear.',
  })

  // 7. Previous ADR history -- not modeled (no ADR history tracked yet).
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
      : drug
      ? "No alert identified for this medicine against the patient's recorded profile."
      : `"${medicineName}" is not yet in MediLink's reference database — several checks above could not be run. Treat this as unassessed rather than confirmed safe.`

  return {
    medicine: medicineName,
    overallRisk,
    checks,
    summaryMessage,
    inDatabase: Boolean(drug),
    drugClass: drug?.drugClass || null,
  }
}
