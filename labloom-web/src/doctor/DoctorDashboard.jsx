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

    useEffect(() => { fetchAppointments(); }, [filter]);

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
