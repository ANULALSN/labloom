import { useState, useEffect } from 'react';
import api from '../api/client';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import { useToast } from '../components/Toast';
import HealthInfoModal from '../components/HealthInfoModal';

export default function DoctorDashboard() {
    const [appointments, setAppointments] = useState([]);
    const [filter, setFilter] = useState('');
    const [loading, setLoading] = useState(true);
    const [selectedPatient, setSelectedPatient] = useState(null);
    const [profile, setProfile] = useState(null);
    const toast = useToast();

    const fetchAppointments = async () => {
        setLoading(true);
        try {
            let url = '/api/doctor/appointments';
            if (filter) url += `?status=${filter}`;
            const data = await api.get(url);
            setAppointments(Array.isArray(data) ? data : []);
        } catch {
            setAppointments([]);
        }
        setLoading(false);
    };

    const fetchProfile = async () => {
        try {
            const data = await api.get('/api/doctor/availability');
            setProfile(data);
        } catch { }
    };

    useEffect(() => {
        fetchAppointments();
        if (!profile) fetchProfile();
    }, [filter]);

    const updateStatus = async (id, status) => {
        try {
            await api.patch(`/api/doctor/appointments/${id}/status`, { status });
            toast.success(`Appointment ${status}`);
            fetchAppointments();
        } catch (err) {
            toast.error(err.message);
        }
    };

    const statusBadge = (s) => {
        const map = { pending: 'badge-warning', confirmed: 'badge-info', completed: 'badge-success', cancelled: 'badge-danger' };
        return <span className={`badge ${map[s] || 'badge-info'}`}>{s}</span>;
    };

    return (
        <div className="app-layout">
            <Sidebar />
            <div className="main-content">
                <Topbar title="Appointments" />
                <div className="page">
                    <div className="page-header">
                        <h1>Appointments</h1>
                        <p>Your schedule and patient appointments</p>
                    </div>

                    {profile && profile.verificationStatus !== 'approved' && (
                        <div className="card mb-24" style={{ backgroundColor: 'var(--warning)', color: '#000', border: 'none' }}>
                            <div className="flex gap-16" style={{ alignItems: 'center' }}>
                                <div style={{ fontSize: 24 }}>⚠️</div>
                                <div style={{ flex: 1 }}>
                                    <h3 style={{ margin: 0, color: '#000' }}>Action Required: Account Verification Pending</h3>
                                    <p style={{ margin: '4px 0 0 0', opacity: 0.8 }}>Your account is currently {profile.verificationStatus}. Patients cannot see your profile until you are approved.</p>
                                </div>
                                <a href="/doctor/verification" className="btn" style={{ backgroundColor: '#000', color: '#fff', border: 'none' }}>
                                    Upload Documents
                                </a>
                            </div>
                        </div>
                    )}

                    <div className="flex gap-8 mb-24">
                        {['', 'pending', 'confirmed', 'completed', 'cancelled'].map(f => (
                            <button key={f} className={`btn ${filter === f ? 'btn-primary' : 'btn-secondary'} btn-sm`} onClick={() => setFilter(f)}>
                                {f ? f.charAt(0).toUpperCase() + f.slice(1) : 'All'}
                            </button>
                        ))}
                    </div>

                    {loading ? (
                        <div className="flex-center" style={{ padding: 60 }}><div className="spinner"></div></div>
                    ) : appointments.length > 0 ? (
                        <div className="card">
                            <table className="data-table">
                                <thead>
                                    <tr><th>Patient</th><th>Date</th><th>Time</th><th>Mode</th><th>Status</th><th>Actions</th></tr>
                                </thead>
                                <tbody>
                                    {appointments.map(a => (
                                        <tr key={a._id}>
                                            <td className="fw-600">{a.patientId?.name || a.patientName || 'Patient'}</td>
                                            <td>{a.date ? new Date(a.date).toLocaleDateString() : '—'}</td>
                                            <td>{a.time || '—'}</td>
                                            <td className="text-muted">{a.appointmentMode || '—'}</td>
                                            <td>{statusBadge(a.status)}</td>
                                            <td>
                                                <div className="flex gap-8">
                                                    <button className="btn btn-secondary btn-sm" onClick={() => setSelectedPatient(a.user)}>View Info</button>
                                                    {a.status === 'pending' && (
                                                        <button className="btn btn-success btn-sm" onClick={() => updateStatus(a._id, 'confirmed')}>Confirm</button>
                                                    )}
                                                    {a.status === 'confirmed' && (
                                                        <button className="btn btn-primary btn-sm" onClick={() => updateStatus(a._id, 'completed')}>Complete</button>
                                                    )}
                                                    {['pending', 'confirmed'].includes(a.status) && (
                                                        <button className="btn btn-danger btn-sm" onClick={() => updateStatus(a._id, 'cancelled')}>Remove</button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="empty-state"><h3>No appointments</h3><p>Your patient appointments will appear here</p></div>
                    )}
                </div>
            </div>
            {selectedPatient && <HealthInfoModal patient={selectedPatient} onClose={() => setSelectedPatient(null)} />}
        </div>
    );
}
