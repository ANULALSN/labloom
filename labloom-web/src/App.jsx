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

// Patient
import PatientDashboard from './patient/PatientDashboard';
import FindDoctors from './patient/FindDoctors';
import FindLabs from './patient/FindLabs';
import MyAppointments from './patient/MyAppointments';
import MyReports from './patient/MyReports';
import Chat from './patient/Chat';
import MyReviews from './patient/MyReviews';
import HealthAssessment from './patient/HealthAssessment';
import PatientProfile from './patient/PatientProfile';

// Doctor
import DoctorDashboard from './doctor/DoctorDashboard';
import PatientList from './doctor/PatientList';
import ManageSlots from './doctor/ManageSlots';
import DoctorChat from './doctor/DoctorChat';
import VerifyReports from './doctor/VerifyReports';
import DoctorReviews from './doctor/DoctorReviews';

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

            {/* Patient Portal */}
            <Route path="/patient" element={<ProtectedRoute allowedRoles={['patient']}><PatientDashboard /></ProtectedRoute>} />
            <Route path="/patient/doctors" element={<ProtectedRoute allowedRoles={['patient']}><FindDoctors /></ProtectedRoute>} />
            <Route path="/patient/labs" element={<ProtectedRoute allowedRoles={['patient']}><FindLabs /></ProtectedRoute>} />
            <Route path="/patient/appointments" element={<ProtectedRoute allowedRoles={['patient']}><MyAppointments /></ProtectedRoute>} />
            <Route path="/patient/reports" element={<ProtectedRoute allowedRoles={['patient']}><MyReports /></ProtectedRoute>} />
            <Route path="/patient/chat" element={<ProtectedRoute allowedRoles={['patient']}><Chat /></ProtectedRoute>} />
            <Route path="/patient/reviews" element={<ProtectedRoute allowedRoles={['patient']}><MyReviews /></ProtectedRoute>} />
            <Route path="/patient/assessment" element={<ProtectedRoute allowedRoles={['patient']}><HealthAssessment /></ProtectedRoute>} />
            <Route path="/patient/profile" element={<ProtectedRoute allowedRoles={['patient']}><PatientProfile /></ProtectedRoute>} />

            {/* Doctor Portal */}
            <Route path="/doctor" element={<ProtectedRoute allowedRoles={['doctor']}><DoctorDashboard /></ProtectedRoute>} />
            <Route path="/doctor/patients" element={<ProtectedRoute allowedRoles={['doctor']}><PatientList /></ProtectedRoute>} />
            <Route path="/doctor/slots" element={<ProtectedRoute allowedRoles={['doctor']}><ManageSlots /></ProtectedRoute>} />
            <Route path="/doctor/chat" element={<ProtectedRoute allowedRoles={['doctor']}><DoctorChat /></ProtectedRoute>} />
            <Route path="/doctor/verify-reports" element={<ProtectedRoute allowedRoles={['doctor']}><VerifyReports /></ProtectedRoute>} />
            <Route path="/doctor/reviews" element={<ProtectedRoute allowedRoles={['doctor']}><DoctorReviews /></ProtectedRoute>} />

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
