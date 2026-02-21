import { useState, useEffect } from 'react';
import api from '../api/client';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import { useToast } from '../components/Toast';

export default function AdminReviews() {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const toast = useToast();

    useEffect(() => {
        api.get('/api/feedback/all')
            .then(data => setReviews(Array.isArray(data) ? data : []))
            .catch(() => {
                toast.error('Failed to load reviews');
                setReviews([]);
            })
            .finally(() => setLoading(false));
    }, []);

    const renderStars = (rating) => {
        return (
            <div className="flex gap-4" style={{ color: '#FFD700', fontSize: 14 }}>
                {[1, 2, 3, 4, 5].map(star => (
                    <span key={star}>{star <= rating ? '★' : '☆'}</span>
                ))}
            </div>
        );
    };

    const getTargetInfo = (rev) => {
        if (rev.targetName) {
            const typeMap = { doctor: 'Doctor', lab: 'Lab', hospital: 'Hospital' };
            return { name: rev.targetName, type: typeMap[rev.targetType] || 'Service' };
        }
        if (rev.doctor) return { name: `Dr. ${rev.doctor.name || 'External'}`, type: 'Doctor' };
        if (rev.lab) return { name: rev.lab.name || 'Facility', type: 'Lab' };
        if (rev.hospital) return { name: rev.hospital.name || 'Hospital', type: 'Hospital' };

        // Fallback for when populations fail but we have the targetType
        if (rev.targetType) {
            const typeMap = { doctor: 'Doctor', lab: 'Lab', hospital: 'Hospital' };
            return { name: `Pending Sync (${rev.targetType})`, type: typeMap[rev.targetType] };
        }

        return { name: 'Health Service', type: 'Service' };
    };

    return (
        <div className="app-layout">
            <Sidebar />
            <div className="main-content">
                <Topbar title="Review Management" />
                <div className="page">
                    <div className="page-header">
                        <h1>⭐ Platform Reviews</h1>
                        <p>Monitor patient feedback for all providers on the platform</p>
                    </div>

                    {loading ? (
                        <div className="flex-center" style={{ padding: 60 }}><div className="spinner"></div></div>
                    ) : reviews.length > 0 ? (
                        <div className="card shadow-sm">
                            <table className="data-table">
                                <thead>
                                    <tr>
                                        <th>Patient</th>
                                        <th>Target Service</th>
                                        <th>Rating</th>
                                        <th>Comment</th>
                                        <th>Date</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {reviews.map(rev => {
                                        const target = getTargetInfo(rev);
                                        return (
                                            <tr key={rev._id}>
                                                <td>
                                                    <div className="fw-600">{rev.user?.name || 'User'}</div>
                                                    <div className="text-muted text-sm">{rev.user?.email || 'No email'}</div>
                                                </td>
                                                <td>
                                                    <div className="fw-600">{target.name}</div>
                                                    <span className="badge badge-info">{target.type}</span>
                                                </td>
                                                <td>{renderStars(rev.rating)}</td>
                                                <td style={{ maxWidth: 300, fontSize: 13, color: 'var(--text-secondary)' }}>
                                                    {rev.comment}
                                                </td>
                                                <td className="text-sm">
                                                    {new Date(rev.createdAt).toLocaleDateString()}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="empty-state">
                            <div className="empty-icon">⭐</div>
                            <h3>No feedback yet</h3>
                            <p>All reviews from patients will appear here.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
