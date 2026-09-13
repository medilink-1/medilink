import { useState, useEffect } from 'react'
import { AlertTriangle, Phone, Loader2, Pencil, X, Check, Plus, Upload, FileText, Download, Trash2, Share2, Copy, Clock, Lock, ShieldCheck, Save, FileWarning } from 'lucide-react'
import { usePatientData } from '../lib/usePatientData'
import { useAuth } from '../context/AuthContext'
import { useLanguage } from '../context/LanguageContext'
import { supabase } from '../lib/supabaseClient'
import { analyzeMedication } from '../lib/medicationSafety'
import MedicineAutocomplete from '../components/MedicineAutocomplete'
import SmartHealthCard from '../components/SmartHealthCard'
import { logActivity } from '../lib/activityLog'

const GENDER_OPTIONS = ['Female', 'Male', 'Other', 'Prefer not to say']
const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']

export default function PatientProfile() {
  const p = usePatientData()
  const { user, refreshProfile } = useAuth()
  const { t } = useLanguage()
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState(null)
  const [showMedForm, setShowMedForm] = useState(false)
  const [medForm, setMedForm] = useState({ name: '', dose: '', frequency: '', duration: '', status: 'active' })
  const [medSaving, setMedSaving] = useState(false)
  const [medPreview, setMedPreview] = useState(null)
  const [editingMedId, setEditingMedId] = useState(null)
  const [editMedForm, setEditMedForm] = useState({ dose: '', frequency: '', duration: '', status: 'active' })
  const [editMedSaving, setEditMedSaving] = useState(false)
  const [medDeletingId, setMedDeletingId] = useState(null)
  const [showCondForm, setShowCondForm] = useState(false)
  const [condName, setCondName] = useState('')
  const [condSaving, setCondSaving] = useState(false)
  const [editingCondId, setEditingCondId] = useState(null)
  const [editCondName, setEditCondName] = useState('')
  const [condRowSaving, setCondRowSaving] = useState(false)
  const [showAllergyForm, setShowAllergyForm] = useState(false)
  const [allergyForm, setAllergyForm] = useState({ name: '', severity: 'high' })
  const [allergySaving, setAllergySaving] = useState(false)
  const [editingAllergyId, setEditingAllergyId] = useState(null)
  const [editAllergyForm, setEditAllergyForm] = useState({ name: '', severity: 'high' })
  const [allergyRowSaving, setAllergyRowSaving] = useState(false)
  const [showLabForm, setShowLabForm] = useState(false)
  const [labForm, setLabForm] = useState({ test_name: '', value: '', unit: '', recorded_at: '' })
  const [labSaving, setLabSaving] = useState(false)
  const [documents, setDocuments] = useState([])
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState('')
  const [shareLinks, setShareLinks] = useState([])
  const [showShareForm, setShowShareForm] = useState(false)
  const [shareExpiry, setShareExpiry] = useState('24h')
  const [shareLabel, setShareLabel] = useState('')
  const [shareSaving, setShareSaving] = useState(false)
  const [newShareUrl, setNewShareUrl] = useState('')
  const [copied, setCopied] = useState(false)
  const [showQrPinForm, setShowQrPinForm] = useState(false)
  const [qrPin, setQrPin] = useState('')
  const [qrPinConfirm, setQrPinConfirm] = useState('')
  const [qrPinError, setQrPinError] = useState('')
  const [qrPinSaving, setQrPinSaving] = useState(false)

  useEffect(() => {
    if (!user) return
    loadDocuments()
    loadShareLinks()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  async function loadDocuments() {
    const { data } = await supabase
      .from('documents')
      .select('*')
      .order('created_at', { ascending: false })
    setDocuments(data || [])
  }

  async function handleUpload(e) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    setUploadError('')
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_')
    const storage_path = `${user.id}/${Date.now()}-${safeName}`
    const { error: uploadErr } = await supabase.storage.from('documents').upload(storage_path, file)
    if (uploadErr) {
      setUploading(false)
      setUploadError(
        uploadErr.message?.includes('Bucket not found')
          ? 'Document storage is not set up yet. Please contact support.'
          : uploadErr.message
      )
      e.target.value = ''
      return
    }
    await supabase.from('documents').insert({
      user_id: user.id,
      file_name: file.name,
      storage_path,
      file_type: file.type || null,
      size_bytes: file.size,
    })
    setUploading(false)
    e.target.value = ''
    await loadDocuments()
  }

  async function handleDownload(doc) {
    const { data, error: signErr } = await supabase.storage
      .from('documents')
      .createSignedUrl(doc.storage_path, 60)
    if (signErr || !data?.signedUrl) return
    window.open(data.signedUrl, '_blank', 'noopener')
  }

  async function handleDelete(doc) {
    if (!window.confirm(`Delete "${doc.file_name}"? This cannot be undone.`)) return
    await supabase.storage.from('documents').remove([doc.storage_path])
    await supabase.from('documents').delete().eq('id', doc.id)
    await loadDocuments()
  }

  async function loadShareLinks() {
    const { data } = await supabase
      .from('share_links')
      .select('*')
      .eq('revoked', false)
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })
    setShareLinks(data || [])
  }

  async function handleCreateShareLink(e) {
    e.preventDefault()
    setShareSaving(true)
    const token = crypto.randomUUID().replace(/-/g, '')
    const hours = shareExpiry === '7d' ? 24 * 7 : shareExpiry === '30d' ? 24 * 30 : 24
    const expiresAt = new Date(Date.now() + hours * 60 * 60 * 1000).toISOString()
    await supabase.from('share_links').insert({
      user_id: user.id,
      token,
      label: shareLabel || null,
      expires_at: expiresAt,
    })
    setShareSaving(false)
    setShareLabel('')
    setShowShareForm(false)
    setNewShareUrl(`${window.location.origin}${import.meta.env.BASE_URL}shared/${token}`)
    setCopied(false)
    await loadShareLinks()
    await logActivity(user.id, 'share_link_created', shareLabel || null)
  }

  async function handleRevokeShareLink(link) {
    if (!window.confirm('Revoke this share link? Anyone still holding it will lose access immediately.')) return
    await supabase.from('share_links').update({ revoked: true }).eq('id', link.id)
    if (newShareUrl.includes(link.token)) setNewShareUrl('')
    await loadShareLinks()
    await logActivity(user.id, 'share_link_revoked', link.label || null)
  }

  async function copyShareUrl(url) {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // clipboard API unavailable -- the user can still select and copy the text manually
    }
  }

  async function handleSetEmergencyPin(e) {
    e.preventDefault()
    setQrPinError('')
    if (!/^[0-9]{4,6}$/.test(qrPin)) {
      setQrPinError('PIN must be 4 to 6 digits.')
      return
    }
    if (qrPin !== qrPinConfirm) {
      setQrPinError('PINs do not match.')
      return
    }
    setQrPinSaving(true)
    const { error: pinError } = await supabase.rpc('create_emergency_qr_link', { p_pin: qrPin })
    setQrPinSaving(false)
    if (pinError) {
      // A foreign-key error here means this session's profile row wasn't
      // ready yet (e.g. right after sign-up, or a stale session from a
      // recreated account) -- reloading re-syncs it via AuthContext's
      // self-healing profile load, so a retry after that should succeed.
      setQrPinError(
        pinError.message.includes('foreign key')
          ? 'Your account needs a quick refresh. Please reload the page and try again.'
          : pinError.message
      )
      return
    }
    setQrPin('')
    setQrPinConfirm('')
    setShowQrPinForm(false)
    await p.reload()
    await logActivity(user.id, 'emergency_qr_created')
  }

  async function handleRevokeEmergencyQr() {
    if (!window.confirm('Turn off your Emergency QR code? The QR on your Smart Health Card will stop working until you set a new PIN.')) return
    await supabase.rpc('revoke_emergency_qr_link')
    await p.reload()
    await logActivity(user.id, 'emergency_qr_revoked')
  }

  function startEdit() {
    setForm({
      full_name: p.profile?.full_name || '',
      age: p.profile?.age ?? '',
      gender: p.profile?.gender || '',
      blood_group: p.profile?.blood_group || '',
      health_id: p.profile?.health_id || '',
      emergency_name: p.profile?.emergency_name || '',
      emergency_relation: p.profile?.emergency_relation || '',
      emergency_phone: p.profile?.emergency_phone || '',
    })
    setError('')
    setEditing(true)
  }

  function cancelEdit() {
    setEditing(false)
    setForm(null)
    setError('')
  }

  async function saveEdit(e) {
    e.preventDefault()
    setSaving(true)
    setError('')
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        full_name: form.full_name || null,
        age: form.age === '' ? null : Number(form.age),
        gender: form.gender || null,
        blood_group: form.blood_group || null,
        health_id: form.health_id || null,
        emergency_name: form.emergency_name || null,
        emergency_relation: form.emergency_relation || null,
        emergency_phone: form.emergency_phone || null,
      })
      .eq('id', user.id)
    setSaving(false)
    if (updateError) {
      setError(updateError.message)
      return
    }
    await refreshProfile()
    setEditing(false)
    setForm(null)
    await logActivity(user.id, 'profile_updated')
  }

  // Actually writes the new medication to the patient's record. Split out
  // from addMedication so the "Save Anyway" button on a safety alert can
  // call it directly without re-running (and re-blocking on) the check.
  async function doSaveMedication() {
    setMedSaving(true)
    await supabase.from('medications').insert({
      user_id: user.id,
      name: medForm.name,
      dose: medForm.dose || null,
      frequency: medForm.frequency || null,
      duration: medForm.duration || null,
      status: 'active',
    })
    setMedSaving(false)
    setMedForm({ name: '', dose: '', frequency: '', duration: '', status: 'active' })
    setMedPreview(null)
    setShowMedForm(false)
    await p.reload()
  }

  // Runs the same engine the Medication Safety page uses, at the moment a
  // medicine is entered here -- rather than a patient having to remember to
  // separately go run a check on another page. A clean (LOW risk) result
  // saves immediately; anything else stops and shows the alert first, and
  // saving only proceeds if the patient explicitly chooses "Save Anyway".
  async function addMedication(e) {
    e.preventDefault()
    const preview = analyzeMedication(medForm.name, {
      allergies: p.allergies,
      conditions: p.conditions,
      labResults: p.labResults,
      medications: p.medications,
    })
    if (preview.overallRisk !== 'LOW') {
      setMedPreview(preview)
      return
    }
    await doSaveMedication()
  }

  function startEditMedication(m) {
    setEditingMedId(m.id)
    setEditMedForm({ dose: m.dose || '', frequency: m.frequency || '', duration: m.duration || '', status: m.status || 'active' })
  }

  async function saveEditMedication(id) {
    setEditMedSaving(true)
    await supabase
      .from('medications')
      .update({
        dose: editMedForm.dose || null,
        frequency: editMedForm.frequency || null,
        duration: editMedForm.duration || null,
        status: editMedForm.status || 'active',
      })
      .eq('id', id)
    setEditMedSaving(false)
    setEditingMedId(null)
    await p.reload()
  }

  async function deleteMedication(m) {
    if (!window.confirm(`Remove "${m.name}" from your medication list? This cannot be undone.`)) return
    setMedDeletingId(m.id)
    await supabase.from('medications').delete().eq('id', m.id)
    setMedDeletingId(null)
    await p.reload()
  }

  async function addCondition(e) {
    e.preventDefault()
    setCondSaving(true)
    await supabase.from('conditions').insert({ user_id: user.id, name: condName })
    setCondSaving(false)
    setCondName('')
    setShowCondForm(false)
    await p.reload()
  }

  function startEditCondition(c) {
    setEditingCondId(c.id)
    setEditCondName(c.name)
  }

  async function saveEditCondition(id) {
    if (!editCondName.trim()) return
    setCondRowSaving(true)
    await supabase.from('conditions').update({ name: editCondName.trim() }).eq('id', id)
    setCondRowSaving(false)
    setEditingCondId(null)
    await p.reload()
  }

  async function deleteCondition(c) {
    if (!window.confirm(`Remove "${c.name}" from your medical conditions? This cannot be undone.`)) return
    await supabase.from('conditions').delete().eq('id', c.id)
    await p.reload()
  }

  async function addAllergy(e) {
    e.preventDefault()
    setAllergySaving(true)
    await supabase.from('allergies').insert({
      user_id: user.id,
      name: allergyForm.name,
      severity: allergyForm.severity || 'high',
    })
    setAllergySaving(false)
    setAllergyForm({ name: '', severity: 'high' })
    setShowAllergyForm(false)
    await p.reload()
  }

  function startEditAllergy(a) {
    setEditingAllergyId(a.id)
    setEditAllergyForm({ name: a.name, severity: a.severity || 'high' })
  }

  async function saveEditAllergy(id) {
    if (!editAllergyForm.name.trim()) return
    setAllergyRowSaving(true)
    await supabase
      .from('allergies')
      .update({ name: editAllergyForm.name.trim(), severity: editAllergyForm.severity || 'high' })
      .eq('id', id)
    setAllergyRowSaving(false)
    setEditingAllergyId(null)
    await p.reload()
  }

  async function deleteAllergy(a) {
    if (!window.confirm(`Remove "${a.name}" from your drug allergies? This cannot be undone.`)) return
    await supabase.from('allergies').delete().eq('id', a.id)
    await p.reload()
  }

  async function addLabResult(e) {
    e.preventDefault()
    setLabSaving(true)
    await supabase.from('lab_results').insert({
      user_id: user.id,
      test_name: labForm.test_name,
      value: labForm.value || null,
      unit: labForm.unit || null,
      recorded_at: labForm.recorded_at || new Date().toISOString().slice(0, 10),
    })
    setLabSaving(false)
    setLabForm({ test_name: '', value: '', unit: '', recorded_at: '' })
    setShowLabForm(false)
    await p.reload()
  }

  if (p.loading) {
    return (
      <div className="max-w-5xl mx-auto px-6 py-20 flex items-center gap-2 text-slate-400">
        <Loader2 className="animate-spin" size={18} /> {t('Loading patient profile…')}
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-14">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-extrabold text-ink-900">{t('Patient Health Profile')}</h1>
          <p className="mt-2 text-slate-500">{t('A unified view of essential patient health information.')}</p>
        </div>
        {!editing && (
          <button
            onClick={startEdit}
            className="shrink-0 inline-flex items-center gap-1.5 rounded-full border border-slate-200 px-5 py-2.5 text-sm font-semibold text-ink-900 hover:bg-slate-50"
          >
            <Pencil size={14} /> {t('Edit Profile')}
          </button>
        )}
      </div>

      <div className="mt-10 grid lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 flex flex-col gap-8">
          {editing ? (
            <form onSubmit={saveEdit} className="flex flex-col gap-8">
              <section>
                <h2 className="text-sm font-bold tracking-wide text-slate-400">{t('PERSONAL INFORMATION')}</h2>
                <div className="mt-3 grid sm:grid-cols-2 gap-4 text-sm">
                  <EditField label="Full name" value={form.full_name} onChange={(v) => setForm({ ...form, full_name: v })} />
                  <EditField label="Age" type="number" value={form.age} onChange={(v) => setForm({ ...form, age: v })} />
                  <EditSelect label="Gender" value={form.gender} options={GENDER_OPTIONS} onChange={(v) => setForm({ ...form, gender: v })} />
                  <EditSelect label="Blood Group" value={form.blood_group} options={BLOOD_GROUPS} onChange={(v) => setForm({ ...form, blood_group: v })} />
                  <EditField label="MediLink Health ID" value={form.health_id} onChange={(v) => setForm({ ...form, health_id: v })} />
                </div>
              </section>

              <section>
                <h2 className="text-sm font-bold tracking-wide text-slate-400">{t('EMERGENCY INFORMATION')}</h2>
                <div className="mt-3 grid sm:grid-cols-2 gap-4 text-sm">
                  <EditField label="Emergency Contact" value={form.emergency_name} onChange={(v) => setForm({ ...form, emergency_name: v })} />
                  <EditField label="Relationship" value={form.emergency_relation} onChange={(v) => setForm({ ...form, emergency_relation: v })} />
                  <EditField label="Emergency Phone" value={form.emergency_phone} onChange={(v) => setForm({ ...form, emergency_phone: v })} />
                </div>
              </section>

              {error && <p className="text-sm text-red-600">{error}</p>}

              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-1.5 bg-brand-600 hover:bg-brand-700 disabled:opacity-60 text-white font-semibold px-5 py-2.5 rounded-full"
                >
                  <Check size={15} /> {saving ? t('Saving…') : t('Save changes')}
                </button>
                <button
                  type="button"
                  onClick={cancelEdit}
                  className="inline-flex items-center gap-1.5 border border-slate-200 text-slate-600 font-medium px-5 py-2.5 rounded-full"
                >
                  <X size={15} /> {t('Cancel')}
                </button>
              </div>
            </form>
          ) : (
            <>
              <section>
                <h2 className="text-sm font-bold tracking-wide text-slate-400">{t('PERSONAL INFORMATION')}</h2>
                <div className="mt-3 grid sm:grid-cols-2 gap-4 text-sm">
                  <Field label="Name" value={p.profile?.full_name} />
                  <Field label="Age" value={p.profile?.age ? `${p.profile.age} Years` : null} />
                  <Field label="Gender" value={p.profile?.gender} />
                  <Field label="Blood Group" value={p.profile?.blood_group} />
                  <Field label="MediLink Health ID" value={p.profile?.health_id} />
                </div>
              </section>

              <section>
                <h2 className="text-sm font-bold tracking-wide text-slate-400">{t('EMERGENCY INFORMATION')}</h2>
                <div className="mt-3 grid sm:grid-cols-2 gap-4 text-sm">
                  <Field label="Emergency Contact" value={p.profile?.emergency_name} />
                  <Field label="Relationship" value={p.profile?.emergency_relation} />
                  <Field label="Emergency Phone" value={p.profile?.emergency_phone} icon={Phone} />
                </div>
              </section>
            </>
          )}

          <section>
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <h2 className="text-sm font-bold tracking-wide text-slate-400">{t('MEDICAL CONDITIONS')}</h2>
              <button
                type="button"
                onClick={() => setShowCondForm((v) => !v)}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-600 hover:text-brand-700"
              >
                <Plus size={14} /> {t('Add Condition')}
              </button>
            </div>

            {showCondForm && (
              <form onSubmit={addCondition} className="mt-3 border border-slate-100 rounded-2xl p-5 flex gap-3 flex-wrap">
                <input required placeholder={t('Condition name (e.g. Hypertension)')} value={condName} onChange={(e) => setCondName(e.target.value)} className="flex-1 min-w-[200px] rounded-xl border border-slate-200 px-4 py-2.5 text-sm" />
                <button type="submit" disabled={condSaving} className="bg-brand-600 hover:bg-brand-700 disabled:opacity-60 text-white text-sm font-semibold px-5 py-2 rounded-full">
                  {condSaving ? t('Saving…') : t('Save')}
                </button>
                <button type="button" onClick={() => setShowCondForm(false)} className="text-slate-500 text-sm font-medium px-2 py-2">{t('Cancel')}</button>
              </form>
            )}

            <div className="mt-3 flex flex-col gap-2">
              {p.conditions.map((c) =>
                editingCondId === c.id ? (
                  <form
                    key={c.id}
                    onSubmit={(e) => { e.preventDefault(); saveEditCondition(c.id) }}
                    className="flex items-center gap-2 border border-slate-100 rounded-2xl px-4 py-2.5 flex-wrap"
                  >
                    <input
                      autoFocus
                      value={editCondName}
                      onChange={(e) => setEditCondName(e.target.value)}
                      className="flex-1 min-w-[160px] rounded-lg border border-slate-200 px-3 py-1.5 text-sm"
                    />
                    <button type="submit" disabled={condRowSaving} className="p-1.5 text-emerald-600 hover:text-emerald-700" title={t('Save')}>
                      <Check size={16} />
                    </button>
                    <button type="button" onClick={() => setEditingCondId(null)} className="p-1.5 text-slate-400 hover:text-slate-600" title={t('Cancel')}>
                      <X size={16} />
                    </button>
                  </form>
                ) : (
                  <div key={c.id} className="flex items-center justify-between gap-3 bg-amber-50 rounded-full pl-3.5 pr-2 py-1.5">
                    <span className="text-sm font-medium text-amber-700">{c.name}</span>
                    <div className="flex items-center gap-0.5 shrink-0">
                      <button type="button" onClick={() => startEditCondition(c)} className="p-1 text-amber-700/60 hover:text-amber-800" title={t('Edit')}>
                        <Pencil size={13} />
                      </button>
                      <button type="button" onClick={() => deleteCondition(c)} className="p-1 text-amber-700/60 hover:text-red-600" title={t('Delete')}>
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                )
              )}
              {p.conditions.length === 0 && <p className="text-sm text-slate-400">{t('No conditions recorded.')}</p>}
            </div>
          </section>

          <section>
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <h2 className="text-sm font-bold tracking-wide text-red-600 flex items-center gap-1.5">
                <AlertTriangle size={14} /> {t('DRUG ALLERGIES — HIGH PRIORITY MEDICAL ALERT')}
              </h2>
              <button
                type="button"
                onClick={() => setShowAllergyForm((v) => !v)}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-600 hover:text-brand-700"
              >
                <Plus size={14} /> {t('Add Allergy')}
              </button>
            </div>

            {showAllergyForm && (
              <form onSubmit={addAllergy} className="mt-3 border border-slate-100 rounded-2xl p-5 grid sm:grid-cols-2 gap-3">
                <input required placeholder={t('Allergy (e.g. Penicillin)')} value={allergyForm.name} onChange={(e) => setAllergyForm({ ...allergyForm, name: e.target.value })} className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm" />
                <select value={allergyForm.severity} onChange={(e) => setAllergyForm({ ...allergyForm, severity: e.target.value })} className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm bg-white">
                  <option value="high">{t('High severity')}</option>
                  <option value="moderate">{t('Moderate severity')}</option>
                  <option value="low">{t('Low severity')}</option>
                </select>
                <div className="sm:col-span-2 flex gap-3">
                  <button type="submit" disabled={allergySaving} className="bg-brand-600 hover:bg-brand-700 disabled:opacity-60 text-white text-sm font-semibold px-5 py-2 rounded-full">
                    {allergySaving ? t('Saving…') : t('Save')}
                  </button>
                  <button type="button" onClick={() => setShowAllergyForm(false)} className="text-slate-500 text-sm font-medium px-5 py-2">{t('Cancel')}</button>
                </div>
              </form>
            )}

            <div className="mt-3 flex flex-col gap-2">
              {p.allergies.map((a) =>
                editingAllergyId === a.id ? (
                  <form
                    key={a.id}
                    onSubmit={(e) => { e.preventDefault(); saveEditAllergy(a.id) }}
                    className="flex items-center gap-2 border border-slate-100 rounded-2xl px-4 py-2.5 flex-wrap"
                  >
                    <input
                      autoFocus
                      value={editAllergyForm.name}
                      onChange={(e) => setEditAllergyForm({ ...editAllergyForm, name: e.target.value })}
                      className="flex-1 min-w-[140px] rounded-lg border border-slate-200 px-3 py-1.5 text-sm"
                    />
                    <select
                      value={editAllergyForm.severity}
                      onChange={(e) => setEditAllergyForm({ ...editAllergyForm, severity: e.target.value })}
                      className="rounded-lg border border-slate-200 px-2 py-1.5 text-sm bg-white"
                    >
                      <option value="high">{t('High severity')}</option>
                      <option value="moderate">{t('Moderate severity')}</option>
                      <option value="low">{t('Low severity')}</option>
                    </select>
                    <button type="submit" disabled={allergyRowSaving} className="p-1.5 text-emerald-600 hover:text-emerald-700" title={t('Save')}>
                      <Check size={16} />
                    </button>
                    <button type="button" onClick={() => setEditingAllergyId(null)} className="p-1.5 text-slate-400 hover:text-slate-600" title={t('Cancel')}>
                      <X size={16} />
                    </button>
                  </form>
                ) : (
                  <div key={a.id} className="flex items-center justify-between gap-3 bg-red-50 rounded-full pl-3.5 pr-2 py-1.5">
                    <span className="text-sm font-semibold text-red-700">⚠ {a.name}</span>
                    <div className="flex items-center gap-0.5 shrink-0">
                      <button type="button" onClick={() => startEditAllergy(a)} className="p-1 text-red-700/60 hover:text-red-800" title={t('Edit')}>
                        <Pencil size={13} />
                      </button>
                      <button type="button" onClick={() => deleteAllergy(a)} className="p-1 text-red-700/60 hover:text-red-900" title={t('Delete')}>
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                )
              )}
              {p.allergies.length === 0 && <p className="text-sm text-slate-400">{t('No known drug allergies.')}</p>}
            </div>
          </section>

          <section>
            <h2 className="text-sm font-bold tracking-wide text-slate-400">{t('ADVERSE DRUG REACTION HISTORY')}</h2>
            <p className="mt-3 text-sm text-slate-500">{t('This prototype does not yet track ADR history — not evaluated, not a confirmed all-clear.')}</p>
          </section>

          <section>
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <h2 className="text-sm font-bold tracking-wide text-slate-400">{t('CURRENT MEDICATIONS')}</h2>
              <button
                type="button"
                onClick={() => setShowMedForm((v) => !v)}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-600 hover:text-brand-700"
              >
                <Plus size={14} /> {t('Add Medication')}
              </button>
            </div>

            {showMedForm && (
              <form onSubmit={addMedication} className="mt-3 border border-slate-100 rounded-2xl p-5 grid sm:grid-cols-2 gap-3">
                <MedicineAutocomplete
                  required
                  value={medForm.name}
                  onChange={(v) => { setMedForm({ ...medForm, name: v }); setMedPreview(null) }}
                  placeholder={t('Medicine name')}
                  inputClassName="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm"
                />
                <input placeholder={t('Dose (e.g. 500mg)')} value={medForm.dose} onChange={(e) => setMedForm({ ...medForm, dose: e.target.value })} className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm" />
                <input placeholder={t('Frequency (e.g. Twice daily)')} value={medForm.frequency} onChange={(e) => setMedForm({ ...medForm, frequency: e.target.value })} className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm" />
                <input placeholder={t('Duration (e.g. 7 days)')} value={medForm.duration} onChange={(e) => setMedForm({ ...medForm, duration: e.target.value })} className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm" />

                {medPreview && (
                  <div className={`sm:col-span-2 rounded-2xl border p-4 ${
                    medPreview.overallRisk === 'HIGH' ? 'bg-red-50 border-red-100' : 'bg-amber-50 border-amber-100'
                  }`}>
                    <p className={`text-xs font-bold uppercase tracking-wide flex items-center gap-1.5 ${
                      medPreview.overallRisk === 'HIGH' ? 'text-red-600' : 'text-amber-700'
                    }`}>
                      <FileWarning size={13} /> {t(medPreview.overallRisk)} {t('risk')} — {t('checked automatically before saving')}
                    </p>
                    <p className="mt-1.5 text-sm font-medium text-ink-900">{medPreview.summaryMessage}</p>
                    <ul className="mt-2 flex flex-col gap-1">
                      {medPreview.checks
                        .filter((c) => c.status !== 'NO ALERT' && c.status !== 'NOT EVALUATED')
                        .map((c, i) => (
                          <li key={i} className="text-xs text-slate-600">
                            <span className="font-semibold text-ink-900">{t(c.title)}:</span> {c.result}
                          </li>
                        ))}
                    </ul>
                    <div className="mt-3 flex gap-3">
                      <button
                        type="button"
                        onClick={doSaveMedication}
                        disabled={medSaving}
                        className="bg-ink-900 hover:bg-black disabled:opacity-60 text-white text-xs font-semibold px-4 py-2 rounded-full"
                      >
                        {medSaving ? t('Saving…') : t('Save Anyway')}
                      </button>
                      <button type="button" onClick={() => setMedPreview(null)} className="text-slate-500 text-xs font-medium px-2 py-2">
                        {t('Go Back')}
                      </button>
                    </div>
                  </div>
                )}

                <div className="sm:col-span-2 flex gap-3">
                  <button type="submit" disabled={medSaving} className="bg-brand-600 hover:bg-brand-700 disabled:opacity-60 text-white text-sm font-semibold px-5 py-2 rounded-full">
                    {medSaving ? t('Saving…') : t('Save medication')}
                  </button>
                  <button
                    type="button"
                    onClick={() => { setShowMedForm(false); setMedPreview(null) }}
                    className="text-slate-500 text-sm font-medium px-5 py-2"
                  >
                    {t('Cancel')}
                  </button>
                </div>
              </form>
            )}

            <div className="mt-3 overflow-x-auto">
              {p.medications.length === 0 ? (
                <p className="text-sm text-slate-400 py-4">{t('No medications recorded yet.')}</p>
              ) : (
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="text-left text-slate-400 border-b border-slate-100">
                    <th className="py-2 pr-4 font-medium">{t('Medicine')}</th>
                    <th className="py-2 pr-4 font-medium">{t('Dose')}</th>
                    <th className="py-2 pr-4 font-medium">{t('Frequency')}</th>
                    <th className="py-2 pr-4 font-medium">{t('Duration')}</th>
                    <th className="py-2 pr-4 font-medium">{t('Status')}</th>
                    <th className="py-2 font-medium">{t('Actions')}</th>
                  </tr>
                </thead>
                <tbody>
                  {p.medications.map((m) =>
                    editingMedId === m.id ? (
                      <tr key={m.id} className="border-b border-slate-50 bg-slate-50/60">
                        <td className="py-2.5 pr-4 font-semibold text-ink-900">{m.name}</td>
                        <td className="py-2 pr-4">
                          <input
                            value={editMedForm.dose}
                            onChange={(e) => setEditMedForm({ ...editMedForm, dose: e.target.value })}
                            className="w-24 rounded-lg border border-slate-200 px-2 py-1 text-sm"
                          />
                        </td>
                        <td className="py-2 pr-4">
                          <input
                            value={editMedForm.frequency}
                            onChange={(e) => setEditMedForm({ ...editMedForm, frequency: e.target.value })}
                            className="w-28 rounded-lg border border-slate-200 px-2 py-1 text-sm"
                          />
                        </td>
                        <td className="py-2 pr-4">
                          <input
                            value={editMedForm.duration}
                            onChange={(e) => setEditMedForm({ ...editMedForm, duration: e.target.value })}
                            className="w-24 rounded-lg border border-slate-200 px-2 py-1 text-sm"
                          />
                        </td>
                        <td className="py-2 pr-4">
                          <select
                            value={editMedForm.status}
                            onChange={(e) => setEditMedForm({ ...editMedForm, status: e.target.value })}
                            className="rounded-lg border border-slate-200 px-2 py-1 text-sm bg-white capitalize"
                          >
                            <option value="active">{t('active')}</option>
                            <option value="completed">{t('completed')}</option>
                            <option value="discontinued">{t('discontinued')}</option>
                          </select>
                        </td>
                        <td className="py-2">
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              disabled={editMedSaving}
                              onClick={() => saveEditMedication(m.id)}
                              className="p-1.5 text-emerald-600 hover:text-emerald-700"
                              title={t('Save')}
                            >
                              <Save size={15} />
                            </button>
                            <button type="button" onClick={() => setEditingMedId(null)} className="p-1.5 text-slate-400 hover:text-slate-600" title={t('Cancel')}>
                              <X size={15} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      <tr key={m.id} className="border-b border-slate-50">
                        <td className="py-2.5 pr-4 font-semibold text-ink-900">{m.name}</td>
                        <td className="py-2.5 pr-4 text-slate-600">{m.dose}</td>
                        <td className="py-2.5 pr-4 text-slate-600">{m.frequency}</td>
                        <td className="py-2.5 pr-4 text-slate-600">{m.duration}</td>
                        <td className="py-2.5 pr-4">
                          <span
                            className={`text-xs font-semibold px-2.5 py-1 rounded-full capitalize ${
                              m.status === 'active'
                                ? 'bg-emerald-50 text-emerald-700'
                                : m.status === 'discontinued'
                                ? 'bg-red-50 text-red-700'
                                : 'bg-slate-100 text-slate-500'
                            }`}
                          >
                            {t(m.status)}
                          </span>
                        </td>
                        <td className="py-2.5">
                          <div className="flex items-center gap-1">
                            <button type="button" onClick={() => startEditMedication(m)} className="p-1.5 text-slate-400 hover:text-brand-600" title={t('Edit')}>
                              <Pencil size={14} />
                            </button>
                            <button
                              type="button"
                              disabled={medDeletingId === m.id}
                              onClick={() => deleteMedication(m)}
                              className="p-1.5 text-slate-400 hover:text-red-600"
                              title={t('Delete')}
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
              )}
            </div>
          </section>

          <section>
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <h2 className="text-sm font-bold tracking-wide text-slate-400">{t('RECENT LABORATORY SUMMARY')}</h2>
              <button
                type="button"
                onClick={() => setShowLabForm((v) => !v)}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-600 hover:text-brand-700"
              >
                <Plus size={14} /> {t('Add Lab Result')}
              </button>
            </div>

            {showLabForm && (
              <form onSubmit={addLabResult} className="mt-3 border border-slate-100 rounded-2xl p-5 grid sm:grid-cols-2 gap-3">
                <input required placeholder={t('Test name (e.g. eGFR)')} value={labForm.test_name} onChange={(e) => setLabForm({ ...labForm, test_name: e.target.value })} className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm sm:col-span-2" />
                <input placeholder={t('Value')} value={labForm.value} onChange={(e) => setLabForm({ ...labForm, value: e.target.value })} className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm" />
                <input placeholder={t('Unit (e.g. mg/dL)')} value={labForm.unit} onChange={(e) => setLabForm({ ...labForm, unit: e.target.value })} className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm" />
                <input type="date" value={labForm.recorded_at} onChange={(e) => setLabForm({ ...labForm, recorded_at: e.target.value })} className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm sm:col-span-2" />
                <div className="sm:col-span-2 flex gap-3">
                  <button type="submit" disabled={labSaving} className="bg-brand-600 hover:bg-brand-700 disabled:opacity-60 text-white text-sm font-semibold px-5 py-2 rounded-full">
                    {labSaving ? t('Saving…') : t('Save')}
                  </button>
                  <button type="button" onClick={() => setShowLabForm(false)} className="text-slate-500 text-sm font-medium px-5 py-2">{t('Cancel')}</button>
                </div>
              </form>
            )}

            <div className="mt-3 grid sm:grid-cols-3 gap-4">
              {p.labResults.map((l) => (
                <div key={l.id} className="rounded-2xl border border-slate-100 p-5">
                  <p className="text-xs text-slate-400">{l.test_name}</p>
                  <p className="mt-1 text-xl font-bold text-ink-900">
                    {l.value} <span className="text-sm font-normal text-slate-400">{l.unit}</span>
                  </p>
                </div>
              ))}
              {p.labResults.length === 0 && <p className="text-sm text-slate-400">{t('No lab results recorded yet.')}</p>}
            </div>
          </section>

          <section>
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <h2 className="text-sm font-bold tracking-wide text-slate-400">{t('DOCUMENTS & REPORTS')}</h2>
              <label className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-600 hover:text-brand-700 cursor-pointer">
                {uploading ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
                {uploading ? t('Uploading…') : t('Upload Document')}
                <input type="file" className="hidden" onChange={handleUpload} disabled={uploading} />
              </label>
            </div>

            {uploadError && <p className="mt-2 text-sm text-red-600">{uploadError}</p>}

            <div className="mt-3 flex flex-col gap-2">
              {documents.map((doc) => (
                <div key={doc.id} className="flex items-center justify-between gap-3 border border-slate-100 rounded-2xl px-4 py-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <FileText size={16} className="text-slate-400 shrink-0" />
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-ink-900 truncate">{doc.file_name}</p>
                      <p className="text-xs text-slate-400">
                        {formatFileSize(doc.size_bytes)} · {new Date(doc.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button type="button" onClick={() => handleDownload(doc)} className="p-2 text-slate-400 hover:text-brand-600" title={t('Download')}>
                      <Download size={16} />
                    </button>
                    <button type="button" onClick={() => handleDelete(doc)} className="p-2 text-slate-400 hover:text-red-600" title={t('Delete')}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
              {documents.length === 0 && <p className="text-sm text-slate-400">{t('No documents uploaded yet.')}</p>}
            </div>

            <p className="mt-3 text-xs text-slate-400">
              {t('Files are stored privately in your account and are only ever accessible through short-lived, secure links.')}
            </p>
          </section>

          <section>
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <h2 className="text-sm font-bold tracking-wide text-slate-400">{t('Share with a Doctor')}</h2>
              <button
                type="button"
                onClick={() => setShowShareForm((v) => !v)}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-600 hover:text-brand-700"
              >
                <Share2 size={14} /> {t('Create Share Link')}
              </button>
            </div>

            <p className="mt-2 text-xs text-slate-400">
              {t('This creates a temporary, read-only link — anyone with the link can view a summary of your profile, allergies, conditions, and active medications without logging in. Revoke it any time.')}
            </p>

            {showShareForm && (
              <form onSubmit={handleCreateShareLink} className="mt-3 border border-slate-100 rounded-2xl p-5 grid sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-400">{t('Expires in')}</label>
                  <select
                    value={shareExpiry}
                    onChange={(e) => setShareExpiry(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm bg-white"
                  >
                    <option value="24h">{t('24 hours')}</option>
                    <option value="7d">{t('7 days')}</option>
                    <option value="30d">{t('30 days')}</option>
                  </select>
                </div>
                <input
                  placeholder={t('Label (optional, e.g. Dr. Sharma)')}
                  value={shareLabel}
                  onChange={(e) => setShareLabel(e.target.value)}
                  className="mt-1 sm:mt-6 rounded-xl border border-slate-200 px-4 py-2.5 text-sm"
                />
                <div className="sm:col-span-2 flex gap-3">
                  <button type="submit" disabled={shareSaving} className="bg-brand-600 hover:bg-brand-700 disabled:opacity-60 text-white text-sm font-semibold px-5 py-2 rounded-full">
                    {shareSaving ? t('Saving…') : t('Create Link')}
                  </button>
                  <button type="button" onClick={() => setShowShareForm(false)} className="text-slate-500 text-sm font-medium px-5 py-2">{t('Cancel')}</button>
                </div>
              </form>
            )}

            {newShareUrl && (
              <div className="mt-3 rounded-2xl border border-brand-100 bg-brand-50/60 p-4 flex items-center justify-between gap-3 flex-wrap">
                <p className="text-sm font-medium text-ink-900 break-all">{newShareUrl}</p>
                <button
                  type="button"
                  onClick={() => copyShareUrl(newShareUrl)}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold bg-white border border-slate-200 px-3 py-1.5 rounded-full shrink-0"
                >
                  <Copy size={13} /> {copied ? t('Copied!') : t('Copy')}
                </button>
              </div>
            )}

            <ul className="mt-3 flex flex-col gap-2">
              {shareLinks.map((link) => (
                <li key={link.id} className="flex items-center justify-between gap-3 border border-slate-100 rounded-2xl px-4 py-3">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-ink-900 truncate">{link.label || t('Share with a Doctor')}</p>
                    <p className="text-xs text-slate-400 flex items-center gap-1">
                      <Clock size={12} /> {t('Expires')}: {new Date(link.expires_at).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => copyShareUrl(`${window.location.origin}${import.meta.env.BASE_URL}shared/${link.token}`)}
                      className="p-2 text-slate-400 hover:text-brand-600"
                      title={t('Copy')}
                    >
                      <Copy size={16} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRevokeShareLink(link)}
                      className="text-xs font-semibold text-red-600 hover:text-red-700 px-2"
                    >
                      {t('Revoke')}
                    </button>
                  </div>
                </li>
              ))}
              {shareLinks.length === 0 && <p className="text-sm text-slate-400">{t('No active share links.')}</p>}
            </ul>
          </section>

          <section>
            <h2 className="text-sm font-bold tracking-wide text-slate-400">{t('Emergency QR Access')}</h2>
            <p className="mt-2 text-xs text-slate-400">
              {t('Your Smart Health Card\'s QR code opens a page that asks for a PIN before showing anything — set one to turn it on.')}
            </p>

            {p.emergencyQrLink ? (
              <div className="mt-3 border border-slate-100 rounded-2xl p-4 flex items-center justify-between gap-3 flex-wrap">
                <div>
                  <p className="text-sm font-semibold text-ink-900 flex items-center gap-1.5">
                    <ShieldCheck size={14} className="text-emerald-600" /> {t('Emergency QR is active')}
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5">{t('Expires')}: {new Date(p.emergencyQrLink.expires_at).toLocaleDateString()}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button type="button" onClick={() => setShowQrPinForm((v) => !v)} className="text-xs font-semibold text-brand-600 hover:text-brand-700 px-2 py-1">
                    {t('Change PIN')}
                  </button>
                  <button type="button" onClick={handleRevokeEmergencyQr} className="text-xs font-semibold text-red-600 hover:text-red-700 px-2 py-1">
                    {t('Turn Off')}
                  </button>
                </div>
              </div>
            ) : (
              <p className="mt-3 text-sm text-slate-400">{t('Emergency QR is not set up yet.')}</p>
            )}

            {!p.emergencyQrLink && !showQrPinForm && (
              <button
                type="button"
                onClick={() => setShowQrPinForm(true)}
                className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-brand-600 hover:text-brand-700"
              >
                <Lock size={14} /> {t('Set a PIN')}
              </button>
            )}

            {showQrPinForm && (
              <form onSubmit={handleSetEmergencyPin} className="mt-3 border border-slate-100 rounded-2xl p-5 grid sm:grid-cols-2 gap-3">
                <input
                  type="password"
                  inputMode="numeric"
                  placeholder={t('New PIN (4-6 digits)')}
                  value={qrPin}
                  onChange={(e) => setQrPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm"
                />
                <input
                  type="password"
                  inputMode="numeric"
                  placeholder={t('Confirm PIN')}
                  value={qrPinConfirm}
                  onChange={(e) => setQrPinConfirm(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm"
                />
                {qrPinError && <p className="sm:col-span-2 text-sm text-red-600">{qrPinError}</p>}
                <div className="sm:col-span-2 flex gap-3">
                  <button type="submit" disabled={qrPinSaving} className="bg-brand-600 hover:bg-brand-700 disabled:opacity-60 text-white text-sm font-semibold px-5 py-2 rounded-full">
                    {qrPinSaving ? t('Saving…') : t('Save PIN')}
                  </button>
                  <button
                    type="button"
                    onClick={() => { setShowQrPinForm(false); setQrPin(''); setQrPinConfirm(''); setQrPinError('') }}
                    className="text-slate-500 text-sm font-medium px-5 py-2"
                  >
                    {t('Cancel')}
                  </button>
                </div>
              </form>
            )}
          </section>
        </div>

        <div>
          <SmartHealthCard profile={p.profile} allergies={p.allergies} emergencyQrLink={p.emergencyQrLink} />
        </div>
      </div>
    </div>
  )
}

function formatFileSize(bytes) {
  if (bytes === null || bytes === undefined) return ''
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function Field({ label, value, icon: Icon }) {
  const { t } = useLanguage()
  return (
    <div>
      <p className="text-xs text-slate-400">{t(label)}</p>
      <p className="mt-0.5 font-semibold text-ink-900 flex items-center gap-1.5">
        {Icon && <Icon size={14} className="text-slate-400" />}
        {value || '—'}
      </p>
    </div>
  )
}

function EditField({ label, value, onChange, type = 'text' }) {
  const { t } = useLanguage()
  return (
    <div>
      <label className="text-xs text-slate-400">{t(label)}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-2.5"
      />
    </div>
  )
}

function EditSelect({ label, value, options, onChange }) {
  const { t } = useLanguage()
  return (
    <div>
      <label className="text-xs text-slate-400">{t(label)}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-2.5 bg-white"
      >
        <option value="">{t('Select…')}</option>
        {options.map((o) => (
          <option key={o} value={o}>
            {t(o)}
          </option>
        ))}
      </select>
    </div>
  )
}
