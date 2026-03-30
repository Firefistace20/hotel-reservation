/**
 * HotelGrid Component
 * Renders the floor plan with lift shaft and room grid
 */

import React, { useMemo } from 'react';
import Room from '../Room';
import HOTEL_CONFIG from '../../config/hotelConfig';
import './HotelGrid.css';

export default function HotelGrid({ rooms, justBookedIds = [] }) {
    const bookedSet = useMemo(() => new Set(justBookedIds), [justBookedIds]);

    // Build room lookup by ID for quick access
    const roomMap = useMemo(() => {
        const map = new Map();
        if (rooms) {
            rooms.forEach(room => map.set(room.id, room));
        }
        return map;
    }, [rooms]);

    // Generate floor data (rendered top to bottom: F10 → F1)
    const floors = useMemo(() => {
        const result = [];
        for (let floor = HOTEL_CONFIG.floors; floor >= 1; floor--) {
            const roomCount = HOTEL_CONFIG.roomsPerFloor[floor - 1];
            const floorRooms = [];

            for (let pos = 1; pos <= roomCount; pos++) {
                const roomId = HOTEL_CONFIG.getRoomId(floor, pos);
                floorRooms.push(roomMap.get(roomId) || {
                    id: roomId,
                    floor,
                    position: pos,
                    occupied: false
                });
            }

            result.push({ floor, rooms: floorRooms, roomCount });
        }
        return result;
    }, [roomMap]);

    return (
        <div className="hotel-wrapper">
            <div className="hotel-title">Floor Plan</div>
            <div className="hotel-grid">
                {/* Lift Shaft */}
                <div className="lift-shaft">
                    <div className="lift-label">Lift</div>
                    {floors.map(({ floor }) => (
                        <div key={floor} className="lift-floor">
                            F{floor}
                        </div>
                    ))}
                </div>

                {/* Room Grid */}
                <div className="floors-container">
                    {floors.map(({ floor, rooms: floorRooms, roomCount }) => (
                        <div key={floor} className="floor-row">
                            {floorRooms.map(room => (
                                <Room
                                    key={room.id}
                                    room={room}
                                    isJustBooked={bookedSet.has(room.id)}
                                />
                            ))}
                            {/* Add spacers for floor 10 (7 rooms → pad to 10) */}
                            {roomCount < 10 && Array.from({ length: 10 - roomCount }).map((_, i) => (
                                <div key={`spacer-${floor}-${i}`} className="room-spacer" />
                            ))}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
