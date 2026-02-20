import { useAuth } from '../auth/AuthContext';

export default function Topbar({ title }) {
    const { user } = useAuth();

    return (
        <div className="topbar">
            <div className="topbar-title">{title || 'Dashboard'}</div>
            <div className="topbar-actions">
                <span className="text-sm text-muted">Welcome, {user?.name || 'User'}</span>
            </div>
        </div>
    );
}
