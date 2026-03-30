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

export default function Legend({ filterStatus, onFilterClick }) {
    const handleLegendClick = (label) => {
        // Toggle filter off if clicking the already active filter
        if (filterStatus === label) {
            onFilterClick(null);
        } else {
            onFilterClick(label);
        }
    };

    return (
        <div className="legend">
            {LEGEND_ITEMS.map(item => {
                const isActive = filterStatus === item.label;
                const isDimmed = filterStatus && !isActive;

                return (
                    <div
                        key={item.label}
                        className={`legend__item ${isActive ? 'legend__item--active' : ''} ${isDimmed ? 'legend__item--dimmed' : ''}`}
                        onClick={() => handleLegendClick(item.label)}
                        role="button"
                        tabIndex={0}
                        title={`Click to filter by ${item.label}`}
                    >
                        <div className={`legend__dot ${item.className}`} />
                        <span className="legend__text">{item.label}</span>
                    </div>
                );
            })}
        </div>
    );
}
