import { useState, useEffect } from 'react';
import api from '../api/client';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import { useToast } from '../components/Toast';

export default function PatientList() {
    const [patients, setPatients] = useState([]);
    const [selectedPatient, setSelectedPatient] = useState(null);
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [prescForm, setPrescForm] = useState({ diagnosis: '', medications: '', notes: '' });
    const toast = useToast();

    useEffect(() => {
        api.get('/api/doctor/patients')
            .then(data => {
                const list = data.patients || (Array.isArray(data) ? data : []);
                setPatients(list);
            })
            .catch(() => setPatients([]))
            .finally(() => setLoading(false));
    }, []);

    const viewHistory = async (patient) => {
        setSelectedPatient(patient);
        try {
            const data = await api.get(`/api/doctor/patients/${patient._id}/history`);
            setHistory(Array.isArray(data) ? data : []);
        } catch {
            setHistory([]);
        }
    };

    const prescribe = async (consultationId) => {
        if (!prescForm.diagnosis) return toast.error('Diagnosis is required');
        try {
            await api.post(`/api/doctor/consultations/${consultationId}/prescribe`, prescForm);
            toast.success('Prescription saved');
            setPrescForm({ diagnosis: '', medications: '', notes: '' });
            viewHistory(selectedPatient);
        } catch (err) {
            toast.error(err.message);
        }
    };

    return (
        <div className="app-layout">
            <Sidebar />
            <div className="main-content">
                <Topbar title="My Patients" />
                <div className="page">
                    <div className="page-header">
                        <h1>👥 My Patients</h1>
                        <p>View patient list and medical histories</p>
                    </div>

                    {selectedPatient ? (
                        <>
                            <div className="flex-between mb-16">
                                <div>
                                    <h3 className="fw-600">{selectedPatient.name} — History</h3>
                                    <p className="text-muted text-sm">📱 {selectedPatient.phone || 'N/A'}</p>
                                </div>
                                <button className="btn btn-secondary btn-sm" onClick={() => setSelectedPatient(null)}>← Back</button>
                            </div>

                            {history.length > 0 ? (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                    {history.map((h, i) => (
                                        <div key={i} className="card">
                                            <div className="flex-between mb-16">
                                                <span className="fw-600">{h.date ? new Date(h.date).toLocaleDateString() : 'Visit'}</span>
                                                <span className={`badge ${h.status === 'completed' ? 'badge-success' : 'badge-info'}`}>{h.status}</span>
                                            </div>
                                            {h.prescription ? (
                                                <div style={{ padding: 12, background: 'var(--bg-input)', borderRadius: 'var(--radius)', fontSize: 13 }}>
                                                    <div><strong>Diagnosis:</strong> {h.prescription.diagnosis}</div>
                                                    {h.prescription.medications && <div><strong>Medications:</strong> {h.prescription.medications}</div>}
                                                    {h.prescription.notes && <div className="text-muted mt-16">{h.prescription.notes}</div>}
                                                </div>
                                            ) : h.status === 'completed' ? (
                                                <div>
                                                    <p className="text-muted text-sm mb-16">Write a prescription for this visit:</p>
                                                    <div className="form-group">
                                                        <label>Diagnosis</label>
                                                        <input className="form-input" placeholder="Diagnosis" value={prescForm.diagnosis} onChange={e => setPrescForm(f => ({ ...f, diagnosis: e.target.value }))} />
                                                    </div>
                                                    <div className="form-group">
                                                        <label>Medications</label>
                                                        <input className="form-input" placeholder="Medications" value={prescForm.medications} onChange={e => setPrescForm(f => ({ ...f, medications: e.target.value }))} />
                                                    </div>
                                                    <div className="form-group">
                                                        <label>Notes</label>
                                                        <input className="form-input" placeholder="Notes" value={prescForm.notes} onChange={e => setPrescForm(f => ({ ...f, notes: e.target.value }))} />
                                                    </div>
                                                    <button className="btn btn-primary btn-sm" onClick={() => prescribe(h._id)}>💊 Save Prescription</button>
                                                </div>
                                            ) : null}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="empty-state"><div className="empty-icon">📋</div><h3>No history</h3></div>
                            )}
                        </>
                    ) : loading ? (
                        <div className="flex-center" style={{ padding: 60 }}><div className="spinner"></div></div>
                    ) : patients.length > 0 ? (
                        <div className="card">
                            <table className="data-table">
                                <thead><tr><th>Name</th><th>Phone</th><th>Actions</th></tr></thead>
                                <tbody>
                                    {patients.map(p => (
                                        <tr key={p._id}>
                                            <td className="fw-600">{p.name}</td>
                                            <td className="text-muted">{p.phone || '—'}</td>
                                            <td><button className="btn btn-secondary btn-sm" onClick={() => viewHistory(p)}>📋 View History</button></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="empty-state"><div className="empty-icon">👥</div><h3>No patients yet</h3></div>
                    )}
                </div>
            </div>
        </div>
    );
}
