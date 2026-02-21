import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { useToast } from '../components/Toast';

export default function SignupPage() {
    const [form, setForm] = useState({ name: '', phone: '', email: '', role: 'patient' });
    const [agreed, setAgreed] = useState(false);
    const [loading, setLoading] = useState(false);
    const { signup } = useAuth();
    const toast = useToast();
    const navigate = useNavigate();

    const update = (field, value) => setForm(f => ({ ...f, [field]: value }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.name || !form.phone) return toast.error('Name and phone number are required');
        if (!agreed) return toast.error('Please agree to the Terms & Conditions');
        setLoading(true);
        try {
            await signup(form);
            toast.success('Account created! You can now login.');
            if (form.role !== 'patient') {
                toast.info('Your account requires admin approval before you can log in.');
            }
            navigate('/login');
        } catch (err) {
            toast.error(err.message || 'Signup failed');
        }
        setLoading(false);
    };

    return (
        <div className="auth-page">
            {/* ── Left Brand Panel ── */}
            <div className="auth-brand">
                <div className="auth-brand-content">
                    <div className="auth-brand-logo">
                        <img src="/logo.png" alt="Labloom" />
                    </div>
                    <h2>Labloom Enterprise</h2>
                    <p>Scale your medical services with integrated precision diagnostics.</p>
                </div>
            </div>

            {/* ── Right Form Panel ── */}
            <div className="auth-form-panel">
                <div className="auth-form-container">
                    <h2>Create Account</h2>
                    <p className="auth-subtitle">Select your role and provide details to join our platform.</p>

                    <form className="auth-form" onSubmit={handleSubmit}>
                        {/* Role */}
                        <div className="form-group">
                            <label>Join As</label>
                            <select className="form-select" value={form.role} onChange={e => update('role', e.target.value)}>
                                <option value="patient">Patient</option>
                                <option value="doctor">Doctor</option>
                                <option value="hospital">Hospital</option>
                                <option value="lab">Laboratory</option>
                            </select>
                        </div>

                        {/* Specialization (Doctor only) */}
                        {form.role === 'doctor' && (
                            <div className="form-group">
                                <label>Specialization</label>
                                <input
                                    className="form-input"
                                    placeholder="e.g. Cardiologist, General Physician"
                                    value={form.specialisation || ''}
                                    onChange={e => update('specialisation', e.target.value)}
                                />
                            </div>
                        )}

                        {/* Name */}
                        <div className="form-group">
                            <label>Full Name</label>
                            <div className="form-input-icon">
                                <span className="icon">👤</span>
                                <input className="form-input" placeholder="Enter your full name" value={form.name} onChange={e => update('name', e.target.value)} />
                            </div>
                        </div>

                        {/* Phone */}
                        <div className="form-group">
                            <label>Mobile Number</label>
                            <div className="phone-row">
                                <div className="phone-prefix">🇮🇳 +91</div>
                                <input className="form-input" type="tel" placeholder="Enter phone number" value={form.phone} onChange={e => update('phone', e.target.value)} />
                            </div>
                        </div>

                        {/* Email */}
                        <div className="form-group">
                            <label>Email Address</label>
                            <div className="form-input-icon">
                                <span className="icon">✉️</span>
                                <input className="form-input" type="email" placeholder="example@domain.com" value={form.email} onChange={e => update('email', e.target.value)} />
                            </div>
                        </div>

                        {/* Terms */}
                        <div className="auth-terms">
                            <input type="checkbox" checked={agreed} onChange={e => setAgreed(e.target.checked)} />
                            <span>I agree to the <a href="#terms">Terms & Conditions</a></span>
                        </div>

                        <button type="submit" className="auth-btn" disabled={loading}>
                            {loading ? '⏳ Creating...' : 'Create Account'}
                        </button>
                    </form>

                    <div className="auth-footer">
                        Already have an account? <Link to="/login">Login Now</Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
