import { useState } from 'react'
import { Plus, Stethoscope, Loader2 } from 'lucide-react'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../context/AuthContext'
import { usePatientData } from '../lib/usePatientData'

const emptyForm = { visit_date: '', doctor: '', specialty: '', complaint: '', diagnosis: '', prescription: '', follow_up: '' }

export default function ClinicVisit() {
  const { user } = useAuth()
  const p = usePatientData()
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)

  const handleAdd = async (e) => {
    e.preventDefault()
    setSaving(true)
    const visit_date = form.visit_date || new Date().toISOString().slice(0, 10)
    await supabase.from('clinic_visits').insert({
      ...form,
      visit_date,
      user_id: user.id,
    })
    await supabase.from('timeline_events').insert({
      user_id: user.id,
      event_year: new Date(visit_date).getFullYear(),
      title: `Clinic Visit — ${form.diagnosis || form.complaint || form.specialty || 'Consultation'}`,
      category: 'clinic',
      description: [form.doctor && `Dr. ${form.doctor}`, form.specialty].filter(Boolean).join(' · ') || null,
    })
    setSaving(false)
    setForm(emptyForm)
    setShowForm(false)
    p.reload()
  }

  if (p.loading) {
    return <div className="max-w-4xl mx-auto px-6 py-20 flex items-center gap-2 text-slate-400"><Loader2 className="animate-spin" size={18}/> Loading clinic visits…</div>
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-14">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-extrabold text-ink-900">Clinic Visit</h1>
          <p className="mt-2 text-slate-500">Consultations, diagnoses and treatment records.</p>
        </div>
        <button onClick={() => setShowForm((v) => !v)} className="inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white font-semibold px-5 py-3 rounded-full">
          <Plus size={18} /> Add New Visit
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleAdd} className="mt-8 border border-slate-100 rounded-2xl p-6 grid sm:grid-cols-2 gap-4">
          <input type="date" value={form.visit_date} onChange={(e) => setForm({ ...form, visit_date: e.target.value })} className="rounded-xl border border-slate-200 px-4 py-3" />
          <input required placeholder="Doctor" value={form.doctor} onChange={(e) => setForm({ ...form, doctor: e.target.value })} className="rounded-xl border border-slate-200 px-4 py-3" />
          <input placeholder="Speciality" value={form.specialty} onChange={(e) => setForm({ ...form, specialty: e.target.value })} className="rounded-xl border border-slate-200 px-4 py-3" />
          <input placeholder="Chief complaint" value={form.complaint} onChange={(e) => setForm({ ...form, complaint: e.target.value })} className="rounded-xl border border-slate-200 px-4 py-3" />
          <input placeholder="Diagnosis" value={form.diagnosis} onChange={(e) => setForm({ ...form, diagnosis: e.target.value })} className="rounded-xl border border-slate-200 px-4 py-3 sm:col-span-2" />
          <textarea placeholder="Prescription" value={form.prescription} onChange={(e) => setForm({ ...form, prescription: e.target.value })} className="rounded-xl border border-slate-200 px-4 py-3 sm:col-span-2" rows={2} />
          <input placeholder="Follow-up" value={form.follow_up} onChange={(e) => setForm({ ...form, follow_up: e.target.value })} className="rounded-xl border border-slate-200 px-4 py-3 sm:col-span-2" />
          <div className="sm:col-span-2 flex gap-3">
            <button type="submit" disabled={saving} className="bg-brand-600 hover:bg-brand-700 disabled:opacity-60 text-white font-semibold px-5 py-2.5 rounded-full">
              {saving ? 'Saving…' : 'Save visit'}
            </button>
            <button type="button" onClick={() => setShowForm(false)} className="text-slate-500 font-medium px-5 py-2.5">Cancel</button>
          </div>
        </form>
      )}

      <div className="mt-8 flex flex-col gap-4">
        {p.clinicVisits.length === 0 ? (
          <div className="text-center py-16 border border-dashed border-slate-200 rounded-2xl text-slate-400">
            No clinic visits recorded yet.
          </div>
        ) : (
          p.clinicVisits.map((v) => (
            <div key={v.id} className="border border-slate-100 rounded-2xl p-6">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <p className="font-semibold text-ink-900 flex items-center gap-2">
                  <Stethoscope size={16} className="text-brand-600" /> {new Date(v.visit_date).toLocaleDateString()}
                </p>
                <span className="text-xs font-semibold bg-brand-50 text-brand-700 px-2.5 py-1 rounded-full">{v.specialty}</span>
              </div>
              <p className="mt-3 text-sm text-slate-500">Doctor: <span className="text-ink-900 font-medium">{v.doctor}</span></p>
              <p className="text-sm text-slate-500">Chief complaint: <span className="text-ink-900">{v.complaint}</span></p>
              <p className="text-sm text-slate-500">Diagnosis: <span className="text-ink-900 font-medium">{v.diagnosis}</span></p>
              {v.prescription && <p className="text-sm text-slate-500 mt-2">Prescription: <span className="text-ink-900">{v.prescription}</span></p>}
              {v.follow_up && <p className="text-sm text-slate-400 mt-1">Follow-up: {v.follow_up}</p>}
            </div>
          ))
        )}
      </div>
    </div>
  )
}
