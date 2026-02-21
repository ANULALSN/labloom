import { useState } from 'react';
import api from '../api/client';
import { useToast } from './Toast';

export default function FeedbackModal({ isOpen, onClose, targetId, targetType, targetName, onSuccess }) {
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');
    const [loading, setLoading] = useState(false);
    const toast = useToast();

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!comment) return toast.error('Please add a comment');

        setLoading(true);
        try {
            await api.post('/api/feedback/submit', {
                targetId,
                targetType,
                targetName,
                rating,
                comment
            });
            toast.success('Thank you for your feedback!');
            onSuccess?.();
            onClose();
        } catch (err) {
            toast.error(err.message || 'Failed to submit feedback');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content" style={{ maxWidth: 400 }}>
                <div className="modal-header">
                    <h3>Give Feedback</h3>
                    <button className="btn-close" onClick={onClose}>✕</button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: 20 }}>
                        <p className="text-muted">Rate your experience with <strong>{targetName}</strong></p>
                    </div>

                    <div className="form-group">
                        <label>Rating</label>
                        <div className="flex gap-8" style={{ fontSize: 24 }}>
                            {[1, 2, 3, 4, 5].map(star => (
                                <span
                                    key={star}
                                    style={{ cursor: 'pointer', color: star <= rating ? '#FFD700' : '#ddd' }}
                                    onClick={() => setRating(star)}
                                >
                                    ★
                                </span>
                            ))}
                        </div>
                    </div>

                    <div className="form-group mt-16">
                        <label>Comment</label>
                        <textarea
                            className="form-input"
                            rows="4"
                            placeholder="Tell us what you liked or what can be improved..."
                            value={comment}
                            onChange={e => setComment(e.target.value)}
                        ></textarea>
                    </div>

                    <div className="modal-footer mt-24">
                        <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
                        <button type="submit" className="btn btn-primary" disabled={loading}>
                            {loading ? 'Submitting...' : 'Submit Feedback'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
