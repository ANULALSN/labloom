import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { useToast } from '../components/Toast';
import api from '../api/client';

const ROLE_CONFIG = {
    doctor: {
        label: 'Doctor',
        icon: 'DR',
        description: 'Independent medical practitioner',
        documents: [
            'Medical Registration Certificate (MRC)',
            'Degree Certificates (MBBS, MD, etc.)',
            'Government ID Proof'
        ],
        uploadEndpoint: '/api/upload/doctor-document',
    },
    hospital: {
        label: 'Hospital',
        icon: 'HP',
        description: 'Hospital or clinic facility',
        documents: [
            'Hospital Registration Certificate',
            'Trade License / Business License',
            'NABH / NABL Accreditation (if applicable)',
            'Government ID Proof of authorized signatory'
        ],
    },
    lab: {
        label: 'Laboratory',
        icon: 'LB',
        description: 'Diagnostic laboratory facility',
        documents: [
            'Lab Registration Certificate',
            'NABL Accreditation Certificate',
            'Trade License / Business License',
            'Government ID Proof of authorized signatory'
        ],
    }
};

export default function SignupPage() {
    const [step, setStep] = useState(1); // 1 = details, 2 = document upload
    const [form, setForm] = useState({ name: '', phone: '', email: '', role: 'doctor' });
    const [agreed, setAgreed] = useState(false);
    const [loading, setLoading] = useState(false);
    const [signupData, setSignupData] = useState(null); // stored after step 1

    // Document upload state
    const [uploadedDocs, setUploadedDocs] = useState([]);
    const [uploading, setUploading] = useState(false);

    const { signup, logout } = useAuth();
    const toast = useToast();
    const navigate = useNavigate();

    const update = (field, value) => setForm(f => ({ ...f, [field]: value }));
    const roleCfg = ROLE_CONFIG[form.role];

    // Step 1: Create Account
    const handleCreateAccount = async (e) => {
        e.preventDefault();
        if (!form.name || !form.phone) return toast.error('Name and phone number are required');
        if (form.role === 'doctor' && !form.specialisation) return toast.error('Please enter your specialization');
        if (!agreed) return toast.error('Please agree to the Terms & Conditions');

        setLoading(true);
        try {
            const data = await signup(form);
            setSignupData(data);
            toast.success('Account created! Now upload your verification documents.');
            setStep(2);
        } catch (err) {
            toast.error(err.message || 'Signup failed');
        }
        setLoading(false);
    };

    // Step 2: Upload Documents
    const handleDocumentUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('document', file);

        setUploading(true);
        try {
            let endpoint;
            if (form.role === 'doctor') {
                endpoint = '/api/upload/doctor-document';
            } else if (form.role === 'lab') {
                endpoint = `/api/upload/lab-document/${signupData.entityReference}`;
            } else if (form.role === 'hospital') {
                endpoint = `/api/upload/hospital-document/${signupData.entityReference}`;
            }

            const result = await api.post(endpoint, formData);
            setUploadedDocs(prev => [...prev, result.document]);
            toast.success('Document uploaded successfully!');
        } catch (err) {
            toast.error(err.message || 'Upload failed');
        } finally {
            setUploading(false);
            e.target.value = null;
        }
    };

    const handleFinish = () => {
        // Clear the temporary auth session — user MUST wait for admin approval to login
        logout();
        toast.info('Your documents have been submitted. You can log in once an admin approves your account.');
        navigate('/login');
    };

    // ════════════════════════════════════════════════
    //  STEP 2: DOCUMENT UPLOAD SCREEN
    // ════════════════════════════════════════════════
    if (step === 2) {
        return (
            <div className="auth-page">
                {/* Left Brand Panel */}
                <div className="auth-brand">
                    <div className="auth-brand-content">
                        <div className="auth-brand-logo">
                            <img src="/logo.png" alt="Labloom" />
                        </div>
                        <h2>Labloom Enterprise</h2>
                        <p>Almost there! Upload your verification documents to get started.</p>
                    </div>
                </div>

                {/* Right Upload Panel */}
                <div className="auth-form-panel">
                    <div className="auth-form-container" style={{ maxWidth: 520 }}>
                        {/* Step Indicator */}
                        <div className="signup-steps">
                            <div className="signup-step completed">
                                <div className="step-circle">&#10003;</div>
                                <span>Account</span>
                            </div>
                            <div className="step-line completed"></div>
                            <div className="signup-step active">
                                <div className="step-circle">2</div>
                                <span>Verification</span>
                            </div>
                        </div>

                        <h2>Upload Verification Documents</h2>
                        <p className="auth-subtitle">
                            Upload the required documents for {roleCfg.label} verification. Your account will be activated after admin review.
                        </p>

                        {/* Required Documents Checklist */}
                        <div className="verification-requirements">
                            <div className="requirements-header">
                                <span className="requirements-role-badge">{roleCfg.icon}</span>
                                <div>
                                    <strong>Required Documents for {roleCfg.label}</strong>
                                    <p style={{ margin: '2px 0 0', fontSize: 12, color: '#6b7280' }}>
                                        Accepted formats: JPG, PNG, WebP, PDF
                                    </p>
                                </div>
                            </div>
                            <ul className="requirements-list">
                                {roleCfg.documents.map((doc, i) => (
                                    <li key={i}>
                                        <span className="req-bullet">&bull;</span>
                                        {doc}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Uploaded Documents */}
                        {uploadedDocs.length > 0 && (
                            <div className="uploaded-docs-list">
                                {uploadedDocs.map((doc, idx) => (
                                    <div key={idx} className="uploaded-doc-item">
                                        <div className="doc-icon-text">
                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>
                                        </div>
                                        <div className="doc-info">
                                            <div className="doc-name">{doc.name || `Document ${idx + 1}`}</div>
                                            <div className="doc-status">Uploaded successfully</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Upload Button */}
                        <label className="upload-drop-zone">
                            {uploading ? (
                                <div className="upload-loading">
                                    <div className="spinner" style={{ width: 24, height: 24 }}></div>
                                    <span>Uploading...</span>
                                </div>
                            ) : (
                                <>
                                    <svg className="upload-svg-icon" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>
                                    <div className="upload-text">Click to upload a document</div>
                                    <div className="upload-hint">JPG, PNG, WebP or PDF</div>
                                </>
                            )}
                            <input
                                type="file"
                                hidden
                                accept=".jpg,.jpeg,.png,.webp,.pdf"
                                onChange={handleDocumentUpload}
                                disabled={uploading}
                            />
                        </label>

                        {/* Action Buttons */}
                        <div className="signup-actions">
                            <button
                                className="auth-btn"
                                onClick={handleFinish}
                                disabled={uploadedDocs.length === 0}
                            >
                                {uploadedDocs.length === 0 ? 'Upload at least one document' : `Submit & Finish (${uploadedDocs.length} doc${uploadedDocs.length > 1 ? 's' : ''} uploaded)`}
                            </button>
                            {uploadedDocs.length === 0 && (
                                <p style={{ textAlign: 'center', fontSize: 12, color: '#6b7280', marginTop: 8 }}>
                                    You must upload at least one verification document to complete registration.
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // ════════════════════════════════════════════════
    //  STEP 1: ACCOUNT DETAILS
    // ════════════════════════════════════════════════
    return (
        <div className="auth-page">
            {/* Left Brand Panel */}
            <div className="auth-brand">
                <div className="auth-brand-content">
                    <div className="auth-brand-logo">
                        <img src="/logo.png" alt="Labloom" />
                    </div>
                    <h2>Labloom Enterprise</h2>
                    <p>Scale your medical services with integrated precision diagnostics.</p>
                </div>
            </div>

            {/* Right Form Panel */}
            <div className="auth-form-panel">
                <div className="auth-form-container">
                    {/* Step Indicator */}
                    <div className="signup-steps">
                        <div className="signup-step active">
                            <div className="step-circle">1</div>
                            <span>Account</span>
                        </div>
                        <div className="step-line"></div>
                        <div className="signup-step">
                            <div className="step-circle">2</div>
                            <span>Verification</span>
                        </div>
                    </div>

                    <h2>Create Account</h2>
                    <p className="auth-subtitle">Select your role and provide details to join our platform.</p>

                    <form className="auth-form" onSubmit={handleCreateAccount}>
                        {/* Role Selector Cards */}
                        <div className="form-group">
                            <label>Join As</label>
                            <div className="role-cards">
                                {Object.entries(ROLE_CONFIG).map(([key, cfg]) => (
                                    <button
                                        type="button"
                                        key={key}
                                        className={`role-card ${form.role === key ? 'selected' : ''}`}
                                        onClick={() => update('role', key)}
                                    >
                                        <span className="role-card-badge">{cfg.icon}</span>
                                        <span className="role-card-label">{cfg.label}</span>
                                        <span className="role-card-desc">{cfg.description}</span>
                                    </button>
                                ))}
                            </div>
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
                            <label>{form.role === 'doctor' ? 'Full Name' : form.role === 'hospital' ? 'Hospital Name' : 'Laboratory Name'}</label>
                            <input className="form-input" placeholder={form.role === 'doctor' ? 'Enter your full name' : `Enter ${ROLE_CONFIG[form.role].label.toLowerCase()} name`} value={form.name} onChange={e => update('name', e.target.value)} />
                        </div>

                        {/* Phone */}
                        <div className="form-group">
                            <label>Mobile Number</label>
                            <div className="phone-row">
                                <div className="phone-prefix">+91</div>
                                <input className="form-input" type="tel" placeholder="Enter phone number" value={form.phone} onChange={e => update('phone', e.target.value)} />
                            </div>
                        </div>

                        {/* Email */}
                        <div className="form-group">
                            <label>Email Address</label>
                            <input className="form-input" type="email" placeholder="example@domain.com" value={form.email} onChange={e => update('email', e.target.value)} />
                        </div>

                        {/* Terms */}
                        <div className="auth-terms">
                            <input type="checkbox" checked={agreed} onChange={e => setAgreed(e.target.checked)} />
                            <span>I agree to the <a href="#terms">Terms & Conditions</a></span>
                        </div>

                        <button type="submit" className="auth-btn" disabled={loading}>
                            {loading ? 'Creating...' : 'Continue'}
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
