/**
 * Hotel Room Reservation System
 * Express Application Entry Point
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');

const bookingRoutes = require('./routes/bookingRoutes');
const { notFoundHandler, errorHandler } = require('./middleware/errorHandler');

const app = express();

// Security middleware
app.use(helmet({
    contentSecurityPolicy: false
}));

// CORS configuration
app.use(cors({
    origin: process.env.CORS_ORIGIN || '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Request parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging (skip in test environment)
if (process.env.NODE_ENV !== 'test') {
    app.use(morgan('dev'));
}

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});

// API routes
app.use('/api', bookingRoutes);

// Serve static files (for frontend)
app.use(express.static(path.join(__dirname, '..', 'public')));

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
