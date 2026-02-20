import { Navigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

export default function ProtectedRoute({ children, allowedRoles }) {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div className="loading-page">
                <div className="spinner"></div>
                <p>Loading...</p>
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    if (allowedRoles && !allowedRoles.includes(user.role)) {
        // Redirect to the user's own portal
        const portalMap = { admin: '/admin', patient: '/patient', doctor: '/doctor', hospital: '/hospital' };
        return <Navigate to={portalMap[user.role] || '/login'} replace />;
    }

    return children;
}
