import { useState, useEffect } from 'react';
import api from '../api/client';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';

export default function AdminDashboard() {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('/api/admin/reports/system')
            .then(data => setStats(data))
            .catch(() => { })
            .finally(() => setLoading(false));
    }, []);

    return (
        <div className="app-layout">
            <Sidebar />
            <div className="main-content">
                <Topbar title="Admin Dashboard" />
                <div className="page">
                    <div className="page-header">
                        <h1>Dashboard</h1>
                        <p>Platform overview and system analytics</p>
                    </div>

                    {loading ? (
                        <div className="flex-center" style={{ padding: 60 }}><div className="spinner"></div></div>
                    ) : stats ? (
                        <>
                            <div className="stats-grid">
                                <div className="stat-card">
                                    <div className="stat-label">Patients</div>
                                    <div className="stat-value">{stats.users?.patients || 0}</div>
                                </div>
                                <div className="stat-card">
                                    <div className="stat-label">Doctors</div>
                                    <div className="stat-value">{stats.users?.doctors || 0}</div>
                                </div>
                                <div className="stat-card">
                                    <div className="stat-label">Hospitals</div>
                                    <div className="stat-value">{stats.users?.hospitals || 0}</div>
                                </div>
                                <div className="stat-card">
                                    <div className="stat-label">Labs</div>
                                    <div className="stat-value">{stats.users?.labs || 0}</div>
                                </div>
                            </div>

                            <div className="grid-2">
                                <div className="card">
                                    <div className="card-header"><h3>Activity</h3></div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                        <div className="flex-between">
                                            <span className="text-muted text-sm">Appointments</span>
                                            <span className="fw-600">{stats.activity?.appointments || 0}</span>
                                        </div>
                                        <div className="flex-between">
                                            <span className="text-muted text-sm">Lab Tests</span>
                                            <span className="fw-600">{stats.activity?.labTests || 0}</span>
                                        </div>
                                        <div className="flex-between">
                                            <span className="text-muted text-sm">Total Bookings</span>
                                            <span className="fw-600">{(stats.activity?.appointments || 0) + (stats.activity?.labTests || 0)}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="card">
                                    <div className="card-header"><h3>Revenue Model</h3></div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                        <div className="flex-between">
                                            <span className="text-muted text-sm">Doctor Booking Fee</span>
                                            <span className="badge badge-primary">₹15 / booking</span>
                                        </div>
                                        <div className="flex-between">
                                            <span className="text-muted text-sm">Lab Booking Fee</span>
                                            <span className="badge badge-success">₹50 / booking</span>
                                        </div>
                                        <div className="flex-between">
                                            <span className="text-muted text-sm">Est. Revenue</span>
                                            <span className="fw-600">₹{((stats.activity?.appointments || 0) * 15) + ((stats.activity?.labTests || 0) * 50)}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="empty-state">
                            <h3>No data yet</h3>
                            <p>Analytics will appear as users register and book appointments</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
