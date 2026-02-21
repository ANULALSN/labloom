import { useNavigate } from 'react-router-dom';

export default function LandingPage() {
    const navigate = useNavigate();

    return (
        <div className="landing-page">
            {/* ── Navbar ── */}
            <nav className="landing-navbar">
                <div className="nav-logo">
                    <img src="/logo.png" alt="Labloom" />
                    <h1>Labloom</h1>
                </div>
                <div className="nav-links">
                    <a href="#features">Solutions</a>
                    <a href="#about">About</a>
                    <a href="#contact">Contact</a>
                    <a onClick={() => navigate('/login')} style={{ cursor: 'pointer' }}>Login</a>
                    <button className="nav-btn-signup" onClick={() => navigate('/signup')}>Sign Up</button>
                </div>
            </nav>

            {/* ── Hero ── */}
            <section className="hero-section">
                <div className="hero-content">
                    <div className="hero-badge">Next Generation Healthcare</div>
                    <h1>Precision Diagnostics for Everyone.</h1>
                    <p>
                        Connected laboratories, clinicians, and patients through an
                        intelligent ecosystem. Data-driven care simplified.
                    </p>
                    <div className="hero-buttons">
                        <button className="hero-btn-primary" onClick={() => navigate('/signup')}>
                            Get Started Free
                        </button>
                        <button className="hero-btn-secondary" onClick={() => {
                            const el = document.getElementById('features');
                            el && el.scrollIntoView({ behavior: 'smooth' });
                        }}>
                            Learn More
                        </button>
                    </div>
                </div>

                <div className="hero-image">
                    <img src="/landing.jpg" alt="Labloom Medical" />
                </div>
            </section>

            {/* ── Features ── */}
            <section className="features-section" id="features">
                <div className="features-grid">
                    <div className="feature-card">
                        <div className="feature-icon">🩺</div>
                        <h3>Find Doctors</h3>
                        <p>Book appointments with verified specialists. Video and in-person consultations available.</p>
                    </div>
                    <div className="feature-card">
                        <div className="feature-icon">🧪</div>
                        <h3>Lab Diagnostics</h3>
                        <p>Browse labs, book tests, and access digital reports — all in one seamless platform.</p>
                    </div>
                    <div className="feature-card">
                        <div className="feature-icon">🏥</div>
                        <h3>Hospital Network</h3>
                        <p>Connected hospital ecosystem with real-time slot management and financial analytics.</p>
                    </div>
                    <div className="feature-card">
                        <div className="feature-icon">📊</div>
                        <h3>Smart Reports</h3>
                        <p>AI-powered report analysis with instant digital access to your complete health records.</p>
                    </div>
                    <div className="feature-card">
                        <div className="feature-icon">💬</div>
                        <h3>Secure Chat</h3>
                        <p>HIPAA-compliant messaging with your healthcare providers. 7-day post-consultation access.</p>
                    </div>
                    <div className="feature-card">
                        <div className="feature-icon">🔒</div>
                        <h3>Data Privacy</h3>
                        <p>Enterprise-grade security with end-to-end encryption and full regulatory compliance.</p>
                    </div>
                </div>
            </section>

            {/* ── Footer ── */}
            <footer id="contact" style={{
                padding: '40px 48px',
                background: '#1a1d2e',
                color: 'rgba(255,255,255,0.5)',
                textAlign: 'center',
                fontSize: 14
            }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 12 }}>
                    <img src="/logo.png" alt="Labloom" style={{ width: 24, height: 24 }} />
                    <span style={{ color: '#00cec9', fontWeight: 700, fontSize: 18 }}>Labloom</span>
                </div>
                <p>© 2026 Labloom Healthcare. All rights reserved.</p>
            </footer>
        </div>
    );
}
