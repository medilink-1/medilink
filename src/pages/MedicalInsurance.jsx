import { useState } from 'react'
import { ShieldCheck, Loader2, ReceiptText, Plus, Pencil, Trash2, Check, X } from 'lucide-react'
import { usePatientData } from '../lib/usePatientData'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabaseClient'
import { useLanguage } from '../context/LanguageContext'

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
const emptyClaimForm = { claim_ref: '', hospital_name: '', amount: '', status: 'submitted' }

export default function MedicalInsurance() {
  const { user } = useAuth()
  const { t } = useLanguage()
  const p = usePatientData()
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(emptyPolicyForm)
  const [saving, setSaving] = useState(false)

  const [editingPolicyId, setEditingPolicyId] = useState(null)
  const [editPolicyForm, setEditPolicyForm] = useState(emptyPolicyForm)
  const [policyRowSaving, setPolicyRowSaving] = useState(false)

  const [openClaimFor, setOpenClaimFor] = useState(null)
  const [claimForm, setClaimForm] = useState(emptyClaimForm)
  const [claimSaving, setClaimSaving] = useState(false)

  const [editingClaimId, setEditingClaimId] = useState(null)
  const [editClaimForm, setEditClaimForm] = useState(emptyClaimForm)
  const [claimRowSaving, setClaimRowSaving] = useState(false)

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

  function startEditPolicy(policy) {
    setEditingPolicyId(policy.id)
    setEditPolicyForm({
      provider: policy.provider || '',
      policy_number: policy.policy_number || '',
      policy_type: policy.policy_type || '',
      coverage_amount: policy.coverage_amount ?? '',
      status: policy.status || 'active',
    })
  }

  async function saveEditPolicy(id) {
    setPolicyRowSaving(true)
    await supabase.from('insurance_policies').update({
      provider: editPolicyForm.provider,
      policy_number: editPolicyForm.policy_number || null,
      policy_type: editPolicyForm.policy_type || null,
      coverage_amount: editPolicyForm.coverage_amount === '' ? null : Number(editPolicyForm.coverage_amount),
      status: editPolicyForm.status || 'active',
    }).eq('id', id)
    setPolicyRowSaving(false)
    setEditingPolicyId(null)
    await p.reload()
  }

  async function deletePolicy(policy) {
    if (!window.confirm(`Delete the "${policy.provider}" policy and all of its claims? This cannot be undone.`)) return
    await supabase.from('insurance_policies').delete().eq('id', policy.id)
    await p.reload()
  }

  async function handleAddClaim(e, policyId) {
    e.preventDefault()
    setClaimSaving(true)
    await supabase.from('insurance_claims').insert({
      user_id: user.id,
      policy_id: policyId,
      claim_ref: claimForm.claim_ref || null,
      hospital_name: claimForm.hospital_name || null,
      amount: claimForm.amount === '' ? null : Number(claimForm.amount),
      status: claimForm.status || 'submitted',
    })
    setClaimSaving(false)
    setClaimForm(emptyClaimForm)
    setOpenClaimFor(null)
    p.reload()
  }

  function startEditClaim(claim) {
    setEditingClaimId(claim.id)
    setEditClaimForm({
      claim_ref: claim.claim_ref || '',
      hospital_name: claim.hospital_name || '',
      amount: claim.amount ?? '',
      status: claim.status || 'submitted',
    })
  }

  async function saveEditClaim(id) {
    setClaimRowSaving(true)
    await supabase.from('insurance_claims').update({
      claim_ref: editClaimForm.claim_ref || null,
      hospital_name: editClaimForm.hospital_name || null,
      amount: editClaimForm.amount === '' ? null : Number(editClaimForm.amount),
      status: editClaimForm.status || 'submitted',
    }).eq('id', id)
    setClaimRowSaving(false)
    setEditingClaimId(null)
    await p.reload()
  }

  async function deleteClaim(claim) {
    if (!window.confirm('Delete this claim record? This cannot be undone.')) return
    await supabase.from('insurance_claims').delete().eq('id', claim.id)
    await p.reload()
  }

  if (p.loading) {
    return <div className="max-w-4xl mx-auto px-6 py-20 flex items-center gap-2 text-slate-400"><Loader2 className="animate-spin" size={18}/> {t('Loading insurance details…')}</div>
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-14">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-extrabold text-ink-900">{t('Medical Insurance')}</h1>
          <p className="mt-2 text-slate-500">{t('Healthcare coverage and insurance information.')}</p>
        </div>
        <button onClick={() => setShowForm((v) => !v)} className="inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white font-semibold px-5 py-3 rounded-full">
          <Plus size={18} /> {t('Add Policy')}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleAdd} className="mt-8 border border-slate-100 rounded-2xl p-6 grid sm:grid-cols-2 gap-4">
          <input required placeholder={t('Insurance provider')} value={form.provider} onChange={(e) => setForm({ ...form, provider: e.target.value })} className="rounded-xl border border-slate-200 px-4 py-3 sm:col-span-2" />
          <input placeholder={t('Policy number')} value={form.policy_number} onChange={(e) => setForm({ ...form, policy_number: e.target.value })} className="rounded-xl border border-slate-200 px-4 py-3" />
          <input placeholder={t('Policy type (e.g. Family Floater)')} value={form.policy_type} onChange={(e) => setForm({ ...form, policy_type: e.target.value })} className="rounded-xl border border-slate-200 px-4 py-3" />
          <input type="number" placeholder={t('Coverage amount (₹)')} value={form.coverage_amount} onChange={(e) => setForm({ ...form, coverage_amount: e.target.value })} className="rounded-xl border border-slate-200 px-4 py-3" />
          <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="rounded-xl border border-slate-200 px-4 py-3 bg-white">
            <option value="active">{t('Active')}</option>
            <option value="expired">{t('Expired')}</option>
          </select>
          <div className="sm:col-span-2 flex gap-3">
            <button type="submit" disabled={saving} className="bg-brand-600 hover:bg-brand-700 disabled:opacity-60 text-white font-semibold px-5 py-2.5 rounded-full">
              {saving ? t('Saving…') : t('Save policy')}
            </button>
            <button type="button" onClick={() => setShowForm(false)} className="text-slate-500 font-medium px-5 py-2.5">{t('Cancel')}</button>
          </div>
        </form>
      )}

      <div className="mt-8 flex flex-col gap-6">
        {p.insurancePolicies.length === 0 ? (
          <div className="text-center py-16 border border-dashed border-slate-200 rounded-2xl text-slate-400">
            {t('No insurance policy on file.')}
          </div>
        ) : (
          p.insurancePolicies.map((policy) =>
            editingPolicyId === policy.id ? (
              <form
                key={policy.id}
                onSubmit={(e) => { e.preventDefault(); saveEditPolicy(policy.id) }}
                className="border border-slate-100 rounded-2xl p-6 grid sm:grid-cols-2 gap-4"
              >
                <input required placeholder={t('Insurance provider')} value={editPolicyForm.provider} onChange={(e) => setEditPolicyForm({ ...editPolicyForm, provider: e.target.value })} className="rounded-xl border border-slate-200 px-4 py-3 sm:col-span-2" />
                <input placeholder={t('Policy number')} value={editPolicyForm.policy_number} onChange={(e) => setEditPolicyForm({ ...editPolicyForm, policy_number: e.target.value })} className="rounded-xl border border-slate-200 px-4 py-3" />
                <input placeholder={t('Policy type')} value={editPolicyForm.policy_type} onChange={(e) => setEditPolicyForm({ ...editPolicyForm, policy_type: e.target.value })} className="rounded-xl border border-slate-200 px-4 py-3" />
                <input type="number" placeholder={t('Coverage amount (₹)')} value={editPolicyForm.coverage_amount} onChange={(e) => setEditPolicyForm({ ...editPolicyForm, coverage_amount: e.target.value })} className="rounded-xl border border-slate-200 px-4 py-3" />
                <select value={editPolicyForm.status} onChange={(e) => setEditPolicyForm({ ...editPolicyForm, status: e.target.value })} className="rounded-xl border border-slate-200 px-4 py-3 bg-white">
                  <option value="active">{t('Active')}</option>
                  <option value="expired">{t('Expired')}</option>
                </select>
                <div className="sm:col-span-2 flex gap-3">
                  <button type="submit" disabled={policyRowSaving} className="inline-flex items-center gap-1.5 bg-brand-600 hover:bg-brand-700 disabled:opacity-60 text-white font-semibold px-5 py-2.5 rounded-full">
                    <Check size={16} /> {t('Save')}
                  </button>
                  <button type="button" onClick={() => setEditingPolicyId(null)} className="inline-flex items-center gap-1.5 text-slate-500 font-medium px-5 py-2.5">
                    <X size={16} /> {t('Cancel')}
                  </button>
                </div>
              </form>
            ) : (
              <div key={policy.id} className="border border-slate-100 rounded-2xl p-6">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <p className="font-bold text-ink-900 flex items-center gap-2">
                    <ShieldCheck size={18} className="text-brand-600" /> {policy.provider}
                  </p>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full capitalize ${statusStyles[policy.status] || statusStyles.active}`}>
                      {policy.status}
                    </span>
                    <button type="button" onClick={() => startEditPolicy(policy)} className="p-1 text-slate-400 hover:text-brand-600" title={t('Edit')}>
                      <Pencil size={14} />
                    </button>
                    <button type="button" onClick={() => deletePolicy(policy)} className="p-1 text-slate-400 hover:text-red-600" title={t('Delete')}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                <div className="mt-4 grid sm:grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-xs text-slate-400">{t('Policy Number')}</p>
                    <p className="font-semibold text-ink-900">{policy.policy_number}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">{t('Policy Type')}</p>
                    <p className="font-semibold text-ink-900">{policy.policy_type}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">{t('Coverage')}</p>
                    <p className="font-semibold text-ink-900">{formatINR(policy.coverage_amount)}</p>
                  </div>
                </div>

                <div className="mt-6 flex items-center justify-between">
                  <p className="text-xs font-bold text-slate-400">{t('CLAIMS HISTORY')}</p>
                  <button
                    type="button"
                    onClick={() => { setOpenClaimFor(openClaimFor === policy.id ? null : policy.id); setClaimForm(emptyClaimForm) }}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-600 hover:text-brand-700"
                  >
                    <Plus size={13} /> {t('Add Claim')}
                  </button>
                </div>

                {openClaimFor === policy.id && (
                  <form onSubmit={(e) => handleAddClaim(e, policy.id)} className="mt-3 border border-slate-100 rounded-xl p-4 grid sm:grid-cols-2 gap-3">
                    <input placeholder={t('Claim reference')} value={claimForm.claim_ref} onChange={(e) => setClaimForm({ ...claimForm, claim_ref: e.target.value })} className="rounded-lg border border-slate-200 px-3 py-2 text-sm" />
                    <input placeholder={t('Hospital name')} value={claimForm.hospital_name} onChange={(e) => setClaimForm({ ...claimForm, hospital_name: e.target.value })} className="rounded-lg border border-slate-200 px-3 py-2 text-sm" />
                    <input type="number" placeholder={t('Amount (₹)')} value={claimForm.amount} onChange={(e) => setClaimForm({ ...claimForm, amount: e.target.value })} className="rounded-lg border border-slate-200 px-3 py-2 text-sm" />
                    <select value={claimForm.status} onChange={(e) => setClaimForm({ ...claimForm, status: e.target.value })} className="rounded-lg border border-slate-200 px-3 py-2 text-sm bg-white">
                      <option value="submitted">{t('Submitted')}</option>
                      <option value="approved">{t('Approved')}</option>
                      <option value="rejected">{t('Rejected')}</option>
                    </select>
                    <div className="sm:col-span-2 flex gap-3">
                      <button type="submit" disabled={claimSaving} className="bg-brand-600 hover:bg-brand-700 disabled:opacity-60 text-white text-sm font-semibold px-5 py-2 rounded-full">
                        {claimSaving ? t('Saving…') : t('Save claim')}
                      </button>
                      <button type="button" onClick={() => setOpenClaimFor(null)} className="text-slate-500 text-sm font-medium px-5 py-2">{t('Cancel')}</button>
                    </div>
                  </form>
                )}

                <div className="mt-3 flex flex-col gap-3">
                  {p.insuranceClaims.filter((c) => c.policy_id === policy.id).map((claim) =>
                    editingClaimId === claim.id ? (
                      <form
                        key={claim.id}
                        onSubmit={(e) => { e.preventDefault(); saveEditClaim(claim.id) }}
                        className="border border-slate-100 rounded-xl p-4 grid sm:grid-cols-2 gap-3"
                      >
                        <input placeholder={t('Claim reference')} value={editClaimForm.claim_ref} onChange={(e) => setEditClaimForm({ ...editClaimForm, claim_ref: e.target.value })} className="rounded-lg border border-slate-200 px-3 py-2 text-sm" />
                        <input placeholder={t('Hospital name')} value={editClaimForm.hospital_name} onChange={(e) => setEditClaimForm({ ...editClaimForm, hospital_name: e.target.value })} className="rounded-lg border border-slate-200 px-3 py-2 text-sm" />
                        <input type="number" placeholder={t('Amount (₹)')} value={editClaimForm.amount} onChange={(e) => setEditClaimForm({ ...editClaimForm, amount: e.target.value })} className="rounded-lg border border-slate-200 px-3 py-2 text-sm" />
                        <select value={editClaimForm.status} onChange={(e) => setEditClaimForm({ ...editClaimForm, status: e.target.value })} className="rounded-lg border border-slate-200 px-3 py-2 text-sm bg-white">
                          <option value="submitted">{t('Submitted')}</option>
                          <option value="approved">{t('Approved')}</option>
                          <option value="rejected">{t('Rejected')}</option>
                        </select>
                        <div className="sm:col-span-2 flex gap-3">
                          <button type="submit" disabled={claimRowSaving} className="inline-flex items-center gap-1.5 bg-brand-600 hover:bg-brand-700 disabled:opacity-60 text-white text-sm font-semibold px-5 py-2 rounded-full">
                            <Check size={14} /> {t('Save')}
                          </button>
                          <button type="button" onClick={() => setEditingClaimId(null)} className="inline-flex items-center gap-1.5 text-slate-500 text-sm font-medium px-5 py-2">
                            <X size={14} /> {t('Cancel')}
                          </button>
                        </div>
                      </form>
                    ) : (
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
                          <button type="button" onClick={() => startEditClaim(claim)} className="p-1 text-slate-400 hover:text-brand-600" title={t('Edit')}>
                            <Pencil size={13} />
                          </button>
                          <button type="button" onClick={() => deleteClaim(claim)} className="p-1 text-slate-400 hover:text-red-600" title={t('Delete')}>
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                    )
                  )}
                  {p.insuranceClaims.filter((c) => c.policy_id === policy.id).length === 0 && (
                    <p className="text-sm text-slate-400">{t('No claims filed yet.')}</p>
                  )}
                </div>
              </div>
            )
          )
        )}
      </div>
    </div>
  )
}
