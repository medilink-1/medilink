import { AlertTriangle, Phone, Loader2 } from 'lucide-react'
import { usePatientData } from '../lib/usePatientData'
import SmartHealthCard from '../components/SmartHealthCard'

export default function PatientProfile() {
  const p = usePatientData()

  if (p.loading) {
    return (
      <div className="max-w-5xl mx-auto px-6 py-20 flex items-center gap-2 text-slate-400">
        <Loader2 className="animate-spin" size={18} /> Loading patient profile…
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-14">
      <h1 className="text-3xl font-extrabold text-ink-900">Patient Health Profile</h1>
      <p className="mt-2 text-slate-500">A unified view of essential patient health information.</p>

      <div className="mt-10 grid lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 flex flex-col gap-8">
          <section>
            <h2 className="text-sm font-bold tracking-wide text-slate-400">PERSONAL INFORMATION</h2>
            <div className="mt-3 grid sm:grid-cols-2 gap-4 text-sm">
              <Field label="Name" value={p.profile?.full_name} />
              <Field label="Age" value={p.profile?.age ? `${p.profile.age} Years` : null} />
              <Field label="Gender" value={p.profile?.gender} />
              <Field label="Blood Group" value={p.profile?.blood_group} />
              <Field label="MediLink Health ID" value={p.profile?.health_id} />
            </div>
          </section>

          <section>
            <h2 className="text-sm font-bold tracking-wide text-slate-400">EMERGENCY INFORMATION</h2>
            <div className="mt-3 grid sm:grid-cols-2 gap-4 text-sm">
              <Field label="Emergency Contact" value={p.profile?.emergency_name} />
              <Field label="Relationship" value={p.profile?.emergency_relation} />
              <Field label="Emergency Phone" value={p.profile?.emergency_phone} icon={Phone} />
            </div>
          </section>

          <section>
            <h2 className="text-sm font-bold tracking-wide text-slate-400">MEDICAL CONDITIONS</h2>
            <ul className="mt-3 flex flex-wrap gap-2">
              {p.conditions.map((c) => (
                <li key={c.id} className="text-sm font-medium bg-amber-50 text-amber-700 px-3 py-1.5 rounded-full">
                  {c.name}
                </li>
              ))}
              {p.conditions.length === 0 && <p className="text-sm text-slate-400">No conditions recorded.</p>}
            </ul>
          </section>

          <section>
            <h2 className="text-sm font-bold tracking-wide text-red-600 flex items-center gap-1.5">
              <AlertTriangle size={14} /> DRUG ALLERGIES — HIGH PRIORITY MEDICAL ALERT
            </h2>
            <ul className="mt-3 flex flex-wrap gap-2">
              {p.allergies.map((a) => (
                <li key={a.id} className="text-sm font-semibold bg-red-50 text-red-700 px-3 py-1.5 rounded-full">
                  ⚠ {a.name}
                </li>
              ))}
              {p.allergies.length === 0 && <p className="text-sm text-slate-400">No known drug allergies.</p>}
            </ul>
          </section>

          <section>
            <h2 className="text-sm font-bold tracking-wide text-slate-400">ADVERSE DRUG REACTION HISTORY</h2>
            <p className="mt-3 text-sm text-slate-500">No additional documented ADR history in demo data.</p>
          </section>

          <section>
            <h2 className="text-sm font-bold tracking-wide text-slate-400">CURRENT MEDICATIONS</h2>
            <div className="mt-3 overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="text-left text-slate-400 border-b border-slate-100">
                    <th className="py-2 pr-4 font-medium">Medicine</th>
                    <th className="py-2 pr-4 font-medium">Dose</th>
                    <th className="py-2 pr-4 font-medium">Frequency</th>
                    <th className="py-2 pr-4 font-medium">Duration</th>
                    <th className="py-2 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {p.medications.map((m) => (
                    <tr key={m.id} className="border-b border-slate-50">
                      <td className="py-2.5 pr-4 font-semibold text-ink-900">{m.name}</td>
                      <td className="py-2.5 pr-4 text-slate-600">{m.dose}</td>
                      <td className="py-2.5 pr-4 text-slate-600">{m.frequency}</td>
                      <td className="py-2.5 pr-4 text-slate-600">{m.duration}</td>
                      <td className="py-2.5">
                        <span className="text-xs font-semibold bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-full capitalize">
                          {m.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <h2 className="text-sm font-bold tracking-wide text-slate-400">RECENT LABORATORY SUMMARY</h2>
            <div className="mt-3 grid sm:grid-cols-3 gap-4">
              {p.labResults.map((l) => (
                <div key={l.id} className="rounded-2xl border border-slate-100 p-5">
                  <p className="text-xs text-slate-400">{l.test_name}</p>
                  <p className="mt-1 text-xl font-bold text-ink-900">
                    {l.value} <span className="text-sm font-normal text-slate-400">{l.unit}</span>
                  </p>
                </div>
              ))}
            </div>
          </section>
        </div>

        <div>
          <SmartHealthCard profile={p.profile} allergies={p.allergies} />
        </div>
      </div>
    </div>
  )
}

function Field({ label, value, icon: Icon }) {
  return (
    <div>
      <p className="text-xs text-slate-400">{label}</p>
      <p className="mt-0.5 font-semibold text-ink-900 flex items-center gap-1.5">
        {Icon && <Icon size={14} className="text-slate-400" />}
        {value || '—'}
      </p>
    </div>
  )
}
