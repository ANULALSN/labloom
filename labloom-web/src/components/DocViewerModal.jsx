import { useEffect, useMemo } from 'react';

/**
 * Normalise a Cloudinary URL so it can be viewed inline (not downloaded).
 * 
 * 1. Strip `fl_attachment` flag that forces browser download
 * 2. Add a cache-buster `?v=<timestamp>` to prevent stale cached binary responses
 * 3. Ensure correct file extension for the resource type
 */
function normalizeCloudinaryUrl(rawUrl) {
    if (!rawUrl) return rawUrl;
    let url = rawUrl;

    // Remove fl_attachment (and optional :filename) from transformation chain
    url = url.replace(/\/?fl_attachment(:[^/,]*)?(,|\/)/g, '$2');
    // Also handle as a query parameter
    url = url.replace(/[?&]fl_attachment(=[^&]*)?/g, '');

    // Add cache buster to force browser to re-evaluate Content-Type
    const separator = url.includes('?') ? '&' : '?';
    url += `${separator}v=${Date.now()}`;

    return url;
}

/**
 * Detect whether the Cloudinary URL points to a PDF.
 * PDFs on Cloudinary are usually stored under /raw/upload/ or end with .pdf
 */
function isPdfUrl(url) {
    if (!url) return false;
    const lower = url.toLowerCase();
    // Check the URL path
    if (lower.includes('/raw/upload/')) return true;
    // Check extension (ignore query params)
    const pathname = lower.split('?')[0];
    if (pathname.endsWith('.pdf')) return true;
    return false;
}

/**
 * Build a Google Docs Viewer fallback URL.
 * Works on Chrome mobile & other browsers where <object>/<iframe> fail for PDFs.
 */
function googleDocsViewerUrl(pdfUrl) {
    return `https://docs.google.com/viewer?url=${encodeURIComponent(pdfUrl)}&embedded=true`;
}

// ─────────────────────────────────────────────────
//  PDF Preview Sub-component
// ─────────────────────────────────────────────────
function PDFPreview({ url, name }) {
    const cleanUrl = useMemo(() => normalizeCloudinaryUrl(url), [url]);
    const fallbackUrl = useMemo(() => googleDocsViewerUrl(cleanUrl), [cleanUrl]);

    return (
        <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
            <iframe
                src={fallbackUrl}
                title={name || 'PDF Document'}
                style={{
                    width: '100%',
                    flex: 1,
                    border: 'none',
                    borderRadius: 8,
                    backgroundColor: '#fff'
                }}
            />
            <div style={{
                textAlign: 'center', padding: '8px 0', fontSize: 11,
                color: 'rgba(255,255,255,0.5)'
            }}>
                Viewing via Google Docs
            </div>
        </div>
    );
}

// ─────────────────────────────────────────────────
//  Image Preview Sub-component
// ─────────────────────────────────────────────────
function ImagePreview({ url, name }) {
    const cleanUrl = useMemo(() => normalizeCloudinaryUrl(url), [url]);

    return (
        <>
            <img
                src={cleanUrl}
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
        </>
    );
}

// ─────────────────────────────────────────────────
//  Main DocViewerModal
// ─────────────────────────────────────────────────
export default function DocViewerModal({ url, name, onClose }) {
    const isPdf = useMemo(() => isPdfUrl(url), [url]);

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
                <span style={{ fontWeight: 600, fontSize: 15, opacity: 0.9, display: 'flex', alignItems: 'center', gap: 8 }}>
                    {isPdf ? '📄' : '🖼️'} {name || 'Document'}
                    {isPdf && (
                        <span style={{
                            fontSize: 10, background: '#ef4444', color: '#fff',
                            padding: '2px 6px', borderRadius: 4, fontWeight: 700,
                            letterSpacing: 0.5
                        }}>
                            PDF
                        </span>
                    )}
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

            {/* Content Area */}
            <div
                onClick={e => e.stopPropagation()}
                style={{
                    width: '100%',
                    maxWidth: 900,
                    height: isPdf ? '80vh' : undefined,
                    maxHeight: '80vh',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: isPdf ? '#2a2a2a' : '#1a1a1a',
                    borderRadius: 12,
                    overflow: 'hidden',
                    flexDirection: 'column'
                }}
            >
                {isPdf ? (
                    <PDFPreview url={url} name={name} />
                ) : (
                    <ImagePreview url={url} name={name} />
                )}
            </div>

            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12, marginTop: 10 }}>
                Click outside or press Esc to close
            </p>
        </div>
    );
}
