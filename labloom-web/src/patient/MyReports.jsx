import { useState, useEffect } from 'react';
import api from '../api/client';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import DocViewerModal from '../components/DocViewerModal';

export default function MyReports() {
    const [reports, setReports] = useState([]);
    const [prescriptions, setPrescriptions] = useState([]);
    const [tab, setTab] = useState('reports');
    const [loading, setLoading] = useState(true);
    const [viewDoc, setViewDoc] = useState(null);

    useEffect(() => {
        Promise.all([
            api.get('/api/patients/reports').catch(() => []),
            api.get('/api/patients/prescriptions').catch(() => []),
        ]).then(([r, p]) => {
            setReports(Array.isArray(r) ? r : []);
            setPrescriptions(Array.isArray(p) ? p : []);
        }).finally(() => setLoading(false));
    }, []);

    const items = tab === 'reports' ? reports : prescriptions;

    return (
        <div className="app-layout">
            <Sidebar />
            <div className="main-content">
                <Topbar title="My Reports" />
                <div className="page">
                    <div className="page-header">
                        <h1>📄 Medical Records</h1>
                        <p>View your lab reports and prescriptions</p>
                    </div>

                    <div className="flex gap-8 mb-24">
                        <button className={`btn ${tab === 'reports' ? 'btn-primary' : 'btn-secondary'} btn-sm`} onClick={() => setTab('reports')}>📄 Lab Reports</button>
                        <button className={`btn ${tab === 'prescriptions' ? 'btn-primary' : 'btn-secondary'} btn-sm`} onClick={() => setTab('prescriptions')}>💊 Prescriptions</button>
                    </div>

                    {loading ? (
                        <div className="flex-center" style={{ padding: 60 }}><div className="spinner"></div></div>
                    ) : items.length > 0 ? (
                        <div className="card">
                            <table className="data-table">
                                <thead>
                                    <tr>
                                        <th>Date</th>
                                        <th>Details</th>
                                        <th>Status</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {items.map((item, i) => (
                                        <tr key={i}>
                                            <td>{new Date(item.date).toLocaleDateString()}</td>
                                            <td className="fw-600">
                                                {tab === 'reports' ? item.title : `${item.medication} ${item.dosage ? `(${item.dosage})` : ''}`}
                                            </td>
                                            <td><span className={`badge ${item.status === 'Bad' ? 'badge-danger' : 'badge-success'}`}>{item.status || 'Available'}</span></td>
                                            <td>
                                                {(item.reportUrl || item.prescriptionPdfUrl) ? (
                                                    <button
                                                        className="btn btn-primary btn-sm"
                                                        onClick={() => setViewDoc({ url: item.reportUrl || item.prescriptionPdfUrl, name: item.title || item.medication })}
                                                    >
                                                        👁️ View Document
                                                    </button>
                                                ) : (
                                                    <span className="text-muted text-sm">— No File —</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="empty-state">
                            <div className="empty-icon">{tab === 'reports' ? '📄' : '💊'}</div>
                            <h3>No {tab} yet</h3>
                            <p>{tab === 'reports' ? 'Lab reports will appear after test completion' : 'Prescriptions from doctor visits will appear here'}</p>
                        </div>
                    )}
                </div>
            </div>

            {viewDoc && (
                <DocViewerModal
                    url={viewDoc.url}
                    name={viewDoc.name}
                    onClose={() => setViewDoc(null)}
                />
            )}
        </div>
    );
}
