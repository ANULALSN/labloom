import { useState, useEffect } from 'react';
import api from '../api/client';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import { useToast } from '../components/Toast';

export default function LabTests() {
    const [tests, setTests] = useState([]);
    const [availableTests, setAvailableTests] = useState([]); // Global test list
    const [loading, setLoading] = useState(true);
    const [showAdd, setShowAdd] = useState(false);
    const [newTest, setNewTest] = useState({ testId: '', price: '', turnaroundTime: '24 Hours' });
    const toast = useToast();

    const fetchData = async () => {
        setLoading(true);
        try {
            const [catalog, allTests] = await Promise.all([
                api.get('/api/lab/catalog'),
                api.get('/api/tests') // Assuming this exists to get global tests
            ]);
            setTests(catalog);
            setAvailableTests(allTests);
        } catch (err) {
            setTests([]);
            toast.error('Failed to load catalog');
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleAdd = async (e) => {
        e.preventDefault();
        try {
            await api.post('/api/lab/catalog', newTest);
            toast.success('Test added to catalog');
            setShowAdd(false);
            fetchData();
        } catch (err) {
            toast.error(err.message);
        }
    };

    const handleRemove = async (id) => {
        if (!window.confirm('Are you sure you want to remove this test?')) return;
        try {
            await api.delete(`/api/lab/catalog/${id}`);
            toast.success('Test removed');
            fetchData();
        } catch (err) {
            toast.error(err.message);
        }
    };

    return (
        <div className="app-layout">
            <Sidebar />
            <div className="main-content">
                <Topbar title="Manage Tests" />
                <div className="page">
                    <div className="page-header flex-between">
                        <div>
                            <h1>🧪 Test Catalog</h1>
                            <p>Manage the medical tests offered by your laboratory</p>
                        </div>
                        <button className="btn btn-primary" onClick={() => setShowAdd(true)}>+ Add New Test</button>
                    </div>

                    {showAdd && (
                        <div className="card mb-24 shadow-sm" style={{ borderColor: 'var(--accent)' }}>
                            <div className="card-header">
                                <h3>Add Test to Catalog</h3>
                                <button className="btn-close" onClick={() => setShowAdd(false)}>✕</button>
                            </div>
                            <form className="form-row" style={{ gridTemplateColumns: '2fr 1fr 1fr auto', alignItems: 'flex-end' }} onSubmit={handleAdd}>
                                <div className="form-group mb-0">
                                    <label>Select Test Type</label>
                                    <select className="form-select" value={newTest.testId} onChange={e => setNewTest({ ...newTest, testId: e.target.value })} required>
                                        <option value="">-- Choose a Test --</option>
                                        {availableTests.map(t => (
                                            <option key={t._id} value={t._id}>{t.name} ({t.category})</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="form-group mb-0">
                                    <label>Price (₹)</label>
                                    <input type="number" className="form-input" placeholder="e.g. 500" value={newTest.price} onChange={e => setNewTest({ ...newTest, price: e.target.value })} required />
                                </div>
                                <div className="form-group mb-0">
                                    <label>Turnaround</label>
                                    <input className="form-input" placeholder="e.g. 24 Hours" value={newTest.turnaroundTime} onChange={e => setNewTest({ ...newTest, turnaroundTime: e.target.value })} required />
                                </div>
                                <button type="submit" className="btn btn-primary">Add</button>
                            </form>
                        </div>
                    )}

                    {loading ? (
                        <div className="flex-center" style={{ padding: 60 }}><div className="spinner"></div></div>
                    ) : tests.length > 0 ? (
                        <div className="card shadow-sm">
                            <table className="data-table">
                                <thead>
                                    <tr>
                                        <th>Test Name</th>
                                        <th>Category</th>
                                        <th>Price</th>
                                        <th>Turnaround</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {tests.map(t => (
                                        <tr key={t._id}>
                                            <td className="fw-600">{t.name}</td>
                                            <td className="text-muted">{t.category}</td>
                                            <td>₹{t.price}</td>
                                            <td>{t.turnaroundTime}</td>
                                            <td>
                                                <button className="btn btn-danger btn-sm" onClick={() => handleRemove(t._id)}>🗑 Remove</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="empty-state">
                            <div className="empty-icon">🧪</div>
                            <h3>Your catalog is empty</h3>
                            <p>Offer tests to patients by adding them to your catalog.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
