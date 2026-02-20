import { useState, useEffect } from 'react';
import api from '../api/client';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';

export default function HospitalAppointments() {
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('/api/hospital/appointments')
            .then(data => setAppointments(Array.isArray(data) ? data : []))
            .catch(() => setAppointments([]))
            .finally(() => setLoading(false));
    }, []);

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
                        <h1>📅 Hospital Appointments</h1>
                        <p>All appointments at your hospital</p>
                    </div>

                    {loading ? (
                        <div className="flex-center" style={{ padding: 60 }}><div className="spinner"></div></div>
                    ) : appointments.length > 0 ? (
                        <div className="card">
                            <table className="data-table">
                                <thead><tr><th>Patient</th><th>Doctor</th><th>Date</th><th>Time</th><th>Status</th></tr></thead>
                                <tbody>
                                    {appointments.map(a => (
                                        <tr key={a._id}>
                                            <td className="fw-600">{a.user?.name || 'Patient'}</td>
                                            <td>{a.doctor?.name || 'Doctor'}</td>
                                            <td>{a.date ? new Date(a.date).toLocaleDateString() : '—'}</td>
                                            <td>{a.time || '—'}</td>
                                            <td>{statusBadge(a.status)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="empty-state"><div className="empty-icon">📅</div><h3>No appointments</h3></div>
                    )}
                </div>
            </div>
        </div>
    );
}
