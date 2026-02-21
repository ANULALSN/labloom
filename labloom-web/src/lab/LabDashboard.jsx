import { useState, useEffect } from 'react';
import api from '../api/client';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import { useToast } from '../components/Toast';

export default function LabDashboard() {
    const [stats, setStats] = useState({ total: 0, pending: 0, completed: 0, revenue: 0 });
    const [recentBookings, setRecentBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const toast = useToast();

    const fetchDashboardData = async () => {
        setLoading(true);
        try {
            const data = await api.get('/api/lab/bookings');
            const list = data.bookings || [];

            setRecentBookings(list.slice(0, 5));
            setStats({
                total: list.length,
                pending: list.filter(b => b.status === 'pending').length,
                completed: list.filter(b => b.status === 'completed').length,
                revenue: list.filter(b => b.status === 'completed').reduce((sum, b) => sum + (b.amount || 0), 0)
            });
        } catch (err) {
            toast.error('Failed to load dashboard data');
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchDashboardData();
    }, []);

    return (
        <div className="app-layout">
            <Sidebar />
            <div className="main-content">
                <Topbar title="Laboratory Overview" />
                <div className="page">
                    <div className="page-header">
                        <h1>📊 Lab Performance</h1>
                        <p>Real-time analytics and recent test activities</p>
                    </div>

                    <div className="stats-grid mb-24">
                        <div className="stat-card">
                            <div className="stat-icon">📅</div>
                            <div className="stat-label">Total Bookings</div>
                            <div className="stat-value">{stats.total}</div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-icon" style={{ color: 'var(--orange)' }}>⏳</div>
                            <div className="stat-label">Pending Samples</div>
                            <div className="stat-value">{stats.pending}</div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-icon" style={{ color: 'var(--teal)' }}>✅</div>
                            <div className="stat-label">Completed Tests</div>
                            <div className="stat-value">{stats.completed}</div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-icon" style={{ color: 'var(--blue)' }}>💰</div>
                            <div className="stat-label">Total Revenue</div>
                            <div className="stat-value">₹{stats.revenue}</div>
                        </div>
                    </div>

                    <div className="grid-2">
                        <div className="card">
                            <div className="card-header flex-between">
                                <h3>📋 Recent Bookings</h3>
                                <a href="/lab/bookings" className="btn btn-secondary btn-sm">View All</a>
                            </div>
                            {recentBookings.length > 0 ? (
                                <div className="flex flex-column gap-12">
                                    {recentBookings.map(b => (
                                        <div key={b._id} className="flex-between p-12 border-bottom">
                                            <div>
                                                <div className="fw-600">{b.test?.name}</div>
                                                <div className="text-muted text-sm">{b.user?.name} • {new Date(b.date).toLocaleDateString()}</div>
                                            </div>
                                            <span className={`badge ${b.status === 'completed' ? 'badge-success' : 'badge-warning'}`}>{b.status}</span>
                                        </div>
                                    ))}
                                </div>
                            ) : <p className="text-muted text-sm">No recent bookings</p>}
                        </div>

                        <div className="card">
                            <div className="card-header"><h3>⚡ Quick Actions</h3></div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                <a href="/lab/tests" className="btn btn-secondary" style={{ justifyContent: 'center' }}>🧪 Manage Test Catalog</a>
                                <a href="/lab/reviews" className="btn btn-secondary" style={{ justifyContent: 'center' }}>⭐ View Customer Reviews</a>
                                <a href="/lab/bookings" className="btn btn-primary" style={{ justifyContent: 'center' }}>📅 Update Booking Status</a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
