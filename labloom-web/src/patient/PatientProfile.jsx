import { useState, useEffect } from 'react';
import api from '../api/client';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import { useToast } from '../components/Toast';

export default function PatientProfile() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const toast = useToast();

    const [form, setForm] = useState({
        lifestyle: { smoking: '', alcohol: '', activityLevel: '' },
        healthProfile: {
            bloodType: '',
            rhFactor: '',
            allergies: '',
            chronicConditions: '',
            height: '',
            weight: '',
            bloodPressure: { systolic: '', diastolic: '' }
        }
    });

    useEffect(() => {
        api.get('/api/patients/me')
            .then(data => {
                setForm({
                    lifestyle: data.lifestyle || form.lifestyle,
                    healthProfile: data.healthProfile || form.healthProfile
                });
            })
            .catch(() => toast.error('Failed to load profile'))
            .finally(() => setLoading(false));
    }, []);

    const handleSave = async () => {
        setSaving(true);
        try {
            await api.patch('/api/patients/health-profile', form);
            toast.success('Profile updated successfully');
        } catch (err) {
            toast.error(err.message || 'Failed to save profile');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="flex-center" style={{ height: '100vh' }}><div className="spinner"></div></div>;

    return (
        <div className="app-layout">
            <Sidebar />
            <div className="main-content">
                <Topbar title="Health Profile" />
                <div className="page">
                    <div className="page-header">
                        <h1>❤️ Personal Health Record</h1>
                        <p>Keep your health information up to date for better medical advice</p>
                    </div>

                    <div className="grid-2">
                        <div className="card shadow-sm">
                            <h3 className="mb-24">🏃 Lifestyle</h3>

                            <div className="form-group">
                                <label>Smoking</label>
                                <select
                                    className="form-input"
                                    value={form.lifestyle.smoking}
                                    onChange={e => setForm({ ...form, lifestyle: { ...form.lifestyle, smoking: e.target.value } })}
                                >
                                    <option value="">Select</option>
                                    <option value="Yes">Yes</option>
                                    <option value="No">No</option>
                                    <option value="Occasionally">Occasionally</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label>Alcohol</label>
                                <select
                                    className="form-input"
                                    value={form.lifestyle.alcohol}
                                    onChange={e => setForm({ ...form, lifestyle: { ...form.lifestyle, alcohol: e.target.value } })}
                                >
                                    <option value="">Select</option>
                                    <option value="Yes">Yes</option>
                                    <option value="No">No</option>
                                    <option value="Occasionally">Occasionally</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label>Activity Level</label>
                                <select
                                    className="form-input"
                                    value={form.lifestyle.activityLevel}
                                    onChange={e => setForm({ ...form, lifestyle: { ...form.lifestyle, activityLevel: e.target.value } })}
                                >
                                    <option value="">Select</option>
                                    <option value="Light">Light (1-3 days/week)</option>
                                    <option value="Moderate">Moderate (3-5 days/week)</option>
                                    <option value="Very Active">Very Active (6-7 days/week)</option>
                                </select>
                            </div>
                        </div>

                        <div className="card shadow-sm">
                            <h3 className="mb-24">🩺 Health Assessment</h3>

                            <div className="flex gap-12">
                                <div className="form-group flex-1">
                                    <label>Blood Type</label>
                                    <select
                                        className="form-input"
                                        value={form.healthProfile.bloodType}
                                        onChange={e => setForm({ ...form, healthProfile: { ...form.healthProfile, bloodType: e.target.value } })}
                                    >
                                        <option value="">Select</option>
                                        <option value="O">O</option>
                                        <option value="A">A</option>
                                        <option value="B">B</option>
                                        <option value="AB">AB</option>
                                    </select>
                                </div>
                                <div className="form-group flex-1">
                                    <label>Rh Factor</label>
                                    <select
                                        className="form-input"
                                        value={form.healthProfile.rhFactor}
                                        onChange={e => setForm({ ...form, healthProfile: { ...form.healthProfile, rhFactor: e.target.value } })}
                                    >
                                        <option value="">Select</option>
                                        <option value="+">Positive (+)</option>
                                        <option value="-">Negative (-)</option>
                                    </select>
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Allergies</label>
                                <input
                                    className="form-input"
                                    placeholder="e.g. Peanuts, Penicillin"
                                    value={form.healthProfile.allergies}
                                    onChange={e => setForm({ ...form, healthProfile: { ...form.healthProfile, allergies: e.target.value } })}
                                />
                            </div>

                            <div className="form-group">
                                <label>Chronic Conditions</label>
                                <input
                                    className="form-input"
                                    placeholder="e.g. Asthma, Diabetes"
                                    value={form.healthProfile.chronicConditions}
                                    onChange={e => setForm({ ...form, healthProfile: { ...form.healthProfile, chronicConditions: e.target.value } })}
                                />
                            </div>

                            <div className="flex gap-12">
                                <div className="form-group flex-1">
                                    <label>Height (cm)</label>
                                    <input
                                        type="number"
                                        className="form-input"
                                        value={form.healthProfile.height}
                                        onChange={e => setForm({ ...form, healthProfile: { ...form.healthProfile, height: e.target.value } })}
                                    />
                                </div>
                                <div className="form-group flex-1">
                                    <label>Weight (kg)</label>
                                    <input
                                        type="number"
                                        className="form-input"
                                        value={form.healthProfile.weight}
                                        onChange={e => setForm({ ...form, healthProfile: { ...form.healthProfile, weight: e.target.value } })}
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Blood Pressure (Systolic / Diastolic)</label>
                                <div className="flex gap-12 align-center">
                                    <input
                                        type="number"
                                        className="form-input flex-1"
                                        value={form.healthProfile.bloodPressure.systolic}
                                        placeholder="Sys"
                                        onChange={e => setForm({ ...form, healthProfile: { ...form.healthProfile, bloodPressure: { ...form.healthProfile.bloodPressure, systolic: e.target.value } } })}
                                    />
                                    <span>/</span>
                                    <input
                                        type="number"
                                        className="form-input flex-1"
                                        value={form.healthProfile.bloodPressure.diastolic}
                                        placeholder="Dia"
                                        onChange={e => setForm({ ...form, healthProfile: { ...form.healthProfile, bloodPressure: { ...form.healthProfile.bloodPressure, diastolic: e.target.value } } })}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end mt-32">
                        <button
                            className="btn btn-primary btn-lg"
                            style={{ minWidth: 200 }}
                            onClick={handleSave}
                            disabled={saving}
                        >
                            {saving ? 'Saving...' : 'Save All Changes'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
