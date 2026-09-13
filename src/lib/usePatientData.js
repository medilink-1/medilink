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
    medicationDoses: [],
    activityLog: [],
    emergencyQrLink: null,
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
      medicationDoses,
      activityLog,
      emergencyQrLink,
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
      supabase
        .from('medication_doses')
        .select('*')
        .gte('dose_date', new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)),
      supabase.from('activity_log').select('*').order('created_at', { ascending: false }).limit(30),
      supabase
        .from('share_links')
        .select('token, expires_at')
        .eq('label', '__emergency_qr__')
        .eq('revoked', false)
        .gt('expires_at', new Date().toISOString())
        .maybeSingle(),
    ])

    // Self-healing backfill: earlier app versions saved clinic/hospital
    // visits without also writing a matching timeline_events row, so those
    // older visits would otherwise never show up on the Health Timeline.
    // On every load, fill in any timeline events that are missing for an
    // existing visit (best-effort match by title, so this never creates
    // duplicates for visits that already have their event).
    let allTimelineEvents = timelineEvents.data || []
    const existingKeys = new Set(allTimelineEvents.map((e) => `${e.category}::${e.title}`))
    const missingEvents = []

    for (const v of clinicVisits.data || []) {
      const title = `Clinic Visit — ${v.diagnosis || v.complaint || v.specialty || 'Consultation'}`
      const key = `clinic::${title}`
      if (!existingKeys.has(key)) {
        existingKeys.add(key)
        missingEvents.push({
          user_id: user.id,
          event_year: new Date(v.visit_date || Date.now()).getFullYear(),
          title,
          category: 'clinic',
          description: [v.doctor && `Dr. ${v.doctor}`, v.specialty].filter(Boolean).join(' · ') || null,
        })
      }
    }

    for (const v of hospitalVisits.data || []) {
      const title = `Hospital Admission — ${v.hospital_name}`
      const key = `hospital::${title}`
      if (!existingKeys.has(key)) {
        existingKeys.add(key)
        missingEvents.push({
          user_id: user.id,
          event_year: new Date(v.admission_date || Date.now()).getFullYear(),
          title,
          category: 'hospital',
          description: v.reason || v.diagnosis || null,
        })
      }
    }

    if (missingEvents.length > 0) {
      const { data: inserted } = await supabase.from('timeline_events').insert(missingEvents).select()
      allTimelineEvents = [...allTimelineEvents, ...(inserted || [])]
    }

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
      timelineEvents: allTimelineEvents,
      medicationDoses: medicationDoses.data || [],
      activityLog: activityLog.data || [],
      emergencyQrLink: emergencyQrLink.data || null,
    })
    setLoading(false)
  }, [user])

  useEffect(() => {
    reload()
  }, [reload])

  return { profile, ...data, loading, reload }
}
