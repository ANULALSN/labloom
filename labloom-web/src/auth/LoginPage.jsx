import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { useToast } from '../components/Toast';

export default function LoginPage() {
    const [mode, setMode] = useState('user'); // user | admin
    const [step, setStep] = useState(1); // 1=phone, 2=otp
    const [phone, setPhone] = useState('');
    const [otp, setOtp] = useState('');
    const [loading, setLoading] = useState(false);
    const { adminRequestOtp, adminVerifyOtp, requestOtp: userRequestOtp, verifyOtp: userVerifyOtp } = useAuth();
    const toast = useToast();
    const navigate = useNavigate();

    const handleRequestOtp = async (e) => {
        e.preventDefault();
        if (!phone || phone.length < 10) return toast.error('Enter a valid phone number');
        setLoading(true);
        try {
            let data;
            if (mode === 'admin') {
                data = await adminRequestOtp(phone);
            } else {
                data = await userRequestOtp(phone);
            }
            toast.success(`OTP sent! Use: ${data.otp || '1234'}`);
            setStep(2);
        } catch (err) {
            toast.error(err.message || 'Failed to send OTP');
        }
        setLoading(false);
    };

    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        if (!otp || otp.length < 4) return toast.error('Enter the OTP');
        setLoading(true);
        try {
            if (mode === 'admin') {
                await adminVerifyOtp(phone, otp);
                navigate('/admin');
            } else {
                const data = await userVerifyOtp(phone, otp);
                const role = data?.user?.role || data?.role || 'patient';
                navigate(`/${role}`);
            }
        } catch (err) {
            toast.error(err.message || 'Invalid OTP');
        }
        setLoading(false);
    };

    return (
        <div className="auth-page">
            {/* ── Left Brand Panel ── */}
            <div className="auth-brand">
                <div className="auth-brand-content">
                    <div className="auth-brand-logo">
                        <img src="/logo.jpeg" alt="Labloom" />
                    </div>
                    <h2>Labloom Enterprise</h2>
                    <p>Scale your medical services with integrated precision diagnostics.</p>
                </div>
            </div>

            {/* ── Right Form Panel ── */}
            <div className="auth-form-panel">
                <div className="auth-form-container">
                    <h2>Welcome Back</h2>
                    <p className="auth-subtitle">Sign in to access your account</p>

                    {/* User / Admin toggle */}
                    <div className="auth-toggle">
                        <button className={mode === 'user' ? 'active' : ''} onClick={() => { setMode('user'); setStep(1); setOtp(''); }}>
                            🧑 User Login
                        </button>
                        <button className={mode === 'admin' ? 'active' : ''} onClick={() => { setMode('admin'); setStep(1); setOtp(''); }}>
                            🔑 Admin Login
                        </button>
                    </div>

                    <form className="auth-form" onSubmit={step === 1 ? handleRequestOtp : handleVerifyOtp}>
                        {/* Phone number */}
                        <div className="form-group">
                            <label>Mobile Number</label>
                            <div className="phone-row">
                                <div className="phone-prefix">🇮🇳 +91</div>
                                <input
                                    className="form-input"
                                    type="tel"
                                    placeholder="Enter phone number"
                                    value={phone}
                                    onChange={e => setPhone(e.target.value)}
                                    disabled={step === 2}
                                />
                            </div>
                        </div>

                        {/* OTP field */}
                        {step === 2 && (
                            <div className="form-group">
                                <label>OTP Verification Code</label>
                                <div className="form-input-icon">
                                    <span className="icon">🔐</span>
                                    <input
                                        className="form-input"
                                        type="text"
                                        placeholder="Enter OTP"
                                        value={otp}
                                        onChange={e => setOtp(e.target.value)}
                                        maxLength={6}
                                        autoFocus
                                    />
                                </div>
                            </div>
                        )}

                        <button type="submit" className="auth-btn" disabled={loading}>
                            {loading ? '⏳ Please wait...' : step === 1 ? '📲 Send OTP' : '✅ Verify & Login'}
                        </button>

                        {step === 2 && (
                            <button type="button" style={{ background: 'none', border: 'none', color: '#6b7280', fontSize: 13, marginTop: 10, cursor: 'pointer', width: '100%', textAlign: 'center' }}
                                onClick={() => { setStep(1); setOtp(''); }}>
                                ← Change number
                            </button>
                        )}
                    </form>

                    <div className="auth-footer">
                        Don't have an account? <Link to="/signup">Create Account</Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
