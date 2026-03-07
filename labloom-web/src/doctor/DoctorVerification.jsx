import { useState, useEffect } from 'react';
import api from '../api/client';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import { useToast } from '../components/Toast';
import DocViewerModal from '../components/DocViewerModal';

export default function DoctorVerification() {
    const [profile, setProfile] = useState(null);
    const [uploadingDoc, setUploadingDoc] = useState(false);
    const [deletingDocId, setDeletingDocId] = useState(null);
    const [viewingDoc, setViewingDoc] = useState(null); // { url, name }
    const [loading, setLoading] = useState(true);
    const toast = useToast();

    const fetchProfile = async () => {
        try {
            const data = await api.get('/api/doctor/availability');
            setProfile(data);
        } catch (err) {
            toast.error(err.message || 'Failed to load profile');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProfile();
    }, []);

    const handleDocumentUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('document', file);

        setUploadingDoc(true);
        try {
            await api.post('/api/upload/doctor-document', formData);
            toast.success('Document uploaded! Awaiting admin review.');
            fetchProfile();
        } catch (err) {
            toast.error(err.message || 'Upload failed');
        } finally {
            setUploadingDoc(false);
            e.target.value = null;
        }
    };

    const handleDeleteDocument = async (docId, docName) => {
        if (!window.confirm(`Delete "${docName || 'this document'}"? This cannot be undone.`)) return;
        setDeletingDocId(docId);
        try {
            await api.delete(`/api/upload/doctor-document/${docId}`);
            toast.success('Document deleted.');
            fetchProfile();
        } catch (err) {
            toast.error(err.message || 'Delete failed');
        } finally {
            setDeletingDocId(null);
        }
    };

    const statusConfig = {
        pending: { color: '#f59e0b', bg: '#fef3c7', label: 'Pending Review', icon: '⏳', desc: 'Your documents are waiting for admin review. This usually takes 1-2 business days.' },
        approved: { color: '#10b981', bg: '#d1fae5', label: 'Approved & Verified', icon: '✅', desc: 'Your account is fully verified. Patients can now see your profile and book appointments.' },
        rejected: { color: '#ef4444', bg: '#fee2e2', label: 'Rejected', icon: '❌', desc: 'Your verification was rejected. Please upload correct documents and contact admin.' },
        suspended: { color: '#6b7280', bg: '#f3f4f6', label: 'Suspended', icon: '🚫', desc: 'Your account has been suspended. Please contact admin.' },
    };

    const status = profile?.verificationStatus || 'pending';
    const cfg = statusConfig[status] || statusConfig.pending;

    if (loading) return (
        <div className="app-layout">
            <Sidebar />
            <div className="main-content">
                <Topbar title="Verification" />
                <div className="flex-center" style={{ height: '80vh' }}><div className="spinner"></div></div>
            </div>
        </div>
    );

    return (
        <>
            <div className="app-layout">
                <Sidebar />
                <div className="main-content">
                    <Topbar title="Account Verification" />
                    <div className="page">
                        <div className="page-header">
                            <h1>🏥 Doctor Verification</h1>
                            <p>Upload your credentials for admin approval to go live on the platform</p>
                        </div>

                        {/* Status Banner */}
                        <div className="card mb-24" style={{ backgroundColor: cfg.bg, border: `2px solid ${cfg.color}` }}>
                            <div className="flex gap-16" style={{ alignItems: 'center' }}>
                                <div style={{ fontSize: 40 }}>{cfg.icon}</div>
                                <div style={{ flex: 1 }}>
                                    <h3 style={{ margin: 0, color: cfg.color }}>{cfg.label}</h3>
                                    <p style={{ margin: '4px 0 0 0', color: '#374151' }}>{cfg.desc}</p>
                                </div>
                                <span className="badge" style={{ backgroundColor: cfg.color, color: '#fff', fontSize: 13 }}>
                                    {status.toUpperCase()}
                                </span>
                            </div>
                        </div>

                        {/* Steps */}
                        <div className="grid-2 mb-24">
                            <div className="card" style={{ borderLeft: '4px solid var(--primary)' }}>
                                <h3 style={{ marginTop: 0 }}>📋 Step 1 — Upload Documents</h3>
                                <p className="text-muted text-sm">
                                    Upload your Medical Registration Certificate (MRC) or Medical Council License.
                                    Accepted formats: JPG, PNG, WebP, PDF.
                                </p>
                                <ul style={{ color: '#6b7280', fontSize: 13, paddingLeft: 18 }}>
                                    <li>Medical Registration Certificate</li>
                                    <li>Degree Certificates (MBBS, MD, etc.)</li>
                                    <li>Government ID Proof</li>
                                </ul>
                            </div>
                            <div className="card" style={{ borderLeft: '4px solid var(--success)' }}>
                                <h3 style={{ marginTop: 0 }}>✅ Step 2 — Admin Reviews</h3>
                                <p className="text-muted text-sm">
                                    Once uploaded, an admin will review your documents and approve your account.
                                    You'll be able to receive patient bookings immediately after approval.
                                </p>
                            </div>
                        </div>

                        {/* Documents Upload */}
                        <div className="card mb-24">
                            <div className="card-header flex-between mb-16">
                                <h3 style={{ margin: 0 }}>Uploaded Documents</h3>
                                <label
                                    className="btn btn-primary btn-sm"
                                    style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6, margin: 0 }}
                                >
                                    {uploadingDoc ? (
                                        <><div className="spinner" style={{ width: 16, height: 16 }}></div> Uploading...</>
                                    ) : (
                                        <>📤 Upload Document</>
                                    )}
                                    <input
                                        type="file"
                                        hidden
                                        accept=".jpg,.jpeg,.png,.webp,.pdf"
                                        onChange={handleDocumentUpload}
                                        disabled={uploadingDoc}
                                    />
                                </label>
                            </div>

                            {profile?.verificationDocuments?.length > 0 ? (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                    {profile.verificationDocuments.map((doc, idx) => (
                                        <div key={doc._id || idx} className="flex-between p-12" style={{
                                            border: '1px solid var(--border)',
                                            borderRadius: 8,
                                            backgroundColor: 'var(--bg-secondary)'
                                        }}>
                                            <div className="flex gap-12" style={{ alignItems: 'center' }}>
                                                <span style={{ fontSize: 24 }}>📄</span>
                                                <div>
                                                    <div className="fw-600">{doc.name || `Document ${idx + 1}`}</div>
                                                    {doc.uploadedAt && (
                                                        <div className="text-muted text-sm">
                                                            Uploaded {new Date(doc.uploadedAt).toLocaleDateString()}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex gap-8">
                                                <button
                                                    className="btn btn-secondary btn-sm"
                                                    onClick={() => setViewingDoc({ url: doc.url, name: doc.name })}
                                                >
                                                    View →
                                                </button>
                                                <button
                                                    className="btn btn-danger btn-sm"
                                                    onClick={() => handleDeleteDocument(doc._id, doc.name)}
                                                    disabled={deletingDocId === doc._id}
                                                    style={{ padding: '6px 12px' }}
                                                >
                                                    {deletingDocId === doc._id ? '...' : '🗑️'}
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="empty-state" style={{ padding: '40px 20px' }}>
                                    <div className="empty-icon">📂</div>
                                    <h3>No Documents Uploaded</h3>
                                    <p>Upload your medical credentials to get verified.</p>
                                    <label className="btn btn-primary" style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                                        📤 Upload First Document
                                        <input
                                            type="file"
                                            hidden
                                            accept=".jpg,.jpeg,.png,.webp,.pdf"
                                            onChange={handleDocumentUpload}
                                            disabled={uploadingDoc}
                                        />
                                    </label>
                                </div>
                            )}
                        </div>

                        {status !== 'approved' && (
                            <div className="card" style={{ background: '#fffbeb', border: '1px solid #f59e0b' }}>
                                <p style={{ margin: 0, fontSize: 14, color: '#92400e' }}>
                                    ⚠️ <strong>Important:</strong> Until your account is approved, your profile will not be visible to patients and you cannot receive bookings. Please ensure all documents are clear and valid.
                                </p>
                            </div>
                        )}
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
