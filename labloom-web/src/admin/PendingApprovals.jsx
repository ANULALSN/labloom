import { useState, useEffect } from 'react';
import api from '../api/client';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import { useToast } from '../components/Toast';
import DocViewerModal from '../components/DocViewerModal';

export default function PendingApprovals() {
    const [tab, setTab] = useState('doctors');
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [viewingDoc, setViewingDoc] = useState(null);
    const toast = useToast();

    const endpoints = {
        doctors: { list: '/api/admin/pending-doctors', approve: '/api/admin/approve-doctor' },
        hospitals: { list: '/api/admin/pending-hospitals', approve: '/api/admin/approve-hospital' },
        labs: { list: '/api/admin/pending-labs', approve: '/api/admin/approve-lab' },
    };

    const fetchItems = async () => {
        setLoading(true);
        try {
            const data = await api.get(endpoints[tab].list);
            setItems(Array.isArray(data) ? data : []);
        } catch {
            setItems([]);
        }
        setLoading(false);
    };

    useEffect(() => { fetchItems(); }, [tab]);

    const approve = async (id) => {
        try {
            await api.post(`${endpoints[tab].approve}/${id}`, {});
            toast.success(`${tab.slice(0, -1)} approved successfully!`);
            fetchItems();
        } catch (err) {
            toast.error(err.message);
        }
    };

    return (
        <>
            <div className="app-layout">
                <Sidebar />
                <div className="main-content">
                    <Topbar title="Pending Approvals" />
                    <div className="page">
                        <div className="page-header">
                            <h1>⏳ Pending Approvals</h1>
                            <p>Review and approve new registrations</p>
                        </div>

                        <div className="flex gap-8 mb-24">
                            {['doctors', 'hospitals', 'labs'].map(t => (
                                <button
                                    key={t}
                                    className={`btn ${tab === t ? 'btn-primary' : 'btn-secondary'} btn-sm`}
                                    onClick={() => setTab(t)}
                                >
                                    {t === 'doctors' ? '🩺' : t === 'hospitals' ? '🏥' : '🧪'} {t.charAt(0).toUpperCase() + t.slice(1)}
                                </button>
                            ))}
                        </div>

                        <div className="card">
                            {loading ? (
                                <div className="flex-center" style={{ padding: 40 }}><div className="spinner"></div></div>
                            ) : items.length > 0 ? (
                                <table className="data-table">
                                    <thead>
                                        <tr>
                                            <th>Name</th>
                                            <th>Phone</th>
                                            <th>Email</th>
                                            <th>Documents</th>
                                            <th>Registered</th>
                                            <th>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {items.map(item => (
                                            <tr key={item._id}>
                                                <td className="fw-600">{item.name}</td>
                                                <td>{item.phone || '—'}</td>
                                                <td className="text-muted">{item.email || '—'}</td>
                                                <td style={{ maxWidth: 200 }}>
                                                    {(() => {
                                                        const docs = tab === 'doctors'
                                                            ? item.doctorProfile?.verificationDocuments
                                                            : item.verificationDocuments;

                                                        if (!docs || docs.length === 0) return <span className="text-muted text-sm">None uploaded</span>;

                                                        return (
                                                            <div className="flex gap-4" style={{ flexWrap: 'wrap' }}>
                                                                {docs.map((d, i) => (
                                                                    <button
                                                                        key={i}
                                                                        onClick={() => setViewingDoc({ url: d.url, name: d.name })}
                                                                        className="badge badge-info"
                                                                        style={{ border: 'none', cursor: 'pointer', fontSize: 10 }}
                                                                    >
                                                                        {d.name || `Doc ${i + 1}`}
                                                                    </button>
                                                                ))}
                                                            </div>
                                                        );
                                                    })()}
                                                </td>
                                                <td className="text-muted">{item.createdAt ? new Date(item.createdAt).toLocaleDateString() : '—'}</td>
                                                <td>
                                                    <button className="btn btn-success btn-sm" onClick={() => approve(item._id)}>
                                                        ✅ Approve
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            ) : (
                                <div className="empty-state">
                                    <div className="empty-icon">✅</div>
                                    <h3>All caught up!</h3>
                                    <p>No pending {tab} to approve</p>
                                </div>
                            )}
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
