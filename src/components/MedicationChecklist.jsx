import { useState } from 'react'
import { CheckCircle2, Circle, Flame } from 'lucide-react'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../context/AuthContext'
import { useLanguage } from '../context/LanguageContext'
import { getChecklist, todayDateStr } from '../lib/medicationAdherence'

// A simple daily "did I take this today" checklist for active
// medications. Deliberately separate from the automatic course-end
// reminders: this is a once-a-day checkbox the patient marks
// themselves, not something MediLink infers.
export default function MedicationChecklist({ medications, doses, onReload }) {
  const { user } = useAuth()
  const { t } = useLanguage()
  const [busyId, setBusyId] = useState(null)
  const { items, takenCount, total } = getChecklist(medications, doses)

  if (total === 0) return null

  async function toggle(item) {
    if (!user) return
    setBusyId(item.medicationId)
    const today = todayDateStr()
    if (item.taken) {
      await supabase
        .from('medication_doses')
        .delete()
        .eq('medication_id', item.medicationId)
        .eq('dose_date', today)
    } else {
      await supabase.from('medication_doses').upsert(
        { user_id: user.id, medication_id: item.medicationId, dose_date: today, taken_at: new Date().toISOString() },
        { onConflict: 'medication_id,dose_date' }
      )
    }
    setBusyId(null)
    onReload()
  }

  return (
    <section className="max-w-7xl mx-auto px-6 pb-20">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h2 className="text-sm font-bold tracking-wide text-teal-700">{t("TODAY'S MEDICATIONS")}</h2>
          <p className="mt-1 text-sm text-slate-500">{t('Check off each dose as you take it.')}</p>
        </div>
        <span className="text-sm font-semibold text-ink-900">
          {takenCount} / {total} {t('taken today')}
        </span>
      </div>

      <div className="mt-4 rounded-3xl border border-slate-100 p-4 sm:p-6 flex flex-col divide-y divide-slate-100">
        {items.map((item) => (
          <button
            key={item.medicationId}
            type="button"
            disabled={busyId === item.medicationId}
            onClick={() => toggle(item)}
            className="flex items-center justify-between gap-3 py-3.5 text-left disabled:opacity-60"
          >
            <span className="flex items-center gap-3 min-w-0">
              {item.taken ? (
                <CheckCircle2 size={22} className="text-emerald-600 shrink-0" />
              ) : (
                <Circle size={22} className="text-slate-300 shrink-0" />
              )}
              <span className="min-w-0">
                <span className="font-semibold text-ink-900">{item.name}</span>
                {item.dose && <span className="text-sm text-slate-500 ml-2">{item.dose}</span>}
              </span>
            </span>
            {item.streak > 1 && (
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full shrink-0">
                <Flame size={12} /> {item.streak} {t('day streak')}
              </span>
            )}
          </button>
        ))}
      </div>
    </section>
  )
}
