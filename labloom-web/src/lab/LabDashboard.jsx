import { useState, useEffect } from 'react';
import api from '../api/client';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import { useToast } from '../components/Toast';

export default function LabDashboard() {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ total: 0, pending: 0, completed: 0 });
    const toast = useToast();

    const fetchBookings = async () => {
        setLoading(true);
        try {
            const data = await api.get('/api/lab/bookings');
            const list = data.bookings || [];
            setBookings(list);

            // Calculate stats
            setStats({
                total: list.length,
                pending: list.filter(b => b.status === 'pending').length,
                completed: list.filter(b => b.status === 'completed').length
            });
        } catch (err) {
            toast.error('Failed to load lab bookings');
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchBookings();
    }, []);

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
            // We need a custom request for multipart/form-data or use axios
            // For now, let's assume api.post can handle it if we fix it, 
            // but usually we need to set headers
            toast.info('Uploading report...');

            // Re-using the logic from other places or creating a specialized upload
            const token = localStorage.getItem('labloom_token');
            const response = await fetch(`${api.base}/api/lab/bookings/${bookingId}/upload-report`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            if (!response.ok) throw new Error('Upload failed');

            toast.success('Report uploaded! Awaiting doctor verification.');
            fetchBookings();
        } catch (err) {
            toast.error(err.message);
        }
    };

    return (
        <div className="app-layout">
            <Sidebar />
            <div className="main-content">
                <Topbar title="Laboratory Dashboard" />
                <div className="page">
                    <div className="page-header">
                        <h1>🧪 Laboratory Dashboard</h1>
                        <p>Manage test bookings and upload patient reports</p>
                    </div>

                    <div className="stats-grid mb-24">
                        <div className="card stat-card">
                            <div className="stat-label">Total Bookings</div>
                            <div className="stat-value">{stats.total}</div>
                        </div>
                        <div className="card stat-card">
                            <div className="stat-label">Pending Samples</div>
                            <div className="stat-value" style={{ color: 'var(--orange)' }}>{stats.pending}</div>
                        </div>
                        <div className="card stat-card">
                            <div className="stat-label">Completed Tests</div>
                            <div className="stat-value" style={{ color: 'var(--teal)' }}>{stats.completed}</div>
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
                                                        <span className="text-muted text-sm">Report Shared</span>
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
                            <div className="empty-icon">🧪</div>
                            <h3>No bookings yet</h3>
                            <p>Customer test bookings will appear here.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
