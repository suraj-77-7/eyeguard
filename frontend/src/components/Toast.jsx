import React, { useEffect, useState } from 'react';

const icons = { success: '✅', error: '❌', warning: '⚠️', info: 'ℹ️' };
const colors = { success: '#22c55e', error: '#ef4444', warning: '#f59e0b', info: '#3b82f6' };

export default function Toast({ message, type = 'info', onClose }) {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        requestAnimationFrame(() => setVisible(true));

        const timer = setTimeout(() => {
            setVisible(false);
            if (onClose) setTimeout(onClose, 300);
        }, 3500);

        return () => clearTimeout(timer);
    }, [onClose]);

    const handleClose = () => {
        setVisible(false);
        if (onClose) setTimeout(onClose, 300);
    };

    return (
        <div
            style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '14px 20px',
                borderRadius: 14,
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(16px)',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
                borderLeft: `4px solid ${colors[type] || colors.info}`,
                transform: visible ? 'translateX(0)' : 'translateX(120%)',
                opacity: visible ? 1 : 0,
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                minWidth: 280,
                maxWidth: 400,
                cursor: 'pointer',
            }}
            onClick={handleClose}
        >
            <span style={{ fontSize: '1.2rem' }}>{icons[type] || icons.info}</span>
            <span style={{ fontSize: '0.9rem', fontWeight: 500, color: '#1e293b' }}>{message}</span>
        </div>
    );
}