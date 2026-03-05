import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import FeedbackModal from '../components/FeedbackModal';
import DocViewerModal from '../components/DocViewerModal';

export default function MyAppointments() {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [feedbackTarget, setFeedbackTarget] = useState(null);
    const [viewingReport, setViewingReport] = useState(null);

    const fetchBookings = () => {
        setLoading(true);
        api.get('/api/patients/appointments/me')
            .then(data => setBookings(Array.isArray(data) ? data : []))
            .catch(() => setBookings([]))
            .finally(() => setLoading(false));
    };

    useEffect(() => { fetchBookings(); }, []);

    const statusBadge = (status) => {
        const map = { pending: 'badge-warning', confirmed: 'badge-info', completed: 'badge-success', cancelled: 'badge-danger' };
        return <span className={`badge ${map[status] || 'badge-info'}`}>{status}</span>;
    };

    const handleFeedbackClick = (booking) => {
        const targetId = booking.bookingType === 'doctor' ? booking.doctor?._id : booking.lab?._id;
        const targetType = booking.bookingType === 'doctor' ? 'doctor' : 'lab';
        const targetName = booking.bookingType === 'doctor' ? booking.doctor?.name : booking.lab?.name;
        setFeedbackTarget({ targetId, targetType, targetName });
    };

    return (
        <>
            <div className="app-layout">
                <Sidebar />
                <div className="main-content">
                    <Topbar title="My Appointments" />
                    <div className="page">
                        <div className="page-header">
                            <h1>📅 My Appointments & Tests</h1>
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
                                            <th>Report</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {bookings.map(b => (
                                            <tr key={b._id}>
                                                <td className="fw-600">
                                                    {b.bookingType === 'doctor' ? '🩺 Doctor' : '🧪 Lab Test'}
                                                    <div className="text-muted text-sm">{b.bookingType === 'doctor' ? b.doctor?.name : b.lab?.name}</div>
                                                    {b.test?.name && <div className="text-muted text-sm" style={{ fontSize: 11 }}>{b.test.name}</div>}
                                                </td>
                                                <td>{b.date ? new Date(b.date).toLocaleDateString() : '—'}</td>
                                                <td>{b.time || '—'}</td>
                                                <td className="text-muted">{b.appointmentMode || '—'}</td>
                                                <td>₹{b.amount || 0}</td>
                                                <td>{statusBadge(b.status)}</td>
                                                <td>
                                                    {b.bookingType === 'test' && b.labReport?.reportUrl ? (
                                                        b.labReport.verifiedByDoctor ? (
                                                            <button
                                                                className="btn btn-success btn-sm"
                                                                onClick={() => setViewingReport({ url: b.labReport.reportUrl, name: `${b.test?.name || 'Lab Report'} — ${b.lab?.name}` })}
                                                            >
                                                                📄 View Report
                                                            </button>
                                                        ) : (
                                                            <span className="badge badge-warning" style={{ fontSize: 11 }}>⏳ Under Review</span>
                                                        )
                                                    ) : (
                                                        <span className="text-muted text-sm">—</span>
                                                    )}
                                                </td>
                                                <td>
                                                    <div className="flex gap-8">
                                                        {['confirmed', 'completed'].includes(b.status) && (
                                                            <Link to={`/patient/chat?bookingId=${b._id}`} className="btn btn-secondary btn-sm" title="Chat">💬</Link>
                                                        )}
                                                        {b.status === 'completed' && (
                                                            <button className="btn btn-primary btn-sm" onClick={() => handleFeedbackClick(b)} title="Give Feedback">⭐</button>
                                                        )}
                                                    </div>
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

                <FeedbackModal
                    isOpen={!!feedbackTarget}
                    onClose={() => setFeedbackTarget(null)}
                    targetId={feedbackTarget?.targetId}
                    targetType={feedbackTarget?.targetType}
                    targetName={feedbackTarget?.targetName}
                />
            </div>

            {viewingReport && (
                <DocViewerModal
                    url={viewingReport.url}
                    name={viewingReport.name}
                    onClose={() => setViewingReport(null)}
                />
            )}
        </>
    );
}
