/**
 * StatusMessage Component
 * Animated alert banner for success/error/info messages
 */

import React from 'react';
import './StatusMessage.css';

const ICONS = {
    success: '✓',
    error: '✕',
    info: 'ℹ'
};

export default function StatusMessage({ status, onDismiss }) {
    if (!status) return null;

    return (
        <div className={`status-message status-message--${status.type}`}>
            <span className="status-message__icon">{ICONS[status.type] || 'ℹ'}</span>
            <span className="status-message__text">{status.message}</span>
            {onDismiss && (
                <button className="status-message__close" onClick={onDismiss} aria-label="Dismiss">
                    ×
                </button>
            )}
        </div>
    );
}
