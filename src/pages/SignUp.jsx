import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function SignUp() {
  const { signUp } = useAuth()
  const navigate = useNavigate()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setNotice('')
    setLoading(true)
    try {
      const data = await signUp({ email, password, fullName })
      if (data.session) {
        navigate('/', { replace: true })
      } else {
        setNotice('Check your email to confirm your account, then sign in.')
      }
    } catch (err) {
      setError(err.message || 'Could not create your account. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto px-6 py-20">
      <h1 className="text-3xl font-extrabold text-ink-900">Create your account</h1>
      <p className="mt-2 text-slate-500">Own your records. See every connection in one place.</p>

      <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-4">
        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-ink-900">Full name</span>
          <input
            type="text"
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
            placeholder="Priya Sharma"
          />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-ink-900">Email</span>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
            placeholder="you@example.com"
          />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-ink-900">Password</span>
          <input
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
            placeholder="At least 6 characters"
          />
        </label>

        {error && <p className="text-sm text-red-600">{error}</p>}
        {notice && <p className="text-sm text-brand-600">{notice}</p>}

        <button
          type="submit"
          disabled={loading}
          className="mt-2 bg-brand-600 hover:bg-brand-700 disabled:opacity-60 text-white font-semibold py-3 rounded-full transition-colors"
        >
          {loading ? 'Creating account…' : 'Create account'}
        </button>
      </form>

      <p className="mt-6 text-sm text-slate-500">
        Already have an account?{' '}
        <Link to="/login" className="text-brand-600 font-semibold">
          Sign in
        </Link>
      </p>
    </div>
  )
}
