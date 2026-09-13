import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { useLanguage } from '../context/LanguageContext'

export default function ResetPassword() {
  const { t } = useLanguage()
  const navigate = useNavigate()
  const [ready, setReady] = useState(false)
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [status, setStatus] = useState('idle')

  useEffect(() => {
    // The recovery link signs the user in via a PASSWORD_RECOVERY auth
    // event before this page even mounts sometimes, so check both the
    // event and any session that already exists.
    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY' || session) setReady(true)
    })
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setReady(true)
    })
    return () => listener.subscription.unsubscribe()
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (password.length < 6) {
      setError(t('Password must be at least 6 characters.'))
      return
    }
    if (password !== confirm) {
      setError(t('Passwords do not match.'))
      return
    }
    setStatus('saving')
    const { error } = await supabase.auth.updateUser({ password })
    setStatus('idle')
    if (error) {
      setError(error.message)
      return
    }
    navigate('/', { replace: true })
  }

  return (
    <div className="max-w-md mx-auto px-6 py-20">
      <h1 className="text-3xl font-extrabold text-ink-900">{t('Set a new password')}</h1>
      <p className="mt-2 text-slate-500">{t('Choose a new password for your MediLink account.')}</p>

      {!ready ? (
        <p className="mt-8 text-sm text-slate-500">
          {t("Verifying your reset link… If this doesn't update after a moment, the link may have expired — request a new one from the")}{' '}
          <Link to="/forgot-password" className="text-brand-600 font-semibold">{t('forgot password')}</Link>{t(' page.')}
        </p>
      ) : (
        <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-4">
          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-ink-900">{t('New password')}</span>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
              placeholder="••••••••"
            />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-ink-900">{t('Confirm new password')}</span>
            <input
              type="password"
              required
              minLength={6}
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className="rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
              placeholder="••••••••"
            />
          </label>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={status === 'saving'}
            className="mt-2 bg-brand-600 hover:bg-brand-700 disabled:opacity-60 text-white font-semibold py-3 rounded-full transition-colors"
          >
            {status === 'saving' ? t('Saving…') : t('Update password')}
          </button>
        </form>
      )}
    </div>
  )
}
