import { useState, useEffect } from 'react';
import api from '../api/client';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import { useToast } from '../components/Toast';

export default function DoctorManagement() {
    const [doctors, setDoctors] = useState([]);
    const [loading, setLoading] = useState(true);
    const toast = useToast();

    useEffect(() => {
        api.get('/api/hospital/doctors')
            .then(data => setDoctors(Array.isArray(data) ? data : []))
            .catch(() => setDoctors([]))
            .finally(() => setLoading(false));
    }, []);

    return (
        <div className="app-layout">
            <Sidebar />
            <div className="main-content">
                <Topbar title="Doctor Management" />
                <div className="page">
                    <div className="page-header">
                        <h1>🩺 Doctors</h1>
                        <p>Manage doctors associated with your hospital</p>
                    </div>

                    {loading ? (
                        <div className="flex-center" style={{ padding: 60 }}><div className="spinner"></div></div>
                    ) : doctors.length > 0 ? (
                        <div className="card">
                            <table className="data-table">
                                <thead><tr><th>Name</th><th>Specialization</th><th>Phone</th><th>Status</th></tr></thead>
                                <tbody>
                                    {doctors.map(d => (
                                        <tr key={d._id}>
                                            <td className="fw-600">{d.name}</td>
                                            <td>{d.specialization || d.doctorProfile?.specialization || '—'}</td>
                                            <td className="text-muted">{d.phone || '—'}</td>
                                            <td><span className="badge badge-success">Active</span></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="empty-state"><div className="empty-icon">🩺</div><h3>No doctors</h3><p>Add doctors to your hospital</p></div>
                    )}
                </div>
            </div>
        </div>
    );
}
