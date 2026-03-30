/**
 * Legend Component
 * Color legend for room statuses
 */

import React from 'react';
import './Legend.css';

const LEGEND_ITEMS = [
    { label: 'Available', className: 'legend-dot--available' },
    { label: 'Occupied', className: 'legend-dot--occupied' },
    { label: 'Just Booked', className: 'legend-dot--booked' },
];

export default function Legend() {
    return (
        <div className="legend">
            {LEGEND_ITEMS.map(item => (
                <div key={item.label} className="legend__item">
                    <div className={`legend__dot ${item.className}`} />
                    <span className="legend__text">{item.label}</span>
                </div>
            ))}
        </div>
    );
}
