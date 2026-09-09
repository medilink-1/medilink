import { ArrowDown } from 'lucide-react'

const solutionFlow = [
  'Patient Profile', 'Pharmacy Visits', 'Clinic Visits', 'Hospital Records', 'Vaccination Records', 'Medical Insurance',
]

const problems = [
  'Drug–Drug Interactions',
  'Drug–Disease Contraindications',
  'Therapeutic Duplication',
  'Allergy-related Risks',
  'Re-exposure to medicines associated with previous ADRs',
  'Dose-related concerns in renal or hepatic impairment',
]

export default function About() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-14">
      <h1 className="text-3xl font-extrabold text-ink-900">About MediLink</h1>

      <section className="mt-10">
        <h2 className="text-sm font-bold tracking-wide text-slate-400">PROBLEM</h2>
        <p className="mt-3 text-slate-600 leading-relaxed">
          Healthcare information is fragmented across hospitals, clinics, pharmacies and physical
          documents. This can result in incomplete patient information at the point of care.
        </p>
        <p className="mt-3 text-slate-600">Potential medication-related problems include:</p>
        <ul className="mt-3 flex flex-col gap-2">
          {problems.map((item) => (
            <li key={item} className="text-sm text-ink-900 bg-slate-50 rounded-xl px-4 py-2.5">{item}</li>
          ))}
        </ul>
      </section>

      <section className="mt-12">
        <h2 className="text-sm font-bold tracking-wide text-slate-400">SOLUTION</h2>
        <p className="mt-3 text-slate-600 leading-relaxed">
          MediLink creates a patient-centered longitudinal health ecosystem. It connects:
        </p>
        <div className="mt-5 flex flex-col items-start gap-1">
          {solutionFlow.map((step, i) => (
            <div key={step}>
              <span className="inline-block rounded-lg bg-white border border-slate-100 shadow-sm px-4 py-2 text-sm font-semibold text-ink-900">
                {step}
              </span>
              {i < solutionFlow.length - 1 && <ArrowDown size={16} className="my-1.5 ml-4 text-brand-300" />}
            </div>
          ))}
        </div>
        <p className="mt-5 text-slate-600 leading-relaxed">
          The system then enables patient-specific medication safety intelligence.
        </p>
      </section>

      <section className="mt-12 rounded-2xl bg-brand-700 text-white p-8">
        <h2 className="text-xs font-bold tracking-wide text-teal-200">CORE INNOVATION</h2>
        <p className="mt-3 text-lg font-semibold leading-relaxed">
          "Transforming fragmented and passive health records into connected, patient-specific and
          actionable medication safety intelligence."
        </p>
      </section>

      <p className="mt-12 text-sm text-slate-500 border-t border-slate-100 pt-6 leading-relaxed">
        MediLink is an academic innovation prototype designed to support access to longitudinal
        health information and medication safety review. It does not diagnose diseases, prescribe
        medications, or replace professional clinical judgment. Final healthcare decisions remain
        with qualified healthcare professionals.
      </p>
    </div>
  )
}
