import { useState } from 'react'
import { AlertTriangle, Loader2, Printer, RefreshCw, User } from 'lucide-react'
import { Link } from 'react-router-dom'
import { usePatientData } from '../lib/usePatientData'
import { analyzeMedication } from '../lib/medicationSafety'
import MedicineAutocomplete from '../components/MedicineAutocomplete'

const quickSelect = ['Amoxicillin', 'Ibuprofen', 'Metformin', 'Amlodipine', 'Atorvastatin', 'Warfarin']

const riskStyles = {
  HIGH: 'bg-red-50 text-red-700 border-red-100',
  MODERATE: 'bg-amber-50 text-amber-700 border-amber-100',
  CAUTION: 'bg-amber-50 text-amber-700 border-amber-100',
  LOW: 'bg-emerald-50 text-emerald-700 border-emerald-100',
}

export default function MedicationSafety() {
  const p = usePatientData()
  const [input, setInput] = useState('')
  const [report, setReport] = useState(null)

  const runAnalysis = (name) => {
    if (!name.trim()) return
    const result = analyzeMedication(name, {
      allergies: p.allergies,
      conditions: p.conditions,
      labResults: p.labResults,
      medications: p.medications,
    })
    setReport(result)
  }

  if (p.loading) {
    return (
      <div className="max-w-5xl mx-auto px-6 py-20 flex items-center gap-2 text-slate-400">
        <Loader2 className="animate-spin" size={18} /> Loading medication safety dashboard…
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-14">
      <h1 className="text-3xl font-extrabold text-ink-900">Medication Safety Intelligence</h1>
      <p className="mt-2 text-slate-500">Patient-specific medication review at the point of care.</p>

      {/* Patient context panel */}
      <div className="mt-8 rounded-2xl border border-teal-100 bg-teal-50/40 p-6 grid sm:grid-cols-2 gap-6">
        <div>
          <p className="text-xs font-bold text-slate-400 flex items-center gap-1.5"><User size={13}/> PATIENT</p>
          <p className="mt-1 font-bold text-ink-900">{p.profile?.full_name}</p>
          <p className="text-sm text-slate-500">{p.profile?.age ? `${p.profile.age} Years` : '—'}</p>
        </div>
        <div>
          <p className="text-xs font-bold text-slate-400">CRITICAL CONDITIONS</p>
          <p className="mt-1 text-sm text-ink-900">{p.conditions.map((c) => c.name).join(' · ') || '—'}</p>
          <p className="mt-2 text-xs font-bold text-red-600">ALLERGY</p>
          <p className="text-sm font-semibold text-red-700">
            {p.allergies.map((a) => `⚠ ${a.name}`).join(', ') || 'None recorded'}
          </p>
        </div>
        <div className="sm:col-span-2">
          <p className="text-xs font-bold text-slate-400">CURRENT MEDICATIONS</p>
          <p className="mt-1 text-sm text-ink-900">
            {p.medications.filter((m) => m.status === 'active').map((m) => m.name).join(' · ') || '—'}
          </p>
        </div>
      </div>

      {/* Medication entry */}
      <div className="mt-10">
        <label className="text-sm font-semibold text-ink-900">Enter Medication for Safety Review</label>
        <div className="mt-2 flex gap-3 flex-wrap">
          <MedicineAutocomplete
            value={input}
            onChange={setInput}
            onSelect={(name) => runAnalysis(name)}
            placeholder="Search or enter medication name…"
            className="flex-1 min-w-[220px]"
            inputClassName="w-full rounded-xl border border-slate-200 px-4 py-3"
          />
          <button
            onClick={() => runAnalysis(input)}
            className="bg-brand-600 hover:bg-brand-700 text-white font-semibold px-6 py-3 rounded-full"
          >
            Run Safety Analysis
          </button>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {quickSelect.map((m) => (
            <button
              key={m}
              onClick={() => {
                setInput(m)
                runAnalysis(m)
              }}
              className="text-sm font-medium border border-slate-200 hover:border-brand-300 px-4 py-1.5 rounded-full"
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      {/* Safety report */}
      {report && (
        <div className="mt-10 rounded-3xl border border-slate-100 p-8">
          <p className="text-xs font-bold text-slate-400">MEDICATION SAFETY REPORT</p>
          <p className="text-2xl font-bold text-ink-900 mt-1">{report.medicine}</p>

          <p className="mt-6 text-xs font-bold text-slate-400">PATIENT-SPECIFIC ANALYSIS</p>
          <div className="mt-3 flex flex-col gap-3">
            {report.checks.map((c, i) => (
              <div key={i} className="border border-slate-100 rounded-2xl p-4">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <p className="font-semibold text-ink-900 text-sm">{i + 1}. {c.title}</p>
                  <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-slate-100 text-slate-600">
                    {c.status}
                  </span>
                </div>
                <p className="text-sm text-slate-600 mt-1.5">{c.result}</p>
                {c.explanation && <p className="text-sm text-slate-500 mt-1">{c.explanation}</p>}
              </div>
            ))}
          </div>

          <div className={`mt-8 rounded-2xl border p-6 ${riskStyles[report.overallRisk]}`}>
            <p className="text-xs font-bold">OVERALL RISK: {report.overallRisk}</p>
            <p className="mt-2 text-sm font-medium">{report.summaryMessage}</p>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link to="/profile" className="border border-slate-200 font-semibold text-sm px-5 py-2.5 rounded-full">
              Review Patient Profile
            </Link>
            <button
              onClick={() => { setReport(null); setInput('') }}
              className="inline-flex items-center gap-1.5 border border-slate-200 font-semibold text-sm px-5 py-2.5 rounded-full"
            >
              <RefreshCw size={14} /> Modify Medication
            </button>
            <button
              onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 border border-slate-200 font-semibold text-sm px-5 py-2.5 rounded-full"
            >
              <Printer size={14} /> Print Safety Report
            </button>
          </div>

          <p className="mt-6 text-xs text-slate-400 flex items-start gap-1.5">
            <AlertTriangle size={13} className="mt-0.5 shrink-0" />
            This prototype provides clinical decision support only and does not replace professional
            medical judgment.
          </p>
        </div>
      )}
    </div>
  )
}
