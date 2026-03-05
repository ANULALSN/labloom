import { useState, useEffect } from 'react';
import api from '../api/client';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import { useToast } from '../components/Toast';
import DocViewerModal from '../components/DocViewerModal';

export default function LabBookings() {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('');
    const [uploadingId, setUploadingId] = useState(null);
    const [viewingReport, setViewingReport] = useState(null);
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

    useEffect(() => { fetchBookings(); }, [filter]);

    const updateStatus = async (id, status) => {
        try {
            await api.patch(`/api/lab/bookings/${id}/status`, { status });
            toast.success(`Booking marked as ${status}`);
            fetchBookings();
        } catch (err) {
            toast.error(err.message);
        }
    };

    const handleUploadReport = async (bookingId, e) => {
        const file = e.target.files[0];
        if (!file) return;
        e.target.value = null;

        const formData = new FormData();
        formData.append('report', file);

        setUploadingId(bookingId);
        try {
            toast.info('Uploading report to cloud...');
            await api.post(`/api/lab/bookings/${bookingId}/upload-report`, formData);
            toast.success('Report uploaded! Patient will be notified. Awaiting doctor verification.');
            fetchBookings();
        } catch (err) {
            toast.error(err.message || 'Upload failed');
        } finally {
            setUploadingId(null);
        }
    };

    const handleSendEmail = async (id) => {
        try {
            await api.post(`/api/lab/bookings/${id}/send-email`);
            toast.success('Report emailed to patient!');
        } catch (err) {
            toast.error(err.message || 'Failed to send email');
        }
    };

    const reportStatus = (labReport) => {
        if (!labReport?.reportUrl) return null;
        if (labReport.verifiedByDoctor) return <span className="badge badge-success" style={{ fontSize: 11 }}>✓ Doctor Verified</span>;
        return <span className="badge badge-warning" style={{ fontSize: 11 }}>⏳ Pending Doctor Review</span>;
    };

    return (
        <>
            <div className="app-layout">
                <Sidebar />
                <div className="main-content">
                    <Topbar title="Test Bookings" />
                    <div className="page">
                        <div className="page-header flex-between">
                            <div>
                                <h1>📅 Test Bookings</h1>
                                <p>Track samples and upload results for all patients</p>
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
                                            <th>Report Status</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {bookings.map(b => (
                                            <tr key={b._id}>
                                                <td>
                                                    <div className="fw-600">{b.user?.name || 'Patient'}</div>
                                                    <div className="text-muted text-sm">{b.user?.phone}</div>
                                                    <div className="text-muted text-sm">{b.user?.email}</div>
                                                </td>
                                                <td>{b.test?.name}</td>
                                                <td>{new Date(b.date).toLocaleDateString()} {b.time}</td>
                                                <td>
                                                    <span className={`badge ${b.status === 'completed' ? 'badge-success' : b.status === 'pending' ? 'badge-warning' : 'badge-info'}`}>
                                                        {b.status}
                                                    </span>
                                                </td>
                                                <td>{reportStatus(b.labReport)}</td>
                                                <td>
                                                    <div className="flex gap-8" style={{ flexWrap: 'wrap' }}>
                                                        {b.status === 'pending' && (
                                                            <button className="btn btn-primary btn-sm" onClick={() => updateStatus(b._id, 'confirmed')}>Check-in</button>
                                                        )}
                                                        {b.status === 'confirmed' && (
                                                            <button className="btn btn-success btn-sm" onClick={() => updateStatus(b._id, 'completed')}>Mark Done</button>
                                                        )}
                                                        {b.status === 'completed' && !b.labReport?.reportUrl && (
                                                            <label className="btn btn-teal btn-sm" style={{ cursor: 'pointer' }}>
                                                                {uploadingId === b._id ? '⏳ Uploading...' : '📤 Upload Report'}
                                                                <input
                                                                    type="file"
                                                                    hidden
                                                                    onChange={(e) => handleUploadReport(b._id, e)}
                                                                    accept=".jpg,.jpeg,.png,.webp"
                                                                    disabled={uploadingId === b._id}
                                                                />
                                                            </label>
                                                        )}
                                                        {b.labReport?.reportUrl && (
                                                            <>
                                                                <button
                                                                    className="btn btn-secondary btn-sm"
                                                                    onClick={() => setViewingReport({ url: b.labReport.reportUrl, name: `${b.user?.name} - ${b.test?.name || 'Report'}` })}
                                                                >
                                                                    👁️ View
                                                                </button>
                                                                <button className="btn btn-secondary btn-sm" onClick={() => handleSendEmail(b._id)}>
                                                                    ✉️ Email
                                                                </button>
                                                            </>
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
