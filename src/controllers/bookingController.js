/**
 * Booking Controller
 * Handles HTTP requests for hotel room booking operations
 */

const BookingService = require('../services/bookingService');

// Singleton instance (in production, consider dependency injection)
const bookingService = new BookingService();

/**
 * GET /api/rooms
 * Get all rooms with their current status
 */
const getAllRooms = async (req, res, next) => {
    try {
        const rooms = bookingService.getAllRooms();
        const stats = bookingService.getStats();

        res.json({
            success: true,
            data: {
                rooms,
                stats,
                config: BookingService.getConfig()
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * GET /api/rooms/available
 * Get only available rooms
 */
const getAvailableRooms = async (req, res, next) => {
    try {
        const rooms = bookingService.getAvailableRooms();

        res.json({
            success: true,
            data: {
                count: rooms.length,
                rooms
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * GET /api/stats
 * Get hotel statistics
 */
const getStats = async (req, res, next) => {
    try {
        const stats = bookingService.getStats();

        res.json({
            success: true,
            data: stats
        });
    } catch (error) {
        next(error);
    }
};

/**
 * POST /api/book
 * Book rooms
 * Body: { count: number, bookingId?: string }
 */
const bookRooms = async (req, res, next) => {
    try {
        const { count, bookingId } = req.body;

        // Validate input
        if (count === undefined || count === null) {
            return res.status(400).json({
                success: false,
                error: 'Room count is required',
                code: 'MISSING_COUNT'
            });
        }

        const parsedCount = parseInt(count, 10);

        if (isNaN(parsedCount)) {
            return res.status(400).json({
                success: false,
                error: 'Room count must be a number',
                code: 'INVALID_COUNT'
            });
        }

        const result = bookingService.bookRooms(parsedCount, bookingId);

        if (result.success) {
            res.status(201).json({
                success: true,
                data: result
            });
        } else {
            // Business logic failure (not enough rooms, etc.)
            res.status(400).json({
                success: false,
                error: result.error,
                code: result.code,
                ...(result.availableCount !== undefined && { availableCount: result.availableCount })
            });
        }
    } catch (error) {
        next(error);
    }
};

/**
 * POST /api/rooms/random-occupancy
 * Generate random occupancy for testing
 * Body: { probability?: number } (0-1, default 0.4)
 */
const setRandomOccupancy = async (req, res, next) => {
    try {
        let { probability } = req.body;

        // Default probability
        if (probability === undefined) {
            probability = 0.4;
        }

        // Validate probability
        probability = parseFloat(probability);
        if (isNaN(probability) || probability < 0 || probability > 1) {
            return res.status(400).json({
                success: false,
                error: 'Probability must be a number between 0 and 1',
                code: 'INVALID_PROBABILITY'
            });
        }

        const result = bookingService.setRandomOccupancy(probability);

        res.json({
            success: true,
            data: result
        });
    } catch (error) {
        next(error);
    }
};

/**
 * POST /api/rooms/reset
 * Reset all rooms to available
 */
const resetRooms = async (req, res, next) => {
    try {
        const result = bookingService.reset();

        res.json({
            success: true,
            data: result
        });
    } catch (error) {
        next(error);
    }
};

/**
 * POST /api/calculate-travel-time
 * Calculate travel time for a given set of rooms
 * Body: { rooms: number[] }
 */
const calculateTravelTime = async (req, res, next) => {
    try {
        const { rooms } = req.body;

        if (!Array.isArray(rooms) || rooms.length === 0) {
            return res.status(400).json({
                success: false,
                error: 'Rooms must be a non-empty array of room IDs',
                code: 'INVALID_ROOMS'
            });
        }

        const travelTime = bookingService.calculateTotalTravelTime(rooms);

        res.json({
            success: true,
            data: {
                rooms,
                travelTime,
                unit: 'minutes'
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * GET /api/config
 * Get hotel configuration
 */
const getConfig = async (req, res, next) => {
    try {
        res.json({
            success: true,
            data: BookingService.getConfig()
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getAllRooms,
    getAvailableRooms,
    getStats,
    bookRooms,
    setRandomOccupancy,
    resetRooms,
    calculateTravelTime,
    getConfig
};
