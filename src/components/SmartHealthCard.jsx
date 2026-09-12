import { useEffect, useState } from 'react'
import { ShieldAlert, QrCode, X } from 'lucide-react'
import QRCode from 'qrcode'

export default function SmartHealthCard({ profile, allergies = [] }) {
  const primaryAllergy = allergies[0]?.name
  const [qrDataUrl, setQrDataUrl] = useState(null)
  const [showQr, setShowQr] = useState(false)

  useEffect(() => {
    const lines = [
      'MediLink Emergency Health Card',
      `Name: ${profile?.full_name || 'Unknown'}`,
      `Health ID: ${profile?.health_id || '—'}`,
      `Blood Group: ${profile?.blood_group || '—'}`,
      `Allergy: ${primaryAllergy || 'None recorded'}`,
    ]
    if (profile?.emergency_name) {
      const rel = profile.emergency_relation ? ` (${profile.emergency_relation})` : ''
      const phone = profile.emergency_phone ? ` — ${profile.emergency_phone}` : ''
      lines.push(`Emergency Contact: ${profile.emergency_name}${rel}${phone}`)
    }
    const payload = lines.join('\n')

    let cancelled = false
    QRCode.toDataURL(payload, { margin: 1, width: 240 })
      .then((url) => {
        if (!cancelled) setQrDataUrl(url)
      })
      .catch(() => {
        if (!cancelled) setQrDataUrl(null)
      })
    return () => {
      cancelled = true
    }
  }, [
    profile?.full_name,
    profile?.health_id,
    profile?.blood_group,
    profile?.emergency_name,
    profile?.emergency_relation,
    profile?.emergency_phone,
    primaryAllergy,
  ])

  return (
    <>
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
          <button
            type="button"
            onClick={() => setShowQr(true)}
            aria-label="Show scannable emergency QR code"
            className="w-9 h-9 rounded-lg bg-white/15 flex items-center justify-center hover:bg-white/25 transition-colors"
          >
            <QrCode size={18} />
          </button>
        </div>
      </div>

      {showQr && (
        <div
          className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-6"
          onClick={() => setShowQr(false)}
        >
          <div
            className="bg-white rounded-2xl p-6 max-w-xs w-full text-center relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setShowQr(false)}
              aria-label="Close"
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-600"
            >
              <X size={18} />
            </button>
            <p className="text-sm font-bold text-ink-900">Emergency QR Code</p>
            <p className="mt-1 text-xs text-slate-500">
              Scan with any QR reader to view critical health info, even offline.
            </p>
            {qrDataUrl ? (
              <img src={qrDataUrl} alt="Emergency health QR code" className="mt-4 mx-auto rounded-lg" width={240} height={240} />
            ) : (
              <div className="mt-4 h-[240px] flex items-center justify-center text-slate-400 text-sm">
                Generating…
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}
