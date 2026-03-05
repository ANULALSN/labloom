import { useState, useEffect } from 'react';
import api from '../api/client';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import { useToast } from '../components/Toast';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const TIME_SLOTS = [];
for (let i = 8; i <= 20; i++) {
    const hour = i.toString().padStart(2, '0');
    TIME_SLOTS.push(`${hour}:00`);
    if (i < 20) TIME_SLOTS.push(`${hour}:30`);
}

export default function ManageSlots() {
    const [availability, setAvailability] = useState([]);
    const [consultationFee, setConsultationFee] = useState(500);
    const [specialization, setSpecialization] = useState('');
    const [verificationStatus, setVerificationStatus] = useState('pending');
    const [verificationDocuments, setVerificationDocuments] = useState([]);
    const [uploadingDoc, setUploadingDoc] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const toast = useToast();

    useEffect(() => {
        fetchAvailability();
    }, []);

    const fetchAvailability = async () => {
        try {
            const data = await api.get('/api/doctor/availability');
            setAvailability(data.availability || []);
            setConsultationFee(data.consultationFee || 500);
            setSpecialization(data.specialization || '');
            setVerificationStatus(data.verificationStatus || 'pending');
            setVerificationDocuments(data.verificationDocuments || []);
        } catch (err) {
            toast.error(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleToggleDay = (day) => {
        setAvailability(prev => {
            const exists = prev.find(a => a.day === day);
            if (exists) {
                return prev.filter(a => a.day !== day);
            } else {
                return [...prev, { day, slots: [{ startTime: '09:00', endTime: '12:00' }] }];
            }
        });
    };

    const handleAddSlot = (day) => {
        setAvailability(prev => prev.map(a => {
            if (a.day === day) {
                return { ...a, slots: [...a.slots, { startTime: '14:00', endTime: '17:00' }] };
            }
            return a;
        }));
    };

    const handleRemoveSlot = (day, index) => {
        setAvailability(prev => prev.map(a => {
            if (a.day === day) {
                const newSlots = a.slots.filter((_, i) => i !== index);
                return { ...a, slots: newSlots };
            }
            return a;
        }));
    };

    const handleUpdateSlot = (day, index, field, value) => {
        setAvailability(prev => prev.map(a => {
            if (a.day === day) {
                const newSlots = [...a.slots];
                newSlots[index] = { ...newSlots[index], [field]: value };
                return { ...a, slots: newSlots };
            }
            return a;
        }));
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            await api.put('/api/doctor/availability', {
                availability,
                consultationFee,
                specialization
            });
            toast.success('Schedule updated successfully!');
        } catch (err) {
            toast.error(err.message);
        } finally {
            setSaving(false);
        }
    };

    const handleDocumentUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('document', file);

        setUploadingDoc(true);
        try {
            await api.post('/api/upload/doctor-document', formData);
            toast.success('Document uploaded successfully!');
            fetchAvailability(); // Refresh documents and status
        } catch (err) {
            toast.error(err.message || 'Error uploading document');
        } finally {
            setUploadingDoc(false);
            e.target.value = null; // reset file input
        }
    };

    if (loading) return (
        <div className="app-layout">
            <Sidebar />
            <div className="main-content">
                <Topbar title="Manage Schedule" />
                <div className="flex-center" style={{ height: '80vh' }}><div className="spinner"></div></div>
            </div>
        </div>
    );

    return (
        <div className="app-layout">
            <Sidebar />
            <div className="main-content">
                <Topbar title="Manage Schedule" />
                <div className="page">
                    <div className="page-header">
                        <h1>📅 My Schedule</h1>
                        <p>Set your weekly availability and consultation fees</p>
                    </div>

                    <div className="card mb-24">
                        <div className="card-header">
                            <h3>Basic Information</h3>
                        </div>
                        <div className="form-row">
                            <div className="form-group">
                                <label>Specialization</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    value={specialization}
                                    onChange={e => setSpecialization(e.target.value)}
                                    placeholder="e.g. Cardiologist"
                                />
                            </div>
                            <div className="form-group">
                                <label>Consultation Fee (₹)</label>
                                <input
                                    type="number"
                                    className="form-input"
                                    value={consultationFee}
                                    onChange={e => setConsultationFee(parseInt(e.target.value) || 0)}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="grid-1 gap-24">
                        {DAYS.map(day => {
                            const config = availability.find(a => a.day === day);
                            return (
                                <div key={day} className={`card ${config ? 'border-primary' : 'opacity-70'}`}>
                                    <div className="flex-between mb-16">
                                        <div className="flex gap-12" style={{ alignItems: 'center' }}>
                                            <input
                                                type="checkbox"
                                                checked={!!config}
                                                onChange={() => handleToggleDay(day)}
                                                style={{ width: 20, height: 20 }}
                                            />
                                            <h3 className="mb-0">{day}</h3>
                                        </div>
                                        {config && (
                                            <button className="btn btn-secondary btn-sm" onClick={() => handleAddSlot(day)}>+ Add Slot</button>
                                        )}
                                    </div>

                                    {config ? (
                                        <div className="flex flex-col gap-12">
                                            {config.slots.map((slot, idx) => (
                                                <div key={idx} className="flex gap-12" style={{ alignItems: 'center' }}>
                                                    <select
                                                        className="form-select"
                                                        value={slot.startTime}
                                                        onChange={e => handleUpdateSlot(day, idx, 'startTime', e.target.value)}
                                                    >
                                                        {TIME_SLOTS.map(t => <option key={t}>{t}</option>)}
                                                    </select>
                                                    <span>to</span>
                                                    <select
                                                        className="form-select"
                                                        value={slot.endTime}
                                                        onChange={e => handleUpdateSlot(day, idx, 'endTime', e.target.value)}
                                                    >
                                                        {TIME_SLOTS.map(t => <option key={t}>{t}</option>)}
                                                    </select>
                                                    <button
                                                        className="btn btn-danger btn-sm"
                                                        onClick={() => handleRemoveSlot(day, idx)}
                                                        style={{ padding: '8px 12px' }}
                                                    >✕</button>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-muted text-sm mb-0">Unavailable on this day</p>
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    <div className="mt-24 sticky-bottom">
                        <button
                            className="btn btn-primary btn-lg w-100"
                            onClick={handleSave}
                            disabled={saving}
                        >
                            {saving ? 'Saving...' : '💾 Save Schedule Changes'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
