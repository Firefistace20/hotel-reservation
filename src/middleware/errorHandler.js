/**
 * Error Handling Middleware
 */

/**
 * Not Found Handler
 */
const notFoundHandler = (req, res, next) => {
    res.status(404).json({
        success: false,
        error: `Route ${req.method} ${req.originalUrl} not found`,
        code: 'NOT_FOUND'
    });
};

/**
 * Global Error Handler
 */
const errorHandler = (err, req, res, next) => {
    console.error('Error:', err);

    // Default error
    let statusCode = err.statusCode || 500;
    let message = err.message || 'Internal Server Error';
    let code = err.code || 'INTERNAL_ERROR';

    // Mongoose validation error
    if (err.name === 'ValidationError') {
        statusCode = 400;
        message = Object.values(err.errors).map(e => e.message).join(', ');
        code = 'VALIDATION_ERROR';
    }

    // Mongoose CastError (invalid ObjectId)
    if (err.name === 'CastError') {
        statusCode = 400;
        message = `Invalid ${err.path}: ${err.value}`;
        code = 'CAST_ERROR';
    }

    // JSON parsing error
    if (err.type === 'entity.parse.failed') {
        statusCode = 400;
        message = 'Invalid JSON in request body';
        code = 'JSON_PARSE_ERROR';
    }

    res.status(statusCode).json({
        success: false,
        error: message,
        code,
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
};

module.exports = {
    notFoundHandler,
    errorHandler
};
