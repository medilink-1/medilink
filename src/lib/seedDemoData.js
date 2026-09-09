import { supabase } from './supabaseClient'

// Seeds the exact demo dataset described in the MediLink brief (Anjali Patil,
// a 68-year-old demo patient) into a brand-new account, so the prototype is
// immediately populated with realistic longitudinal health data. Runs once
// per account -- profiles.seeded flags that it has already happened.
export async function seedDemoDataIfNeeded(userId) {
  const { data: profile } = await supabase
    .from('profiles')
    .select('seeded')
    .eq('id', userId)
    .single()

  if (!profile || profile.seeded) return

  await supabase
    .from('profiles')
    .update({
      age: 68,
      gender: 'Female',
      blood_group: 'B+',
      health_id: 'ML-2026-001',
      emergency_name: 'Raj Patil',
      emergency_relation: 'Son',
      emergency_phone: '+91 98765 43210',
    })
    .eq('id', userId)

  await supabase.from('conditions').insert([
    { user_id: userId, name: 'Type 2 Diabetes' },
    { user_id: userId, name: 'Hypertension' },
    { user_id: userId, name: 'Chronic Kidney Disease Stage 3' },
  ])

  await supabase.from('allergies').insert([
    { user_id: userId, name: 'Penicillin', severity: 'high' },
  ])

  await supabase.from('medications').insert([
    { user_id: userId, name: 'Metformin', dose: '500 mg', frequency: 'Twice Daily', duration: '3 Years', status: 'active' },
    { user_id: userId, name: 'Amlodipine', dose: '5 mg', frequency: 'Once Daily', duration: '2 Years', status: 'active' },
    { user_id: userId, name: 'Losartan', dose: '50 mg', frequency: 'Once Daily', duration: '1 Year', status: 'active' },
  ])

  await supabase.from('lab_results').insert([
    { user_id: userId, test_name: 'Serum Creatinine', value: '1.8', unit: 'mg/dL' },
    { user_id: userId, test_name: 'eGFR', value: '42', unit: 'mL/min/1.73m²' },
    { user_id: userId, test_name: 'HbA1c', value: '7.2', unit: '%' },
  ])

  await supabase.from('clinic_visits').insert([
    {
      user_id: userId,
      visit_date: '2026-08-15',
      doctor: 'Dr. Rahul Sharma',
      specialty: 'General Medicine',
      complaint: 'Routine follow-up',
      diagnosis: 'Type 2 Diabetes and Hypertension',
      prescription: 'Metformin 500 mg, Amlodipine 5 mg, Losartan 50 mg',
      follow_up: 'After 3 months',
    },
  ])

  await supabase.from('hospital_visits').insert([
    {
      user_id: userId,
      hospital_name: 'CityCare Multispeciality Hospital',
      admission_date: '2024-01-12',
      discharge_date: '2024-01-17',
      reason: 'Community Acquired Pneumonia',
      diagnosis: 'Pneumonia',
      treatment_summary: 'Antibiotic therapy, supportive treatment and clinical monitoring.',
    },
  ])

  const { data: dependent } = await supabase
    .from('dependents')
    .insert({ user_id: userId, name: 'Aarav Patil', age: 4, relationship: 'Grandson' })
    .select()
    .single()

  if (dependent) {
    await supabase.from('vaccinations').insert([
      { user_id: userId, dependent_id: dependent.id, vaccine_name: 'BCG', status: 'completed' },
      { user_id: userId, dependent_id: dependent.id, vaccine_name: 'OPV', status: 'completed' },
      { user_id: userId, dependent_id: dependent.id, vaccine_name: 'DPT', status: 'completed' },
      { user_id: userId, dependent_id: dependent.id, vaccine_name: 'Hepatitis B', status: 'completed' },
      { user_id: userId, dependent_id: dependent.id, vaccine_name: 'MMR', status: 'completed' },
      { user_id: userId, dependent_id: dependent.id, vaccine_name: 'Booster Dose', status: 'due_soon' },
    ])
  }

  const { data: policy } = await supabase
    .from('insurance_policies')
    .insert({
      user_id: userId,
      provider: 'HealthSecure Insurance',
      policy_number: 'HS-2026-458921',
      policy_type: 'Family Health Insurance',
      coverage_amount: 1000000,
      status: 'active',
    })
    .select()
    .single()

  if (policy) {
    await supabase.from('insurance_claims').insert([
      {
        user_id: userId,
        policy_id: policy.id,
        claim_ref: 'CL-2025-001',
        hospital_name: 'CityCare Multispeciality Hospital',
        status: 'approved',
        amount: 48500,
      },
    ])
  }

  await supabase.from('timeline_events').insert([
    { user_id: userId, event_year: 2022, title: 'Type 2 Diabetes Diagnosed', category: 'clinic', description: 'Initial diagnosis and treatment plan established.' },
    { user_id: userId, event_year: 2023, title: 'Hypertension Diagnosed', category: 'clinic', description: 'Blood pressure management initiated.' },
    { user_id: userId, event_year: 2024, title: 'Hospital Admission for Pneumonia', category: 'hospital', description: 'Admitted to CityCare Multispeciality Hospital for community acquired pneumonia.' },
    { user_id: userId, event_year: 2024, title: 'Chronic Kidney Disease Identified', category: 'laboratory', description: 'Renal function decline identified via lab screening.' },
    { user_id: userId, event_year: 2025, title: 'Penicillin Allergy Recorded', category: 'pharmacy', description: 'Documented during pharmacy medication review.' },
    { user_id: userId, event_year: 2026, title: 'Medication Safety Review', category: 'pharmacy', description: 'Full medication list reviewed for interactions and renal dosing.' },
  ])

  await supabase.from('profiles').update({ seeded: true }).eq('id', userId)
}
