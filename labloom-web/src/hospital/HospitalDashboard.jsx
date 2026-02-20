import { useState, useEffect } from 'react';
import api from '../api/client';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import { useToast } from '../components/Toast';

export default function HospitalDashboard() {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('/api/hospital/dashboard')
            .then(data => setStats(data))
            .catch(() => { })
            .finally(() => setLoading(false));
    }, []);

    return (
        <div className="app-layout">
            <Sidebar />
            <div className="main-content">
                <Topbar title="Hospital Dashboard" />
                <div className="page">
                    <div className="page-header">
                        <h1>🏥 Dashboard</h1>
                        <p>Hospital overview and key metrics</p>
                    </div>

                    {loading ? (
                        <div className="flex-center" style={{ padding: 60 }}><div className="spinner"></div></div>
                    ) : (
                        <div className="stats-grid">
                            <div className="stat-card">
                                <div className="stat-icon">🩺</div>
                                <div className="stat-label">Doctors</div>
                                <div className="stat-value">{stats?.totalDoctors || 0}</div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-icon">📅</div>
                                <div className="stat-label">Appointments</div>
                                <div className="stat-value">{stats?.totalAppointments || 0}</div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-icon">✅</div>
                                <div className="stat-label">Completed</div>
                                <div className="stat-value">{stats?.completedAppointments || 0}</div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-icon">💰</div>
                                <div className="stat-label">Revenue</div>
                                <div className="stat-value">₹{stats?.totalRevenue || 0}</div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
