import { useState } from 'react'
import { Loader2 } from 'lucide-react'
import { usePatientData } from '../lib/usePatientData'
import { useLanguage } from '../context/LanguageContext'

const filters = [
  { key: 'all', label: 'All' },
  { key: 'clinic', label: 'Clinic' },
  { key: 'hospital', label: 'Hospital' },
  { key: 'pharmacy', label: 'Pharmacy' },
  { key: 'laboratory', label: 'Laboratory' },
]

const categoryDot = {
  clinic: 'bg-brand-600 ring-brand-50',
  hospital: 'bg-red-500 ring-red-50',
  pharmacy: 'bg-teal-600 ring-teal-50',
  laboratory: 'bg-amber-500 ring-amber-50',
}

export default function HealthTimeline() {
  const { t } = useLanguage()
  const p = usePatientData()
  const [filter, setFilter] = useState('all')

  const events = filter === 'all' ? p.timelineEvents : p.timelineEvents.filter((e) => e.category === filter)

  if (p.loading) {
    return <div className="max-w-3xl mx-auto px-6 py-20 flex items-center gap-2 text-slate-400"><Loader2 className="animate-spin" size={18}/> {t('Loading health timeline…')}</div>
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-14">
      <h1 className="text-3xl font-extrabold text-ink-900">{t('My Health Timeline')}</h1>
      <p className="mt-2 text-slate-500">{t('A connected, chronological view of your complete healthcare journey.')}</p>

      <div className="mt-6 flex flex-wrap gap-2">
        {filters.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`text-sm font-semibold px-4 py-1.5 rounded-full transition-colors ${
              filter === f.key ? 'bg-brand-600 text-white' : 'border border-slate-200 text-slate-500 hover:border-brand-200'
            }`}
          >
            {t(f.label)}
          </button>
        ))}
      </div>

      <div className="mt-10 relative pl-8 border-l-2 border-slate-100 flex flex-col gap-8">
        {events.length === 0 ? (
          <p className="text-sm text-slate-400">{t('No events in this category.')}</p>
        ) : (
          events.map((ev) => (
            <div key={ev.id} className="relative">
              <span className={`absolute -left-[41px] top-0.5 w-4 h-4 rounded-full ring-4 ${categoryDot[ev.category] || 'bg-slate-400 ring-slate-50'}`} />
              <p className="text-sm font-bold text-brand-700">{ev.event_year}</p>
              <p className="font-semibold text-ink-900">{ev.title}</p>
              {ev.description && <p className="text-sm text-slate-500 mt-1">{ev.description}</p>}
              <span className="mt-1.5 inline-block text-xs font-medium text-slate-400 capitalize">{ev.category}</span>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
