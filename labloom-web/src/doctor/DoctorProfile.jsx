import { useState, useEffect } from 'react';
import api from '../api/client';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import { useToast } from '../components/Toast';

export default function DoctorProfile() {
    const [hospitals, setHospitals] = useState([]);
    const [selectedHospital, setSelectedHospital] = useState('');
    const [saving, setSaving] = useState(false);
    const [affiliations, setAffiliations] = useState([]);
    const toast = useToast();

    useEffect(() => {
        fetchHospitals();
        fetchProfile();
    }, []);

    const fetchHospitals = async () => {
        try {
            const data = await api.get('/api/doctor/hospitals');
            setHospitals(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error('Failed to load hospitals:', err);
        }
    };

    const fetchProfile = async () => {
        try {
            const user = await api.get('/api/auth/profile');
            if (user?.doctorProfile?.hospitalAffiliations) {
                setAffiliations(user.doctorProfile.hospitalAffiliations);
            }
        } catch (err) {
            console.error('Failed to load profile:', err);
        }
    };

    const handleJoinHospital = async () => {
        if (!selectedHospital) {
            toast.error('Please select a hospital first.');
            return;
        }

        setSaving(true);
        try {
            await api.post('/api/doctor/join-hospital', { hospitalId: selectedHospital });
            toast.success('Successfully joined the hospital!');
            setSelectedHospital('');
            fetchProfile(); // refresh affiliations
        } catch (err) {
            toast.error(err.message || 'Failed to join hospital.');
        } finally {
            setSaving(false);
        }
    };

    // Format affiliations to display hospital name if we have it in the list
    const getHospitalName = (id) => {
        const hospital = hospitals.find((h) => h._id === id);
        return hospital ? hospital.name : 'Unknown Hospital';
    };

    return (
        <div className="app-layout">
            <Sidebar />
            <div className="main-content">
                <Topbar title="Settings & Profile" />
                <div className="page" style={{ maxWidth: 800 }}>
                    <div className="page-header">
                        <h1>Settings & Profile</h1>
                        <p>Manage your account settings and hospital affiliations</p>
                    </div>

                    <div className="card mb-24">
                        <h2 className="mb-16">Hospital Affiliations</h2>
                        <p className="text-muted mb-16">
                            Join a registered hospital to start receiving bookings and assignments directly through them.
                        </p>

                        <div className="flex gap-16 mb-24">
                            <select
                                className="input-field"
                                value={selectedHospital}
                                onChange={(e) => setSelectedHospital(e.target.value)}
                                style={{ flex: 1 }}
                            >
                                <option value="">Select a hospital to join...</option>
                                {hospitals.map((h) => (
                                    <option key={h._id} value={h._id}>
                                        {h.name} {h.city ? `- ${h.city}` : ''}
                                    </option>
                                ))}
                            </select>
                            <button
                                className="btn btn-primary"
                                onClick={handleJoinHospital}
                                disabled={saving}
                            >
                                {saving ? 'Joining...' : 'Join Hospital'}
                            </button>
                        </div>

                        {affiliations.length > 0 && (
                            <div>
                                <h3 className="mb-12">Current Affiliations</h3>
                                <div className="grid-2">
                                    {affiliations.map((affil, idx) => (
                                        <div key={idx} className="card" style={{ padding: 16, border: '1px solid var(--border)' }}>
                                            <div style={{ fontSize: 24, marginBottom: 8 }}>🏥</div>
                                            <div className="fw-600">{getHospitalName(affil.hospitalId)}</div>
                                            <div className="text-muted text-sm">Department: {affil.department || 'General'}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
