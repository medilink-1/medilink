import { lazy, Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import Navbar from './components/Navbar'
import ProtectedRoute from './components/ProtectedRoute'

// Route-level code splitting: each page is only downloaded when a user
// actually navigates to it, instead of every page's code shipping in one
// single startup bundle. Behavior is unchanged -- this only affects when
// each chunk is fetched, not what any page does.
const Home = lazy(() => import('./pages/Home'))
const Login = lazy(() => import('./pages/Login'))
const SignUp = lazy(() => import('./pages/SignUp'))
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'))
const ResetPassword = lazy(() => import('./pages/ResetPassword'))
const PatientProfile = lazy(() => import('./pages/PatientProfile'))
const ClinicVisit = lazy(() => import('./pages/ClinicVisit'))
const HospitalVisit = lazy(() => import('./pages/HospitalVisit'))
const ChildVaccination = lazy(() => import('./pages/ChildVaccination'))
const MedicalInsurance = lazy(() => import('./pages/MedicalInsurance'))
const HealthTimeline = lazy(() => import('./pages/HealthTimeline'))
const MedicationSafety = lazy(() => import('./pages/MedicationSafety'))
const SharedSummary = lazy(() => import('./pages/SharedSummary'))
const About = lazy(() => import('./pages/About'))
const PrivacyData = lazy(() => import('./pages/PrivacyData'))

function Protected({ children }) {
  return <ProtectedRoute>{children}</ProtectedRoute>
}

function RouteFallback() {
  return (
    <div className="max-w-5xl mx-auto px-6 py-24 flex items-center justify-center gap-2 text-slate-400">
      <Loader2 className="animate-spin" size={18} /> Loading…
    </div>
  )
}

export default function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Suspense fallback={<RouteFallback />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/about" element={<About />} />
            <Route path="/shared/:token" element={<SharedSummary />} />

            <Route path="/profile" element={<Protected><PatientProfile /></Protected>} />
            <Route path="/pharmacy" element={<Navigate to="/medication-safety" replace />} />
            <Route path="/clinic" element={<Protected><ClinicVisit /></Protected>} />
            <Route path="/hospital" element={<Protected><HospitalVisit /></Protected>} />
            <Route path="/vaccination" element={<Protected><ChildVaccination /></Protected>} />
            <Route path="/insurance" element={<Protected><MedicalInsurance /></Protected>} />
            <Route path="/timeline" element={<Protected><HealthTimeline /></Protected>} />
            <Route path="/medication-safety" element={<Protected><MedicationSafety /></Protected>} />
            <Route path="/data-privacy" element={<Protected><PrivacyData /></Protected>} />
          </Routes>
        </Suspense>
      </main>
    </div>
  )
}
