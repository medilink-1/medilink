import { Link } from 'react-router-dom'
import {
  ChevronRight, User, Pill, Stethoscope, Building2, Syringe, ShieldCheck,
  AlertTriangle, CheckCircle2, FileWarning,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { usePatientData } from '../lib/usePatientData'
import SmartHealthCard from '../components/SmartHealthCard'
import { analyzeMedication } from '../lib/medicationSafety'

const ecosystemCards = [
  { icon: User, title: 'Patient Profile', desc: 'Personal information, medical history and complete health summary.', to: '/profile' },
  { icon: Pill, title: 'Medication Safety', desc: 'Medication history and real-time medication safety analysis.', to: '/medication-safety', highlight: true },
  { icon: Stethoscope, title: 'Clinic Visit', desc: 'Consultations, diagnoses and prescriptions.', to: '/clinic' },
  { icon: Building2, title: 'Hospital Visit', desc: 'Admissions, treatments and discharge records.', to: '/hospital' },
  { icon: Syringe, title: 'Child Vaccination', desc: 'Vaccination history and immunization records.', to: '/vaccination' },
  { icon: ShieldCheck, title: 'Medical Insurance', desc: 'Insurance policies, claims and healthcare coverage.', to: '/insurance' },
]

const workflowSteps = [
  'Smart Health ID', 'Patient Identification', 'Longitudinal Health Profile', 'Healthcare Visit',
  'Medication Entry', 'Safety Analysis', 'Risk Identification', 'Real-Time Alert',
  'Healthcare Professional Review', 'Informed Clinical Decision',
]

const riskBannerStyles = {
  HIGH: 'bg-red-50 text-red-700 border-red-100',
  MODERATE: 'bg-amber-50 text-amber-700 border-amber-100',
  CAUTION: 'bg-amber-50 text-amber-700 border-amber-100',
  LOW: 'bg-emerald-50 text-emerald-700 border-emerald-100',
}

const impactPoints = [
  'Connected Longitudinal Health Records',
  'Improved Continuity of Care',
  'Immediate Access to Critical Patient Information',
  'Patient-Specific Medication Safety Review',
  'Early Identification of Potential Medication Risks',
  'Better-Informed Healthcare Decisions',
  'Enhanced Patient Safety',
]

export default function Home() {
  const { user } = useAuth()
  const patient = usePatientData()

  const activeMeds = patient.medications.filter((m) => m.status === 'active')
  const timelinePreview = patient.timelineEvents.slice(0, 5)

  const previewMed = activeMeds[0]
  const previewReport =
    user && previewMed
      ? analyzeMedication(previewMed.name, {
          allergies: patient.allergies,
          conditions: patient.conditions,
          labResults: patient.labResults,
          medications: patient.medications,
        })
      : null

  return (
    <div>
      {/* SECTION 1: HERO */}
      <section className="max-w-7xl mx-auto px-6 pt-16 pb-20 grid lg:grid-cols-2 gap-16 items-center">
        <div>
          <h1 className="text-5xl sm:text-6xl font-extrabold leading-[1.05] text-ink-900">
            Your Health. Connected.
            <br />
            Your Medication. <span className="text-brand-600">Safer.</span>
          </h1>
          <p className="mt-6 text-lg text-slate-500 max-w-lg leading-relaxed">
            One secure health ecosystem connecting your complete healthcare journey with
            intelligent medication safety insights.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              to={user ? '/profile' : '/signup'}
              className="inline-flex items-center gap-1 bg-brand-600 hover:bg-brand-700 text-white font-semibold px-6 py-3.5 rounded-full transition-colors"
            >
              View My Health Profile <ChevronRight size={18} />
            </Link>
            <Link
              to={user ? '/medication-safety' : '/signup'}
              className="inline-flex items-center border border-teal-200 text-teal-700 hover:bg-teal-50 font-semibold px-6 py-3.5 rounded-full transition-colors"
            >
              Medication Safety Check
            </Link>
          </div>
        </div>

        <div className="flex justify-center">
          {user && patient.profile ? (
            <SmartHealthCard profile={patient.profile} allergies={patient.allergies} />
          ) : (
            <div className="w-full max-w-sm rounded-3xl bg-gradient-to-br from-brand-700 via-brand-600 to-teal-600 text-white p-8 shadow-xl">
              <p className="text-sm font-extrabold tracking-widest">MEDILINK</p>
              <p className="mt-6 text-xs uppercase tracking-wide text-white/70">Smart Health Card</p>
              <p className="mt-1 text-lg text-white/90">
                Sign in to see your patient identity, connected records and medication safety
                intelligence.
              </p>
              <Link to="/signup" className="mt-6 inline-block bg-white text-brand-700 font-semibold px-5 py-2.5 rounded-full text-sm">
                Create your account
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* SECTION 2: PATIENT QUICK OVERVIEW */}
      {user && patient.profile && (
        <section className="max-w-7xl mx-auto px-6 pb-20">
          <h2 className="text-sm font-bold tracking-wide text-teal-700">PATIENT QUICK OVERVIEW</h2>
          <div className="mt-4 rounded-3xl border border-slate-100 p-8 grid md:grid-cols-3 gap-8">
            <div>
              <div className="w-16 h-16 rounded-full bg-brand-50 text-brand-600 flex items-center justify-center text-xl font-bold">
                {patient.profile.full_name?.[0] || 'P'}
              </div>
              <p className="mt-4 text-lg font-bold text-ink-900">{patient.profile.full_name}</p>
              <p className="text-sm text-slate-500">
                {patient.profile.age} Years · {patient.profile.gender} · Blood Group {patient.profile.blood_group}
              </p>
              <p className="text-sm text-slate-400 mt-1">MediLink Health ID: {patient.profile.health_id}</p>
            </div>

            <div>
              <p className="text-xs font-bold text-red-600 flex items-center gap-1.5">
                <AlertTriangle size={14} /> CRITICAL HEALTH INFORMATION
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {patient.allergies.map((a) => (
                  <span key={a.id} className="text-xs font-semibold bg-red-50 text-red-700 px-3 py-1.5 rounded-full">
                    ⚠ {a.name} Allergy
                  </span>
                ))}
                {patient.conditions.map((c) => (
                  <span key={c.id} className="text-xs font-semibold bg-amber-50 text-amber-700 px-3 py-1.5 rounded-full">
                    {c.name}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <p className="text-xs font-bold text-slate-500">CURRENT MEDICATIONS</p>
              <ul className="mt-3 flex flex-col gap-1.5">
                {activeMeds.map((m) => (
                  <li key={m.id} className="text-sm text-ink-900 flex items-center gap-2">
                    <Pill size={14} className="text-brand-500" /> {m.name} {m.dose}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      )}

      {/* SECTION 3: MY HEALTH ECOSYSTEM */}
      <section className="max-w-7xl mx-auto px-6 pb-20">
        <h2 className="text-3xl font-extrabold text-ink-900">My Health Ecosystem</h2>
        <p className="mt-2 text-slate-500">Everything about your health, connected in one place.</p>

        <div className="mt-8 flex gap-5 overflow-x-auto pb-2 lg:grid lg:grid-cols-6 lg:overflow-visible">
          {ecosystemCards.map((card) => (
            <Link
              key={card.title}
              to={user ? card.to : '/login'}
              className={`group shrink-0 w-64 lg:w-auto rounded-2xl border p-6 hover:shadow-md transition-all ${
                card.highlight ? 'border-teal-200 bg-teal-50/40' : 'border-slate-100 hover:border-brand-200'
              }`}
            >
              <span className={`w-11 h-11 rounded-xl flex items-center justify-center ${card.highlight ? 'bg-teal-600 text-white' : 'bg-brand-50 text-brand-600'}`}>
                <card.icon size={20} />
              </span>
              <h3 className="mt-4 font-bold text-ink-900">{card.title}</h3>
              <p className="mt-1.5 text-sm text-slate-500 leading-relaxed">{card.desc}</p>
              <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-brand-600">
                Open <ChevronRight size={15} className="group-hover:translate-x-0.5 transition-transform" />
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* SECTION 4: HEALTH TIMELINE PREVIEW */}
      {user && timelinePreview.length > 0 && (
        <section className="max-w-4xl mx-auto px-6 pb-20">
          <h2 className="text-3xl font-extrabold text-ink-900">My Health Timeline</h2>
          <p className="mt-2 text-slate-500">A connected view of your healthcare journey.</p>

          <div className="mt-8 relative pl-8 border-l-2 border-brand-100 flex flex-col gap-8">
            {timelinePreview.map((ev) => (
              <div key={ev.id} className="relative">
                <span className="absolute -left-[41px] top-0.5 w-4 h-4 rounded-full bg-brand-600 ring-4 ring-brand-50" />
                <p className="text-sm font-bold text-brand-700">{ev.event_year}</p>
                <p className="font-semibold text-ink-900">{ev.title}</p>
              </div>
            ))}
          </div>

          <Link to="/timeline" className="mt-6 inline-flex items-center gap-1 text-sm font-semibold text-brand-600">
            View Complete Timeline <ChevronRight size={15} />
          </Link>
        </section>
      )}

      {/* SECTION 5: MEDICATION SAFETY INTELLIGENCE PREVIEW */}
      <section className="bg-slate-50/70 py-20">
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="text-3xl font-extrabold text-ink-900">Medication Safety Intelligence</h2>
          <p className="mt-2 text-slate-500">
            Transforming patient health information into actionable safety insights.
          </p>

          {!user ? (
            <div className="mt-8 rounded-3xl bg-white border border-slate-100 p-8 grid md:grid-cols-2 gap-8">
              <div>
                <p className="text-xs font-bold text-slate-400">EXAMPLE: NEW MEDICATION</p>
                <p className="text-2xl font-bold text-ink-900 mt-1">Amoxicillin</p>

                <p className="mt-6 text-xs font-bold text-slate-400">SYSTEM SAFETY ANALYSIS</p>
                <ul className="mt-3 flex flex-col gap-2 text-sm text-slate-600">
                  {[
                    'Drug–Drug Interaction Check', 'Drug–Disease Contraindication Check', 'Drug Allergy Check',
                  ].map((c) => (
                    <li key={c} className="flex items-center gap-2">
                      <CheckCircle2 size={15} className="text-teal-600" /> {c}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <div className="rounded-2xl bg-red-50 border border-red-100 p-6">
                  <p className="text-xs font-bold text-red-600">HIGH RISK (EXAMPLE)</p>
                  <p className="mt-2 font-bold text-ink-900 flex items-center gap-2">
                    <FileWarning size={18} className="text-red-600" /> Potential Allergy-Related Risk Detected
                  </p>
                  <p className="mt-2 text-sm text-slate-600">
                    A patient with a documented Penicillin allergy would be flagged here before
                    this medicine is prescribed or dispensed.
                  </p>
                </div>
                <Link
                  to="/signup"
                  className="mt-5 inline-flex bg-brand-600 hover:bg-brand-700 text-white font-semibold px-6 py-3 rounded-full"
                >
                  Create your account
                </Link>
                <p className="mt-4 text-xs font-bold text-slate-400">CLINICAL DECISION SUPPORT ONLY</p>
                <p className="text-xs text-slate-400 mt-1">
                  MediLink provides medication safety information to support healthcare professionals.
                  It does not replace professional clinical judgment.
                </p>
              </div>
            </div>
          ) : previewReport ? (
            <div className="mt-8 rounded-3xl bg-white border border-slate-100 p-8 grid md:grid-cols-2 gap-8">
              <div>
                <p className="text-xs font-bold text-slate-400">YOUR MOST RECENT MEDICATION</p>
                <p className="text-2xl font-bold text-ink-900 mt-1">{previewReport.medicine}</p>

                <p className="mt-6 text-xs font-bold text-slate-400">SYSTEM SAFETY ANALYSIS</p>
                <ul className="mt-3 flex flex-col gap-2 text-sm text-slate-600">
                  {previewReport.checks.map((c) => (
                    <li key={c.title} className="flex items-center gap-2">
                      <CheckCircle2
                        size={15}
                        className={c.status === 'NOT EVALUATED' ? 'text-slate-300' : 'text-teal-600'}
                      />
                      {c.title}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <div className={`rounded-2xl border p-6 ${riskBannerStyles[previewReport.overallRisk]}`}>
                  <p className="text-xs font-bold">{previewReport.overallRisk} RISK</p>
                  <p className="mt-2 font-bold flex items-center gap-2">
                    <FileWarning size={18} /> {previewReport.summaryMessage}
                  </p>
                </div>
                <Link
                  to="/medication-safety"
                  className="mt-5 inline-flex bg-brand-600 hover:bg-brand-700 text-white font-semibold px-6 py-3 rounded-full"
                >
                  View Full Analysis
                </Link>
                <p className="mt-4 text-xs font-bold text-slate-400">CLINICAL DECISION SUPPORT ONLY</p>
                <p className="text-xs text-slate-400 mt-1">
                  MediLink provides medication safety information to support healthcare professionals.
                  It does not replace professional clinical judgment.
                </p>
              </div>
            </div>
          ) : (
            <div className="mt-8 rounded-3xl bg-white border border-slate-100 p-10 text-center">
              <p className="font-semibold text-ink-900">Add a medication to see your personalized safety analysis here.</p>
              <p className="mt-2 text-sm text-slate-500 max-w-md mx-auto">
                This section shows a live, patient-specific safety review the moment you add a
                medication on your Patient Profile.
              </p>
              <Link
                to="/medication-safety"
                className="mt-5 inline-flex bg-brand-600 hover:bg-brand-700 text-white font-semibold px-6 py-3 rounded-full"
              >
                Run a Safety Check
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* SECTION 6: HOW MEDILINK WORKS */}
      <section className="max-w-5xl mx-auto px-6 py-20">
        <h2 className="text-3xl font-extrabold text-ink-900 text-center">How MediLink Works</h2>
        <p className="mt-2 text-slate-500 text-center">From your Smart Health ID to an informed clinical decision.</p>
        <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {workflowSteps.map((step, i) => (
            <div key={step} className="rounded-2xl border border-slate-100 bg-white shadow-sm p-5 flex flex-col gap-3">
              <span className="w-7 h-7 rounded-full bg-brand-50 text-brand-600 text-xs font-bold flex items-center justify-center shrink-0">
                {i + 1}
              </span>
              <p className="font-semibold text-ink-900 text-sm leading-snug">{step}</p>
            </div>
          ))}
        </div>
      </section>

      {/* SECTION 7: MEDILINK IMPACT */}
      <section className="bg-brand-700 text-white py-20">
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="text-3xl font-extrabold">The MediLink Impact</h2>
          <div className="mt-8 grid sm:grid-cols-2 gap-4">
            {impactPoints.map((point, i) => {
              const isDangling = impactPoints.length % 2 === 1 && i === impactPoints.length - 1
              return (
                <div
                  key={point}
                  className={`flex items-start gap-3 bg-white/10 rounded-2xl p-5 ${
                    isDangling ? 'sm:col-span-2 sm:max-w-[calc(50%-0.5rem)] sm:mx-auto' : ''
                  }`}
                >
                  <CheckCircle2 size={18} className="text-teal-300 mt-0.5 shrink-0" />
                  <span className="text-sm font-medium">{point}</span>
                </div>
              )
            })}
          </div>
        </div>
      </section>
    </div>
  )
}
