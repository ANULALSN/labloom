import { useEffect } from 'react';

export default function DocViewerModal({ url, name, onClose }) {
    useEffect(() => {
        const handleKey = (e) => { if (e.key === 'Escape') onClose(); };
        document.addEventListener('keydown', handleKey);
        return () => document.removeEventListener('keydown', handleKey);
    }, [onClose]);

    return (
        <div
            onClick={onClose}
            style={{
                position: 'fixed',
                inset: 0,
                backgroundColor: 'rgba(0,0,0,0.82)',
                zIndex: 9999,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 24
            }}
        >
            {/* Header */}
            <div
                onClick={e => e.stopPropagation()}
                style={{
                    width: '100%',
                    maxWidth: 900,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: 12,
                    color: '#fff'
                }}
            >
                <span style={{ fontWeight: 600, fontSize: 15, opacity: 0.9 }}>
                    🖼️ {name || 'Document'}
                </span>
                <div style={{ display: 'flex', gap: 8 }}>
                    <a
                        href={url}
                        download
                        target="_blank"
                        rel="noreferrer"
                        style={{
                            background: 'rgba(255,255,255,0.15)',
                            color: '#fff',
                            border: 'none',
                            borderRadius: 8,
                            padding: '6px 14px',
                            cursor: 'pointer',
                            fontSize: 13,
                            textDecoration: 'none'
                        }}
                    >
                        ⬇️ Download
                    </a>
                    <button
                        onClick={onClose}
                        style={{
                            background: 'rgba(255,255,255,0.15)',
                            color: '#fff',
                            border: 'none',
                            borderRadius: 8,
                            padding: '6px 14px',
                            cursor: 'pointer',
                            fontSize: 16
                        }}
                    >
                        ✕
                    </button>
                </div>
            </div>

            {/* Image */}
            <div
                onClick={e => e.stopPropagation()}
                style={{
                    width: '100%',
                    maxWidth: 900,
                    maxHeight: '80vh',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: '#1a1a1a',
                    borderRadius: 12,
                    overflow: 'hidden'
                }}
            >
                <img
                    src={url}
                    alt={name || 'Document'}
                    style={{
                        maxWidth: '100%',
                        maxHeight: '80vh',
                        objectFit: 'contain',
                        display: 'block'
                    }}
                    onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                    }}
                />
                <div style={{
                    display: 'none',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: 40,
                    color: '#aaa',
                    gap: 12
                }}>
                    <span style={{ fontSize: 48 }}>⚠️</span>
                    <p style={{ margin: 0, color: '#ccc' }}>Could not load image</p>
                    <a href={url} target="_blank" rel="noreferrer" style={{ color: '#60a5fa' }}>
                        Open directly →
                    </a>
                </div>
            </div>

            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12, marginTop: 10 }}>
                Click outside or press Esc to close
            </p>
        </div>
    );
}
