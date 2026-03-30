/**
 * StatCard Component
 * Dashboard statistics card with label, value, and color accent
 */

import React from 'react';
import './StatCard.css';

export default function StatCard({ label, value, color = 'default' }) {
    return (
        <div className="stat-card">
            <div className="stat-card__label">{label}</div>
            <div className={`stat-card__value stat-card__value--${color}`}>
                {value}
            </div>
        </div>
    );
}
