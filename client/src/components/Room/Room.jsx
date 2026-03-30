/**
 * Room Component
 * Individual room cell with status-based styling
 */

import React, { memo } from 'react';
import './Room.css';

const Room = memo(function Room({ room, isJustBooked, filterStatus }) {
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

    let isMatch = true;
    if (filterStatus) {
        if (filterStatus === 'Available') isMatch = !room.occupied && !isJustBooked;
        else if (filterStatus === 'Occupied') isMatch = room.occupied && !isJustBooked;
        else if (filterStatus === 'Just Booked') isMatch = isJustBooked;
    }

    return (
        <div
            className={`room ${getStatusClass()} ${!isMatch ? 'room--dimmed' : ''}`}
            data-tooltip={`Room ${room.id} — ${getStatusText()}`}
        >
            {room.id}
        </div>
    );
});

export default Room;
