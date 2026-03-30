/**
 * Custom Hooks for Hotel Reservation
 */

import { useState, useCallback, useEffect } from 'react';
import api, { ApiError } from '../services/api';

/**
 * Hook for managing hotel room state
 */
export function useHotelRooms() {
    const [rooms, setRooms] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [lastBooking, setLastBooking] = useState(null);

    const clearError = useCallback(() => setError(null), []);

    const fetchRooms = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const [roomsData, statsData] = await Promise.all([
                api.getAllRooms(),
                api.getStats()
            ]);

            setRooms(roomsData.rooms);
            setStats(statsData);
        } catch (err) {
            setError(err instanceof ApiError ? err.message : 'Failed to fetch rooms');
        } finally {
            setLoading(false);
        }
    }, []);

    const bookRooms = useCallback(async (count) => {
        try {
            setError(null);

            const result = await api.bookRooms(count);
            setLastBooking(result);

            await fetchRooms();

            return result;
        } catch (err) {
            const message = err instanceof ApiError ? err.message : 'Booking failed';
            setError(message);
            throw err;
        }
    }, [fetchRooms]);

    const setRandomOccupancy = useCallback(async (probability = 0.4) => {
        try {
            setError(null);
            setLastBooking(null);

            await api.setRandomOccupancy(probability);
            await fetchRooms();
        } catch (err) {
            setError(err instanceof ApiError ? err.message : 'Failed to set random occupancy');
        }
    }, [fetchRooms]);

    const resetRooms = useCallback(async () => {
        try {
            setError(null);
            setLastBooking(null);

            await api.resetRooms();
            await fetchRooms();
        } catch (err) {
            setError(err instanceof ApiError ? err.message : 'Failed to reset rooms');
        }
    }, [fetchRooms]);

    useEffect(() => {
        fetchRooms();
    }, [fetchRooms]);

    return {
        rooms,
        stats,
        loading,
        error,
        lastBooking,
        bookRooms,
        setRandomOccupancy,
        resetRooms,
        clearError,
        refresh: fetchRooms
    };
}

/**
 * Hook for managing status messages
 */
export function useStatusMessage() {
    const [status, setStatus] = useState(null);

    const showSuccess = useCallback((message) => {
        setStatus({ type: 'success', message });
    }, []);

    const showError = useCallback((message) => {
        setStatus({ type: 'error', message });
    }, []);

    const showInfo = useCallback((message) => {
        setStatus({ type: 'info', message });
    }, []);

    const clear = useCallback(() => {
        setStatus(null);
    }, []);

    return { status, showSuccess, showError, showInfo, clear };
}
