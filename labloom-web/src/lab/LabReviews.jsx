import { useState, useEffect } from 'react';
import api from '../api/client';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import { useAuth } from '../auth/AuthContext';

export default function LabReviews() {
    const { user } = useAuth();
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user?._id) {
            api.get(`/api/feedback/${user._id}?targetType=lab`)
                .then(data => setReviews(Array.isArray(data) ? data : []))
                .catch(() => setReviews([]))
                .finally(() => setLoading(false));
        }
    }, [user]);

    const renderStars = (rating) => {
        return (
            <div className="flex gap-4" style={{ color: '#FFD700', fontSize: 16 }}>
                {[1, 2, 3, 4, 5].map(star => (
                    <span key={star}>{star <= rating ? '★' : '☆'}</span>
                ))}
            </div>
        );
    };

    return (
        <div className="app-layout">
            <Sidebar />
            <div className="main-content">
                <Topbar title="Laboratory Reviews" />
                <div className="page">
                    <div className="page-header">
                        <h1>⭐ Laboratory Reviews</h1>
                        <p>What patients are saying about your diagnostic services</p>
                    </div>

                    {loading ? (
                        <div className="flex-center" style={{ padding: 60 }}><div className="spinner"></div></div>
                    ) : reviews.length > 0 ? (
                        <div className="grid-2">
                            {reviews.map(rev => (
                                <div key={rev._id} className="card">
                                    <div className="flex-between mb-12">
                                        <div className="flex gap-12" style={{ alignItems: 'center' }}>
                                            <div className="avatar" style={{ width: 36, height: 36, borderRadius: '50%', background: '#eee', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600 }}>
                                                {(rev.user?.name || 'P')[0]}
                                            </div>
                                            <div>
                                                <div className="fw-600">{rev.user?.name || 'Patient'}</div>
                                                <div className="text-muted text-sm">{new Date(rev.createdAt).toLocaleDateString()}</div>
                                            </div>
                                        </div>
                                        {renderStars(rev.rating)}
                                    </div>
                                    <p className="text-secondary" style={{ fontStyle: 'italic' }}>"{rev.comment}"</p>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="empty-state">
                            <div className="empty-icon">⭐</div>
                            <h3>No reviews yet</h3>
                            <p>Customer reviews will appear here.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
