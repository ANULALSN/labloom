import { useState, useEffect } from 'react';
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
    const [personalData, setPersonalData] = useState({
        firstName: '',
        lastName: '',
        dob: '',
        phone: user?.phone || '',
        email: user?.email || '',
        city: '',
        address: ''
    });

    const [emergencyContact, setEmergencyContact] = useState({
        firstName: '',
        lastName: '',
        relationship: '',
        phone: '',
        email: '',
        city: '',
        address: ''
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

    const [lifestyle, setLifestyle] = useState({
        smoking: '',
        alcohol: '',
        activityLevel: ''
    });

    useEffect(() => {
        // Pre-fill some data if available
        if (user) {
            setPersonalData(prev => ({
                ...prev,
                phone: user.phone || '',
                email: user.email || ''
            }));
        }
    }, [user]);

    const handleNext = () => setStep(prev => prev + 1);
    const handleBack = () => setStep(prev => prev - 1);

    const handleSkip = () => {
        toast.info('Profile marked as incomplete. You will be asked to complete it again later.');
        navigate('/login'); // Redirect to login or landing since forced onboarding prevents dashboard access
    };

    const handleSubmit = async () => {
        try {
            const response = await api.patch('/api/patients/health-profile', {
                personalData,
                emergencyContact,
                healthProfile,
                lifestyle
            });

            // Update local user state
            const updatedUser = { ...user, ...response.user, isHealthProfileComplete: true };
            localStorage.setItem('labloom_user', JSON.stringify(updatedUser));
            setUser(updatedUser);

            toast.success('Onboarding completed! Welcome to Labloom.');
            navigate('/patient');
        } catch (err) {
            toast.error(err.message || 'Failed to save profile');
        }
    };

    // Validation
    const isStep1Valid = personalData.firstName && personalData.lastName && personalData.dob && personalData.phone && personalData.city && personalData.address;
    const isStep2Valid = emergencyContact.firstName && emergencyContact.lastName && emergencyContact.relationship && emergencyContact.phone;
    const isStep3Valid = healthProfile.bloodType && healthProfile.rhFactor && healthProfile.allergies && healthProfile.height && healthProfile.weight;
    const isStep4Valid = lifestyle.smoking && lifestyle.alcohol && lifestyle.activityLevel;

    const renderStep1 = () => (
        <div className="assessment-step">
            <div className="assessment-header">
                <div className="step-indicator">
                    <div className="step-dot active"></div>
                    <div className="step-dot"></div>
                    <div className="step-dot"></div>
                    <div className="step-dot"></div>
                </div>
                <h1>Personal Information</h1>
                <p>Let's start with your basic details.</p>
            </div>

            <div className="form-row">
                <div className="form-group">
                    <label>First Name*</label>
                    <input
                        type="text"
                        className="form-input"
                        placeholder="John"
                        value={personalData.firstName}
                        onChange={e => setPersonalData({ ...personalData, firstName: e.target.value })}
                    />
                </div>
                <div className="form-group">
                    <label>Last Name*</label>
                    <input
                        type="text"
                        className="form-input"
                        placeholder="Doe"
                        value={personalData.lastName}
                        onChange={e => setPersonalData({ ...personalData, lastName: e.target.value })}
                    />
                </div>
            </div>

            <div className="form-group">
                <label>Date of Birth*</label>
                <input
                    type="date"
                    className="form-input"
                    value={personalData.dob}
                    onChange={e => setPersonalData({ ...personalData, dob: e.target.value })}
                />
            </div>

            <div className="form-row">
                <div className="form-group">
                    <label>Phone Number*</label>
                    <input
                        type="tel"
                        className="form-input"
                        value={personalData.phone}
                        onChange={e => setPersonalData({ ...personalData, phone: e.target.value })}
                    />
                </div>
                <div className="form-group">
                    <label>Email (Optional)</label>
                    <input
                        type="email"
                        className="form-input"
                        placeholder="john@example.com"
                        value={personalData.email}
                        onChange={e => setPersonalData({ ...personalData, email: e.target.value })}
                    />
                </div>
            </div>

            <div className="form-group">
                <label>City*</label>
                <input
                    type="text"
                    className="form-input"
                    placeholder="Search city"
                    value={personalData.city}
                    onChange={e => setPersonalData({ ...personalData, city: e.target.value })}
                />
            </div>

            <div className="form-group">
                <label>Street Address*</label>
                <textarea
                    className="form-input"
                    rows="2"
                    placeholder="Building, Apartment, Street"
                    value={personalData.address}
                    onChange={e => setPersonalData({ ...personalData, address: e.target.value })}
                ></textarea>
            </div>

            <div className="flex gap-12 mt-24">
                <button className="btn btn-secondary flex-1" onClick={handleSkip}>Skip</button>
                <button
                    className="btn btn-primary flex-1"
                    onClick={handleNext}
                    disabled={!isStep1Valid}
                >
                    Next
                </button>
            </div>
        </div>
    );

    const renderStep2 = () => (
        <div className="assessment-step">
            <div className="assessment-header">
                <div className="step-indicator">
                    <div className="step-dot active"></div>
                    <div className="step-dot active"></div>
                    <div className="step-dot"></div>
                    <div className="step-dot"></div>
                </div>
                <h1>Emergency Contact</h1>
                <p>Who should we contact in case of an emergency?</p>
            </div>

            <div className="form-row">
                <div className="form-group">
                    <label>Contact First Name*</label>
                    <input
                        type="text"
                        className="form-input"
                        value={emergencyContact.firstName}
                        onChange={e => setEmergencyContact({ ...emergencyContact, firstName: e.target.value })}
                    />
                </div>
                <div className="form-group">
                    <label>Contact Last Name*</label>
                    <input
                        type="text"
                        className="form-input"
                        value={emergencyContact.lastName}
                        onChange={e => setEmergencyContact({ ...emergencyContact, lastName: e.target.value })}
                    />
                </div>
            </div>

            <div className="form-group">
                <label>Relationship*</label>
                <select
                    className="form-input"
                    value={emergencyContact.relationship}
                    onChange={e => setEmergencyContact({ ...emergencyContact, relationship: e.target.value })}
                >
                    <option value="">Select Relationship</option>
                    <option value="Spouse">Spouse</option>
                    <option value="Parent">Parent</option>
                    <option value="Child">Child</option>
                    <option value="Friend">Friend</option>
                    <option value="Other">Other</option>
                </select>
            </div>

            <div className="form-row">
                <div className="form-group">
                    <label>Contact Phone*</label>
                    <input
                        type="tel"
                        className="form-input"
                        value={emergencyContact.phone}
                        onChange={e => setEmergencyContact({ ...emergencyContact, phone: e.target.value })}
                    />
                </div>
                <div className="form-group">
                    <label>Contact Email (Optional)</label>
                    <input
                        type="email"
                        className="form-input"
                        value={emergencyContact.email}
                        onChange={e => setEmergencyContact({ ...emergencyContact, email: e.target.value })}
                    />
                </div>
            </div>

            <div className="form-group">
                <label>Contact City</label>
                <input
                    type="text"
                    className="form-input"
                    value={emergencyContact.city}
                    onChange={e => setEmergencyContact({ ...emergencyContact, city: e.target.value })}
                />
            </div>

            <div className="form-group">
                <label>Full Address</label>
                <textarea
                    className="form-input"
                    rows="2"
                    value={emergencyContact.address}
                    onChange={e => setEmergencyContact({ ...emergencyContact, address: e.target.value })}
                ></textarea>
            </div>

            <div className="flex gap-12 mt-24">
                <button className="btn btn-secondary flex-1" onClick={handleBack}>Back</button>
                <button
                    className="btn btn-primary flex-1"
                    onClick={handleNext}
                    disabled={!isStep2Valid}
                >
                    Next
                </button>
            </div>
        </div>
    );

    const renderStep3 = () => (
        <div className="assessment-step">
            <div className="assessment-header">
                <div className="step-indicator">
                    <div className="step-dot active"></div>
                    <div className="step-dot active"></div>
                    <div className="step-dot active"></div>
                    <div className="step-dot"></div>
                </div>
                <h1>Health Assessment</h1>
                <p>Provide medical details for better care.</p>
            </div>

            <div className="assessment-form-group">
                <label>Blood Type*</label>
                <div className="blood-type-grid">
                    {['O', 'A', 'B', 'AB'].map(type => (
                        <button
                            key={type}
                            type="button"
                            className={`blood-type-btn ${healthProfile.bloodType === type ? 'active' : ''}`}
                            onClick={() => setHealthProfile({ ...healthProfile, bloodType: type })}
                        >
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
                            type="button"
                            className={`option-btn flex-1 ${healthProfile.rhFactor === rh ? 'active' : ''}`}
                            onClick={() => setHealthProfile({ ...healthProfile, rhFactor: rh })}
                        >
                            Rh {rh}
                        </button>
                    ))}
                </div>
            </div>

            <div className="form-group">
                <label>Allergies* (e.g., Peanuts, Penicillin)</label>
                <textarea
                    className="form-input"
                    rows="2"
                    placeholder="Enter your allergies"
                    value={healthProfile.allergies}
                    onChange={e => setHealthProfile({ ...healthProfile, allergies: e.target.value })}
                ></textarea>
            </div>

            <div className="form-group">
                <label>Chronic Conditions (e.g., Diabetes)</label>
                <textarea
                    className="form-input"
                    rows="2"
                    placeholder="Enter chronic conditions"
                    value={healthProfile.chronicConditions}
                    onChange={e => setHealthProfile({ ...healthProfile, chronicConditions: e.target.value })}
                ></textarea>
            </div>

            <div className="assessment-input-row">
                <div className="form-group">
                    <label>Height (cm)*</label>
                    <input
                        type="number"
                        className="form-input"
                        value={healthProfile.height}
                        onChange={e => setHealthProfile({ ...healthProfile, height: e.target.value })}
                    />
                </div>
                <div className="form-group">
                    <label>Weight (kg)*</label>
                    <input
                        type="number"
                        className="form-input"
                        value={healthProfile.weight}
                        onChange={e => setHealthProfile({ ...healthProfile, weight: e.target.value })}
                    />
                </div>
            </div>

            <div className="form-group">
                <label>Blood Pressure (mmHg)</label>
                <div className="flex gap-12 align-center">
                    <input
                        type="number"
                        className="form-input flex-1"
                        placeholder="Sys"
                        value={healthProfile.bloodPressure.systolic}
                        onChange={e => setHealthProfile({ ...healthProfile, bloodPressure: { ...healthProfile.bloodPressure, systolic: e.target.value } })}
                    />
                    <span>/</span>
                    <input
                        type="number"
                        className="form-input flex-1"
                        placeholder="Dia"
                        value={healthProfile.bloodPressure.diastolic}
                        onChange={e => setHealthProfile({ ...healthProfile, bloodPressure: { ...healthProfile.bloodPressure, diastolic: e.target.value } })}
                    />
                </div>
            </div>

            <div className="flex gap-12 mt-24">
                <button className="btn btn-secondary flex-1" onClick={handleBack}>Back</button>
                <button
                    className="btn btn-primary flex-1"
                    onClick={handleNext}
                    disabled={!isStep3Valid}
                >
                    Next
                </button>
            </div>
        </div>
    );

    const renderStep4 = () => (
        <div className="assessment-step">
            <div className="assessment-header">
                <div className="step-indicator">
                    <div className="step-dot active"></div>
                    <div className="step-dot active"></div>
                    <div className="step-dot active"></div>
                    <div className="step-dot active"></div>
                </div>
                <h1>Lifestyle information</h1>
                <p>Help us understand your daily habits.</p>
            </div>

            <div className="assessment-form-group">
                <label>Smoking</label>
                <div className="option-grid">
                    {['Yes', 'No', 'Occasionally'].map(opt => (
                        <button
                            key={opt}
                            type="button"
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
                            type="button"
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
                        { val: 'Light', desc: 'Light: Sports 1–3 days/week' },
                        { val: 'Moderate', desc: 'Moderate: Sports 3–5 days/week' },
                        { val: 'Very Active', desc: 'Very Active: Sports 6–7 days/week' }
                    ].map(opt => (
                        <button
                            key={opt.val}
                            type="button"
                            className={`option-btn ${lifestyle.activityLevel === opt.val ? 'active' : ''}`}
                            style={{ textAlign: 'left', padding: '16px' }}
                            onClick={() => setLifestyle({ ...lifestyle, activityLevel: opt.val })}
                        >
                            {opt.desc}
                        </button>
                    ))}
                </div>
            </div>

            <div className="flex gap-12 mt-24">
                <button className="btn btn-secondary flex-1" onClick={handleBack}>Back</button>
                <button
                    className="btn btn-primary flex-1"
                    onClick={handleSubmit}
                    disabled={!isStep4Valid}
                >
                    Finish
                </button>
            </div>
        </div>
    );

    return (
        <div className="assessment-page">
            <div className="assessment-container">
                {step === 1 && renderStep1()}
                {step === 2 && renderStep2()}
                {step === 3 && renderStep3()}
                {step === 4 && renderStep4()}
            </div>
        </div>
    );
}
