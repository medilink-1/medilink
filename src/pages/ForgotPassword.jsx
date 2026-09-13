import { useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { useLanguage } from '../context/LanguageContext'

export default function ForgotPassword() {
  const { t } = useLanguage()
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState('idle') // idle | sending | sent | error
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setStatus('sending')
    setError('')
    const redirectTo = `${window.location.origin}${import.meta.env.BASE_URL}reset-password`
    const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo })
    if (error) {
      setError(error.message)
      setStatus('error')
      return
    }
    setStatus('sent')
  }

  return (
    <div className="max-w-md mx-auto px-6 py-20">
      <h1 className="text-3xl font-extrabold text-ink-900">{t('Reset your password')}</h1>
      <p className="mt-2 text-slate-500">{t("Enter your account email and we'll send you a password reset link.")}</p>

      {status === 'sent' ? (
        <div className="mt-8 rounded-2xl border border-emerald-100 bg-emerald-50 p-6 text-sm text-emerald-700">
          {t('If an account exists for')} <span className="font-semibold">{email}</span>{t(', a password reset link has been sent. Check your inbox.')}
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-4">
          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-ink-900">{t('Email')}</span>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
              placeholder="you@example.com"
            />
          </label>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={status === 'sending'}
            className="mt-2 bg-brand-600 hover:bg-brand-700 disabled:opacity-60 text-white font-semibold py-3 rounded-full transition-colors"
          >
            {status === 'sending' ? t('Sending…') : t('Send reset link')}
          </button>
        </form>
      )}

      <p className="mt-6 text-sm text-slate-500">
        <Link to="/login" className="text-brand-600 font-semibold">{t('Back to sign in')}</Link>
      </p>
    </div>
  )
}
