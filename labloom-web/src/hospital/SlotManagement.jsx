import { useState, useEffect } from 'react';
import api from '../api/client';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import { useToast } from '../components/Toast';

export default function SlotManagement() {
    const [form, setForm] = useState({ doctorId: '', date: '', startTime: '', endTime: '' });
    const [doctors, setDoctors] = useState([]);
    const [loading, setLoading] = useState(false);
    const toast = useToast();

    useEffect(() => {
        api.get('/api/hospital/doctors')
            .then(data => setDoctors(Array.isArray(data) ? data : []))
            .catch(() => { });
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.doctorId || !form.date) return toast.error('Select doctor and date');
        setLoading(true);
        try {
            // Backend expects day string (e.g., "Monday") and slots array
            const dateObj = new Date(form.date);
            const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
            const dayName = days[dateObj.getDay()];

            const payload = {
                doctorId: form.doctorId,
                day: dayName,
                slots: [{ startTime: form.startTime, endTime: form.endTime }]
            };

            await api.post('/api/hospital/slots/manage', payload);
            toast.success('Slot created successfully!');
            setForm({ doctorId: '', date: '', startTime: '', endTime: '' });
        } catch (err) {
            toast.error(err.message);
        }
        setLoading(false);
    };

    return (
        <div className="app-layout">
            <Sidebar />
            <div className="main-content">
                <Topbar title="Slot Management" />
                <div className="page">
                    <div className="page-header">
                        <h1>🕐 Slot Management</h1>
                        <p>Create and manage appointment time slots for doctors</p>
                    </div>

                    <div className="card" style={{ maxWidth: 600 }}>
                        <div className="card-header"><h3>➕ Create New Slot</h3></div>
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label>Doctor</label>
                                <select className="form-select" value={form.doctorId} onChange={e => setForm(f => ({ ...f, doctorId: e.target.value }))}>
                                    <option value="">Select doctor...</option>
                                    {doctors.map(d => (
                                        <option key={d._id} value={d._id}>{d.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Date</label>
                                <input type="date" className="form-input" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Start Time</label>
                                    <input type="time" className="form-input" value={form.startTime} onChange={e => setForm(f => ({ ...f, startTime: e.target.value }))} />
                                </div>
                                <div className="form-group">
                                    <label>End Time</label>
                                    <input type="time" className="form-input" value={form.endTime} onChange={e => setForm(f => ({ ...f, endTime: e.target.value }))} />
                                </div>
                            </div>
                            <button className="btn btn-primary" disabled={loading}>
                                {loading ? '⏳ Creating...' : '✅ Create Slot'}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
