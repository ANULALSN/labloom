import React from 'react';

export default function HealthInfoModal({ patient, onClose }) {
    if (!patient) return null;

    const hp = patient.healthProfile || {};
    const ls = patient.lifestyle || {};

    return (
        <div className="modal-overlay">
            <div className="modal-content" style={{ maxWidth: 600 }}>
                <div className="modal-header">
                    <h2>🩺 Patient Health Profile</h2>
                    <button className="close-btn" onClick={onClose}>&times;</button>
                </div>
                <div className="modal-body">
                    <div className="flex gap-16 mb-24 align-center">
                        <div className="avatar" style={{ width: 64, height: 64, borderRadius: '50%', background: '#27ae9e', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, fontWeight: 700 }}>
                            {patient.name?.[0] || 'P'}
                        </div>
                        <div>
                            <h3 style={{ margin: 0 }}>{patient.name}</h3>
                            <p className="text-muted" style={{ margin: 4 }}>{patient.phone} • {patient.email || 'No email'}</p>
                        </div>
                    </div>

                    <div className="grid-2">
                        <div className="info-section">
                            <h4 className="text-primary mb-12">🏃 Lifestyle</h4>
                            <div className="info-row"><strong>Smoking:</strong> {ls.smoking || 'N/A'}</div>
                            <div className="info-row"><strong>Alcohol:</strong> {ls.alcohol || 'N/A'}</div>
                            <div className="info-row"><strong>Activity:</strong> {ls.activityLevel || 'N/A'}</div>
                        </div>
                        <div className="info-section">
                            <h4 className="text-primary mb-12">❤️ Vitals</h4>
                            <div className="info-row"><strong>Blood Type:</strong> {hp.bloodType}{hp.rhFactor === '+' ? '+' : hp.rhFactor === '-' ? '-' : ''}</div>
                            <div className="info-row"><strong>Height:</strong> {hp.height ? `${hp.height} cm` : 'N/A'}</div>
                            <div className="info-row"><strong>Weight:</strong> {hp.weight ? `${hp.weight} kg` : 'N/A'}</div>
                            <div className="info-row"><strong>BP:</strong> {hp.bloodPressure?.systolic}/{hp.bloodPressure?.diastolic} mmHg</div>
                        </div>
                    </div>

                    <div className="info-section mt-24">
                        <h4 className="text-primary mb-12">⚠️ Medical Alerts</h4>
                        <div className="card" style={{ background: '#fff5f5', borderColor: '#feb2b2' }}>
                            <div className="mb-8"><strong>Allergies:</strong> {hp.allergies || 'None reported'}</div>
                            <div><strong>Chronic Conditions:</strong> {hp.chronicConditions || 'None reported'}</div>
                        </div>
                    </div>
                </div>
                <div className="modal-footer">
                    <button className="btn btn-secondary" onClick={onClose}>Close</button>
                </div>
            </div>
            <style jsx>{`
                .info-row {
                    margin-bottom: 8px;
                    font-size: 14px;
                    color: #4a5568;
                }
                .info-row strong {
                    color: #1a202c;
                    width: 100px;
                    display: inline-block;
                }
                .info-section h4 {
                    font-size: 16px;
                    border-bottom: 2px solid #e2e8f0;
                    padding-bottom: 8px;
                }
            `}</style>
        </div>
    );
}
