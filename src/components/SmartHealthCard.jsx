import { ShieldAlert, QrCode } from 'lucide-react'

export default function SmartHealthCard({ profile, allergies = [] }) {
  const primaryAllergy = allergies[0]?.name

  return (
    <div className="relative w-full max-w-sm rounded-3xl bg-gradient-to-br from-brand-700 via-brand-600 to-teal-600 text-white p-6 shadow-xl overflow-hidden">
      <div className="absolute -right-10 -top-10 w-40 h-40 rounded-full bg-white/10" />
      <div className="absolute -right-4 bottom-0 w-24 h-24 rounded-full bg-white/10" />

      <div className="relative flex items-center justify-between">
        <span className="text-sm font-extrabold tracking-widest">MEDILINK</span>
        <span className="text-[10px] uppercase tracking-widest bg-white/15 px-2 py-1 rounded-full">
          Smart Health Card
        </span>
      </div>

      <p className="relative mt-6 text-xs uppercase tracking-wide text-white/70">Patient</p>
      <p className="relative text-xl font-bold">{profile?.full_name || 'Demo Patient'}</p>

      <div className="relative mt-4 grid grid-cols-2 gap-3 text-sm">
        <div>
          <p className="text-white/60 text-xs">Health ID</p>
          <p className="font-semibold">{profile?.health_id || '—'}</p>
        </div>
        <div>
          <p className="text-white/60 text-xs">Blood Group</p>
          <p className="font-semibold">{profile?.blood_group || '—'}</p>
        </div>
      </div>

      {primaryAllergy && (
        <div className="relative mt-4 flex items-center gap-2 bg-white/15 rounded-xl px-3 py-2 text-xs font-semibold">
          <ShieldAlert size={14} /> Critical Allergy: {primaryAllergy}
        </div>
      )}

      <div className="relative mt-5 flex items-center justify-between">
        <span className="text-[11px] text-white/70">Emergency Medical Access Enabled</span>
        <span className="w-9 h-9 rounded-lg bg-white/15 flex items-center justify-center">
          <QrCode size={18} />
        </span>
      </div>
    </div>
  )
}
