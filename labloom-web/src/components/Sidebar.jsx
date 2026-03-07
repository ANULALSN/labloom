import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

const navConfig = {
    admin: {
        label: 'Admin',
        items: [
            { icon: '', label: 'Dashboard', path: '/admin' },
            { icon: '', label: 'User Management', path: '/admin/users' },
            { icon: '', label: 'Pending Approvals', path: '/admin/approvals' },
            { icon: '', label: 'Platform Reviews', path: '/admin/reviews' },
        ]
    },
    doctor: {
        label: 'Doctor',
        items: [
            { icon: '', label: 'Appointments', path: '/doctor' },
            { icon: '', label: 'My Patients', path: '/doctor/patients' },
            { icon: '', label: 'Verify Reports', path: '/doctor/verify-reports' },
            { icon: '', label: 'Manage Slots', path: '/doctor/slots' },
            { icon: '', label: 'Messages', path: '/doctor/chat' },
            { icon: '', label: 'Reviews', path: '/doctor/reviews' },
        ]
    },
    hospital: {
        label: 'Hospital',
        items: [
            { icon: '', label: 'Dashboard', path: '/hospital' },
            { icon: '', label: 'Doctors', path: '/hospital/doctors' },
            { icon: '', label: 'Slot Management', path: '/hospital/slots' },
            { icon: '', label: 'Appointments', path: '/hospital/appointments' },
            { icon: '', label: 'Finance', path: '/hospital/finance' },
            { icon: '', label: 'Reviews', path: '/hospital/reviews' },
        ]
    },
    lab: {
        label: 'Laboratory',
        items: [
            { icon: '', label: 'Dashboard', path: '/lab' },
            { icon: '', label: 'Bookings', path: '/lab/bookings' },
            { icon: '', label: 'Manage Tests', path: '/lab/tests' },
            { icon: '', label: 'Reviews', path: '/lab/reviews' },
        ]
    },
};

export default function Sidebar() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const config = navConfig[user?.role] || navConfig.patient;

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <aside className="sidebar">
            <div className="sidebar-logo">
                <img src="/logo.png" alt="Labloom" style={{ width: 32, height: 32 }} />
                <div>
                    <h2>Labloom</h2>
                    <span className="role-badge">{config.label}</span>
                </div>
            </div>

            <nav className="sidebar-nav">
                <div className="nav-group-label">Navigation</div>
                {config.items.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        end={item.path === `/${user?.role}` || item.path === '/admin'}
                        className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                    >
                        <span className="nav-icon">{item.icon}</span>
                        {item.label}
                    </NavLink>
                ))}
            </nav>

            <div className="sidebar-footer">
                <div className="sidebar-user">
                    <div className="avatar">{(user?.name || 'U')[0].toUpperCase()}</div>
                    <div className="user-info">
                        <div className="user-name">{user?.name || 'User'}</div>
                        <div className="user-role">{user?.role || 'guest'}</div>
                    </div>
                    <button className="btn-icon" onClick={handleLogout} title="Logout" style={{ fontSize: 13, color: '#ef4444' }}>Logout</button>
                </div>
            </div>
        </aside>
    );
}
