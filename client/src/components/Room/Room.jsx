/**
 * Room Component
 * Individual room cell with status-based styling
 */

import React, { memo } from 'react';
import './Room.css';

const Room = memo(function Room({ room, isJustBooked }) {
    const getStatusClass = () => {
        if (isJustBooked) return 'room--just-booked';
        if (room.occupied) return 'room--occupied';
        return 'room--available';
    };

    const getStatusText = () => {
        if (isJustBooked) return 'Just Booked';
        if (room.occupied) return 'Occupied';
        return 'Available';
    };

    return (
        <div
            className={`room ${getStatusClass()}`}
            data-tooltip={`Room ${room.id} — ${getStatusText()}`}
        >
            {room.id}
        </div>
    );
});

export default Room;
