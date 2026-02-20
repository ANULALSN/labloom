import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../api/client';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import { useAuth } from '../auth/AuthContext';
import { useToast } from '../components/Toast';

export default function DoctorChat() {
    const [bookings, setBookings] = useState([]);
    const [activeBooking, setActiveBooking] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMsg, setNewMsg] = useState('');
    const [sending, setSending] = useState(false);
    const { user } = useAuth();
    const toast = useToast();
    const messagesEnd = useRef(null);
    const [searchParams] = useSearchParams();

    useEffect(() => {
        // Doctors visit their appointments
        api.get('/api/doctor/appointments')
            .then(data => {
                // Backend returns a flat array of appointments
                const active = (Array.isArray(data) ? data : []).filter(b => ['confirmed', 'completed'].includes(b.status));
                setBookings(active);
                const preselect = searchParams.get('bookingId');
                if (preselect) {
                    const found = active.find(b => b._id === preselect);
                    if (found) setActiveBooking(found);
                }
            }).catch(() => setBookings([]));
    }, []);

    useEffect(() => {
        if (!activeBooking) return;
        loadMessages();
        const interval = setInterval(loadMessages, 5000);
        return () => clearInterval(interval);
    }, [activeBooking]);

    const loadMessages = async () => {
        try {
            const data = await api.get(`/api/chat/${activeBooking._id}`);
            setMessages(Array.isArray(data) ? data : []);
            setTimeout(() => messagesEnd.current?.scrollIntoView({ behavior: 'smooth' }), 100);
        } catch { }
    };

    const sendMessage = async (e) => {
        e.preventDefault();
        if (!newMsg.trim()) return;
        setSending(true);
        try {
            await api.post('/api/chat/send', { bookingId: activeBooking._id, content: newMsg });
            setNewMsg('');
            loadMessages();
        } catch (err) {
            toast.error(err.message);
        }
        setSending(false);
    };

    return (
        <div className="app-layout">
            <Sidebar />
            <div className="main-content">
                <Topbar title="Patient Chat" />
                <div className="page">
                    <div className="page-header">
                        <h1>💬 Messages</h1>
                        <p>Chat with your patients regarding their appointments</p>
                    </div>

                    {!activeBooking ? (
                        <div className="card shadow-sm">
                            <h3 className="mb-16">Select a patient to chat</h3>
                            {bookings.length > 0 ? (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                    {bookings.map(b => (
                                        <div key={b._id} className="flex-between" style={{ padding: '16px 20px', background: 'var(--bg-input)', borderRadius: 'var(--radius)', cursor: 'pointer', border: '1px solid var(--border)', transition: 'all 0.2s' }}
                                            onClick={() => setActiveBooking(b)}
                                            onMouseOver={(e) => e.currentTarget.style.borderColor = 'var(--accent)'}
                                            onMouseOut={(e) => e.currentTarget.style.borderColor = 'var(--border)'}
                                        >
                                            <div>
                                                <div className="fw-600 mb-4">{b.user?.name || 'Patient'}</div>
                                                <div className="text-muted" style={{ fontSize: 12 }}>
                                                    📅 {new Date(b.date).toLocaleDateString()} • {b.time} • <span className="badge badge-primary" style={{ fontSize: 10 }}>{b.status}</span>
                                                </div>
                                            </div>
                                            <div className="flex gap-12" style={{ alignItems: 'center' }}>
                                                <span className="text-accent fw-600" style={{ fontSize: 13 }}>Open Chat →</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="empty-state">
                                    <div className="empty-icon">💬</div>
                                    <h3>No active messages</h3>
                                    <p>Once patients book appointments, you can chat with them here.</p>
                                </div>
                            )}
                        </div>
                    ) : (
                        <>
                            <div className="flex-between mb-20">
                                <div className="flex gap-12" style={{ alignItems: 'center' }}>
                                    <div className="avatar" style={{ background: 'var(--accent)', color: 'white', width: 40, height: 40 }}>{(activeBooking.user?.name || 'P')[0].toUpperCase()}</div>
                                    <div>
                                        <div className="fw-700">{activeBooking.user?.name || 'Patient'}</div>
                                        <div className="text-muted text-sm">{new Date(activeBooking.date).toLocaleDateString()} at {activeBooking.time}</div>
                                    </div>
                                </div>
                                <button className="btn btn-secondary btn-sm" onClick={() => setActiveBooking(null)}>← All Messages</button>
                            </div>

                            <div className="chat-container shadow-md">
                                <div className="chat-messages">
                                    {messages.length === 0 && (
                                        <div className="text-center text-muted" style={{ padding: 60 }}>
                                            <div style={{ fontSize: 40, marginBottom: 12 }}>💬</div>
                                            No messages yet. Send a greeting to the patient!
                                        </div>
                                    )}
                                    {messages.map((m, i) => {
                                        const isSent = (m.sender?._id || m.sender) === user?._id;
                                        return (
                                            <div key={i} className={`chat-bubble ${isSent ? 'sent' : 'received'}`}>
                                                {m.content}
                                                <div className="bubble-time">{new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                                            </div>
                                        );
                                    })}
                                    <div ref={messagesEnd} />
                                </div>

                                <form className="chat-input-bar align-center" onSubmit={sendMessage}>
                                    <input
                                        type="text"
                                        className="form-input"
                                        placeholder="Type your message here..."
                                        value={newMsg}
                                        onChange={e => setNewMsg(e.target.value)}
                                        autoFocus
                                    />
                                    <button className="btn btn-primary" style={{ borderRadius: 24, padding: '10px 24px' }} type="submit" disabled={sending}>
                                        {sending ? '...' : 'Send'}
                                    </button>
                                </form>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
