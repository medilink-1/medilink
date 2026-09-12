import { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { Bell, HelpCircle, User, ChevronDown, LogOut, HeartPulse } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const navItems = [
  { to: '/', label: 'Home' },
  { to: '/timeline', label: 'Health Timeline' },
  { to: '/medication-safety', label: 'Medication Safety' },
  { to: '/about', label: 'About MediLink' },
]

export default function Navbar() {
  const { user, profile, signOut } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)
  const navigate = useNavigate()

  const handleSignOut = async () => {
    await signOut()
    navigate('/login')
  }

  return (
    <header className="border-b border-slate-100 bg-white/95 backdrop-blur sticky top-0 z-20">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between gap-6">
        <Link to="/" className="flex items-center gap-2.5 shrink-0">
          <span className="w-10 h-10 rounded-xl bg-brand-600 text-white flex items-center justify-center">
            <HeartPulse size={20} />
          </span>
          <span className="flex flex-col leading-tight">
            <span className="text-lg font-extrabold tracking-tight text-ink-900">MEDILINK</span>
            <span className="text-[11px] font-medium text-teal-600">Smart Health Ecosystem</span>
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
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-2.5 shrink-0">
          <div className="relative">
            <button
              aria-label="Notifications"
              onClick={() => setNotifOpen((v) => !v)}
              className="w-10 h-10 rounded-full border border-slate-200 flex items-center justify-center text-slate-500 hover:text-brand-600 hover:border-brand-200 transition-colors"
            >
              <Bell size={17} />
            </button>
            {notifOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-white border border-slate-100 rounded-xl shadow-lg py-3 px-4">
                <p className="text-sm font-semibold text-ink-900">Notifications</p>
                <p className="mt-1 text-sm text-slate-400">No new notifications.</p>
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
                  <span className="text-xs text-slate-400">{profile?.health_id || 'Patient'}</span>
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
                    Patient Profile
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50"
                  >
                    <LogOut size={15} /> Sign out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link
              to="/login"
              className="px-4 py-2 rounded-full bg-brand-600 text-white text-sm font-semibold hover:bg-brand-700 transition-colors"
            >
              Sign in
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}
