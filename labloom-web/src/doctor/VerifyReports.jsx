import { useState, useEffect } from 'react';
import api from '../api/client';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import { useToast } from '../components/Toast';

export default function VerifyReports() {
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
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

    useEffect(() => {
        fetchReports();
    }, []);

    const handleVerify = async (reportId) => {
        try {
            await api.post(`/api/doctor/verify-report/${reportId}`);
            toast.success('Report verified and released to patient');
            fetchReports();
        } catch (err) {
            toast.error(err.message || 'Verification failed');
        }
    };

    return (
        <div className="app-layout">
            <Sidebar />
            <div className="main-content">
                <Topbar title="Verify reports" />
                <div className="page">
                    <div className="page-header">
                        <h1>📄 Verify Lab Reports</h1>
                        <p>Review and approve diagnostic reports before they are sent to patients</p>
                    </div>

                    {loading ? (
                        <div className="flex-center" style={{ padding: 60 }}><div className="spinner"></div></div>
                    ) : reports.length > 0 ? (
                        <div className="card shadow-sm">
                            <table className="data-table">
                                <thead>
                                    <tr>
                                        <th>Patient</th>
                                        <th>Test Name</th>
                                        <th>Lab</th>
                                        <th>Date</th>
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
                                            <td>{r.lab?.name || 'Diagnostic Lab'}</td>
                                            <td>{new Date(r.updatedAt).toLocaleDateString()}</td>
                                            <td>
                                                <div className="flex gap-8">
                                                    <a href={`${api.base}${r.labReport?.reportUrl}`} target="_blank" rel="noreferrer" className="btn btn-secondary btn-sm">👁️ View PDF</a>
                                                    <button className="btn btn-success btn-sm" onClick={() => handleVerify(r._id)}>✅ Verify & Release</button>
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
                            <p>All laboratory reports are currently up to date.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
