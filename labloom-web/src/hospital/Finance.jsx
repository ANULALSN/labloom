import { useState, useEffect } from 'react';
import api from '../api/client';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';

export default function Finance() {
    const [finance, setFinance] = useState(null);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [loading, setLoading] = useState(true);

    const fetchFinance = async () => {
        setLoading(true);
        try {
            let url = '/api/hospital/finance';
            const params = [];
            if (startDate) params.push(`startDate=${startDate}`);
            if (endDate) params.push(`endDate=${endDate}`);
            if (params.length) url += '?' + params.join('&');
            const data = await api.get(url);
            setFinance(data);
        } catch {
            setFinance(null);
        }
        setLoading(false);
    };

    useEffect(() => { fetchFinance(); }, []);

    return (
        <div className="app-layout">
            <Sidebar />
            <div className="main-content">
                <Topbar title="Finance" />
                <div className="page">
                    <div className="page-header">
                        <h1>💰 Finance</h1>
                        <p>Revenue reports and financial analytics</p>
                    </div>

                    <div className="card mb-24">
                        <div className="flex gap-12" style={{ flexWrap: 'wrap', alignItems: 'flex-end' }}>
                            <div className="form-group" style={{ margin: 0 }}>
                                <label>Start Date</label>
                                <input type="date" className="form-input" value={startDate} onChange={e => setStartDate(e.target.value)} />
                            </div>
                            <div className="form-group" style={{ margin: 0 }}>
                                <label>End Date</label>
                                <input type="date" className="form-input" value={endDate} onChange={e => setEndDate(e.target.value)} />
                            </div>
                            <button className="btn btn-primary btn-sm" onClick={fetchFinance}>📊 Generate Report</button>
                        </div>
                    </div>

                    {loading ? (
                        <div className="flex-center" style={{ padding: 60 }}><div className="spinner"></div></div>
                    ) : finance ? (
                        <div className="stats-grid">
                            <div className="stat-card">
                                <div className="stat-icon">💰</div>
                                <div className="stat-label">Total Revenue</div>
                                <div className="stat-value">₹{finance.totalRevenue || 0}</div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-icon">📅</div>
                                <div className="stat-label">Total Bookings</div>
                                <div className="stat-value">{finance.totalBookings || 0}</div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-icon">✅</div>
                                <div className="stat-label">Completed</div>
                                <div className="stat-value">{finance.completedBookings || 0}</div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-icon">📈</div>
                                <div className="stat-label">Platform Fee (₹15/visit)</div>
                                <div className="stat-value">₹{(finance.completedBookings || 0) * 15}</div>
                            </div>
                        </div>
                    ) : (
                        <div className="empty-state"><div className="empty-icon">💰</div><h3>No data</h3></div>
                    )}
                </div>
            </div>
        </div>
    );
}
