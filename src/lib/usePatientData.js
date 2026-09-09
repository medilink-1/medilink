import { useEffect, useState, useCallback } from 'react'
import { supabase } from './supabaseClient'
import { useAuth } from '../context/AuthContext'

// Loads the full longitudinal patient record for the signed-in user in one
// place, so every module (profile, pharmacy, clinic, hospital, vaccination,
// insurance, timeline) reads from the same source of truth.
export function usePatientData() {
  const { user, profile } = useAuth()
  const [data, setData] = useState({
    conditions: [],
    allergies: [],
    medications: [],
    labResults: [],
    clinicVisits: [],
    hospitalVisits: [],
    dependents: [],
    vaccinations: [],
    insurancePolicies: [],
    insuranceClaims: [],
    timelineEvents: [],
  })
  const [loading, setLoading] = useState(true)

  const reload = useCallback(async () => {
    if (!user) return
    setLoading(true)
    const [
      conditions,
      allergies,
      medications,
      labResults,
      clinicVisits,
      hospitalVisits,
      dependents,
      vaccinations,
      insurancePolicies,
      insuranceClaims,
      timelineEvents,
    ] = await Promise.all([
      supabase.from('conditions').select('*').order('created_at'),
      supabase.from('allergies').select('*').order('created_at'),
      supabase.from('medications').select('*').order('created_at'),
      supabase.from('lab_results').select('*').order('recorded_at', { ascending: false }),
      supabase.from('clinic_visits').select('*').order('visit_date', { ascending: false }),
      supabase.from('hospital_visits').select('*').order('admission_date', { ascending: false }),
      supabase.from('dependents').select('*').order('created_at'),
      supabase.from('vaccinations').select('*').order('created_at'),
      supabase.from('insurance_policies').select('*').order('created_at'),
      supabase.from('insurance_claims').select('*').order('created_at'),
      supabase.from('timeline_events').select('*').order('event_year'),
    ])

    setData({
      conditions: conditions.data || [],
      allergies: allergies.data || [],
      medications: medications.data || [],
      labResults: labResults.data || [],
      clinicVisits: clinicVisits.data || [],
      hospitalVisits: hospitalVisits.data || [],
      dependents: dependents.data || [],
      vaccinations: vaccinations.data || [],
      insurancePolicies: insurancePolicies.data || [],
      insuranceClaims: insuranceClaims.data || [],
      timelineEvents: timelineEvents.data || [],
    })
    setLoading(false)
  }, [user])

  useEffect(() => {
    reload()
  }, [reload])

  return { profile, ...data, loading, reload }
}
