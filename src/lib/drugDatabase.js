// Curated reference data for the Medication Safety module.
//
// This is NOT a validated clinical drug database. It is a deliberately
// curated set of commonly prescribed medicines, drug classes, and
// interaction/contraindication patterns used to power patient-specific
// checks in medicationSafety.js. It has been expanded well beyond the
// original ~50 entries to cover most common therapeutic categories
// (antibiotics, cardiovascular, antidiabetic, respiratory, CNS/psych,
// GI, anticoagulants, vitamins, antifungals/antivirals, and more), but
// it is still a curated subset, not an exhaustive drug registry -- no
// list like this could name literally every medicine and brand in
// existence and still have every entry correctly classified. Any
// medicine not listed here is treated as "not evaluated" by the engine
// -- never as a false "no risk" -- so it's always safer to be added
// here than guessed at.

export const DRUG_DATABASE = [
  // --- Antibiotics ---
  { name: 'Amoxicillin', aliases: ['amoxil'], drugClass: 'Penicillin Antibiotic', allergyGroup: 'penicillin' },
  { name: 'Ampicillin', aliases: [], drugClass: 'Penicillin Antibiotic', allergyGroup: 'penicillin' },
  { name: 'Penicillin V', aliases: ['penicillin'], drugClass: 'Penicillin Antibiotic', allergyGroup: 'penicillin' },
  { name: 'Cloxacillin', aliases: [], drugClass: 'Penicillin Antibiotic', allergyGroup: 'penicillin' },
  { name: 'Co-amoxiclav', aliases: ['augmentin', 'amoxiclav'], drugClass: 'Penicillin Antibiotic', allergyGroup: 'penicillin' },
  { name: 'Cephalexin', aliases: ['keflex'], drugClass: 'Cephalosporin Antibiotic', allergyGroup: 'cephalosporin' },
  { name: 'Cefixime', aliases: ['taxim'], drugClass: 'Cephalosporin Antibiotic', allergyGroup: 'cephalosporin' },
  { name: 'Cefpodoxime', aliases: [], drugClass: 'Cephalosporin Antibiotic', allergyGroup: 'cephalosporin' },
  { name: 'Cefuroxime', aliases: ['zinnat'], drugClass: 'Cephalosporin Antibiotic', allergyGroup: 'cephalosporin' },
  { name: 'Ceftriaxone', aliases: ['monocef'], drugClass: 'Cephalosporin Antibiotic', allergyGroup: 'cephalosporin' },
  { name: 'Azithromycin', aliases: ['azithral', 'zithromax'], drugClass: 'Macrolide Antibiotic' },
  { name: 'Erythromycin', aliases: [], drugClass: 'Macrolide Antibiotic' },
  { name: 'Clarithromycin', aliases: ['claribid'], drugClass: 'Macrolide Antibiotic' },
  { name: 'Roxithromycin', aliases: ['roxid'], drugClass: 'Macrolide Antibiotic' },
  { name: 'Ciprofloxacin', aliases: ['cipro'], drugClass: 'Fluoroquinolone Antibiotic' },
  { name: 'Levofloxacin', aliases: [], drugClass: 'Fluoroquinolone Antibiotic' },
  { name: 'Ofloxacin', aliases: [], drugClass: 'Fluoroquinolone Antibiotic' },
  { name: 'Norfloxacin', aliases: [], drugClass: 'Fluoroquinolone Antibiotic' },
  { name: 'Moxifloxacin', aliases: ['moxikind', 'moxicip'], drugClass: 'Fluoroquinolone Antibiotic' },
  { name: 'Doxycycline', aliases: [], drugClass: 'Tetracycline Antibiotic' },
  { name: 'Metronidazole', aliases: ['flagyl'], drugClass: 'Nitroimidazole Antibiotic' },
  { name: 'Clindamycin', aliases: ['dalacin'], drugClass: 'Lincosamide Antibiotic' },
  { name: 'Nitrofurantoin', aliases: [], drugClass: 'Nitrofuran Antibiotic' },
  { name: 'Linezolid', aliases: [], drugClass: 'Oxazolidinone Antibiotic' },
  { name: 'Gentamicin', aliases: [], drugClass: 'Aminoglycoside Antibiotic' },
  { name: 'Amikacin', aliases: [], drugClass: 'Aminoglycoside Antibiotic' },
  { name: 'Cotrimoxazole', aliases: ['septran', 'bactrim'], drugClass: 'Sulfonamide Antibiotic' },
  { name: 'Isoniazid', aliases: [], drugClass: 'Antitubercular' },
  { name: 'Rifampicin', aliases: [], drugClass: 'Antitubercular' },
  { name: 'Ethambutol', aliases: [], drugClass: 'Antitubercular' },
  { name: 'Pyrazinamide', aliases: [], drugClass: 'Antitubercular' },

  // --- Pain / anti-inflammatory ---
  { name: 'Ibuprofen', aliases: ['brufen'], drugClass: 'NSAID', renal: { threshold: 60, severity: 'CAUTION', note: 'NSAIDs should be used cautiously in patients with reduced kidney function.' } },
  { name: 'Naproxen', aliases: [], drugClass: 'NSAID', renal: { threshold: 60, severity: 'CAUTION', note: 'NSAIDs should be used cautiously in patients with reduced kidney function.' } },
  { name: 'Diclofenac', aliases: ['voveran'], drugClass: 'NSAID', renal: { threshold: 60, severity: 'CAUTION', note: 'NSAIDs should be used cautiously in patients with reduced kidney function.' } },
  { name: 'Etoricoxib', aliases: ['nucoxia'], drugClass: 'NSAID', renal: { threshold: 60, severity: 'CAUTION', note: 'NSAIDs should be used cautiously in patients with reduced kidney function.' } },
  { name: 'Celecoxib', aliases: ['celact'], drugClass: 'NSAID', renal: { threshold: 60, severity: 'CAUTION', note: 'NSAIDs should be used cautiously in patients with reduced kidney function.' } },
  { name: 'Nimesulide', aliases: ['nise'], drugClass: 'NSAID', renal: { threshold: 60, severity: 'CAUTION', note: 'NSAIDs should be used cautiously in patients with reduced kidney function.' } },
  { name: 'Mefenamic Acid', aliases: ['meftal'], drugClass: 'NSAID', renal: { threshold: 60, severity: 'CAUTION', note: 'NSAIDs should be used cautiously in patients with reduced kidney function.' } },
  { name: 'Ketorolac', aliases: [], drugClass: 'NSAID', renal: { threshold: 60, severity: 'CAUTION', note: 'NSAIDs should be used cautiously in patients with reduced kidney function.' } },
  { name: 'Aspirin', aliases: ['ecosprin'], drugClass: 'Antiplatelet / NSAID' },
  { name: 'Paracetamol', aliases: ['acetaminophen', 'crocin', 'dolo', 'calpol'], drugClass: 'Analgesic (Non-NSAID)' },
  { name: 'Tramadol', aliases: [], drugClass: 'Opioid Analgesic' },
  { name: 'Codeine', aliases: [], drugClass: 'Opioid Analgesic' },
  { name: 'Morphine', aliases: [], drugClass: 'Opioid Analgesic' },
  { name: 'Tizanidine', aliases: [], drugClass: 'Muscle Relaxant' },
  { name: 'Chlorzoxazone', aliases: [], drugClass: 'Muscle Relaxant' },

  // --- Diabetes ---
  { name: 'Metformin', aliases: ['glycomet', 'glucophage'], drugClass: 'Biguanide (Antidiabetic)', renal: { threshold: 45, severity: 'MODERATE', note: 'Metformin requires dose review or avoidance as kidney function declines.' } },
  { name: 'Glimepiride', aliases: ['amaryl'], drugClass: 'Sulfonylurea (Antidiabetic)' },
  { name: 'Glipizide', aliases: [], drugClass: 'Sulfonylurea (Antidiabetic)' },
  { name: 'Insulin Glargine', aliases: ['lantus'], drugClass: 'Insulin' },
  { name: 'Insulin Aspart', aliases: ['novorapid'], drugClass: 'Insulin' },
  { name: 'Insulin NPH', aliases: ['human insulin'], drugClass: 'Insulin' },
  { name: 'Sitagliptin', aliases: ['januvia'], drugClass: 'DPP-4 Inhibitor (Antidiabetic)' },
  { name: 'Vildagliptin', aliases: ['galvus'], drugClass: 'DPP-4 Inhibitor (Antidiabetic)' },
  { name: 'Linagliptin', aliases: ['trajenta'], drugClass: 'DPP-4 Inhibitor (Antidiabetic)' },
  { name: 'Pioglitazone', aliases: ['pioz'], drugClass: 'Thiazolidinedione (Antidiabetic)' },
  { name: 'Dapagliflozin', aliases: ['forxiga'], drugClass: 'SGLT2 Inhibitor (Antidiabetic)', renal: { threshold: 45, severity: 'CAUTION', note: 'SGLT2 inhibitors have reduced glucose-lowering effect and require caution as kidney function declines.' } },
  { name: 'Empagliflozin', aliases: ['jardiance'], drugClass: 'SGLT2 Inhibitor (Antidiabetic)', renal: { threshold: 45, severity: 'CAUTION', note: 'SGLT2 inhibitors have reduced glucose-lowering effect and require caution as kidney function declines.' } },
  { name: 'Canagliflozin', aliases: [], drugClass: 'SGLT2 Inhibitor (Antidiabetic)', renal: { threshold: 45, severity: 'CAUTION', note: 'SGLT2 inhibitors have reduced glucose-lowering effect and require caution as kidney function declines.' } },

  // --- Cardiovascular ---
  { name: 'Amlodipine', aliases: ['amlopres'], drugClass: 'Calcium Channel Blocker' },
  { name: 'Nifedipine', aliases: ['depin'], drugClass: 'Calcium Channel Blocker' },
  { name: 'Verapamil', aliases: [], drugClass: 'Calcium Channel Blocker' },
  { name: 'Diltiazem', aliases: [], drugClass: 'Calcium Channel Blocker' },
  { name: 'Atenolol', aliases: [], drugClass: 'Beta Blocker' },
  { name: 'Metoprolol', aliases: [], drugClass: 'Beta Blocker' },
  { name: 'Bisoprolol', aliases: ['concor'], drugClass: 'Beta Blocker' },
  { name: 'Carvedilol', aliases: [], drugClass: 'Beta Blocker' },
  { name: 'Nebivolol', aliases: ['nebicard'], drugClass: 'Beta Blocker' },
  { name: 'Propranolol', aliases: [], drugClass: 'Beta Blocker' },
  { name: 'Enalapril', aliases: [], drugClass: 'ACE Inhibitor' },
  { name: 'Ramipril', aliases: [], drugClass: 'ACE Inhibitor' },
  { name: 'Captopril', aliases: [], drugClass: 'ACE Inhibitor' },
  { name: 'Lisinopril', aliases: [], drugClass: 'ACE Inhibitor' },
  { name: 'Perindopril', aliases: [], drugClass: 'ACE Inhibitor' },
  { name: 'Losartan', aliases: ['losar'], drugClass: 'ARB' },
  { name: 'Telmisartan', aliases: ['telma'], drugClass: 'ARB' },
  { name: 'Olmesartan', aliases: ['olmesar'], drugClass: 'ARB' },
  { name: 'Valsartan', aliases: [], drugClass: 'ARB' },
  { name: 'Hydrochlorothiazide', aliases: ['hctz'], drugClass: 'Thiazide Diuretic' },
  { name: 'Furosemide', aliases: ['lasix'], drugClass: 'Loop Diuretic' },
  { name: 'Torsemide', aliases: ['dytor'], drugClass: 'Loop Diuretic' },
  { name: 'Spironolactone', aliases: [], drugClass: 'Potassium-Sparing Diuretic' },
  { name: 'Atorvastatin', aliases: ['atorva'], drugClass: 'Statin' },
  { name: 'Rosuvastatin', aliases: ['rosuva'], drugClass: 'Statin' },
  { name: 'Pravastatin', aliases: [], drugClass: 'Statin' },
  { name: 'Simvastatin', aliases: [], drugClass: 'Statin' },
  { name: 'Pitavastatin', aliases: [], drugClass: 'Statin' },
  { name: 'Digoxin', aliases: [], drugClass: 'Cardiac Glycoside', renal: { threshold: 60, severity: 'MODERATE', note: 'Digoxin is renally cleared and requires dose adjustment as kidney function declines, to avoid toxicity.' } },
  { name: 'Isosorbide Mononitrate', aliases: ['monotrate'], drugClass: 'Nitrate' },
  { name: 'Isosorbide Dinitrate', aliases: [], drugClass: 'Nitrate' },
  { name: 'Nitroglycerin', aliases: ['glyceryl trinitrate'], drugClass: 'Nitrate' },

  // --- Gastrointestinal ---
  { name: 'Omeprazole', aliases: ['omez'], drugClass: 'Proton Pump Inhibitor' },
  { name: 'Pantoprazole', aliases: [], drugClass: 'Proton Pump Inhibitor' },
  { name: 'Rabeprazole', aliases: ['rablet'], drugClass: 'Proton Pump Inhibitor' },
  { name: 'Esomeprazole', aliases: ['nexium'], drugClass: 'Proton Pump Inhibitor' },
  { name: 'Famotidine', aliases: [], drugClass: 'H2 Blocker' },
  { name: 'Domperidone', aliases: ['domstal'], drugClass: 'Antiemetic' },
  { name: 'Ondansetron', aliases: ['emeset'], drugClass: 'Antiemetic' },
  { name: 'Metoclopramide', aliases: [], drugClass: 'Antiemetic' },
  { name: 'Sucralfate', aliases: [], drugClass: 'Gastric Protectant' },
  { name: 'Lactulose', aliases: [], drugClass: 'Laxative' },
  { name: 'Loperamide', aliases: ['imodium', 'lopamide'], drugClass: 'Antidiarrheal' },

  // --- Respiratory ---
  { name: 'Salbutamol', aliases: ['albuterol', 'asthalin'], drugClass: 'Bronchodilator' },
  { name: 'Theophylline', aliases: [], drugClass: 'Bronchodilator' },
  { name: 'Ipratropium', aliases: [], drugClass: 'Anticholinergic Bronchodilator' },
  { name: 'Tiotropium', aliases: ['tiova'], drugClass: 'Anticholinergic Bronchodilator' },
  { name: 'Budesonide', aliases: ['budecort'], drugClass: 'Inhaled Corticosteroid' },
  { name: 'Montelukast', aliases: ['montair'], drugClass: 'Leukotriene Receptor Antagonist' },
  { name: 'Cetirizine', aliases: ['zyrtec'], drugClass: 'Antihistamine' },
  { name: 'Loratadine', aliases: [], drugClass: 'Antihistamine' },
  { name: 'Fexofenadine', aliases: ['allegra'], drugClass: 'Antihistamine' },
  { name: 'Levocetirizine', aliases: ['levocet'], drugClass: 'Antihistamine' },
  { name: 'Hydroxyzine', aliases: [], drugClass: 'Antihistamine' },

  // --- Steroids ---
  { name: 'Prednisolone', aliases: ['wysolone'], drugClass: 'Corticosteroid' },
  { name: 'Dexamethasone', aliases: [], drugClass: 'Corticosteroid' },
  { name: 'Hydrocortisone', aliases: [], drugClass: 'Corticosteroid' },
  { name: 'Betamethasone', aliases: [], drugClass: 'Corticosteroid' },
  { name: 'Methylprednisolone', aliases: [], drugClass: 'Corticosteroid' },

  // --- Blood thinners ---
  { name: 'Warfarin', aliases: [], drugClass: 'Anticoagulant' },
  { name: 'Enoxaparin', aliases: ['clexane'], drugClass: 'Anticoagulant', renal: { threshold: 30, severity: 'MODERATE', note: 'Enoxaparin accumulates in significant kidney impairment, increasing bleeding risk; dose adjustment is required.' } },
  { name: 'Rivaroxaban', aliases: ['xarelto'], drugClass: 'Direct Oral Anticoagulant' },
  { name: 'Apixaban', aliases: ['eliquis'], drugClass: 'Direct Oral Anticoagulant' },
  { name: 'Dabigatran', aliases: ['pradaxa'], drugClass: 'Direct Oral Anticoagulant' },
  { name: 'Clopidogrel', aliases: ['clopilet'], drugClass: 'Antiplatelet' },
  { name: 'Ticagrelor', aliases: ['brilinta'], drugClass: 'Antiplatelet' },
  { name: 'Prasugrel', aliases: [], drugClass: 'Antiplatelet' },

  // --- CNS / mental health ---
  { name: 'Diazepam', aliases: ['valium'], drugClass: 'Benzodiazepine' },
  { name: 'Alprazolam', aliases: ['xanax'], drugClass: 'Benzodiazepine' },
  { name: 'Clonazepam', aliases: ['rivotril'], drugClass: 'Benzodiazepine' },
  { name: 'Lorazepam', aliases: ['ativan'], drugClass: 'Benzodiazepine' },
  { name: 'Phenytoin', aliases: ['eptoin'], drugClass: 'Antiepileptic' },
  { name: 'Carbamazepine', aliases: [], drugClass: 'Antiepileptic' },
  { name: 'Divalproex Sodium', aliases: ['valparin'], drugClass: 'Antiepileptic' },
  { name: 'Levetiracetam', aliases: ['levipil'], drugClass: 'Antiepileptic' },
  { name: 'Gabapentin', aliases: [], drugClass: 'Antiepileptic / Neuropathic Pain', renal: { threshold: 60, severity: 'CAUTION', note: 'Gabapentin is renally cleared and its dose should be reduced as kidney function declines.' } },
  { name: 'Pregabalin', aliases: ['pregeb'], drugClass: 'Antiepileptic / Neuropathic Pain', renal: { threshold: 60, severity: 'CAUTION', note: 'Pregabalin is renally cleared and its dose should be reduced as kidney function declines.' } },
  { name: 'Sertraline', aliases: ['zoloft'], drugClass: 'SSRI (Antidepressant)' },
  { name: 'Escitalopram', aliases: ['nexito'], drugClass: 'SSRI (Antidepressant)' },
  { name: 'Fluoxetine', aliases: [], drugClass: 'SSRI (Antidepressant)' },
  { name: 'Paroxetine', aliases: [], drugClass: 'SSRI (Antidepressant)' },
  { name: 'Duloxetine', aliases: [], drugClass: 'SNRI (Antidepressant)' },
  { name: 'Venlafaxine', aliases: [], drugClass: 'SNRI (Antidepressant)' },
  { name: 'Amitriptyline', aliases: [], drugClass: 'Tricyclic Antidepressant (TCA)' },
  { name: 'Olanzapine', aliases: [], drugClass: 'Antipsychotic' },
  { name: 'Risperidone', aliases: [], drugClass: 'Antipsychotic' },
  { name: 'Quetiapine', aliases: [], drugClass: 'Antipsychotic' },

  // --- Thyroid ---
  { name: 'Levothyroxine', aliases: ['eltroxin', 'thyronorm'], drugClass: 'Thyroid Hormone' },
  { name: 'Carbimazole', aliases: [], drugClass: 'Thyroid Antagonist' },
  { name: 'Methimazole', aliases: [], drugClass: 'Thyroid Antagonist' },

  // --- Vitamins / supplements ---
  { name: 'Vitamin D3', aliases: ['cholecalciferol'], drugClass: 'Vitamin/Supplement' },
  { name: 'Methylcobalamin', aliases: ['vitamin b12'], drugClass: 'Vitamin/Supplement' },
  { name: 'Folic Acid', aliases: [], drugClass: 'Vitamin/Supplement' },
  { name: 'Ferrous Ascorbate', aliases: [], drugClass: 'Vitamin/Supplement' },
  { name: 'Calcium Carbonate', aliases: [], drugClass: 'Vitamin/Supplement' },

  // --- Antifungal / antiviral ---
  { name: 'Fluconazole', aliases: ['flucos'], drugClass: 'Antifungal' },
  { name: 'Itraconazole', aliases: [], drugClass: 'Antifungal' },
  { name: 'Terbinafine', aliases: ['terbicip'], drugClass: 'Antifungal' },
  { name: 'Acyclovir', aliases: [], drugClass: 'Antiviral' },
  { name: 'Oseltamivir', aliases: ['tamiflu'], drugClass: 'Antiviral' },

  // --- Gout ---
  { name: 'Allopurinol', aliases: ['zyloric'], drugClass: 'Uricosuric/Gout', renal: { threshold: 60, severity: 'CAUTION', note: 'Allopurinol dosing should be reduced as kidney function declines, to avoid toxicity.' } },
  { name: 'Febuxostat', aliases: [], drugClass: 'Uricosuric/Gout' },
  { name: 'Colchicine', aliases: [], drugClass: 'Uricosuric/Gout' },

  // --- Urology ---
  { name: 'Tamsulosin', aliases: ['urimax'], drugClass: 'Alpha Blocker' },
  { name: 'Finasteride', aliases: [], drugClass: 'Hormonal (5-alpha reductase inhibitor)' },
  { name: 'Sildenafil', aliases: ['viagra'], drugClass: 'PDE5 Inhibitor' },
  { name: 'Tadalafil', aliases: ['cialis'], drugClass: 'PDE5 Inhibitor' },
]

// Class-vs-class interaction patterns. Same-class pairs are deliberately
// excluded here -- those are surfaced by the Therapeutic Duplication
// check instead, to avoid reporting the same thing twice.
export const INTERACTION_RULES = [
  { classes: ['NSAID', 'Anticoagulant'], severity: 'HIGH', note: 'Combined use significantly increases bleeding risk.' },
  { classes: ['NSAID', 'Direct Oral Anticoagulant'], severity: 'HIGH', note: 'Combined use significantly increases bleeding risk.' },
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
  { classes: ['Direct Oral Anticoagulant', 'Antiplatelet'], severity: 'HIGH', note: 'Significantly increased bleeding risk when combined.' },
  { classes: ['Anticoagulant', 'Fluoroquinolone Antibiotic'], severity: 'MODERATE', note: 'May potentiate anticoagulant effect — closer monitoring advised.' },
  { classes: ['Anticoagulant', 'Nitroimidazole Antibiotic'], severity: 'MODERATE', note: 'Metronidazole can significantly potentiate warfarin — monitoring advised.' },
  { classes: ['SSRI (Antidepressant)', 'NSAID'], severity: 'MODERATE', note: 'Combined use increases gastrointestinal bleeding risk.' },
  { classes: ['SSRI (Antidepressant)', 'Antiplatelet'], severity: 'MODERATE', note: 'Combined use increases bleeding risk.' },
  { classes: ['SNRI (Antidepressant)', 'NSAID'], severity: 'MODERATE', note: 'Combined use increases gastrointestinal bleeding risk.' },
  { classes: ['Proton Pump Inhibitor', 'Antiplatelet'], severity: 'CAUTION', note: 'Omeprazole-type PPIs may reduce clopidogrel effectiveness.' },
  { classes: ['Benzodiazepine', 'Opioid Analgesic'], severity: 'HIGH', note: 'Combined use significantly increases the risk of sedation and life-threatening respiratory depression.' },
  { classes: ['SSRI (Antidepressant)', 'Opioid Analgesic'], severity: 'MODERATE', note: 'Combined use (particularly with tramadol) increases the risk of serotonin syndrome.' },
  { classes: ['Nitrate', 'PDE5 Inhibitor'], severity: 'HIGH', note: 'Combined use can cause severe, life-threatening hypotension.' },
  { classes: ['Cardiac Glycoside', 'Loop Diuretic'], severity: 'MODERATE', note: 'Diuretic-induced potassium loss increases the risk of digoxin toxicity.' },
  { classes: ['Cardiac Glycoside', 'Thiazide Diuretic'], severity: 'MODERATE', note: 'Diuretic-induced potassium loss increases the risk of digoxin toxicity.' },
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
  { classes: ['SGLT2 Inhibitor (Antidiabetic)'], conditionKeyword: 'kidney', severity: 'CAUTION', note: 'SGLT2 inhibitors have reduced effectiveness and require caution as kidney function declines.' },
  { classes: ['Corticosteroid'], conditionKeyword: 'diabetes', severity: 'CAUTION', note: 'Corticosteroids can raise blood glucose.' },
  { classes: ['Corticosteroid'], conditionKeyword: 'ulcer', severity: 'CAUTION', note: 'Corticosteroids increase GI risk in peptic ulcer disease.' },
  { classes: ['Thiazide Diuretic'], conditionKeyword: 'gout', severity: 'CAUTION', note: 'Thiazide diuretics can raise uric acid and trigger gout flares.' },
  { classes: ['Antitubercular'], conditionKeyword: 'liver', severity: 'MODERATE', note: 'Several antitubercular drugs are hepatotoxic and require caution in liver disease.' },
  { classes: ['Opioid Analgesic'], conditionKeyword: 'kidney', severity: 'CAUTION', note: 'Opioid clearance can be reduced in kidney disease, increasing the risk of accumulation and sedation.' },
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
