/**
 * Server Entry Point
 */

require('dotenv').config();

const app = require('./app');

const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || '0.0.0.0';

const server = app.listen(PORT, HOST, () => {
    console.log(`
╔══════════════════════════════════════════════════════════════╗
║         Hotel Room Reservation System                        ║
╠══════════════════════════════════════════════════════════════╣
║  Server running at: http://${HOST}:${PORT}                      ║
║  Environment: ${(process.env.NODE_ENV || 'development').padEnd(46)}║
║  API Base URL: http://localhost:${PORT}/api                     ║
╠══════════════════════════════════════════════════════════════╣
║  Available Endpoints:                                        ║
║  ├── GET  /api/rooms              - Get all rooms            ║
║  ├── GET  /api/rooms/available    - Get available rooms      ║
║  ├── GET  /api/stats              - Get hotel statistics     ║
║  ├── GET  /api/config             - Get hotel configuration  ║
║  ├── POST /api/book               - Book rooms               ║
║  ├── POST /api/rooms/random-occupancy - Random occupancy     ║
║  ├── POST /api/rooms/reset        - Reset all rooms          ║
║  └── POST /api/calculate-travel-time - Calculate travel time ║
╚══════════════════════════════════════════════════════════════╝
  `);
});

// Graceful shutdown
const shutdown = (signal) => {
    console.log(`\n${signal} received. Shutting down gracefully...`);
    server.close(() => {
        console.log('Server closed.');
        process.exit(0);
    });
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
