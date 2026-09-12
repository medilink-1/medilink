// Curated reference data for the Medication Safety module.
//
// This is NOT a validated clinical drug database. It is a deliberately
// limited, hand-curated set of common medicines, drug classes, and
// interaction/contraindication patterns used to power patient-specific
// checks in medicationSafety.js. Any medicine not listed here is treated
// as "not evaluated" by the engine -- never as a false "no risk".

export const DRUG_DATABASE = [
  { name: 'Amoxicillin', aliases: ['amoxil'], drugClass: 'Penicillin Antibiotic', allergyGroup: 'penicillin' },
  { name: 'Ampicillin', aliases: [], drugClass: 'Penicillin Antibiotic', allergyGroup: 'penicillin' },
  { name: 'Penicillin V', aliases: ['penicillin'], drugClass: 'Penicillin Antibiotic', allergyGroup: 'penicillin' },
  { name: 'Cloxacillin', aliases: [], drugClass: 'Penicillin Antibiotic', allergyGroup: 'penicillin' },
  { name: 'Cephalexin', aliases: ['keflex'], drugClass: 'Cephalosporin Antibiotic', allergyGroup: 'cephalosporin' },
  { name: 'Azithromycin', aliases: ['azithral', 'zithromax'], drugClass: 'Macrolide Antibiotic' },
  { name: 'Erythromycin', aliases: [], drugClass: 'Macrolide Antibiotic' },
  { name: 'Ciprofloxacin', aliases: ['cipro'], drugClass: 'Fluoroquinolone Antibiotic' },
  { name: 'Levofloxacin', aliases: [], drugClass: 'Fluoroquinolone Antibiotic' },
  { name: 'Doxycycline', aliases: [], drugClass: 'Tetracycline Antibiotic' },
  { name: 'Metronidazole', aliases: ['flagyl'], drugClass: 'Nitroimidazole Antibiotic' },
  { name: 'Ibuprofen', aliases: ['brufen'], drugClass: 'NSAID', renal: { threshold: 60, severity: 'CAUTION', note: 'NSAIDs should be used cautiously in patients with reduced kidney function.' } },
  { name: 'Naproxen', aliases: [], drugClass: 'NSAID', renal: { threshold: 60, severity: 'CAUTION', note: 'NSAIDs should be used cautiously in patients with reduced kidney function.' } },
  { name: 'Diclofenac', aliases: ['voveran'], drugClass: 'NSAID', renal: { threshold: 60, severity: 'CAUTION', note: 'NSAIDs should be used cautiously in patients with reduced kidney function.' } },
  { name: 'Aspirin', aliases: ['ecosprin'], drugClass: 'Antiplatelet / NSAID' },
  { name: 'Paracetamol', aliases: ['acetaminophen', 'crocin', 'dolo', 'calpol'], drugClass: 'Analgesic (Non-NSAID)' },
  { name: 'Metformin', aliases: ['glycomet', 'glucophage'], drugClass: 'Biguanide (Antidiabetic)', renal: { threshold: 45, severity: 'MODERATE', note: 'Metformin requires dose review or avoidance as kidney function declines.' } },
  { name: 'Glimepiride', aliases: ['amaryl'], drugClass: 'Sulfonylurea (Antidiabetic)' },
  { name: 'Glipizide', aliases: [], drugClass: 'Sulfonylurea (Antidiabetic)' },
  { name: 'Insulin Glargine', aliases: ['lantus', 'insulin'], drugClass: 'Insulin' },
  { name: 'Sitagliptin', aliases: ['januvia'], drugClass: 'DPP-4 Inhibitor (Antidiabetic)' },
  { name: 'Amlodipine', aliases: ['amlopres'], drugClass: 'Calcium Channel Blocker' },
  { name: 'Atenolol', aliases: [], drugClass: 'Beta Blocker' },
  { name: 'Metoprolol', aliases: [], drugClass: 'Beta Blocker' },
  { name: 'Enalapril', aliases: [], drugClass: 'ACE Inhibitor' },
  { name: 'Ramipril', aliases: [], drugClass: 'ACE Inhibitor' },
  { name: 'Losartan', aliases: ['losar'], drugClass: 'ARB' },
  { name: 'Telmisartan', aliases: ['telma'], drugClass: 'ARB' },
  { name: 'Hydrochlorothiazide', aliases: ['hctz'], drugClass: 'Thiazide Diuretic' },
  { name: 'Furosemide', aliases: ['lasix'], drugClass: 'Loop Diuretic' },
  { name: 'Spironolactone', aliases: [], drugClass: 'Potassium-Sparing Diuretic' },
  { name: 'Atorvastatin', aliases: ['atorva'], drugClass: 'Statin' },
  { name: 'Rosuvastatin', aliases: ['rosuva'], drugClass: 'Statin' },
  { name: 'Omeprazole', aliases: ['omez'], drugClass: 'Proton Pump Inhibitor' },
  { name: 'Pantoprazole', aliases: ['pan'], drugClass: 'Proton Pump Inhibitor' },
  { name: 'Famotidine', aliases: [], drugClass: 'H2 Blocker' },
  { name: 'Levothyroxine', aliases: ['eltroxin', 'thyronorm'], drugClass: 'Thyroid Hormone' },
  { name: 'Salbutamol', aliases: ['albuterol', 'asthalin'], drugClass: 'Bronchodilator' },
  { name: 'Montelukast', aliases: ['montair'], drugClass: 'Leukotriene Receptor Antagonist' },
  { name: 'Prednisolone', aliases: ['wysolone'], drugClass: 'Corticosteroid' },
  { name: 'Warfarin', aliases: [], drugClass: 'Anticoagulant' },
  { name: 'Clopidogrel', aliases: ['clopilet'], drugClass: 'Antiplatelet' },
  { name: 'Cetirizine', aliases: ['zyrtec'], drugClass: 'Antihistamine' },
  { name: 'Loratadine', aliases: [], drugClass: 'Antihistamine' },
  { name: 'Diazepam', aliases: ['valium'], drugClass: 'Benzodiazepine' },
  { name: 'Alprazolam', aliases: ['xanax'], drugClass: 'Benzodiazepine' },
  { name: 'Phenytoin', aliases: ['eptoin'], drugClass: 'Antiepileptic' },
  { name: 'Sertraline', aliases: ['zoloft'], drugClass: 'SSRI (Antidepressant)' },
  { name: 'Escitalopram', aliases: ['nexito'], drugClass: 'SSRI (Antidepressant)' },
]

// Class-vs-class interaction patterns. Same-class pairs are deliberately
// excluded here -- those are surfaced by the Therapeutic Duplication
// check instead, to avoid reporting the same thing twice.
export const INTERACTION_RULES = [
  { classes: ['NSAID', 'Anticoagulant'], severity: 'HIGH', note: 'Combined use significantly increases bleeding risk.' },
  { classes: ['NSAID', 'Antiplatelet'], severity: 'HIGH', note: 'Combined use increases gastrointestinal bleeding risk.' },
  { classes: ['NSAID', 'Antiplatelet / NSAID'], severity: 'HIGH', note: 'Combined use increases gastrointestinal bleeding risk.' },
  { classes: ['NSAID', 'ACE Inhibitor'], severity: 'MODERATE', note: 'May blunt blood-pressure control and reduce kidney function.' },
  { classes: ['NSAID', 'ARB'], severity: 'MODERATE', note: 'May blunt blood-pressure control and reduce kidney function.' },
  { classes: ['NSAID', 'Loop Diuretic'], severity: 'CAUTION', note: 'NSAIDs can reduce diuretic effectiveness and stress the kidneys.' },
  { classes: ['ACE Inhibitor', 'Potassium-Sparing Diuretic'], severity: 'MODERATE', note: 'Risk of hyperkalemia (elevated blood potassium).' },
  { classes: ['ARB', 'Potassium-Sparing Diuretic'], severity: 'MODERATE', note: 'Risk of hyperkalemia (elevated blood potassium).' },
  { classes: ['Statin', 'Macrolide Antibiotic'], severity: 'MODERATE', note: 'Some macrolides raise statin levels, increasing muscle-toxicity risk.' },
  { classes: ['Statin', 'Calcium Channel Blocker'], severity: 'CAUTION', note: 'Amlodipine-type calcium channel blockers can raise statin blood levels.' },
  { classes: ['Anticoagulant', 'Antiplatelet'], severity: 'HIGH', note: 'Significantly increased bleeding risk when combined.' },
  { classes: ['Anticoagulant', 'Fluoroquinolone Antibiotic'], severity: 'MODERATE', note: 'May potentiate anticoagulant effect — closer monitoring advised.' },
  { classes: ['Anticoagulant', 'Nitroimidazole Antibiotic'], severity: 'MODERATE', note: 'Metronidazole can significantly potentiate warfarin — monitoring advised.' },
  { classes: ['SSRI (Antidepressant)', 'NSAID'], severity: 'MODERATE', note: 'Combined use increases gastrointestinal bleeding risk.' },
  { classes: ['SSRI (Antidepressant)', 'Antiplatelet'], severity: 'MODERATE', note: 'Combined use increases bleeding risk.' },
  { classes: ['Proton Pump Inhibitor', 'Antiplatelet'], severity: 'CAUTION', note: 'Omeprazole-type PPIs may reduce clopidogrel effectiveness.' },
]

export const CONTRAINDICATION_RULES = [
  { classes: ['NSAID'], conditionKeyword: 'kidney', severity: 'CAUTION', note: 'NSAIDs should be used cautiously in patients with kidney disease.' },
  { classes: ['NSAID'], conditionKeyword: 'asthma', severity: 'CAUTION', note: 'A subset of asthma patients have NSAID-sensitive airway disease.' },
  { classes: ['NSAID'], conditionKeyword: 'ulcer', severity: 'MODERATE', note: 'NSAIDs increase the risk of GI bleeding in peptic ulcer disease.' },
  { classes: ['Beta Blocker'], conditionKeyword: 'asthma', severity: 'MODERATE', note: 'Beta blockers can worsen bronchospasm in asthma.' },
  { classes: ['Beta Blocker'], conditionKeyword: 'copd', severity: 'CAUTION', note: 'Beta blockers should be used cautiously in COPD.' },
  { classes: ['ACE Inhibitor'], conditionKeyword: 'pregnan', severity: 'HIGH', note: 'ACE inhibitors are contraindicated in pregnancy.' },
  { classes: ['ARB'], conditionKeyword: 'pregnan', severity: 'HIGH', note: 'ARBs are contraindicated in pregnancy.' },
  { classes: ['Statin'], conditionKeyword: 'liver', severity: 'MODERATE', note: 'Statins should be used cautiously in active liver disease.' },
  { classes: ['Biguanide (Antidiabetic)'], conditionKeyword: 'kidney', severity: 'MODERATE', note: 'Metformin requires dose adjustment or avoidance in significant kidney disease.' },
  { classes: ['Corticosteroid'], conditionKeyword: 'diabetes', severity: 'CAUTION', note: 'Corticosteroids can raise blood glucose.' },
  { classes: ['Corticosteroid'], conditionKeyword: 'ulcer', severity: 'CAUTION', note: 'Corticosteroids increase GI risk in peptic ulcer disease.' },
  { classes: ['Thiazide Diuretic'], conditionKeyword: 'gout', severity: 'CAUTION', note: 'Thiazide diuretics can raise uric acid and trigger gout flares.' },
]

/**
 * Looks up a free-typed medicine name against the reference database.
 * Tries an exact name/alias match first, then falls back to a
 * substring match to tolerate brand names, dosages, or minor typos
 * (e.g. "Dolo 650" -> Paracetamol).
 */
export function findDrug(rawName) {
  const name = (rawName || '').trim().toLowerCase()
  if (!name) return null
  const exact = DRUG_DATABASE.find(
    (d) => d.name.toLowerCase() === name || d.aliases.some((a) => a.toLowerCase() === name)
  )
  if (exact) return exact
  return (
    DRUG_DATABASE.find(
      (d) => name.includes(d.name.toLowerCase()) || d.aliases.some((a) => name.includes(a.toLowerCase()))
    ) || null
  )
}
