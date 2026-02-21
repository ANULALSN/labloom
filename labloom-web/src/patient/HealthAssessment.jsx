import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/client';
import { useToast } from '../components/Toast';
import { useAuth } from '../auth/AuthContext';

export default function HealthAssessment() {
    const [step, setStep] = useState(1);
    const { user, setUser } = useAuth();
    const navigate = useNavigate();
    const toast = useToast();

    // Form state
    const [lifestyle, setLifestyle] = useState({
        smoking: '',
        alcohol: '',
        activityLevel: ''
    });

    const [healthProfile, setHealthProfile] = useState({
        bloodType: '',
        rhFactor: '',
        allergies: '',
        chronicConditions: '',
        height: '',
        weight: '',
        bloodPressure: { systolic: '', diastolic: '' }
    });

    const handleNext = () => setStep(2);
    const handleBack = () => setStep(1);

    const handleSubmit = async () => {
        try {
            const data = await api.patch('/api/patients/health-profile', {
                lifestyle,
                healthProfile
            });

            // Update local user state
            const updatedUser = { ...user, isHealthProfileComplete: true };
            localStorage.setItem('labloom_user', JSON.stringify(updatedUser));

            toast.success('Health profile completed!');
            navigate('/patient');
            window.location.reload(); // Ensure protected routes re-evaluate
        } catch (err) {
            toast.error(err.message || 'Failed to save health profile');
        }
    };

    const renderLifestyle = () => (
        <div className="assessment-step">
            <div className="assessment-header">
                <div className="step-indicator">
                    <div className="step-dot active"></div>
                    <div className="step-dot"></div>
                </div>
                <h1>Lifestyle information</h1>
                <p>Sharing lifestyle details helps doctors tailor advice and treatment to your health needs.</p>
            </div>

            <div className="assessment-form-group">
                <label>Smoking</label>
                <div className="option-grid">
                    {['Yes', 'No', 'Occasionally'].map(opt => (
                        <button
                            key={opt}
                            className={`option-btn ${lifestyle.smoking === opt ? 'active' : ''}`}
                            onClick={() => setLifestyle({ ...lifestyle, smoking: opt })}
                        >
                            {opt}
                        </button>
                    ))}
                </div>
            </div>

            <div className="assessment-form-group">
                <label>Alcohol</label>
                <div className="option-grid">
                    {['Yes', 'No', 'Occasionally'].map(opt => (
                        <button
                            key={opt}
                            className={`option-btn ${lifestyle.alcohol === opt ? 'active' : ''}`}
                            onClick={() => setLifestyle({ ...lifestyle, alcohol: opt })}
                        >
                            {opt}
                        </button>
                    ))}
                </div>
            </div>

            <div className="assessment-form-group">
                <label>Activity Level</label>
                <div className="flex flex-column gap-12">
                    {[
                        { val: 'Light', desc: 'Light (sports 1-3 days a week)' },
                        { val: 'Moderate', desc: 'Moderate (sports 3-5 days a week)' },
                        { val: 'Very Active', desc: 'Very Active (sports 6-7 days a week)' }
                    ].map(opt => (
                        <button
                            key={opt.val}
                            className={`option-btn ${lifestyle.activityLevel === opt.val ? 'active' : ''}`}
                            style={{ textAlign: 'left', padding: '16px' }}
                            onClick={() => setLifestyle({ ...lifestyle, activityLevel: opt.val })}
                        >
                            {opt.desc}
                        </button>
                    ))}
                </div>
            </div>

            <button
                className="btn btn-primary btn-lg mt-24"
                style={{ width: '100%' }}
                disabled={!lifestyle.smoking || !lifestyle.alcohol || !lifestyle.activityLevel}
                onClick={handleNext}
            >
                Next
            </button>
        </div>
    );

    const renderHealth = () => (
        <div className="assessment-step">
            <div className="assessment-header">
                <div className="step-indicator">
                    <div className="step-dot"></div>
                    <div className="step-dot active"></div>
                </div>
                <h1>Health Assessment</h1>
                <p>Providing this data helps the doctor customize your treatment and ensure precise care.</p>
            </div>

            <div className="assessment-form-group">
                <label>Blood type</label>
                <div className="blood-type-grid">
                    {['O', 'A', 'B', 'AB'].map(type => (
                        <button
                            key={type}
                            className={`blood-type-btn ${healthProfile.bloodType === type ? 'active' : ''}`}
                            onClick={() => setHealthProfile({ ...healthProfile, bloodType: type })}
                        >
                            <span className="drop-icon">💧</span>
                            <span>{type}</span>
                        </button>
                    ))}
                </div>
            </div>

            <div className="assessment-form-group">
                <div className="flex gap-12">
                    {['+', '-'].map(rh => (
                        <button
                            key={rh}
                            className={`option-btn flex-1 ${healthProfile.rhFactor === rh ? 'active' : ''}`}
                            onClick={() => setHealthProfile({ ...healthProfile, rhFactor: rh })}
                        >
                            Rh {rh}
                        </button>
                    ))}
                </div>
            </div>

            <div className="form-group">
                <label>Allergies</label>
                <input
                    type="text"
                    className="form-input"
                    placeholder="Enter your allergies"
                    value={healthProfile.allergies}
                    onChange={e => setHealthProfile({ ...healthProfile, allergies: e.target.value })}
                />
            </div>

            <div className="form-group">
                <label>Chronic conditions</label>
                <input
                    type="text"
                    className="form-input"
                    placeholder="Enter your chronic conditions"
                    value={healthProfile.chronicConditions}
                    onChange={e => setHealthProfile({ ...healthProfile, chronicConditions: e.target.value })}
                />
            </div>

            <div className="assessment-input-row">
                <div className="form-group">
                    <label>Your height (cm)</label>
                    <input
                        type="number"
                        className="form-input"
                        placeholder="Height"
                        value={healthProfile.height}
                        onChange={e => setHealthProfile({ ...healthProfile, height: e.target.value })}
                    />
                </div>
                <div className="form-group">
                    <label>Your weight (kg)</label>
                    <input
                        type="number"
                        className="form-input"
                        placeholder="Weight"
                        value={healthProfile.weight}
                        onChange={e => setHealthProfile({ ...healthProfile, weight: e.target.value })}
                    />
                </div>
            </div>

            <div className="form-group">
                <label>Blood pressure (mmHg)</label>
                <div className="flex gap-12 align-center">
                    <input
                        type="number"
                        className="form-input flex-1"
                        placeholder="Systolic"
                        value={healthProfile.bloodPressure.systolic}
                        onChange={e => setHealthProfile({ ...healthProfile, bloodPressure: { ...healthProfile.bloodPressure, systolic: e.target.value } })}
                    />
                    <span>/</span>
                    <input
                        type="number"
                        className="form-input flex-1"
                        placeholder="Diastolic"
                        value={healthProfile.bloodPressure.diastolic}
                        onChange={e => setHealthProfile({ ...healthProfile, bloodPressure: { ...healthProfile.bloodPressure, diastolic: e.target.value } })}
                    />
                </div>
            </div>

            <div className="flex gap-12 mt-24">
                <button className="btn btn-secondary flex-1" onClick={handleBack}>Back</button>
                <button
                    className="btn btn-primary flex-1"
                    onClick={handleSubmit}
                    disabled={!healthProfile.bloodType || !healthProfile.rhFactor}
                >
                    Finish
                </button>
            </div>
        </div>
    );

    return (
        <div className="assessment-page">
            <div className="assessment-container">
                {step === 1 ? renderLifestyle() : renderHealth()}
            </div>
        </div>
    );
}
