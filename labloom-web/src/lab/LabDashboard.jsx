import { useState, useEffect } from 'react';
import api from '../api/client';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import { useToast } from '../components/Toast';
import DocViewerModal from '../components/DocViewerModal';

export default function LabDashboard() {
    const [stats, setStats] = useState({ total: 0, pending: 0, completed: 0, revenue: 0 });
    const [recentBookings, setRecentBookings] = useState([]);
    const [profile, setProfile] = useState(null);
    const [uploadingDoc, setUploadingDoc] = useState(false);
    const [deletingDocId, setDeletingDocId] = useState(null);
    const [viewingDoc, setViewingDoc] = useState(null);
    const [loading, setLoading] = useState(true);
    const toast = useToast();

    const fetchDashboardData = async () => {
        setLoading(true);
        try {
            const data = await api.get('/api/lab/bookings');
            const list = data.bookings || [];

            setRecentBookings(list.slice(0, 5));
            setStats({
                total: list.length,
                pending: list.filter(b => b.status === 'pending').length,
                completed: list.filter(b => b.status === 'completed').length,
                revenue: list.filter(b => b.status === 'completed').reduce((sum, b) => sum + (b.amount || 0), 0)
            });

            // Fetch lab profile
            const profileData = await api.get('/api/lab/settings');
            setProfile(profileData);
        } catch (err) {
            toast.error('Failed to load dashboard data');
        }
        setLoading(false);
    };

    const handleDocumentUpload = async (e) => {
        const file = e.target.files[0];
        if (!file || !profile) return;

        const formData = new FormData();
        formData.append('document', file);

        setUploadingDoc(true);
        try {
            await api.post(`/api/upload/lab-document/${profile._id}`, formData);
            toast.success('Document uploaded successfully!');
            fetchDashboardData(); // Refresh documents and status
        } catch (err) {
            toast.error(err.message || 'Error uploading document');
        } finally {
            setUploadingDoc(false);
            e.target.value = null; // reset file input
        }
    };

    const handleDeleteDocument = async (docId, docName) => {
        if (!window.confirm(`Delete "${docName || 'this document'}"? This cannot be undone.`)) return;
        setDeletingDocId(docId);
        try {
            await api.delete(`/api/upload/lab-document/${profile._id}/${docId}`);
            toast.success('Document deleted.');
            fetchDashboardData();
        } catch (err) {
            toast.error(err.message || 'Delete failed');
        } finally {
            setDeletingDocId(null);
        }
    };


    useEffect(() => {
        fetchDashboardData();
    }, []);

    return (
        <>
            <div className="app-layout">
                <Sidebar />
                <div className="main-content">
                    <Topbar title="Laboratory Overview" />
                    <div className="page">
                        <div className="page-header">
                            <h1>📊 Lab Performance</h1>
                            <p>Real-time analytics and recent test activities</p>
                        </div>

                        {profile && profile.verificationStatus !== 'approved' && (
                            <div className="card mb-24" style={{ backgroundColor: 'var(--warning)', color: '#000', border: 'none' }}>
                                <div className="flex gap-16" style={{ alignItems: 'center' }}>
                                    <div style={{ fontSize: 24 }}>⚠️</div>
                                    <div style={{ flex: 1 }}>
                                        <h3 style={{ margin: 0, color: '#000' }}>Action Required: Lab Verification Pending</h3>
                                        <p style={{ margin: '4px 0 0 0', opacity: 0.8 }}>Your laboratory is currently {profile.verificationStatus}. Patients cannot see your lab on the platform until you upload your registration certificates below and are approved by the admin.</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Verification Documents Upload Section */}
                        {profile && (
                            <div className="card mb-24" style={{ border: `1px solid ${profile.verificationStatus === 'approved' ? 'var(--success)' : 'var(--warning)'}` }}>
                                <div className="card-header flex-between mb-16">
                                    <h3>Verification Documents</h3>
                                    <span className={`badge ${profile.verificationStatus === 'approved' ? 'badge-success' : 'badge-warning'}`}>
                                        {(profile.verificationStatus || 'pending').toUpperCase()}
                                    </span>
                                </div>
                                <p className="text-muted text-sm mb-16">
                                    Upload your lab registration certificates, licenses, or accreditations for admin verification.
                                </p>

                                <div className="flex gap-16" style={{ flexWrap: 'wrap', marginBottom: 16 }}>
                                    {(profile.verificationDocuments || []).map((doc, idx) => (
                                        <div key={doc._id || idx} className="flex gap-8" style={{ alignItems: 'center', border: '1px solid var(--border)', borderRadius: 8, padding: '8px 12px', backgroundColor: 'var(--bg-secondary)' }}>
                                            <button
                                                className="btn btn-secondary btn-sm"
                                                onClick={() => setViewingDoc({ url: doc.url, name: doc.name })}
                                                style={{ fontSize: 13, fontWeight: 600 }}
                                            >
                                                📄 {doc.name || `Document ${idx + 1}`} →
                                            </button>
                                            <button
                                                className="btn btn-danger btn-sm"
                                                onClick={() => handleDeleteDocument(doc._id, doc.name)}
                                                disabled={deletingDocId === doc._id}
                                                style={{ padding: '4px 8px', fontSize: 12 }}
                                                title="Delete document"
                                            >
                                                {deletingDocId === doc._id ? '...' : '🗑️'}
                                            </button>
                                        </div>
                                    ))}
                                </div>

                                <label className="btn btn-secondary btn-sm" style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', width: 'auto' }}>
                                    {uploadingDoc ? 'Uploading...' : '📁 Upload New Document'}
                                    <input
                                        type="file"
                                        hidden
                                        accept=".jpg,.jpeg,.png,.webp"
                                        onChange={handleDocumentUpload}
                                        disabled={uploadingDoc}
                                    />
                                </label>
                            </div>
                        )}

                        <div className="stats-grid mb-24">
                            <div className="stat-card">
                                <div className="stat-icon">📅</div>
                                <div className="stat-label">Total Bookings</div>
                                <div className="stat-value">{stats.total}</div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-icon" style={{ color: 'var(--orange)' }}>⏳</div>
                                <div className="stat-label">Pending Samples</div>
                                <div className="stat-value">{stats.pending}</div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-icon" style={{ color: 'var(--teal)' }}>✅</div>
                                <div className="stat-label">Completed Tests</div>
                                <div className="stat-value">{stats.completed}</div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-icon" style={{ color: 'var(--blue)' }}>💰</div>
                                <div className="stat-label">Total Revenue</div>
                                <div className="stat-value">₹{stats.revenue}</div>
                            </div>
                        </div>

                        <div className="grid-2">
                            <div className="card">
                                <div className="card-header flex-between">
                                    <h3>📋 Recent Bookings</h3>
                                    <a href="/lab/bookings" className="btn btn-secondary btn-sm">View All</a>
                                </div>
                                {recentBookings.length > 0 ? (
                                    <div className="flex flex-column gap-12">
                                        {recentBookings.map(b => (
                                            <div key={b._id} className="flex-between p-12 border-bottom">
                                                <div>
                                                    <div className="fw-600">{b.test?.name}</div>
                                                    <div className="text-muted text-sm">{b.user?.name} • {new Date(b.date).toLocaleDateString()}</div>
                                                </div>
                                                <span className={`badge ${b.status === 'completed' ? 'badge-success' : 'badge-warning'}`}>{b.status}</span>
                                            </div>
                                        ))}
                                    </div>
                                ) : <p className="text-muted text-sm">No recent bookings</p>}
                            </div>

                            <div className="card">
                                <div className="card-header"><h3>⚡ Quick Actions</h3></div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                    <a href="/lab/tests" className="btn btn-secondary" style={{ justifyContent: 'center' }}>🧪 Manage Test Catalog</a>
                                    <a href="/lab/reviews" className="btn btn-secondary" style={{ justifyContent: 'center' }}>⭐ View Customer Reviews</a>
                                    <a href="/lab/bookings" className="btn btn-primary" style={{ justifyContent: 'center' }}>📅 Update Booking Status</a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {viewingDoc && (
                <DocViewerModal
                    url={viewingDoc.url}
                    name={viewingDoc.name}
                    onClose={() => setViewingDoc(null)}
                />
            )}
        </>
    );
}
