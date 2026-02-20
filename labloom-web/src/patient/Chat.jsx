import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../api/client';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import { useAuth } from '../auth/AuthContext';
import { useToast } from '../components/Toast';

export default function Chat() {
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
        api.get('/api/patients/appointments/me')
            .then(data => {
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
                <Topbar title="Chat" />
                <div className="page">
                    <div className="page-header">
                        <h1>💬 Chat</h1>
                        <p>Message your doctor within 7 days of appointment completion</p>
                    </div>

                    {!activeBooking ? (
                        <div className="card">
                            <h3 className="mb-16">Select an appointment to chat</h3>
                            {bookings.length > 0 ? (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                    {bookings.map(b => (
                                        <div key={b._id} className="flex-between" style={{ padding: '12px 16px', background: 'var(--bg-input)', borderRadius: 'var(--radius)', cursor: 'pointer', border: '1px solid var(--border)' }} onClick={() => setActiveBooking(b)}>
                                            <div>
                                                <div className="fw-600 text-sm">{b.bookingType === 'doctor' ? '🩺 Doctor Visit' : '🧪 Lab Test'}</div>
                                                <div className="text-muted" style={{ fontSize: 11 }}>{new Date(b.date).toLocaleDateString()} • {b.status}</div>
                                            </div>
                                            <span className="badge badge-primary">Chat →</span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="empty-state"><div className="empty-icon">💬</div><h3>No active chats</h3><p>You need a confirmed/completed appointment to chat</p></div>
                            )}
                        </div>
                    ) : (
                        <>
                            <div className="flex-between mb-16">
                                <div>
                                    <span className="fw-600">{activeBooking.bookingType === 'doctor' ? '🩺 Doctor Visit' : '🧪 Lab Test'}</span>
                                    <span className="text-muted text-sm"> — {new Date(activeBooking.date).toLocaleDateString()}</span>
                                </div>
                                <button className="btn btn-secondary btn-sm" onClick={() => setActiveBooking(null)}>← Back</button>
                            </div>

                            <div className="chat-container">
                                <div className="chat-messages">
                                    {messages.length === 0 && (
                                        <div className="text-center text-muted" style={{ padding: 40 }}>No messages yet. Start the conversation!</div>
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

                                <form className="chat-input-bar" onSubmit={sendMessage}>
                                    <input
                                        type="text"
                                        placeholder="Type a message..."
                                        value={newMsg}
                                        onChange={e => setNewMsg(e.target.value)}
                                        autoFocus
                                    />
                                    <button className="btn btn-primary" type="submit" disabled={sending}>
                                        {sending ? '⏳' : '📤'} Send
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
