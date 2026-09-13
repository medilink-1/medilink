import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { AlertTriangle, Phone, Clock, Loader2, HeartPulse, Lock, ShieldAlert, Download } from 'lucide-react'
import { supabase } from '../lib/supabaseClient'

// Public, read-only page -- intentionally NOT behind ProtectedRoute.
// It never touches any table directly; the only data path is the
// get_shared_health_summary() Postgres function, which validates the
// token (not expired, not revoked) and, when the link is PIN-protected
// (as the Smart Health Card's Emergency QR always is), also validates a
// PIN before returning anything. Anyone with the link can open this
// page without a MediLink account, but a PIN-protected one reveals
// nothing until the correct PIN is entered.
export default function SharedSummary() {
  const { token } = useParams()
  const [status, setStatus] = useState('loading') // loading | ok | invalid | error | pin_required | locked
  const [data, setData] = useState(null)
  const [linkLabel, setLinkLabel] = useState(null)
  const [lockedUntil, setLockedUntil] = useState(null)
  const [pin, setPin] = useState('')
  const [pinError, setPinError] = useState('')
  const [checkingPin, setCheckingPin] = useState(false)

  useEffect(() => {
    let cancelled = false
    async function load() {
      const { data: result, error } = await supabase.rpc('get_shared_health_summary', { p_token: token })
      if (cancelled) return
      if (error) {
        setStatus('error')
        return
      }
      applyResult(result)
    }
    load()
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token])

  function applyResult(result) {
    if (!result || result.status === 'not_found') {
      setStatus('invalid')
      return
    }
    if (result.status === 'locked') {
      setLockedUntil(result.locked_until)
      setStatus('locked')
      return
    }
    if (result.status === 'pin_required' || result.status === 'invalid_pin') {
      setLinkLabel(result.label ?? linkLabel)
      if (result.status === 'invalid_pin') {
        setPinError(
          result.attempts_left > 0
            ? `Incorrect PIN. ${result.attempts_left} attempt${result.attempts_left === 1 ? '' : 's'} left.`
            : 'Incorrect PIN.'
        )
        setPin('')
      }
      setStatus('pin_required')
      return
    }
    // status === 'ok'
    setData(result)
    setStatus('ok')
  }

  async function handleSubmitPin(e) {
    e.preventDefault()
    setPinError('')
    setCheckingPin(true)
    const { data: result, error } = await supabase.rpc('get_shared_health_summary', { p_token: token, p_pin: pin })
    setCheckingPin(false)
    if (error) {
      setStatus('error')
      return
    }
    applyResult(result)
  }

  if (status === 'loading') {
    return (
      <div className="max-w-2xl mx-auto px-6 py-24 flex items-center justify-center gap-2 text-slate-400">
        <Loader2 className="animate-spin" size={18} /> Loading shared summary…
      </div>
    )
  }

  if (status === 'invalid') {
    return (
      <div className="max-w-lg mx-auto px-6 py-24 text-center">
        <h1 className="text-2xl font-bold text-ink-900">This link isn't valid</h1>
        <p className="mt-3 text-slate-500">
          It may have expired or been revoked by the patient. Ask them to send a new link.
        </p>
      </div>
    )
  }

  if (status === 'error') {
    return (
      <div className="max-w-lg mx-auto px-6 py-24 text-center">
        <h1 className="text-2xl font-bold text-ink-900">Something went wrong</h1>
        <p className="mt-3 text-slate-500">Please try again, or ask the patient for a fresh link.</p>
      </div>
    )
  }

  if (status === 'locked') {
    return (
      <div className="max-w-lg mx-auto px-6 py-24 text-center">
        <ShieldAlert size={28} className="mx-auto text-amber-500" />
        <h1 className="mt-4 text-2xl font-bold text-ink-900">Too many incorrect attempts</h1>
        <p className="mt-3 text-slate-500">
          For security, this link is temporarily locked
          {lockedUntil ? ` until ${new Date(lockedUntil).toLocaleTimeString()}` : ''}. Ask the patient
          for their PIN again and try later, or ask them to generate a new emergency QR code.
        </p>
      </div>
    )
  }

  if (status === 'pin_required') {
    return (
      <div className="max-w-md mx-auto px-6 py-24">
        <div className="text-center">
          <span className="w-12 h-12 mx-auto rounded-full bg-brand-50 text-brand-600 flex items-center justify-center">
            <Lock size={20} />
          </span>
          <h1 className="mt-4 text-2xl font-bold text-ink-900">Enter PIN to view</h1>
          <p className="mt-2 text-sm text-slate-500">
            {linkLabel
              ? `This summary (${linkLabel}) is protected by a PIN set by the patient.`
              : 'This emergency health summary is protected by a PIN set by the patient.'}{' '}
            Ask them for it, or have them enter it themselves.
          </p>
        </div>

        <form onSubmit={handleSubmitPin} className="mt-8 flex flex-col gap-4">
          <input
            type="password"
            inputMode="numeric"
            autoFocus
            required
            value={pin}
            onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
            placeholder="PIN"
            className="text-center text-lg tracking-[0.3em] rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
          />
          {pinError && <p className="text-sm text-red-600 text-center">{pinError}</p>}
          <button
            type="submit"
            disabled={checkingPin || pin.length < 4}
            className="bg-brand-600 hover:bg-brand-700 disabled:opacity-60 text-white font-semibold py-3 rounded-full transition-colors"
          >
            {checkingPin ? 'Checking…' : 'View Summary'}
          </button>
        </form>

        <p className="mt-6 text-xs text-slate-400 text-center">
          This page reveals nothing about the patient until the correct PIN is entered.
        </p>
      </div>
    )
  }

  const { profile, allergies, conditions, medications, expires_at } = data

  return (
    <div className="max-w-3xl mx-auto px-6 py-14">
      <div className="print:hidden rounded-2xl bg-brand-50 border border-brand-100 px-5 py-3 flex items-center justify-between gap-3 flex-wrap text-sm text-brand-700 font-medium">
        <span className="flex items-center gap-2">
          <HeartPulse size={16} className="shrink-0" />
          Shared read-only health summary — this is not a MediLink login, and nothing here can be edited.
        </span>
        <button
          type="button"
          onClick={() => window.print()}
          className="inline-flex items-center gap-1.5 bg-white border border-brand-200 text-brand-700 text-xs font-semibold px-3 py-1.5 rounded-full shrink-0 hover:bg-brand-50"
        >
          <Download size={13} /> Download PDF
        </button>
      </div>

      <h1 className="mt-8 text-3xl font-extrabold text-ink-900">{profile?.full_name || 'Patient'}</h1>
      <p className="mt-1 text-slate-500">
        {[
          profile?.age ? `${profile.age} Years` : null,
          profile?.gender,
          profile?.blood_group ? `Blood Group ${profile.blood_group}` : null,
        ]
          .filter(Boolean)
          .join(' · ')}
      </p>
      {profile?.health_id && <p className="text-sm text-slate-400 mt-1">MediLink Health ID: {profile.health_id}</p>}

      <div className="mt-8 grid sm:grid-cols-2 gap-6">
        <div className="rounded-2xl border border-slate-100 p-5">
          <p className="text-xs font-bold text-red-600 flex items-center gap-1.5">
            <AlertTriangle size={13} /> DRUG ALLERGIES
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {(allergies || []).map((a, i) => (
              <span key={i} className="text-xs font-semibold bg-red-50 text-red-700 px-3 py-1.5 rounded-full">
                ⚠ {a.name}
              </span>
            ))}
            {(!allergies || allergies.length === 0) && <p className="text-sm text-slate-400">No known drug allergies.</p>}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-100 p-5">
          <p className="text-xs font-bold text-slate-400">EMERGENCY CONTACT</p>
          <p className="mt-2 text-sm font-semibold text-ink-900 flex items-center gap-1.5">
            <Phone size={14} className="text-slate-400" />
            {profile?.emergency_name || '—'}
            {profile?.emergency_relation ? ` (${profile.emergency_relation})` : ''}
          </p>
          <p className="text-sm text-slate-500">{profile?.emergency_phone || '—'}</p>
        </div>

        <div className="rounded-2xl border border-slate-100 p-5">
          <p className="text-xs font-bold text-slate-400">MEDICAL CONDITIONS</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {(conditions || []).map((c, i) => (
              <span key={i} className="text-xs font-medium bg-amber-50 text-amber-700 px-3 py-1.5 rounded-full">
                {c.name}
              </span>
            ))}
            {(!conditions || conditions.length === 0) && <p className="text-sm text-slate-400">No conditions recorded.</p>}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-100 p-5">
          <p className="text-xs font-bold text-slate-400">CURRENT MEDICATIONS</p>
          <ul className="mt-3 flex flex-col gap-1.5">
            {(medications || []).map((m, i) => (
              <li key={i} className="text-sm text-ink-900">
                {m.name} {m.dose} {m.frequency ? `· ${m.frequency}` : ''}
              </li>
            ))}
            {(!medications || medications.length === 0) && <p className="text-sm text-slate-400">No active medications.</p>}
          </ul>
        </div>
      </div>

      <p className="mt-8 text-xs text-slate-400 flex items-center gap-1.5">
        <Clock size={13} /> This link expires on {new Date(expires_at).toLocaleString()}.
      </p>
      <p className="mt-2 text-xs text-slate-400">
        This summary reflects only what the patient has recorded in MediLink and does not replace a full clinical record.
      </p>
    </div>
  )
}
