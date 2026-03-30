/**
 * Booking Controller
 * Handles HTTP requests for hotel room booking operations
 */

const BookingService = require('../services/bookingService');
const { validationResult } = require('express-validator');
const { Mutex } = require('async-mutex');

// Singleton instance (in production, consider dependency injection)
const bookingService = new BookingService();

// Global mutex to prevent booking race conditions
const bookingMutex = new Mutex();

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
        // Validate request syntax
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                error: errors.array()[0].msg,
                code: 'VALIDATION_ERROR'
            });
        }

        const { count, bookingId } = req.body;
        const parsedCount = parseInt(count, 10);

        // Lock the booking process to prevent double-booking race conditions
        const result = await bookingMutex.runExclusive(async () => {
            return bookingService.bookRooms(parsedCount, bookingId);
        });

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
        // Validate request syntax
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                error: errors.array()[0].msg,
                code: 'VALIDATION_ERROR'
            });
        }

        let { probability } = req.body;

        // Default probability
        if (probability === undefined) {
            probability = 0.4;
        }

        probability = parseFloat(probability);

        // Lock to prevent conflicts
        const result = await bookingMutex.runExclusive(async () => {
            return bookingService.setRandomOccupancy(probability);
        });

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
        // Lock to prevent state conflicts during reset
        const result = await bookingMutex.runExclusive(async () => {
            return bookingService.reset();
        });

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
        // Validate request syntax
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                error: errors.array()[0].msg,
                code: 'VALIDATION_ERROR'
            });
        }

        const { rooms } = req.body;

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
