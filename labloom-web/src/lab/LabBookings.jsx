import { useState, useEffect } from 'react';
import api from '../api/client';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import { useToast } from '../components/Toast';

export default function LabBookings() {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('');
    const toast = useToast();

    const fetchBookings = async () => {
        setLoading(true);
        try {
            let url = '/api/lab/bookings';
            if (filter) url += `?status=${filter}`;
            const data = await api.get(url);
            setBookings(data.bookings || []);
        } catch (err) {
            toast.error('Failed to load lab bookings');
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchBookings();
    }, [filter]);

    const updateStatus = async (id, status) => {
        try {
            await api.patch(`/api/lab/bookings/${id}/status`, { status });
            toast.success(`Booking ${status}`);
            fetchBookings();
        } catch (err) {
            toast.error(err.message);
        }
    };

    const handleUploadReport = async (bookingId, e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('report', file);

        try {
            toast.info('Uploading report...');
            const token = localStorage.getItem('labloom_token');
            const response = await fetch(`${api.base}/api/lab/bookings/${bookingId}/upload-report`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
                body: formData
            });

            if (!response.ok) throw new Error('Upload failed');

            toast.success('Report uploaded! Awaiting doctor verification.');
            fetchBookings();
        } catch (err) {
            toast.error(err.message);
        }
    };

    const handleSendEmail = async (id) => {
        try {
            await api.post(`/api/lab/bookings/${id}/send-email`);
            toast.success('Report sent via email!');
        } catch (err) {
            toast.error(err.message || 'Failed to send email');
        }
    };

    return (
        <div className="app-layout">
            <Sidebar />
            <div className="main-content">
                <Topbar title="Test Bookings" />
                <div className="page">
                    <div className="page-header flex-between">
                        <div>
                            <h1>📅 Test Bookings</h1>
                            <p>Track samples and results for all patients</p>
                        </div>
                        <div className="flex gap-8">
                            {['', 'pending', 'confirmed', 'completed'].map(s => (
                                <button key={s} className={`btn ${filter === s ? 'btn-primary' : 'btn-secondary'} btn-sm`} onClick={() => setFilter(s)}>
                                    {s ? s.charAt(0).toUpperCase() + s.slice(1) : 'All'}
                                </button>
                            ))}
                        </div>
                    </div>

                    {loading ? (
                        <div className="flex-center" style={{ padding: 60 }}><div className="spinner"></div></div>
                    ) : bookings.length > 0 ? (
                        <div className="card shadow-sm">
                            <table className="data-table">
                                <thead>
                                    <tr>
                                        <th>Patient</th>
                                        <th>Test</th>
                                        <th>Date/Time</th>
                                        <th>Status</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {bookings.map(b => (
                                        <tr key={b._id}>
                                            <td>
                                                <div className="fw-600">{b.user?.name || 'Patient'}</div>
                                                <div className="text-muted text-sm">{b.user?.phone}</div>
                                            </td>
                                            <td>{b.test?.name}</td>
                                            <td>{new Date(b.date).toLocaleDateString()} {b.time}</td>
                                            <td>
                                                <span className={`badge ${b.status === 'completed' ? 'badge-success' : b.status === 'pending' ? 'badge-warning' : 'badge-info'}`}>
                                                    {b.status}
                                                </span>
                                                {b.labReport?.verifiedByDoctor && <span className="badge badge-success" style={{ marginLeft: 4 }}>✓ Verified</span>}
                                            </td>
                                            <td>
                                                <div className="flex gap-8">
                                                    {b.status === 'pending' && (
                                                        <button className="btn btn-primary btn-sm" onClick={() => updateStatus(b._id, 'confirmed')}>Check-in</button>
                                                    )}
                                                    {b.status === 'confirmed' && (
                                                        <button className="btn btn-success btn-sm" onClick={() => updateStatus(b._id, 'completed')}>Mark Done</button>
                                                    )}
                                                    {b.status === 'completed' && !b.labReport?.reportUrl && (
                                                        <div className="file-upload-btn">
                                                            <input type="file" id={`upload-${b._id}`} hidden onChange={(e) => handleUploadReport(b._id, e)} accept=".pdf,.jpg,.png" />
                                                            <label htmlFor={`upload-${b._id}`} className="btn btn-teal btn-sm" style={{ cursor: 'pointer' }}>📤 Upload Report</label>
                                                        </div>
                                                    )}
                                                    {b.labReport?.reportUrl && (
                                                        <div className="flex gap-8">
                                                            <span className="text-muted text-sm">Report Shared</span>
                                                            <button className="btn btn-secondary btn-sm" onClick={() => handleSendEmail(b._id)}>✉️ Send Email</button>
                                                        </div>
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
                            <h3>No bookings found</h3>
                            <p>Refine your filter or wait for new bookings.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
