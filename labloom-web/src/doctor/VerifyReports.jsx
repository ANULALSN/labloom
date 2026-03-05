import { useState, useEffect } from 'react';
import api from '../api/client';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import { useToast } from '../components/Toast';
import DocViewerModal from '../components/DocViewerModal';

export default function VerifyReports() {
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [viewingDoc, setViewingDoc] = useState(null);
    const [verifyingId, setVerifyingId] = useState(null);
    const toast = useToast();

    const fetchReports = async () => {
        setLoading(true);
        try {
            const data = await api.get('/api/doctor/pending-reports');
            setReports(Array.isArray(data) ? data : []);
        } catch (err) {
            toast.error('Failed to load pending reports');
            setReports([]);
        }
        setLoading(false);
    };

    useEffect(() => { fetchReports(); }, []);

    const handleVerify = async (reportId) => {
        setVerifyingId(reportId);
        try {
            await api.post(`/api/doctor/verify-report/${reportId}`);
            toast.success('✅ Report verified and sent to patient!');
            fetchReports();
        } catch (err) {
            toast.error(err.message || 'Verification failed');
        } finally {
            setVerifyingId(null);
        }
    };

    return (
        <>
            <div className="app-layout">
                <Sidebar />
                <div className="main-content">
                    <Topbar title="Verify Reports" />
                    <div className="page">
                        <div className="page-header">
                            <h1>📄 Verify Lab Reports</h1>
                            <p>Review and verify diagnostic reports before they are released to patients</p>
                        </div>

                        {loading ? (
                            <div className="flex-center" style={{ padding: 60 }}><div className="spinner"></div></div>
                        ) : reports.length > 0 ? (
                            <div className="card shadow-sm">
                                <table className="data-table">
                                    <thead>
                                        <tr>
                                            <th>Patient</th>
                                            <th>Test</th>
                                            <th>Lab</th>
                                            <th>Uploaded</th>
                                            <th>Your Connection</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {reports.map(r => (
                                            <tr key={r._id}>
                                                <td>
                                                    <div className="fw-600">{r.user?.name || 'Patient'}</div>
                                                    <div className="text-muted text-sm">{r.user?.phone}</div>
                                                </td>
                                                <td>{r.test?.name || 'Lab Test'}</td>
                                                <td>{r.lab?.name || '—'}</td>
                                                <td>{r.labReport?.resultDate ? new Date(r.labReport.resultDate).toLocaleDateString() : new Date(r.updatedAt).toLocaleDateString()}</td>
                                                <td>
                                                    <div style={{ fontSize: 12 }}>
                                                        {r.labReport?.referringDoctor
                                                            ? <span className="badge badge-success" style={{ fontSize: 10 }}>Referred to you</span>
                                                            : <span className="badge badge-info" style={{ fontSize: 10 }}>Your patient</span>
                                                        }
                                                        <div className="text-muted" style={{ fontSize: 11, marginTop: 2 }}>
                                                            {r.user?.phone}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td>
                                                    <div className="flex gap-8">
                                                        <button
                                                            className="btn btn-secondary btn-sm"
                                                            onClick={() => setViewingDoc({ url: r.labReport?.reportUrl, name: `${r.user?.name} - ${r.test?.name || 'Report'}` })}
                                                        >
                                                            👁️ View Report
                                                        </button>
                                                        <button
                                                            className="btn btn-success btn-sm"
                                                            onClick={() => handleVerify(r._id)}
                                                            disabled={verifyingId === r._id}
                                                        >
                                                            {verifyingId === r._id ? '...' : '✅ Verify & Release'}
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="empty-state">
                                <div className="empty-icon">📄</div>
                                <h3>No pending reports</h3>
                                <p>All lab reports have been verified. Check back when the lab uploads new results.</p>
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
