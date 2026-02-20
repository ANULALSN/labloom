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

// Patient
import PatientDashboard from './patient/PatientDashboard';
import FindDoctors from './patient/FindDoctors';
import FindLabs from './patient/FindLabs';
import MyAppointments from './patient/MyAppointments';
import MyReports from './patient/MyReports';
import Chat from './patient/Chat';

// Doctor
import DoctorDashboard from './doctor/DoctorDashboard';
import PatientList from './doctor/PatientList';
import ManageSlots from './doctor/ManageSlots';
import DoctorChat from './doctor/DoctorChat';
import VerifyReports from './doctor/VerifyReports';

// Hospital
import HospitalDashboard from './hospital/HospitalDashboard';
import DoctorManagement from './hospital/DoctorManagement';
import SlotManagement from './hospital/SlotManagement';
import HospitalAppointments from './hospital/HospitalAppointments';
import Finance from './hospital/Finance';

// Lab
import LabDashboard from './lab/LabDashboard';

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

            {/* Patient Portal */}
            <Route path="/patient" element={<ProtectedRoute allowedRoles={['patient']}><PatientDashboard /></ProtectedRoute>} />
            <Route path="/patient/doctors" element={<ProtectedRoute allowedRoles={['patient']}><FindDoctors /></ProtectedRoute>} />
            <Route path="/patient/labs" element={<ProtectedRoute allowedRoles={['patient']}><FindLabs /></ProtectedRoute>} />
            <Route path="/patient/appointments" element={<ProtectedRoute allowedRoles={['patient']}><MyAppointments /></ProtectedRoute>} />
            <Route path="/patient/reports" element={<ProtectedRoute allowedRoles={['patient']}><MyReports /></ProtectedRoute>} />
            <Route path="/patient/chat" element={<ProtectedRoute allowedRoles={['patient']}><Chat /></ProtectedRoute>} />

            {/* Doctor Portal */}
            <Route path="/doctor" element={<ProtectedRoute allowedRoles={['doctor']}><DoctorDashboard /></ProtectedRoute>} />
            <Route path="/doctor/patients" element={<ProtectedRoute allowedRoles={['doctor']}><PatientList /></ProtectedRoute>} />
            <Route path="/doctor/slots" element={<ProtectedRoute allowedRoles={['doctor']}><ManageSlots /></ProtectedRoute>} />
            <Route path="/doctor/chat" element={<ProtectedRoute allowedRoles={['doctor']}><DoctorChat /></ProtectedRoute>} />
            <Route path="/doctor/verify-reports" element={<ProtectedRoute allowedRoles={['doctor']}><VerifyReports /></ProtectedRoute>} />

            {/* Hospital Portal */}
            <Route path="/hospital" element={<ProtectedRoute allowedRoles={['hospital']}><HospitalDashboard /></ProtectedRoute>} />
            <Route path="/hospital/doctors" element={<ProtectedRoute allowedRoles={['hospital']}><DoctorManagement /></ProtectedRoute>} />
            <Route path="/hospital/slots" element={<ProtectedRoute allowedRoles={['hospital']}><SlotManagement /></ProtectedRoute>} />
            <Route path="/hospital/appointments" element={<ProtectedRoute allowedRoles={['hospital']}><HospitalAppointments /></ProtectedRoute>} />
            <Route path="/hospital/finance" element={<ProtectedRoute allowedRoles={['hospital']}><Finance /></ProtectedRoute>} />

            {/* Lab Portal */}
            <Route path="/lab" element={<ProtectedRoute allowedRoles={['lab']}><LabDashboard /></ProtectedRoute>} />
            <Route path="/lab/bookings" element={<ProtectedRoute allowedRoles={['lab']}><LabDashboard /></ProtectedRoute>} />
            <Route path="/lab/tests" element={<ProtectedRoute allowedRoles={['lab']}><LabDashboard /></ProtectedRoute>} />

            {/* Default */}
            <Route path="/" element={<LandingPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
