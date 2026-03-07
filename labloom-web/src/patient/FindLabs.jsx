import { useState, useEffect } from 'react';
import api from '../api/client';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import { useToast } from '../components/Toast';

// ── Inline SVG Icons ──
const ShareIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" /><line x1="8.59" y1="13.51" x2="15.42" y2="17.49" /><line x1="15.41" y1="6.51" x2="8.59" y2="10.49" /></svg>
);
const MapPinIcon = () => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>
);
const CalendarIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
);

function handleShare(e, name, type, id) {
    e.stopPropagation();
    const shareData = {
        title: `${name} | Labloom`,
        text: `Check out ${name} on Labloom - Healthcare & Diagnostics`,
        url: `${window.location.origin}/${type}/${id}`,
    };
    if (navigator.share) {
        navigator.share(shareData).catch(() => { });
    } else {
        navigator.clipboard.writeText(`${shareData.title}\n${shareData.url}`);
    }
}

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
                        <h1>Find Labs</h1>
                        <p>Browse diagnostic labs and book tests</p>
                    </div>

                    {bookingTest && (
                        <div className="card mb-24" style={{ borderColor: 'var(--teal)' }}>
                            <div className="card-header">
                                <h3><CalendarIcon /> Book: {bookingTest.name || 'Lab Test'}</h3>
                                <button className="btn btn-secondary btn-sm" onClick={() => setBookingTest(null)}>Cancel</button>
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Date</label>
                                    <input type="date" className="form-input" value={bookDate} onChange={e => setBookDate(e.target.value)} />
                                </div>
                                <div className="form-group">
                                    <label>Price</label>
                                    <div className="form-input" style={{ background: 'transparent' }}>&#8377;{bookingTest.price || 'N/A'}</div>
                                </div>
                            </div>
                            <button className="btn btn-primary" onClick={bookLabTest}>Confirm Booking</button>
                        </div>
                    )}

                    {selectedLab ? (
                        <>
                            <div className="flex-between mb-16">
                                <div>
                                    <h3 className="fw-600">{selectedLab.name} — Tests</h3>
                                    <p className="text-muted text-sm" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                        <MapPinIcon /> {selectedLab.address || selectedLab.city || 'No address'}
                                    </p>
                                </div>
                                <button className="btn btn-secondary btn-sm" onClick={() => { setSelectedLab(null); setTests([]); }}>Go Back</button>
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
                                                    <td>&#8377;{t.price || '—'}</td>
                                                    <td className="text-muted">{t.turnaroundTime || '—'}</td>
                                                    <td><button className="btn btn-primary btn-sm" onClick={() => setBookingTest(t)}>Book</button></td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div className="entity-empty-state">
                                    <div className="entity-empty-icon">
                                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M10 2v7.31" /><path d="M14 9.3V1.99" /><path d="M8.5 2h7" /><path d="M14 9.3a6.5 6.5 0 1 1-4 0" /><path d="M5.52 16h12.96" /></svg>
                                    </div>
                                    <h3>No tests listed</h3>
                                    <p>This lab hasn't added any tests yet.</p>
                                </div>
                            )}
                        </>
                    ) : loading ? (
                        <div className="flex-center" style={{ padding: 60 }}><div className="spinner"></div></div>
                    ) : labs.length > 0 ? (
                        <div className="grid-3" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
                            {labs.map(lab => (
                                <div key={lab._id} className="entity-card" onClick={() => viewTests(lab)}>
                                    {/* Share */}
                                    <button
                                        className="entity-card-share"
                                        onClick={(e) => handleShare(e, lab.name, 'lab', lab._id)}
                                        title="Share this lab"
                                    >
                                        <ShareIcon />
                                    </button>

                                    {/* Header */}
                                    <div className="entity-card-header lab-header">
                                        <div className="entity-card-header-info">
                                            <div className="entity-card-avatar">
                                                {lab.image
                                                    ? <img src={lab.image} alt={lab.name} />
                                                    : (lab.name || 'L')[0].toUpperCase()
                                                }
                                            </div>
                                            <div>
                                                <h3 className="entity-card-name">{lab.name}</h3>
                                                <div className="entity-card-specialty">Diagnostic Center</div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Body */}
                                    <div className="entity-card-body">
                                        <div className="entity-card-chips">
                                            <span className="entity-chip">
                                                <MapPinIcon /> {lab.address || lab.city || 'Location not specified'}
                                            </span>
                                        </div>

                                        <div className="entity-card-footer">
                                            <div className="entity-card-location">Diagnostic tests & profiles</div>
                                            <button className="entity-card-book-btn lab-btn">
                                                View Tests
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="entity-empty-state">
                            <div className="entity-empty-icon">
                                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M10 2v7.31" /><path d="M14 9.3V1.99" /><path d="M8.5 2h7" /><path d="M14 9.3a6.5 6.5 0 1 1-4 0" /><path d="M5.52 16h12.96" /></svg>
                            </div>
                            <h3>No labs available</h3>
                            <p>Labs will appear once they register and are approved</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
