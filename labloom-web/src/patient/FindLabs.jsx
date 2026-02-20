import { useState, useEffect } from 'react';
import api from '../api/client';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import { useToast } from '../components/Toast';

export default function FindLabs() {
    const [labs, setLabs] = useState([]);
    const [tests, setTests] = useState([]);
    const [selectedLab, setSelectedLab] = useState(null);
    const [loading, setLoading] = useState(true);
    const [bookingTest, setBookingTest] = useState(null);
    const [bookDate, setBookDate] = useState('');
    const toast = useToast();

    useEffect(() => {
        api.get('/api/patients/labs')
            .then(data => setLabs(Array.isArray(data) ? data : []))
            .catch(() => setLabs([]))
            .finally(() => setLoading(false));
    }, []);

    const viewTests = async (lab) => {
        setSelectedLab(lab);
        try {
            const data = await api.get(`/api/patients/labs/${lab._id}/tests`);
            // Backend now returns { tests, lab }
            setTests(Array.isArray(data.tests) ? data.tests : (Array.isArray(data) ? data : []));
        } catch {
            setTests([]);
        }
    };

    const bookLabTest = async () => {
        if (!bookDate) return toast.error('Select a date');
        try {
            await api.post('/api/patients/bookings', {
                bookingType: 'test',
                testId: bookingTest._id || bookingTest.testId,
                labId: selectedLab._id,
                date: bookDate,
                amount: bookingTest.price || 500,
            });
            toast.success('Lab test booked!');
            setBookingTest(null);
        } catch (err) {
            toast.error(err.message);
        }
    };

    return (
        <div className="app-layout">
            <Sidebar />
            <div className="main-content">
                <Topbar title="Find Labs" />
                <div className="page">
                    <div className="page-header">
                        <h1>🧪 Find Labs</h1>
                        <p>Browse diagnostic labs and book tests</p>
                    </div>

                    {bookingTest && (
                        <div className="card mb-24" style={{ borderColor: 'var(--teal)' }}>
                            <div className="card-header">
                                <h3>📅 Book: {bookingTest.name || 'Lab Test'}</h3>
                                <button className="btn btn-secondary btn-sm" onClick={() => setBookingTest(null)}>✕</button>
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Date</label>
                                    <input type="date" className="form-input" value={bookDate} onChange={e => setBookDate(e.target.value)} />
                                </div>
                                <div className="form-group">
                                    <label>Price</label>
                                    <div className="form-input" style={{ background: 'transparent' }}>₹{bookingTest.price || 'N/A'}</div>
                                </div>
                            </div>
                            <button className="btn btn-primary" onClick={bookLabTest}>✅ Book Test</button>
                        </div>
                    )}

                    {selectedLab ? (
                        <>
                            <div className="flex-between mb-16">
                                <div>
                                    <h3 className="fw-600">{selectedLab.name} — Tests</h3>
                                    <p className="text-muted text-sm">{selectedLab.address || 'No address'}</p>
                                </div>
                                <button className="btn btn-secondary btn-sm" onClick={() => { setSelectedLab(null); setTests([]); }}>← Back to Labs</button>
                            </div>
                            {tests.length > 0 ? (
                                <div className="card">
                                    <table className="data-table">
                                        <thead>
                                            <tr><th>Test Name</th><th>Price</th><th>Turnaround</th><th></th></tr>
                                        </thead>
                                        <tbody>
                                            {tests.map((t, i) => (
                                                <tr key={i}>
                                                    <td className="fw-600">{t.name || t.testId?.name || 'Test'}</td>
                                                    <td>₹{t.price || '—'}</td>
                                                    <td className="text-muted">{t.turnaroundTime || '—'}</td>
                                                    <td><button className="btn btn-primary btn-sm" onClick={() => setBookingTest(t)}>Book</button></td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div className="empty-state"><div className="empty-icon">🧪</div><h3>No tests listed</h3></div>
                            )}
                        </>
                    ) : loading ? (
                        <div className="flex-center" style={{ padding: 60 }}><div className="spinner"></div></div>
                    ) : labs.length > 0 ? (
                        <div className="grid-3" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}>
                            {labs.map(lab => (
                                <div key={lab._id} className="card" style={{ cursor: 'pointer' }} onClick={() => viewTests(lab)}>
                                    <div className="fw-600 mb-16">{lab.name}</div>
                                    <div className="text-muted text-sm">📍 {lab.address || lab.city || 'N/A'}</div>
                                    <div className="mt-16"><span className="badge badge-info">View Tests →</span></div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="empty-state"><div className="empty-icon">🧪</div><h3>No labs available</h3></div>
                    )}
                </div>
            </div>
        </div>
    );
}
