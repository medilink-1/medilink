import { useState } from 'react'
import { CheckCircle2, Clock, Loader2, Plus, UserRound, Syringe, Pencil, Trash2, Check, X } from 'lucide-react'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../context/AuthContext'
import { usePatientData } from '../lib/usePatientData'

const emptyVaxForm = { vaccine_name: '', status: 'completed', event_date: '' }

export default function ChildVaccination() {
  const { user } = useAuth()
  const p = usePatientData()
  const [showForm, setShowForm] = useState(false)
  const [name, setName] = useState('')
  const [age, setAge] = useState('')
  const [relationship, setRelationship] = useState('')
  const [saving, setSaving] = useState(false)
  const [openVaxFor, setOpenVaxFor] = useState(null)
  const [vaxForm, setVaxForm] = useState(emptyVaxForm)
  const [vaxSaving, setVaxSaving] = useState(false)

  const [editingDepId, setEditingDepId] = useState(null)
  const [editDepForm, setEditDepForm] = useState({ name: '', age: '', relationship: '' })
  const [depRowSaving, setDepRowSaving] = useState(false)

  const [editingVaxId, setEditingVaxId] = useState(null)
  const [editVaxForm, setEditVaxForm] = useState(emptyVaxForm)
  const [vaxRowSaving, setVaxRowSaving] = useState(false)

  const handleAddDependent = async (e) => {
    e.preventDefault()
    setSaving(true)
    await supabase.from('dependents').insert({ user_id: user.id, name, age: Number(age) || null, relationship })
    setSaving(false)
    setName(''); setAge(''); setRelationship('')
    setShowForm(false)
    p.reload()
  }

  const handleAddVaccination = async (e, dependentId) => {
    e.preventDefault()
    setVaxSaving(true)
    await supabase.from('vaccinations').insert({
      user_id: user.id,
      dependent_id: dependentId,
      vaccine_name: vaxForm.vaccine_name,
      status: vaxForm.status || 'completed',
      event_date: vaxForm.event_date || new Date().toISOString().slice(0, 10),
    })
    setVaxSaving(false)
    setVaxForm(emptyVaxForm)
    setOpenVaxFor(null)
    p.reload()
  }

  function startEditDependent(dep) {
    setEditingDepId(dep.id)
    setEditDepForm({ name: dep.name || '', age: dep.age ?? '', relationship: dep.relationship || '' })
  }

  async function saveEditDependent(id) {
    if (!editDepForm.name.trim()) return
    setDepRowSaving(true)
    await supabase.from('dependents').update({
      name: editDepForm.name.trim(),
      age: editDepForm.age === '' ? null : Number(editDepForm.age),
      relationship: editDepForm.relationship || null,
    }).eq('id', id)
    setDepRowSaving(false)
    setEditingDepId(null)
    await p.reload()
  }

  async function deleteDependent(dep) {
    if (!window.confirm(`Remove "${dep.name}" and all of their vaccination records? This cannot be undone.`)) return
    await supabase.from('dependents').delete().eq('id', dep.id)
    await p.reload()
  }

  function startEditVax(v) {
    setEditingVaxId(v.id)
    setEditVaxForm({ vaccine_name: v.vaccine_name || '', status: v.status || 'completed', event_date: v.event_date || '' })
  }

  async function saveEditVax(id) {
    if (!editVaxForm.vaccine_name.trim()) return
    setVaxRowSaving(true)
    await supabase.from('vaccinations').update({
      vaccine_name: editVaxForm.vaccine_name.trim(),
      status: editVaxForm.status || 'completed',
      event_date: editVaxForm.event_date || null,
    }).eq('id', id)
    setVaxRowSaving(false)
    setEditingVaxId(null)
    await p.reload()
  }

  async function deleteVax(v) {
    if (!window.confirm(`Remove the "${v.vaccine_name}" vaccination record? This cannot be undone.`)) return
    await supabase.from('vaccinations').delete().eq('id', v.id)
    await p.reload()
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
                {editingDepId === dep.id ? (
                  <form
                    onSubmit={(e) => { e.preventDefault(); saveEditDependent(dep.id) }}
                    className="flex items-center gap-2 border border-slate-100 rounded-2xl p-4 flex-wrap"
                  >
                    <input autoFocus required placeholder="Name" value={editDepForm.name} onChange={(e) => setEditDepForm({ ...editDepForm, name: e.target.value })} className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm" />
                    <input type="number" placeholder="Age" value={editDepForm.age} onChange={(e) => setEditDepForm({ ...editDepForm, age: e.target.value })} className="w-24 rounded-lg border border-slate-200 px-3 py-1.5 text-sm" />
                    <input placeholder="Relationship" value={editDepForm.relationship} onChange={(e) => setEditDepForm({ ...editDepForm, relationship: e.target.value })} className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm" />
                    <button type="submit" disabled={depRowSaving} className="p-1.5 text-emerald-600 hover:text-emerald-700" title="Save">
                      <Check size={16} />
                    </button>
                    <button type="button" onClick={() => setEditingDepId(null)} className="p-1.5 text-slate-400 hover:text-slate-600" title="Cancel">
                      <X size={16} />
                    </button>
                  </form>
                ) : (
                  <div className="flex items-center justify-between gap-3 flex-wrap">
                    <div className="flex items-center gap-3">
                      <span className="w-11 h-11 rounded-full bg-brand-50 text-brand-600 flex items-center justify-center">
                        <UserRound size={20} />
                      </span>
                      <div>
                        <p className="font-bold text-ink-900">{dep.name}</p>
                        <p className="text-sm text-slate-500">{dep.age} Years · {dep.relationship}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button type="button" onClick={() => startEditDependent(dep)} className="p-1.5 text-slate-400 hover:text-brand-600" title="Edit dependent">
                        <Pencil size={14} />
                      </button>
                      <button type="button" onClick={() => deleteDependent(dep)} className="p-1.5 text-slate-400 hover:text-red-600" title="Remove dependent">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                )}

                <div className="mt-5 relative pl-8 border-l-2 border-brand-100 flex flex-col gap-5">
                  {vax.map((v) => (
                    <div key={v.id} className="relative">
                      <span className={`absolute -left-[41px] top-0.5 w-4 h-4 rounded-full ring-4 ${
                        v.status === 'completed' ? 'bg-emerald-500 ring-emerald-50' : 'bg-amber-500 ring-amber-50'
                      }`} />
                      {editingVaxId === v.id ? (
                        <form
                          onSubmit={(e) => { e.preventDefault(); saveEditVax(v.id) }}
                          className="flex items-center gap-2 border border-slate-100 rounded-xl p-3 flex-wrap"
                        >
                          <input autoFocus required placeholder="Vaccine name" value={editVaxForm.vaccine_name} onChange={(e) => setEditVaxForm({ ...editVaxForm, vaccine_name: e.target.value })} className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm" />
                          <input type="date" value={editVaxForm.event_date} onChange={(e) => setEditVaxForm({ ...editVaxForm, event_date: e.target.value })} className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm" />
                          <select value={editVaxForm.status} onChange={(e) => setEditVaxForm({ ...editVaxForm, status: e.target.value })} className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm bg-white">
                            <option value="completed">Completed</option>
                            <option value="due_soon">Due Soon</option>
                            <option value="scheduled">Scheduled</option>
                          </select>
                          <button type="submit" disabled={vaxRowSaving} className="p-1.5 text-emerald-600 hover:text-emerald-700" title="Save">
                            <Check size={16} />
                          </button>
                          <button type="button" onClick={() => setEditingVaxId(null)} className="p-1.5 text-slate-400 hover:text-slate-600" title="Cancel">
                            <X size={16} />
                          </button>
                        </form>
                      ) : (
                        <div className="flex items-center gap-2 flex-wrap">
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
                          <button type="button" onClick={() => startEditVax(v)} className="p-1 text-slate-400 hover:text-brand-600" title="Edit">
                            <Pencil size={13} />
                          </button>
                          <button type="button" onClick={() => deleteVax(v)} className="p-1 text-slate-400 hover:text-red-600" title="Delete">
                            <Trash2 size={13} />
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                  {vax.length === 0 && <p className="text-sm text-slate-400">No vaccination records yet.</p>}
                </div>

                <button
                  type="button"
                  onClick={() => { setOpenVaxFor(openVaxFor === dep.id ? null : dep.id); setVaxForm(emptyVaxForm) }}
                  className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-600 hover:text-brand-700"
                >
                  <Syringe size={14} /> Add Vaccination
                </button>

                {openVaxFor === dep.id && (
                  <form onSubmit={(e) => handleAddVaccination(e, dep.id)} className="mt-3 border border-slate-100 rounded-2xl p-5 grid sm:grid-cols-3 gap-3">
                    <input required placeholder="Vaccine name" value={vaxForm.vaccine_name} onChange={(e) => setVaxForm({ ...vaxForm, vaccine_name: e.target.value })} className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm sm:col-span-2" />
                    <input type="date" value={vaxForm.event_date} onChange={(e) => setVaxForm({ ...vaxForm, event_date: e.target.value })} className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm" />
                    <select value={vaxForm.status} onChange={(e) => setVaxForm({ ...vaxForm, status: e.target.value })} className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm bg-white sm:col-span-3">
                      <option value="completed">Completed</option>
                      <option value="due_soon">Due Soon</option>
                      <option value="scheduled">Scheduled</option>
                    </select>
                    <div className="sm:col-span-3 flex gap-3">
                      <button type="submit" disabled={vaxSaving} className="bg-brand-600 hover:bg-brand-700 disabled:opacity-60 text-white text-sm font-semibold px-5 py-2 rounded-full">
                        {vaxSaving ? 'Saving…' : 'Save'}
                      </button>
                      <button type="button" onClick={() => setOpenVaxFor(null)} className="text-slate-500 text-sm font-medium px-5 py-2">Cancel</button>
                    </div>
                  </form>
                )}
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
