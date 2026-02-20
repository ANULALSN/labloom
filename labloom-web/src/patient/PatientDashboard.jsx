import { useState, useEffect } from 'react';
import api from '../api/client';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';

export default function PatientDashboard() {
    const [dashboard, setDashboard] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('/api/patients/dashboard')
            .then(data => setDashboard(data))
            .catch(() => { })
            .finally(() => setLoading(false));
    }, []);

    return (
        <div className="app-layout">
            <Sidebar />
            <div className="main-content">
                <Topbar title="Patient Dashboard" />
                <div className="page">
                    <div className="page-header">
                        <h1>🏠 Dashboard</h1>
                        <p>Welcome back! Here's your health overview</p>
                    </div>

                    {loading ? (
                        <div className="flex-center" style={{ padding: 60 }}><div className="spinner"></div></div>
                    ) : (
                        <>
                            <div className="stats-grid">
                                <div className="stat-card">
                                    <div className="stat-icon">📅</div>
                                    <div className="stat-label">Upcoming Appointments</div>
                                    <div className="stat-value">{dashboard?.upcomingAppointments || 0}</div>
                                </div>
                                <div className="stat-card">
                                    <div className="stat-icon">✅</div>
                                    <div className="stat-label">Completed Visits</div>
                                    <div className="stat-value">{dashboard?.completedVisits || 0}</div>
                                </div>
                                <div className="stat-card">
                                    <div className="stat-icon">📄</div>
                                    <div className="stat-label">Lab Reports</div>
                                    <div className="stat-value">{dashboard?.labReports || 0}</div>
                                </div>
                                <div className="stat-card">
                                    <div className="stat-icon">💊</div>
                                    <div className="stat-label">Prescriptions</div>
                                    <div className="stat-value">{dashboard?.prescriptions || 0}</div>
                                </div>
                            </div>

                            <div className="grid-2">
                                <div className="card">
                                    <div className="card-header"><h3>⚡ Quick Actions</h3></div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                        <a href="/patient/doctors" className="btn btn-secondary" style={{ justifyContent: 'center' }}>🩺 Find a Doctor</a>
                                        <a href="/patient/labs" className="btn btn-secondary" style={{ justifyContent: 'center' }}>🧪 Book a Lab Test</a>
                                        <a href="/patient/appointments" className="btn btn-secondary" style={{ justifyContent: 'center' }}>📅 View My Appointments</a>
                                    </div>
                                </div>

                                <div className="card">
                                    <div className="card-header"><h3>📋 Recent Activity</h3></div>
                                    {dashboard?.recentBookings?.length > 0 ? (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                            {dashboard.recentBookings.slice(0, 5).map((b, i) => (
                                                <div key={i} className="flex-between" style={{ padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                                                    <div>
                                                        <div className="fw-600 text-sm">
                                                            {b.bookingType === 'doctor'
                                                                ? `🩺 Dr. ${b.doctor?.name || 'Doctor'} (${b.doctor?.doctorProfile?.specialization || 'Consultant'})`
                                                                : `🧪 ${b.test?.name || 'Lab Test'}`}
                                                        </div>
                                                        <div className="text-muted" style={{ fontSize: 11 }}>
                                                            {new Date(b.date).toLocaleDateString()} {b.lab?.name ? `• ${b.lab.name}` : ''}
                                                        </div>
                                                    </div>
                                                    <span className={`badge ${b.status === 'completed' ? 'badge-success' : b.status === 'confirmed' ? 'badge-info' : 'badge-warning'}`}>
                                                        {b.status}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-muted text-sm">No recent activity</p>
                                    )}
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
