/**
 * Hotel Room Reservation System
 * Express Application Entry Point
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const rateLimit = require('express-rate-limit');

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

// Serve static files from the React app (production)
app.use(express.static(path.join(__dirname, '..', 'client', 'build')));

// Serve the old landing page for now if needed, or redirect
app.use('/legacy', express.static(path.join(__dirname, '..', 'public')));

// API Rate Limiting (100 requests per 15 minutes)
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: { success: false, error: 'Too many requests from this IP, please try again later.' },
    standardHeaders: true,
    legacyHeaders: false,
});

// API routes with rate limiter
app.use('/api', apiLimiter, bookingRoutes);

// Catch-all route to serve React's index.html for any non-API routes
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'client', 'build', 'index.html'));
});

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
