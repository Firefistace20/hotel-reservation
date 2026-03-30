/**
 * App Component
 * Main container wiring header, stats, controls, status, hotel grid, and legend
 */

import React, { useState, useCallback } from 'react';
import { useHotelRooms, useStatusMessage } from './hooks/useHotelRooms';
import HotelGrid from './components/HotelGrid';
import StatusMessage from './components/StatusMessage';
import StatCard from './components/StatCard';
import Legend from './components/Legend';
import './App.css';

export default function App() {
    const {
        rooms,
        stats,
        loading,
        lastBooking,
        bookRooms,
        setRandomOccupancy,
        resetRooms
    } = useHotelRooms();

    const { status, showSuccess, showError, showInfo, clear: clearStatus } = useStatusMessage();
    const [roomCount, setRoomCount] = useState(3);
    const [actionLoading, setActionLoading] = useState(false);

    const handleBook = useCallback(async () => {
        const count = parseInt(roomCount, 10);
        if (isNaN(count) || count < 1 || count > 5) {
            showError('Enter a number between 1 and 5');
            return;
        }

        setActionLoading(true);
        try {
            const result = await bookRooms(count);
            const floorInfo = result.floor
                ? `Floor ${result.floor}`
                : `Floors ${result.floors?.join(', ')}`;
            showSuccess(
                `Booked rooms ${result.rooms.join(', ')} — ${result.strategy} (${floorInfo}) — ${result.travelTime} min travel`
            );
        } catch (err) {
            showError(err.message || 'Booking failed');
        } finally {
            setActionLoading(false);
        }
    }, [roomCount, bookRooms, showSuccess, showError]);

    const handleRandom = useCallback(async () => {
        setActionLoading(true);
        await setRandomOccupancy(0.4);
        showInfo('Random occupancy generated (~40%)');
        setActionLoading(false);
    }, [setRandomOccupancy, showInfo]);

    const handleReset = useCallback(async () => {
        setActionLoading(true);
        await resetRooms();
        showInfo('All rooms reset to available');
        setActionLoading(false);
    }, [resetRooms, showInfo]);

    const justBookedIds = lastBooking?.rooms || [];

    if (loading) {
        return (
            <div className="app-loading">
                <div className="app-loading__spinner" />
                <p>Loading hotel data...</p>
            </div>
        );
    }

    return (
        <div className="app">
            {/* Header */}
            <header className="app-header">
                <h1 className="app-header__title">🏨 Hotel Room Reservation</h1>
                <p className="app-header__subtitle">
                    97 rooms across 10 floors · Optimal allocation with travel time minimization
                </p>
            </header>

            {/* Stats Bar */}
            <div className="stats-bar">
                <StatCard label="Total Rooms" value={stats?.total ?? 97} color="accent" />
                <StatCard label="Available" value={stats?.available ?? '—'} color="green" />
                <StatCard label="Occupied" value={stats?.occupied ?? '—'} color="red" />
                <StatCard
                    label="Travel Time"
                    value={lastBooking ? `${lastBooking.travelTime} min` : '—'}
                    color="blue"
                />
            </div>

            {/* Controls */}
            <div className="controls">
                <div className="controls__input-group">
                    <label htmlFor="roomCount">Rooms:</label>
                    <input
                        id="roomCount"
                        type="number"
                        min="1"
                        max="5"
                        value={roomCount}
                        onChange={(e) => setRoomCount(e.target.value)}
                        disabled={actionLoading}
                    />
                </div>
                <button
                    className="btn btn--primary"
                    onClick={handleBook}
                    disabled={actionLoading}
                >
                    {actionLoading ? 'Booking...' : 'Book Rooms'}
                </button>
                <button
                    className="btn"
                    onClick={handleRandom}
                    disabled={actionLoading}
                >
                    🎲 Random
                </button>
                <div className="controls__spacer" />
                <button
                    className="btn btn--danger"
                    onClick={handleReset}
                    disabled={actionLoading}
                >
                    Reset All
                </button>
            </div>

            {/* Status Message */}
            <StatusMessage status={status} onDismiss={clearStatus} />

            {/* Hotel Floor Plan */}
            <HotelGrid rooms={rooms} justBookedIds={justBookedIds} />

            {/* Legend */}
            <Legend />

            {/* Booking Details */}
            {lastBooking && (
                <div className="booking-details">
                    <div className="booking-details__title">Last Booking</div>
                    <div className="booking-details__grid">
                        <div className="booking-details__item">
                            <span className="booking-details__label">Booking ID</span>
                            <span className="booking-details__value">{lastBooking.bookingId}</span>
                        </div>
                        <div className="booking-details__item">
                            <span className="booking-details__label">Strategy</span>
                            <span className="booking-details__badge">{lastBooking.strategy}</span>
                        </div>
                        <div className="booking-details__item">
                            <span className="booking-details__label">Rooms</span>
                            <span className="booking-details__value">{lastBooking.rooms?.join(', ')}</span>
                        </div>
                        <div className="booking-details__item">
                            <span className="booking-details__label">Travel Time</span>
                            <span className="booking-details__value">{lastBooking.travelTime} min</span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
