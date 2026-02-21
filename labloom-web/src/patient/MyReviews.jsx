import { useState, useEffect } from 'react';
import api from '../api/client';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';

export default function MyReviews() {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('/api/feedback/my')
            .then(data => setReviews(Array.isArray(data) ? data : []))
            .catch(() => setReviews([]))
            .finally(() => setLoading(false));
    }, []);

    const renderStars = (rating) => {
        return (
            <div className="flex gap-4" style={{ color: '#FFD700', fontSize: 16 }}>
                {[1, 2, 3, 4, 5].map(star => (
                    <span key={star}>{star <= rating ? '★' : '☆'}</span>
                ))}
            </div>
        );
    };

    const getTargetInfo = (rev) => {
        if (rev.doctor) return { name: `Dr. ${rev.doctor.name}`, type: 'Doctor' };
        if (rev.lab) return { name: rev.lab.name, type: 'Laboratory' };
        if (rev.hospital) return { name: rev.hospital.name, type: 'Hospital' };
        return { name: 'Health Service', type: 'Service' };
    };

    return (
        <div className="app-layout">
            <Sidebar />
            <div className="main-content">
                <Topbar title="My Activity" />
                <div className="page">
                    <div className="page-header">
                        <h1>⭐ My Feedback</h1>
                        <p>A history of all reviews and ratings you've shared</p>
                    </div>

                    {loading ? (
                        <div className="flex-center" style={{ padding: 60 }}><div className="spinner"></div></div>
                    ) : reviews.length > 0 ? (
                        <div className="grid-2">
                            {reviews.map(rev => {
                                const target = getTargetInfo(rev);
                                return (
                                    <div key={rev._id} className="card">
                                        <div className="flex-between mb-12">
                                            <div>
                                                <div className="fw-600">{target.name}</div>
                                                <div className="text-muted text-sm">{target.type} • {new Date(rev.createdAt).toLocaleDateString()}</div>
                                            </div>
                                            {renderStars(rev.rating)}
                                        </div>
                                        <p className="text-secondary" style={{ fontStyle: 'italic' }}>"{rev.comment}"</p>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="empty-state">
                            <div className="empty-icon">⭐</div>
                            <h3>No reviews yet</h3>
                            <p>Once you complete appointments, you can leave feedback for doctors and labs.</p>
                            <a href="/patient/appointments" className="btn btn-primary mt-16">Go to My Appointments</a>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
