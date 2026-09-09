import { useState } from 'react'
import { CheckCircle2, Clock, Loader2, Plus, UserRound } from 'lucide-react'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../context/AuthContext'
import { usePatientData } from '../lib/usePatientData'

export default function ChildVaccination() {
  const { user } = useAuth()
  const p = usePatientData()
  const [showForm, setShowForm] = useState(false)
  const [name, setName] = useState('')
  const [age, setAge] = useState('')
  const [relationship, setRelationship] = useState('')
  const [saving, setSaving] = useState(false)

  const handleAddDependent = async (e) => {
    e.preventDefault()
    setSaving(true)
    await supabase.from('dependents').insert({ user_id: user.id, name, age: Number(age) || null, relationship })
    setSaving(false)
    setName(''); setAge(''); setRelationship('')
    setShowForm(false)
    p.reload()
  }

  if (p.loading) {
    return <div className="max-w-4xl mx-auto px-6 py-20 flex items-center gap-2 text-slate-400"><Loader2 className="animate-spin" size={18}/> Loading vaccination records…</div>
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-14">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-extrabold text-ink-900">Child Vaccination</h1>
          <p className="mt-2 text-slate-500">Vaccination history and immunization records for family dependents.</p>
        </div>
        <button onClick={() => setShowForm((v) => !v)} className="inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white font-semibold px-5 py-3 rounded-full">
          <Plus size={18} /> Add Dependent
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleAddDependent} className="mt-8 border border-slate-100 rounded-2xl p-6 grid sm:grid-cols-3 gap-4">
          <input required placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} className="rounded-xl border border-slate-200 px-4 py-3" />
          <input type="number" placeholder="Age" value={age} onChange={(e) => setAge(e.target.value)} className="rounded-xl border border-slate-200 px-4 py-3" />
          <input placeholder="Relationship (e.g. Son)" value={relationship} onChange={(e) => setRelationship(e.target.value)} className="rounded-xl border border-slate-200 px-4 py-3" />
          <div className="sm:col-span-3 flex gap-3">
            <button type="submit" disabled={saving} className="bg-brand-600 hover:bg-brand-700 disabled:opacity-60 text-white font-semibold px-5 py-2.5 rounded-full">
              {saving ? 'Saving…' : 'Save'}
            </button>
            <button type="button" onClick={() => setShowForm(false)} className="text-slate-500 font-medium px-5 py-2.5">Cancel</button>
          </div>
        </form>
      )}

      <div className="mt-10 flex flex-col gap-10">
        {p.dependents.length === 0 ? (
          <div className="text-center py-16 border border-dashed border-slate-200 rounded-2xl text-slate-400">
            No dependents added yet.
          </div>
        ) : (
          p.dependents.map((dep) => {
            const vax = p.vaccinations.filter((v) => v.dependent_id === dep.id)
            return (
              <div key={dep.id}>
                <div className="flex items-center gap-3">
                  <span className="w-11 h-11 rounded-full bg-brand-50 text-brand-600 flex items-center justify-center">
                    <UserRound size={20} />
                  </span>
                  <div>
                    <p className="font-bold text-ink-900">{dep.name}</p>
                    <p className="text-sm text-slate-500">{dep.age} Years · {dep.relationship}</p>
                  </div>
                </div>

                <div className="mt-5 relative pl-8 border-l-2 border-brand-100 flex flex-col gap-5">
                  {vax.map((v) => (
                    <div key={v.id} className="relative">
                      <span className={`absolute -left-[41px] top-0.5 w-4 h-4 rounded-full ring-4 ${
                        v.status === 'completed' ? 'bg-emerald-500 ring-emerald-50' : 'bg-amber-500 ring-amber-50'
                      }`} />
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-ink-900">{v.vaccine_name}</p>
                        {v.status === 'completed' ? (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                            <CheckCircle2 size={12} /> Completed
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">
                            <Clock size={12} /> Due Soon
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                  {vax.length === 0 && <p className="text-sm text-slate-400">No vaccination records yet.</p>}
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
