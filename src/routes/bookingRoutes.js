/**
 * Booking Routes
 * API endpoints for hotel room booking system
 */

const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');

// Room information
router.get('/rooms', bookingController.getAllRooms);
router.get('/rooms/available', bookingController.getAvailableRooms);
router.get('/stats', bookingController.getStats);
router.get('/config', bookingController.getConfig);

// Booking operations
router.post('/book', bookingController.bookRooms);

// Utility operations
router.post('/rooms/random-occupancy', bookingController.setRandomOccupancy);
router.post('/rooms/reset', bookingController.resetRooms);
router.post('/calculate-travel-time', bookingController.calculateTravelTime);

module.exports = router;
