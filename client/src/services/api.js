/**
 * API Service
 * Centralized API communication layer with error handling
 */

const API_BASE_URL = '/api';

/**
 * Custom API Error class
 */
class ApiError extends Error {
    constructor(message, code, status) {
        super(message);
        this.name = 'ApiError';
        this.code = code;
        this.status = status;
    }
}

/**
 * Generic fetch wrapper with error handling
 */
async function request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;

    const config = {
        headers: {
            'Content-Type': 'application/json',
            ...options.headers,
        },
        ...options,
    };

    try {
        const response = await fetch(url, config);
        const data = await response.json();

        if (!response.ok || !data.success) {
            throw new ApiError(
                data.error || 'Request failed',
                data.code || 'UNKNOWN_ERROR',
                response.status
            );
        }

        return data.data;
    } catch (error) {
        if (error instanceof ApiError) {
            throw error;
        }

        throw new ApiError(
            error.message || 'Network error',
            'NETWORK_ERROR',
            0
        );
    }
}

/**
 * API Methods
 */
const api = {
    getAllRooms: () => request('/rooms'),
    getAvailableRooms: () => request('/rooms/available'),
    getStats: () => request('/stats'),

    bookRooms: (count) => request('/book', {
        method: 'POST',
        body: JSON.stringify({ count }),
    }),

    setRandomOccupancy: (probability = 0.4) => request('/rooms/random-occupancy', {
        method: 'POST',
        body: JSON.stringify({ probability }),
    }),

    resetRooms: () => request('/rooms/reset', {
        method: 'POST',
    }),

    calculateTravelTime: (rooms) => request('/calculate-travel-time', {
        method: 'POST',
        body: JSON.stringify({ rooms }),
    }),
};

export { api, ApiError };
export default api;
