import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './auth/AuthContext';
import { ToastProvider } from './components/Toast';
import ProtectedRoute from './components/ProtectedRoute';

// Auth
import LoginPage from './auth/LoginPage';
import SignupPage from './auth/SignupPage';
import LandingPage from './pages/LandingPage';

// Admin
import AdminDashboard from './admin/AdminDashboard';
import UserManagement from './admin/UserManagement';
import PendingApprovals from './admin/PendingApprovals';
import AdminReviews from './admin/AdminReviews';

// Doctor
import DoctorDashboard from './doctor/DoctorDashboard';
import PatientList from './doctor/PatientList';
import ManageSlots from './doctor/ManageSlots';
import DoctorChat from './doctor/DoctorChat';
import VerifyReports from './doctor/VerifyReports';
import DoctorReviews from './doctor/DoctorReviews';
import DoctorProfile from './doctor/DoctorProfile';

// Hospital
import HospitalDashboard from './hospital/HospitalDashboard';
import DoctorManagement from './hospital/DoctorManagement';
import SlotManagement from './hospital/SlotManagement';
import HospitalAppointments from './hospital/HospitalAppointments';
import Finance from './hospital/Finance';
import HospitalReviews from './hospital/HospitalReviews';

// Lab
import LabDashboard from './lab/LabDashboard';
import LabReviews from './lab/LabReviews';
import LabBookings from './lab/LabBookings';
import LabTests from './lab/LabTests';

// Patient mobile redirect page
function PatientMobileRedirect() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
      fontFamily: "'Inter', sans-serif",
      padding: 24
    }}>
      <div style={{
        maxWidth: 420,
        textAlign: 'center',
        background: 'rgba(255,255,255,0.05)',
        backdropFilter: 'blur(20px)',
        borderRadius: 20,
        padding: '48px 32px',
        border: '1px solid rgba(255,255,255,0.1)'
      }}>
        <div style={{ fontSize: 64, marginBottom: 16 }}>📱</div>
        <h1 style={{ color: '#fff', fontSize: 24, margin: '0 0 8px 0' }}>Use the Labloom App</h1>
        <p style={{ color: '#94a3b8', fontSize: 15, lineHeight: 1.6, margin: '0 0 28px 0' }}>
          The patient portal is available exclusively on our mobile app for the best experience — book doctors, view reports, chat, and more.
        </p>
        <div style={{
          display: 'flex',
          gap: 12,
          justifyContent: 'center',
          flexWrap: 'wrap'
        }}>
          <a href="#" style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: '#fff', color: '#0f172a', padding: '12px 24px',
            borderRadius: 12, fontWeight: 600, fontSize: 14,
            textDecoration: 'none'
          }}>
            🍎 App Store
          </a>
          <a href="#" style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: '#fff', color: '#0f172a', padding: '12px 24px',
            borderRadius: 12, fontWeight: 600, fontSize: 14,
            textDecoration: 'none'
          }}>
            ▶️ Google Play
          </a>
        </div>
        <p style={{ color: '#64748b', fontSize: 12, marginTop: 28 }}>
          Are you a doctor, hospital, or lab?{' '}
          <a href="/login" style={{ color: '#60a5fa' }}>Sign in here</a>
        </p>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <Routes>
            {/* Public */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />

            {/* Admin Portal */}
            <Route path="/admin" element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>} />
            <Route path="/admin/users" element={<ProtectedRoute allowedRoles={['admin']}><UserManagement /></ProtectedRoute>} />
            <Route path="/admin/approvals" element={<ProtectedRoute allowedRoles={['admin']}><PendingApprovals /></ProtectedRoute>} />
            <Route path="/admin/reviews" element={<ProtectedRoute allowedRoles={['admin']}><AdminReviews /></ProtectedRoute>} />

            {/* Patient — redirect to mobile app download page */}
            <Route path="/patient" element={<PatientMobileRedirect />} />
            <Route path="/patient/*" element={<PatientMobileRedirect />} />

            {/* Doctor Portal */}
            <Route path="/doctor" element={<ProtectedRoute allowedRoles={['doctor']}><DoctorDashboard /></ProtectedRoute>} />
            <Route path="/doctor/patients" element={<ProtectedRoute allowedRoles={['doctor']}><PatientList /></ProtectedRoute>} />
            <Route path="/doctor/slots" element={<ProtectedRoute allowedRoles={['doctor']}><ManageSlots /></ProtectedRoute>} />
            <Route path="/doctor/chat" element={<ProtectedRoute allowedRoles={['doctor']}><DoctorChat /></ProtectedRoute>} />
            <Route path="/doctor/verify-reports" element={<ProtectedRoute allowedRoles={['doctor']}><VerifyReports /></ProtectedRoute>} />
            <Route path="/doctor/reviews" element={<ProtectedRoute allowedRoles={['doctor']}><DoctorReviews /></ProtectedRoute>} />
            <Route path="/doctor/profile" element={<ProtectedRoute allowedRoles={['doctor']}><DoctorProfile /></ProtectedRoute>} />

            {/* Hospital Portal */}
            <Route path="/hospital" element={<ProtectedRoute allowedRoles={['hospital']}><HospitalDashboard /></ProtectedRoute>} />
            <Route path="/hospital/doctors" element={<ProtectedRoute allowedRoles={['hospital']}><DoctorManagement /></ProtectedRoute>} />
            <Route path="/hospital/slots" element={<ProtectedRoute allowedRoles={['hospital']}><SlotManagement /></ProtectedRoute>} />
            <Route path="/hospital/appointments" element={<ProtectedRoute allowedRoles={['hospital']}><HospitalAppointments /></ProtectedRoute>} />
            <Route path="/hospital/finance" element={<ProtectedRoute allowedRoles={['hospital']}><Finance /></ProtectedRoute>} />
            <Route path="/hospital/reviews" element={<ProtectedRoute allowedRoles={['hospital']}><HospitalReviews /></ProtectedRoute>} />

            {/* Lab Portal */}
            <Route path="/lab" element={<ProtectedRoute allowedRoles={['lab']}><LabDashboard /></ProtectedRoute>} />
            <Route path="/lab/bookings" element={<ProtectedRoute allowedRoles={['lab']}><LabBookings /></ProtectedRoute>} />
            <Route path="/lab/tests" element={<ProtectedRoute allowedRoles={['lab']}><LabTests /></ProtectedRoute>} />
            <Route path="/lab/reviews" element={<ProtectedRoute allowedRoles={['lab']}><LabReviews /></ProtectedRoute>} />

            {/* Default */}
            <Route path="/" element={<LandingPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
