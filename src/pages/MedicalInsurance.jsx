import { useState } from 'react'
import { ShieldCheck, Loader2, ReceiptText, Plus } from 'lucide-react'
import { usePatientData } from '../lib/usePatientData'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabaseClient'

const statusStyles = {
  active: 'bg-emerald-50 text-emerald-700',
  approved: 'bg-emerald-50 text-emerald-700',
  submitted: 'bg-amber-50 text-amber-700',
  rejected: 'bg-red-50 text-red-700',
}

function formatINR(amount) {
  if (amount == null) return '—'
  return `₹${Number(amount).toLocaleString('en-IN')}`
}

const emptyPolicyForm = { provider: '', policy_number: '', policy_type: '', coverage_amount: '', status: 'active' }

export default function MedicalInsurance() {
  const { user } = useAuth()
  const p = usePatientData()
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(emptyPolicyForm)
  const [saving, setSaving] = useState(false)

  const handleAdd = async (e) => {
    e.preventDefault()
    setSaving(true)
    await supabase.from('insurance_policies').insert({
      user_id: user.id,
      provider: form.provider,
      policy_number: form.policy_number || null,
      policy_type: form.policy_type || null,
      coverage_amount: form.coverage_amount === '' ? null : Number(form.coverage_amount),
      status: form.status || 'active',
    })
    setSaving(false)
    setForm(emptyPolicyForm)
    setShowForm(false)
    p.reload()
  }

  if (p.loading) {
    return <div className="max-w-4xl mx-auto px-6 py-20 flex items-center gap-2 text-slate-400"><Loader2 className="animate-spin" size={18}/> Loading insurance details…</div>
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-14">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-extrabold text-ink-900">Medical Insurance</h1>
          <p className="mt-2 text-slate-500">Healthcare coverage and insurance information.</p>
        </div>
        <button onClick={() => setShowForm((v) => !v)} className="inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white font-semibold px-5 py-3 rounded-full">
          <Plus size={18} /> Add Policy
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleAdd} className="mt-8 border border-slate-100 rounded-2xl p-6 grid sm:grid-cols-2 gap-4">
          <input required placeholder="Insurance provider" value={form.provider} onChange={(e) => setForm({ ...form, provider: e.target.value })} className="rounded-xl border border-slate-200 px-4 py-3 sm:col-span-2" />
          <input placeholder="Policy number" value={form.policy_number} onChange={(e) => setForm({ ...form, policy_number: e.target.value })} className="rounded-xl border border-slate-200 px-4 py-3" />
          <input placeholder="Policy type (e.g. Family Floater)" value={form.policy_type} onChange={(e) => setForm({ ...form, policy_type: e.target.value })} className="rounded-xl border border-slate-200 px-4 py-3" />
          <input type="number" placeholder="Coverage amount (₹)" value={form.coverage_amount} onChange={(e) => setForm({ ...form, coverage_amount: e.target.value })} className="rounded-xl border border-slate-200 px-4 py-3" />
          <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="rounded-xl border border-slate-200 px-4 py-3 bg-white">
            <option value="active">Active</option>
            <option value="expired">Expired</option>
          </select>
          <div className="sm:col-span-2 flex gap-3">
            <button type="submit" disabled={saving} className="bg-brand-600 hover:bg-brand-700 disabled:opacity-60 text-white font-semibold px-5 py-2.5 rounded-full">
              {saving ? 'Saving…' : 'Save policy'}
            </button>
            <button type="button" onClick={() => setShowForm(false)} className="text-slate-500 font-medium px-5 py-2.5">Cancel</button>
          </div>
        </form>
      )}

      <div className="mt-8 flex flex-col gap-6">
        {p.insurancePolicies.length === 0 ? (
          <div className="text-center py-16 border border-dashed border-slate-200 rounded-2xl text-slate-400">
            No insurance policy on file.
          </div>
        ) : (
          p.insurancePolicies.map((policy) => (
            <div key={policy.id} className="border border-slate-100 rounded-2xl p-6">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <p className="font-bold text-ink-900 flex items-center gap-2">
                  <ShieldCheck size={18} className="text-brand-600" /> {policy.provider}
                </p>
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full capitalize ${statusStyles[policy.status] || statusStyles.active}`}>
                  {policy.status}
                </span>
              </div>

              <div className="mt-4 grid sm:grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-xs text-slate-400">Policy Number</p>
                  <p className="font-semibold text-ink-900">{policy.policy_number}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400">Policy Type</p>
                  <p className="font-semibold text-ink-900">{policy.policy_type}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400">Coverage</p>
                  <p className="font-semibold text-ink-900">{formatINR(policy.coverage_amount)}</p>
                </div>
              </div>

              <p className="mt-6 text-xs font-bold text-slate-400">CLAIMS HISTORY</p>
              <div className="mt-3 flex flex-col gap-3">
                {p.insuranceClaims.filter((c) => c.policy_id === policy.id).map((claim) => (
                  <div key={claim.id} className="flex items-center justify-between border border-slate-100 rounded-xl p-4 flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <ReceiptText size={16} className="text-slate-400" />
                      <div>
                        <p className="text-sm font-semibold text-ink-900">{claim.claim_ref}</p>
                        <p className="text-xs text-slate-500">{claim.hospital_name}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-semibold text-ink-900">{formatINR(claim.amount)}</span>
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full capitalize ${statusStyles[claim.status] || statusStyles.submitted}`}>
                        {claim.status}
                      </span>
                    </div>
                  </div>
                ))}
                {p.insuranceClaims.filter((c) => c.policy_id === policy.id).length === 0 && (
                  <p className="text-sm text-slate-400">No claims filed yet.</p>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
