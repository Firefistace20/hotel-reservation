/**
 * Booking Routes
 * API endpoints for hotel room booking system
 */

const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const { body } = require('express-validator');

// Room information
router.get('/rooms', bookingController.getAllRooms);
router.get('/rooms/available', bookingController.getAvailableRooms);
router.get('/stats', bookingController.getStats);
router.get('/config', bookingController.getConfig);

// Booking operations
router.post('/book',
    [
        body('count').isInt({ min: 1, max: 5 }).withMessage('Room count must be an integer between 1 and 5')
    ],
    bookingController.bookRooms.bind(bookingController)
);

// Utility operations
router.post('/rooms/random-occupancy',
    [
        body('probability').optional().isFloat({ min: 0, max: 1 }).withMessage('Probability must be between 0 and 1')
    ],
    bookingController.setRandomOccupancy.bind(bookingController)
);
router.post('/rooms/reset', bookingController.resetRooms.bind(bookingController));
router.post('/calculate-travel-time',
    [
        body('rooms').isArray({ min: 2 }).withMessage('Must provide an array of at least 2 room IDs'),
        body('rooms.*').isInt().withMessage('Room IDs must be integers')
    ],
    bookingController.calculateTravelTime.bind(bookingController)
);

module.exports = router;
