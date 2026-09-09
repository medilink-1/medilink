import { useState } from 'react'
import { Loader2 } from 'lucide-react'
import { usePatientData } from '../lib/usePatientData'
import { analyzeMedication } from '../lib/medicationSafety'

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

  const runAnalysis = () => {
    if (!input.trim()) return
    setReport(
      analyzeMedication(input, {
        allergies: p.allergies,
        conditions: p.conditions,
        labResults: p.labResults,
        medications: p.medications,
      })
    )
  }

  if (p.loading) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-20 flex items-center gap-2 text-slate-400">
        <Loader2 className="animate-spin" size={18} /> Loading…
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-14">
      <h1 className="text-3xl font-extrabold text-ink-900">Medication Safety Intelligence</h1>
      <p className="mt-2 text-slate-500">Patient-specific medication safety review at the point of care.</p>

      <section className="mt-8 grid sm:grid-cols-2 gap-6">
        <div className="rounded-2xl border border-slate-100 p-5">
          <p className="text-xs font-bold text-slate-400">PATIENT CLINICAL CONTEXT</p>
          <p className="mt-2 text-sm text-ink-900">{p.conditions.map((c) => c.name).join(' · ') || 'No conditions on file'}</p>
          <p className="mt-1 text-sm font-semibold text-red-600">
            {p.allergies.map((a) => `⚠ ${a.name}`).join(', ') || 'No known allergies'}
          </p>
        </div>
        <div className="rounded-2xl border border-slate-100 p-5">
          <p className="text-xs font-bold text-slate-400">CURRENT MEDICATIONS</p>
          <p className="mt-2 text-sm text-ink-900">
            {p.medications.filter((m) => m.status === 'active').map((m) => m.name).join(' · ') || '—'}
          </p>
        </div>
      </section>

      <section className="mt-8">
        <label className="text-sm font-semibold text-ink-900">Medication Search / Input</label>
        <div className="mt-2 flex gap-3 flex-wrap">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Enter a medication name…"
            className="flex-1 min-w-[220px] rounded-xl border border-slate-200 px-4 py-3"
          />
          <button onClick={runAnalysis} className="bg-brand-600 hover:bg-brand-700 text-white font-semibold px-6 py-3 rounded-full">
            Run Safety Analysis
          </button>
        </div>
      </section>

      {report && (
        <section className="mt-8">
          <p className="text-xs font-bold text-slate-400">RISK CLASSIFICATION</p>
          <div className={`mt-2 rounded-2xl border p-6 ${riskStyles[report.overallRisk]}`}>
            <p className="text-xs font-bold">{report.overallRisk}</p>
            <p className="mt-2 text-sm font-medium">{report.summaryMessage}</p>
          </div>

          <div className="mt-4 flex flex-col gap-3">
            {report.checks.map((c, i) => (
              <div key={i} className="border border-slate-100 rounded-2xl p-4">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <p className="font-semibold text-ink-900 text-sm">{c.title}</p>
                  <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-slate-100 text-slate-600">{c.status}</span>
                </div>
                <p className="text-sm text-slate-600 mt-1.5">{c.result}</p>
                {c.explanation && <p className="text-sm text-slate-500 mt-1">{c.explanation}</p>}
              </div>
            ))}
          </div>
        </section>
      )}

      <p className="mt-10 text-xs text-slate-400 border-t border-slate-100 pt-4">
        MediLink is an academic innovation prototype designed to support access to longitudinal
        health information and medication safety review. It does not diagnose diseases, prescribe
        medications, or replace professional clinical judgment. Final healthcare decisions remain
        with qualified healthcare professionals.
      </p>
    </div>
  )
}
