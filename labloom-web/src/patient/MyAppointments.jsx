import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';

export default function MyAppointments() {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('/api/patients/appointments/me')
            .then(data => setBookings(Array.isArray(data) ? data : []))
            .catch(() => setBookings([]))
            .finally(() => setLoading(false));
    }, []);

    const statusBadge = (status) => {
        const map = { pending: 'badge-warning', confirmed: 'badge-info', completed: 'badge-success', cancelled: 'badge-danger' };
        return <span className={`badge ${map[status] || 'badge-info'}`}>{status}</span>;
    };

    return (
        <div className="app-layout">
            <Sidebar />
            <div className="main-content">
                <Topbar title="My Appointments" />
                <div className="page">
                    <div className="page-header">
                        <h1>📅 My Appointments</h1>
                        <p>View all your doctor visits and lab test bookings</p>
                    </div>

                    {loading ? (
                        <div className="flex-center" style={{ padding: 60 }}><div className="spinner"></div></div>
                    ) : bookings.length > 0 ? (
                        <div className="card">
                            <table className="data-table">
                                <thead>
                                    <tr>
                                        <th>Type</th>
                                        <th>Date</th>
                                        <th>Time</th>
                                        <th>Mode</th>
                                        <th>Amount</th>
                                        <th>Status</th>
                                        <th>Chat</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {bookings.map(b => (
                                        <tr key={b._id}>
                                            <td className="fw-600">{b.bookingType === 'doctor' ? '🩺 Doctor' : '🧪 Lab Test'}</td>
                                            <td>{b.date ? new Date(b.date).toLocaleDateString() : '—'}</td>
                                            <td>{b.time || '—'}</td>
                                            <td className="text-muted">{b.appointmentMode || '—'}</td>
                                            <td>₹{b.amount || 0}</td>
                                            <td>{statusBadge(b.status)}</td>
                                            <td>
                                                {['confirmed', 'completed'].includes(b.status) && (
                                                    <Link to={`/patient/chat?bookingId=${b._id}`} className="btn btn-secondary btn-sm">💬</Link>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="empty-state">
                            <div className="empty-icon">📅</div>
                            <h3>No appointments yet</h3>
                            <p>Book a doctor visit or lab test to get started</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
