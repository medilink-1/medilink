import { ShieldCheck, Loader2, ReceiptText } from 'lucide-react'
import { usePatientData } from '../lib/usePatientData'

const statusStyles = {
  active: 'bg-emerald-50 text-emerald-700',
  approved: 'bg-emerald-50 text-emerald-700',
  submitted: 'bg-amber-50 text-amber-700',
  rejected: 'bg-red-50 text-red-700',
}

function formatINR(amount) {
  if (amount == null) return '—'
  return `₹${Number(amount).toLocaleString('en-IN')}`
}

export default function MedicalInsurance() {
  const p = usePatientData()

  if (p.loading) {
    return <div className="max-w-4xl mx-auto px-6 py-20 flex items-center gap-2 text-slate-400"><Loader2 className="animate-spin" size={18}/> Loading insurance details…</div>
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-14">
      <h1 className="text-3xl font-extrabold text-ink-900">Medical Insurance</h1>
      <p className="mt-2 text-slate-500">Healthcare coverage and insurance information.</p>

      <div className="mt-8 flex flex-col gap-6">
        {p.insurancePolicies.length === 0 ? (
          <div className="text-center py-16 border border-dashed border-slate-200 rounded-2xl text-slate-400">
            No insurance policy on file.
          </div>
        ) : (
          p.insurancePolicies.map((policy) => (
            <div key={policy.id} className="border border-slate-100 rounded-2xl p-6">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <p className="font-bold text-ink-900 flex items-center gap-2">
                  <ShieldCheck size={18} className="text-brand-600" /> {policy.provider}
                </p>
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full capitalize ${statusStyles[policy.status] || statusStyles.active}`}>
                  {policy.status}
                </span>
              </div>

              <div className="mt-4 grid sm:grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-xs text-slate-400">Policy Number</p>
                  <p className="font-semibold text-ink-900">{policy.policy_number}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400">Policy Type</p>
                  <p className="font-semibold text-ink-900">{policy.policy_type}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400">Coverage</p>
                  <p className="font-semibold text-ink-900">{formatINR(policy.coverage_amount)}</p>
                </div>
              </div>

              <p className="mt-6 text-xs font-bold text-slate-400">CLAIMS HISTORY</p>
              <div className="mt-3 flex flex-col gap-3">
                {p.insuranceClaims.filter((c) => c.policy_id === policy.id).map((claim) => (
                  <div key={claim.id} className="flex items-center justify-between border border-slate-100 rounded-xl p-4 flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <ReceiptText size={16} className="text-slate-400" />
                      <div>
                        <p className="text-sm font-semibold text-ink-900">{claim.claim_ref}</p>
                        <p className="text-xs text-slate-500">{claim.hospital_name}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-semibold text-ink-900">{formatINR(claim.amount)}</span>
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full capitalize ${statusStyles[claim.status] || statusStyles.submitted}`}>
                        {claim.status}
                      </span>
                    </div>
                  </div>
                ))}
                {p.insuranceClaims.filter((c) => c.policy_id === policy.id).length === 0 && (
                  <p className="text-sm text-slate-400">No claims filed yet.</p>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
