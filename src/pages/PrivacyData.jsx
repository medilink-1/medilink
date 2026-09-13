import { useState } from 'react'
import { Download, FileText, Trash2, AlertTriangle, Loader2, ShieldAlert, History } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { usePatientData } from '../lib/usePatientData'
import { useAuth } from '../context/AuthContext'
import { useLanguage } from '../context/LanguageContext'
import { supabase } from '../lib/supabaseClient'
import { describeActivity } from '../lib/activityLog'

// A single place for the two data-ownership actions every patient
// should have: getting a full copy of their own record, and
// permanently erasing it. Both act only on this signed-in user's own
// rows, enforced by the same row-level-security policies as every
// other page -- there is no separate "admin" path here.
export default function PrivacyData() {
  const p = usePatientData()
  const { user, profile, signOut } = useAuth()
  const { t } = useLanguage()
  const navigate = useNavigate()
  const [confirmText, setConfirmText] = useState('')
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState('')

  function buildExportRecord() {
    return {
      exported_at: new Date().toISOString(),
      profile: profile || null,
      conditions: p.conditions,
      allergies: p.allergies,
      medications: p.medications,
      medication_doses: p.medicationDoses,
      lab_results: p.labResults,
      clinic_visits: p.clinicVisits,
      hospital_visits: p.hospitalVisits,
      dependents: p.dependents,
      vaccinations: p.vaccinations,
      insurance_policies: p.insurancePolicies,
      insurance_claims: p.insuranceClaims,
      timeline_events: p.timelineEvents,
      activity_log: p.activityLog,
    }
  }

  function downloadJson() {
    const record = buildExportRecord()
    const blob = new Blob([JSON.stringify(record, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `medilink-export-${new Date().toISOString().slice(0, 10)}.json`
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
  }

  async function handleDeleteEverything() {
    if (!user) return
    setDeleteError('')
    setDeleting(true)
    try {
      // Remove any uploaded document files from storage first -- those
      // live in Supabase Storage, not a regular table, so deleting the
      // profile row below would not clean them up on its own.
      const { data: docs } = await supabase.from('documents').select('storage_path')
      const paths = (docs || []).map((d) => d.storage_path).filter(Boolean)
      if (paths.length > 0) {
        await supabase.storage.from('documents').remove(paths)
      }

      // Every other table's row references this profile with
      // "on delete cascade", so deleting the profile row removes
      // conditions, allergies, medications, medication doses, lab
      // results, clinic/hospital visits, dependents, vaccinations,
      // insurance policies/claims, timeline events, documents and
      // share links in one step.
      await supabase.from('profiles').delete().eq('id', user.id)

      await signOut()
      navigate('/', { replace: true })
    } catch {
      setDeleteError(t('Something went wrong deleting your data. Please try again.'))
      setDeleting(false)
    }
  }

  if (p.loading) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-20 flex items-center gap-2 text-slate-400">
        <Loader2 className="animate-spin" size={18} /> {t('Loading your data…')}
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-14">
      <h1 className="text-3xl font-extrabold text-ink-900">{t('Data & Privacy')}</h1>
      <p className="mt-2 text-slate-500">{t('Get a copy of your health record, or permanently remove it from MediLink.')}</p>

      {/* Export */}
      <section className="mt-10 rounded-2xl border border-slate-100 p-6">
        <h2 className="font-bold text-ink-900 flex items-center gap-2">
          <FileText size={18} className="text-brand-600" /> {t('Export Your Data')}
        </h2>
        <p className="mt-2 text-sm text-slate-500">
          {t('Download everything MediLink has stored for your account: profile, conditions, allergies, medications, lab results, visits, vaccinations, insurance and your health timeline.')}
        </p>
        <p className="mt-2 text-xs text-slate-400">
          {t('Uploaded documents (lab reports, prescriptions) are not included in this file -- download those individually from your Patient Profile.')}
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <button
            onClick={downloadJson}
            className="inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white font-semibold px-5 py-2.5 rounded-full"
          >
            <Download size={16} /> {t('Download as JSON')}
          </button>
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-2 border border-slate-200 hover:border-brand-200 font-semibold text-sm px-5 py-2.5 rounded-full"
          >
            <FileText size={16} /> {t('Print / Save as PDF')}
          </button>
        </div>
      </section>

      {/* Printable summary (also shown on screen so there's nothing hidden) */}
      <section className="mt-8 rounded-2xl border border-slate-100 p-6 text-sm">
        <h2 className="font-bold text-ink-900">{t('Record Summary')}</h2>
        <div className="mt-4 grid sm:grid-cols-2 gap-x-8 gap-y-3 text-slate-600">
          <p>{t('Conditions')}: <span className="font-semibold text-ink-900">{p.conditions.length}</span></p>
          <p>{t('Allergies')}: <span className="font-semibold text-ink-900">{p.allergies.length}</span></p>
          <p>{t('Medications')}: <span className="font-semibold text-ink-900">{p.medications.length}</span></p>
          <p>{t('Lab Results')}: <span className="font-semibold text-ink-900">{p.labResults.length}</span></p>
          <p>{t('Clinic Visit')}: <span className="font-semibold text-ink-900">{p.clinicVisits.length}</span></p>
          <p>{t('Hospital Visit')}: <span className="font-semibold text-ink-900">{p.hospitalVisits.length}</span></p>
          <p>{t('Child Vaccination')}: <span className="font-semibold text-ink-900">{p.vaccinations.length}</span></p>
          <p>{t('Medical Insurance')}: <span className="font-semibold text-ink-900">{p.insurancePolicies.length}</span></p>
        </div>
      </section>

      {/* Activity & access log */}
      <section className="print:hidden mt-8 rounded-2xl border border-slate-100 p-6">
        <h2 className="font-bold text-ink-900 flex items-center gap-2">
          <History size={18} className="text-brand-600" /> {t('Activity & Access Log')}
        </h2>
        <p className="mt-2 text-sm text-slate-500">
          {t('Profile changes and every time one of your share links (including your Emergency QR) was viewed or had a failed PIN attempt.')}
        </p>
        <div className="mt-4 flex flex-col divide-y divide-slate-100">
          {p.activityLog.length === 0 ? (
            <p className="text-sm text-slate-400">{t('No activity recorded yet.')}</p>
          ) : (
            p.activityLog.map((entry) => (
              <div key={entry.id} className="py-2.5 flex items-center justify-between gap-3 text-sm">
                <span className="text-ink-900">
                  {t(describeActivity(entry))}
                  {entry.detail && <span className="text-slate-400"> · {entry.detail}</span>}
                </span>
                <span className="text-xs text-slate-400 shrink-0">{new Date(entry.created_at).toLocaleString()}</span>
              </div>
            ))
          )}
        </div>
      </section>

      {/* Danger zone */}
      <section className="print:hidden mt-8 rounded-2xl border border-red-100 bg-red-50/40 p-6">
        <h2 className="font-bold text-red-700 flex items-center gap-2">
          <ShieldAlert size={18} /> {t('Delete Your Data')}
        </h2>
        <p className="mt-2 text-sm text-red-700/90">
          {t('This permanently deletes every record listed above -- your profile, medical history and uploaded documents -- from MediLink. This cannot be undone.')}
        </p>
        <p className="mt-2 text-xs text-red-700/70">
          {t('This removes your health data, not your sign-in credentials. Your email will still be able to sign in afterward, starting from a blank profile. To close the login itself, contact support.')}
        </p>

        <label className="mt-4 block text-sm font-medium text-ink-900">
          {t('Type DELETE to confirm')}
        </label>
        <input
          value={confirmText}
          onChange={(e) => setConfirmText(e.target.value)}
          className="mt-1.5 w-full max-w-xs rounded-xl border border-red-200 px-4 py-2.5 outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100"
          placeholder="DELETE"
        />

        {deleteError && <p className="mt-2 text-sm text-red-600">{deleteError}</p>}

        <button
          onClick={handleDeleteEverything}
          disabled={confirmText !== 'DELETE' || deleting}
          className="mt-4 inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold px-5 py-2.5 rounded-full"
        >
          <Trash2 size={16} /> {deleting ? t('Deleting…') : t('Permanently Delete My Data')}
        </button>

        <p className="mt-3 text-xs text-red-700/70 flex items-start gap-1.5">
          <AlertTriangle size={13} className="mt-0.5 shrink-0" />
          {t('Consider exporting your data above before deleting it.')}
        </p>
      </section>
    </div>
  )
}
