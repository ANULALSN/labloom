import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/client';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import { useToast } from '../components/Toast';

// ── Inline SVG Icons (no external dependencies) ──
const ShareIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" /><line x1="8.59" y1="13.51" x2="15.42" y2="17.49" /><line x1="15.41" y1="6.51" x2="8.59" y2="10.49" /></svg>
);
const MapPinIcon = () => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>
);
const BriefcaseIcon = () => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2" /><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" /></svg>
);
const StarIcon = ({ filled }) => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill={filled ? '#f59e0b' : 'none'} stroke={filled ? '#f59e0b' : '#e5e7eb'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>
);
const CalendarIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
);

function RatingStars({ rating = 0, count = 0 }) {
    const stars = [];
    const rounded = Math.round(rating);
    for (let i = 1; i <= 5; i++) {
        stars.push(<StarIcon key={i} filled={i <= rounded} />);
    }
    return (
        <div className="entity-card-rating">
            {stars}
            {count > 0 && <span className="rating-count">({count})</span>}
        </div>
    );
}

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

export default function FindDoctors() {
    const [doctors, setDoctors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedDoctor, setSelectedDoctor] = useState(null);
    const [bookingForm, setBookingForm] = useState({ date: '', time: '', appointmentMode: 'In-person', amount: 500 });
    const [booking, setBooking] = useState(false);
    const toast = useToast();
    const navigate = useNavigate();

    const [slots, setSlots] = useState([]);
    const [fetchingSlots, setFetchingSlots] = useState(false);

    useEffect(() => {
        api.get('/api/patients/doctors')
            .then(data => setDoctors(Array.isArray(data) ? data : []))
            .catch(() => setDoctors([]))
            .finally(() => setLoading(false));
    }, []);

    // Fetch slots when date or selected doctor changes
    useEffect(() => {
        if (selectedDoctor && bookingForm.date) {
            fetchSlots(selectedDoctor._id, bookingForm.date);
        }
    }, [selectedDoctor, bookingForm.date]);

    const fetchSlots = async (doctorId, date) => {
        setFetchingSlots(true);
        try {
            const data = await api.get(`/api/patients/doctors/${doctorId}/slots?date=${date}`);
            setSlots(data);
        } catch (err) {
            toast.error('Failed to load slots');
            setSlots([]);
        } finally {
            setFetchingSlots(false);
        }
    };

    const handleSelectDoctor = (doc) => {
        setSelectedDoctor(doc);
        setBookingForm({
            date: new Date().toISOString().split('T')[0],
            time: '',
            appointmentMode: 'In-person',
            amount: doc.doctorProfile?.consultationFee || 500
        });
    };

    const handleBook = async () => {
        if (!bookingForm.date || !bookingForm.time) return toast.error('Select date and time');
        setBooking(true);
        try {
            await api.post('/api/patients/appointments', {
                bookingType: 'doctor',
                doctorId: selectedDoctor._id,
                date: bookingForm.date,
                time: bookingForm.time,
                appointmentMode: bookingForm.appointmentMode,
                amount: bookingForm.amount,
            });
            toast.success('Appointment booked successfully!');
            setSelectedDoctor(null);
            navigate('/patient/appointments');
        } catch (err) {
            toast.error(err.message);
        }
        setBooking(false);
    };

    return (
        <div className="app-layout">
            <Sidebar />
            <div className="main-content">
                <Topbar title="Find Doctors" />
                <div className="page">
                    <div className="page-header">
                        <h1>Find Doctors</h1>
                        <p>Browse available doctors and book appointments</p>
                    </div>

                    {/* ── Booking Panel (unchanged logic) ── */}
                    {selectedDoctor && (
                        <div className="card mb-24" style={{ borderColor: 'var(--accent)' }}>
                            <div className="card-header">
                                <h3><CalendarIcon /> Book Appointment with {selectedDoctor.name}</h3>
                                <button className="btn btn-secondary btn-sm" onClick={() => setSelectedDoctor(null)}>Cancel</button>
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Select Date</label>
                                    <input type="date" className="form-input" min={new Date().toISOString().split('T')[0]} value={bookingForm.date} onChange={e => setBookingForm(f => ({ ...f, date: e.target.value, time: '' }))} />
                                </div>
                                <div className="form-group">
                                    <label>Consultation Fee</label>
                                    <div className="form-input" style={{ background: '#f8f9fa', fontWeight: 600 }}>&#8377;{bookingForm.amount}</div>
                                </div>
                            </div>

                            <div className="form-group mt-16">
                                <label>Available Slots {fetchingSlots && <span className="spinner spinner-xs" style={{ marginLeft: 8 }}></span>}</label>
                                {slots.length > 0 ? (
                                    <div className="flex flex-wrap gap-8 mt-8">
                                        {slots.map(s => (
                                            <button
                                                key={s.time}
                                                disabled={!s.isAvailable}
                                                className={`btn btn-sm ${bookingForm.time === s.time ? 'btn-primary' : 'btn-outline-secondary'} ${!s.isAvailable ? 'opacity-30' : ''}`}
                                                onClick={() => setBookingForm(f => ({ ...f, time: s.time }))}
                                                style={{ minWidth: 80 }}
                                            >
                                                {s.time}
                                            </button>
                                        ))}
                                    </div>
                                ) : !fetchingSlots && bookingForm.date ? (
                                    <p className="text-muted text-sm mt-8">No slots available for this date.</p>
                                ) : null}
                            </div>

                            <div className="form-row mt-16">
                                <div className="form-group">
                                    <label>Appointment Mode</label>
                                    <select className="form-select" value={bookingForm.appointmentMode} onChange={e => setBookingForm(f => ({ ...f, appointmentMode: e.target.value }))}>
                                        <option>In-person</option>
                                        <option>Video call</option>
                                    </select>
                                </div>
                                <div className="form-group flex" style={{ alignItems: 'flex-end' }}>
                                    <button className="btn btn-primary w-100" onClick={handleBook} disabled={booking || !bookingForm.time}>
                                        {booking ? 'Booking...' : 'Confirm Booking'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ── Doctor Cards Grid ── */}
                    {loading ? (
                        <div className="flex-center" style={{ padding: 60 }}><div className="spinner"></div></div>
                    ) : doctors.length > 0 ? (
                        <div className="grid-3" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
                            {doctors.map(doc => {
                                const profile = doc.doctorProfile || {};
                                const fee = profile.consultationFee;
                                const exp = profile.experience;
                                const rating = profile.rating || 0;
                                const reviewsCount = profile.reviewsCount || 0;

                                return (
                                    <div key={doc._id} className="entity-card" onClick={() => handleSelectDoctor(doc)}>
                                        {/* Share */}
                                        <button
                                            className="entity-card-share"
                                            onClick={(e) => handleShare(e, doc.name, 'doctor', doc._id)}
                                            title="Share this doctor"
                                        >
                                            <ShareIcon />
                                        </button>

                                        {/* Header */}
                                        <div className="entity-card-header">
                                            <div className="entity-card-header-info">
                                                <div className="entity-card-avatar">
                                                    {doc.image
                                                        ? <img src={doc.image} alt={doc.name} />
                                                        : (doc.name || 'D')[0].toUpperCase()
                                                    }
                                                </div>
                                                <div>
                                                    <h3 className="entity-card-name">{doc.name}</h3>
                                                    <div className="entity-card-specialty">
                                                        {doc.specialization || profile.specialization || 'General Physician'}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Body */}
                                        <div className="entity-card-body">
                                            <RatingStars rating={rating} count={reviewsCount} />

                                            <div className="entity-card-chips">
                                                {exp > 0 && (
                                                    <span className="entity-chip">
                                                        <BriefcaseIcon /> {exp} yr{exp > 1 ? 's' : ''} exp
                                                    </span>
                                                )}
                                                <span className="entity-chip">
                                                    <MapPinIcon /> {doc.city || 'Not specified'}
                                                </span>
                                            </div>

                                            <div className="entity-card-footer">
                                                {fee ? (
                                                    <div className="entity-card-fee">
                                                        &#8377;{fee} <span>/ visit</span>
                                                    </div>
                                                ) : (
                                                    <div className="entity-card-location">Fee on visit</div>
                                                )}
                                                <button className="entity-card-book-btn">
                                                    Book Now
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="entity-empty-state">
                            <div className="entity-empty-icon">
                                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                            </div>
                            <h3>No doctors available</h3>
                            <p>Doctors will appear once they register and are approved</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
