import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import ProtectedRoute from './components/ProtectedRoute'
import Home from './pages/Home'
import Login from './pages/Login'
import SignUp from './pages/SignUp'
import PatientProfile from './pages/PatientProfile'
import PharmacyVisit from './pages/PharmacyVisit'
import ClinicVisit from './pages/ClinicVisit'
import HospitalVisit from './pages/HospitalVisit'
import ChildVaccination from './pages/ChildVaccination'
import MedicalInsurance from './pages/MedicalInsurance'
import HealthTimeline from './pages/HealthTimeline'
import MedicationSafety from './pages/MedicationSafety'
import About from './pages/About'

function Protected({ children }) {
  return <ProtectedRoute>{children}</ProtectedRoute>
}

export default function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/about" element={<About />} />

          <Route path="/profile" element={<Protected><PatientProfile /></Protected>} />
          <Route path="/pharmacy" element={<Protected><PharmacyVisit /></Protected>} />
          <Route path="/clinic" element={<Protected><ClinicVisit /></Protected>} />
          <Route path="/hospital" element={<Protected><HospitalVisit /></Protected>} />
          <Route path="/vaccination" element={<Protected><ChildVaccination /></Protected>} />
          <Route path="/insurance" element={<Protected><MedicalInsurance /></Protected>} />
          <Route path="/timeline" element={<Protected><HealthTimeline /></Protected>} />
          <Route path="/medication-safety" element={<Protected><MedicationSafety /></Protected>} />
        </Routes>
      </main>
    </div>
  )
}
