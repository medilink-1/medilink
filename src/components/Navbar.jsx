import { useEffect, useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { Bell, HelpCircle, User, ChevronDown, LogOut, HeartPulse, Menu, X, Syringe, Pill, ShieldCheck } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useLanguage } from '../context/LanguageContext'
import { supabase } from '../lib/supabaseClient'
import { getMedicationReminders } from '../lib/medicationReminders'

const navItems = [
  { to: '/', label: 'Home' },
  { to: '/timeline', label: 'Health Timeline' },
  { to: '/medication-safety', label: 'Medication Safety' },
  { to: '/about', label: 'About MediLink' },
]

export default function Navbar() {
  const { user, profile, signOut } = useAuth()
  const { lang, setLang, t } = useLanguage()
  const [menuOpen, setMenuOpen] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [notifications, setNotifications] = useState([])
  const navigate = useNavigate()

  useEffect(() => {
    if (!user) {
      setNotifications([])
      return
    }
    let cancelled = false

    async function loadNotifications() {
      const [{ data: vax }, { data: deps }, { data: meds }] = await Promise.all([
        supabase.from('vaccinations').select('*').neq('status', 'completed'),
        supabase.from('dependents').select('*'),
        supabase.from('medications').select('*').eq('status', 'active'),
      ])
      if (cancelled) return
      const depNameById = Object.fromEntries((deps || []).map((d) => [d.id, d.name]))
      const medItems = getMedicationReminders(meds || []).map((r) => ({
        id: r.id,
        type: 'medication',
        text: r.text,
      }))
      const vaxItems = (vax || []).map((v) => ({
        id: `vax-${v.id}`,
        type: 'vaccination',
        text: `${depNameById[v.dependent_id] || 'A dependent'}’s ${v.vaccine_name} vaccination is ${
          v.status === 'due_soon' ? 'due soon' : 'scheduled'
        }${v.event_date ? ` (${new Date(v.event_date).toLocaleDateString()})` : ''}.`,
      }))
      setNotifications([...medItems, ...vaxItems])
    }

    loadNotifications()
    return () => {
      cancelled = true
    }
  }, [user])

  const handleSignOut = async () => {
    await signOut()
    setMobileOpen(false)
    navigate('/login')
  }

  return (
    <header className="print:hidden border-b border-slate-100 bg-white/95 backdrop-blur sticky top-0 z-20">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between gap-6">
        <Link to="/" className="flex items-center gap-2.5 shrink-0">
          <span className="w-10 h-10 rounded-xl bg-brand-600 text-white flex items-center justify-center">
            <HeartPulse size={20} />
          </span>
          <span className="flex flex-col leading-tight">
            <span className="text-lg font-extrabold tracking-tight text-ink-900">MEDILINK</span>
            <span className="text-[11px] font-medium text-teal-600">{t('Smart Health Ecosystem')}</span>
          </span>
        </Link>

        <nav className="hidden lg:flex items-center gap-9">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                `text-[15px] font-medium transition-colors ${
                  isActive ? 'text-brand-700' : 'text-slate-500 hover:text-ink-900'
                }`
              }
            >
              {t(item.label)}
            </NavLink>
          ))}
        </nav>

        <button
          aria-label="Open menu"
          onClick={() => setMobileOpen((v) => !v)}
          className="lg:hidden w-10 h-10 rounded-full border border-slate-200 flex items-center justify-center text-slate-500 shrink-0"
        >
          {mobileOpen ? <X size={18} /> : <Menu size={18} />}
        </button>

        <div className="hidden lg:flex items-center gap-2.5 shrink-0">
          <button
            onClick={() => setLang(lang === 'hi' ? 'en' : 'hi')}
            className="w-10 h-10 rounded-full border border-slate-200 flex items-center justify-center text-xs font-bold text-slate-500 hover:text-brand-600 hover:border-brand-200 transition-colors"
            aria-label="Toggle language"
          >
            {lang === 'hi' ? 'EN' : 'हि'}
          </button>
          <div className="relative">
            <button
              aria-label="Notifications"
              onClick={() => setNotifOpen((v) => !v)}
              className="relative w-10 h-10 rounded-full border border-slate-200 flex items-center justify-center text-slate-500 hover:text-brand-600 hover:border-brand-200 transition-colors"
            >
              <Bell size={17} />
              {notifications.length > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500" />
              )}
            </button>
            {notifOpen && (
              <div className="absolute right-0 mt-2 w-72 bg-white border border-slate-100 rounded-xl shadow-lg py-3 px-4 max-h-80 overflow-y-auto">
                <p className="text-sm font-semibold text-ink-900">{t('Notifications')}</p>
                {notifications.length === 0 ? (
                  <p className="mt-1 text-sm text-slate-400">{t('No new notifications.')}</p>
                ) : (
                  <ul className="mt-2 flex flex-col gap-2.5">
                    {notifications.map((n) => (
                      <li key={n.id} className="flex items-start gap-2 text-sm text-slate-600 border-t border-slate-50 pt-2.5 first:border-t-0 first:pt-0">
                        {n.type === 'medication' ? (
                          <Pill size={14} className="text-brand-500 mt-0.5 shrink-0" />
                        ) : (
                          <Syringe size={14} className="text-brand-500 mt-0.5 shrink-0" />
                        )}
                        {n.text}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>
          <Link
            to="/about"
            aria-label="Help"
            className="w-10 h-10 rounded-full border border-slate-200 flex items-center justify-center text-slate-500 hover:text-brand-600 hover:border-brand-200 transition-colors"
          >
            <HelpCircle size={17} />
          </Link>

          {user ? (
            <div className="relative">
              <button
                onClick={() => setMenuOpen((v) => !v)}
                className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-full hover:bg-slate-50 transition-colors"
              >
                <span className="w-9 h-9 rounded-full bg-brand-50 text-brand-600 flex items-center justify-center">
                  <User size={17} />
                </span>
                <span className="hidden sm:flex flex-col items-start leading-tight">
                  <span className="text-sm font-semibold text-ink-900">
                    {profile?.full_name || user.email}
                  </span>
                  <span className="text-xs text-slate-400">{profile?.health_id || t('Patient')}</span>
                </span>
                <ChevronDown size={16} className="text-slate-400" />
              </button>

              {menuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-100 rounded-xl shadow-lg py-1">
                  <Link
                    to="/profile"
                    onClick={() => setMenuOpen(false)}
                    className="block px-4 py-2 text-sm text-slate-600 hover:bg-slate-50"
                  >
                    {t('Patient Profile')}
                  </Link>
                  <Link
                    to="/data-privacy"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-2 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50"
                  >
                    <ShieldCheck size={15} /> {t('Data & Privacy')}
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50"
                  >
                    <LogOut size={15} /> {t('Sign out')}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link
              to="/login"
              className="px-4 py-2 rounded-full bg-brand-600 text-white text-sm font-semibold hover:bg-brand-700 transition-colors"
            >
              {t('Sign in')}
            </Link>
          )}
        </div>
      </div>

      {mobileOpen && (
        <div className="lg:hidden border-t border-slate-100 px-6 py-4 flex flex-col gap-1 bg-white">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) =>
                `py-2.5 text-[15px] font-medium ${isActive ? 'text-brand-700' : 'text-slate-600'}`
              }
            >
              {t(item.label)}
            </NavLink>
          ))}
          <div className="mt-2 pt-3 border-t border-slate-100 flex flex-col gap-1">
            {user ? (
              <>
                <Link to="/profile" onClick={() => setMobileOpen(false)} className="py-2.5 text-[15px] font-medium text-slate-600">
                  {t('Patient Profile')}
                </Link>
                <Link to="/data-privacy" onClick={() => setMobileOpen(false)} className="py-2.5 text-[15px] font-medium text-slate-600">
                  {t('Data & Privacy')}
                </Link>
                <button onClick={handleSignOut} className="flex items-center gap-2 py-2.5 text-[15px] font-medium text-slate-600">
                  <LogOut size={15} /> {t('Sign out')}
                </button>
              </>
            ) : (
              <Link to="/login" onClick={() => setMobileOpen(false)} className="py-2.5 text-[15px] font-semibold text-brand-600">
                {t('Sign in')}
              </Link>
            )}
            <button
              onClick={() => setLang(lang === 'hi' ? 'en' : 'hi')}
              className="mt-2 pt-3 border-t border-slate-100 text-left py-2.5 text-[15px] font-medium text-slate-600"
            >
              {lang === 'hi' ? 'Switch to English' : 'हिंदी में देखें (Switch to Hindi)'}
            </button>
          </div>
        </div>
      )}
    </header>
  )
}
