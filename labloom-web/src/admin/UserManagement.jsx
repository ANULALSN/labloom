import { useState, useEffect } from 'react';
import api from '../api/client';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import { useToast } from '../components/Toast';

export default function UserManagement() {
    const [users, setUsers] = useState([]);
    const [roleFilter, setRoleFilter] = useState('');
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);
    const toast = useToast();

    const fetchUsers = async () => {
        setLoading(true);
        try {
            let url = '/api/admin/users';
            const params = [];
            if (roleFilter) params.push(`role=${roleFilter}`);
            if (search) params.push(`search=${search}`);
            if (params.length) url += '?' + params.join('&');
            const data = await api.get(url);
            // API returns { users: [...], totalPages, currentPage, total }
            setUsers(Array.isArray(data.users) ? data.users : Array.isArray(data) ? data : []);
        } catch {
            setUsers([]);
        }
        setLoading(false);
    };

    useEffect(() => { fetchUsers(); }, [roleFilter]);

    const toggleStatus = async (userId, isActive) => {
        try {
            await api.patch(`/api/admin/users/${userId}/status`, { isActive: !isActive });
            toast.success(`User ${!isActive ? 'activated' : 'suspended'}`);
            fetchUsers();
        } catch (err) {
            toast.error(err.message);
        }
    };

    const deleteUser = async (userId) => {
        if (!window.confirm("Are you sure you want to permanently delete this user? This action cannot be undone.")) return;
        try {
            await api.delete(`/api/admin/users/${userId}`);
            toast.success('User deleted successfully');
            fetchUsers();
        } catch (err) {
            toast.error(err.message || 'Failed to delete user');
        }
    };

    const getRoleBadge = (role) => {
        const map = { patient: 'badge-info', doctor: 'badge-primary', hospital: 'badge-success', lab: 'badge-warning', admin: 'badge-danger' };
        return <span className={`badge ${map[role] || 'badge-info'}`}>{role}</span>;
    };

    return (
        <div className="app-layout">
            <Sidebar />
            <div className="main-content">
                <Topbar title="User Management" />
                <div className="page">
                    <div className="page-header">
                        <h1>👥 User Management</h1>
                        <p>View and manage all registered users</p>
                    </div>

                    <div className="card mb-24">
                        <div className="flex gap-12" style={{ flexWrap: 'wrap' }}>
                            <input
                                type="text"
                                className="form-input"
                                placeholder="Search by name or phone..."
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && fetchUsers()}
                                style={{ maxWidth: 300 }}
                            />
                            <select className="form-select" value={roleFilter} onChange={e => setRoleFilter(e.target.value)} style={{ maxWidth: 160 }}>
                                <option value="">All Roles</option>
                                <option value="patient">Patient</option>
                                <option value="doctor">Doctor</option>
                                <option value="hospital">Hospital</option>
                                <option value="lab">Lab</option>
                            </select>
                            <button className="btn btn-secondary btn-sm" onClick={fetchUsers}>🔍 Search</button>
                        </div>
                    </div>

                    <div className="card">
                        {loading ? (
                            <div className="flex-center" style={{ padding: 40 }}><div className="spinner"></div></div>
                        ) : users.length > 0 ? (
                            <table className="data-table">
                                <thead>
                                    <tr>
                                        <th>Name</th>
                                        <th>Phone</th>
                                        <th>Email</th>
                                        <th>Role</th>
                                        <th>Status</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.map(u => (
                                        <tr key={u._id}>
                                            <td className="fw-600">{u.name}</td>
                                            <td>{u.phone || '—'}</td>
                                            <td className="text-muted">{u.email || '—'}</td>
                                            <td>{getRoleBadge(u.role)}</td>
                                            <td>
                                                <span className={`badge ${u.isActive !== false ? 'badge-success' : 'badge-danger'}`}>
                                                    {u.isActive !== false ? 'Active' : 'Suspended'}
                                                </span>
                                            </td>
                                            <td>
                                                <div className="flex gap-8">
                                                    <button
                                                        className={`btn btn-sm ${u.isActive !== false ? 'btn-warning' : 'btn-success'}`}
                                                        style={{ minWidth: 80 }}
                                                        onClick={() => toggleStatus(u._id, u.isActive !== false)}
                                                    >
                                                        {u.isActive !== false ? 'Suspend' : 'Activate'}
                                                    </button>

                                                    {u.role !== 'admin' && (
                                                        <button
                                                            className="btn btn-sm btn-danger"
                                                            onClick={() => deleteUser(u._id)}
                                                        >
                                                            Delete
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            <div className="empty-state">
                                <div className="empty-icon">👥</div>
                                <h3>No users found</h3>
                                <p>Try adjusting your search or filter</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
