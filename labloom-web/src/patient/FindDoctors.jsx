import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/client';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import { useToast } from '../components/Toast';

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
                        <h1>🩺 Find Doctors</h1>
                        <p>Browse available doctors and book appointments</p>
                    </div>

                    {selectedDoctor && (
                        <div className="card mb-24" style={{ borderColor: 'var(--accent)' }}>
                            <div className="card-header">
                                <h3>📅 Book Appointment with {selectedDoctor.name}</h3>
                                <button className="btn btn-secondary btn-sm" onClick={() => setSelectedDoctor(null)}>✕ Cancel</button>
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Select Date</label>
                                    <input type="date" className="form-input" min={new Date().toISOString().split('T')[0]} value={bookingForm.date} onChange={e => setBookingForm(f => ({ ...f, date: e.target.value, time: '' }))} />
                                </div>
                                <div className="form-group">
                                    <label>Consultation Fee (₹)</label>
                                    <div className="form-input" style={{ background: '#f8f9fa', fontWeight: 600 }}>₹{bookingForm.amount}</div>
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
                                        {booking ? '⏳ Booking...' : '✅ Confirm Booking'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {loading ? (
                        <div className="flex-center" style={{ padding: 60 }}><div className="spinner"></div></div>
                    ) : doctors.length > 0 ? (
                        <div className="grid-3" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}>
                            {doctors.map(doc => (
                                <div key={doc._id} className="card" style={{ cursor: 'pointer' }} onClick={() => handleSelectDoctor(doc)}>
                                    <div className="flex gap-12" style={{ alignItems: 'center', marginBottom: 12 }}>
                                        <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'linear-gradient(135deg, var(--accent), var(--teal))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, color: 'white', fontWeight: 700 }}>
                                            {(doc.name || 'D')[0]}
                                        </div>
                                        <div>
                                            <div className="fw-600">{doc.name}</div>
                                            <div className="text-muted text-sm">{doc.specialization || doc.doctorProfile?.specialization || 'General'}</div>
                                        </div>
                                    </div>
                                    <div className="flex-between">
                                        <span className="text-muted text-sm">📍 {doc.city || 'Not specified'}</span>
                                        <span className="badge badge-primary">Book →</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="empty-state">
                            <div className="empty-icon">🩺</div>
                            <h3>No doctors available</h3>
                            <p>Doctors will appear once they register and are approved</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
