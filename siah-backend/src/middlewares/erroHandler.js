import { logger } from '../utils/logger.js';

export const errorHandler = (err, req, res, next) => {
  logger.error('Error occurred:', {
    error: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });

  // Prisma errors
  if (err.code && err.code.startsWith('P')) {
    return res.status(400).json({
      success: false,
      error: 'Database error',
      message: 'An error occurred while processing your request'
    });
  }

  // Joi validation errors
  if (err.isJoi) {
    return res.status(400).json({
      success: false,
      error: 'Validation error',
      message: err.details[0].message,
      details: err.details
    });
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      error: 'Invalid token',
      message: 'Authentication failed'
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      error: 'Token expired',
      message: 'Please login again'
    });
  }

  // Default error
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal server error';

  res.status(statusCode).json({
    success: false,
    error: 'Server error',
    message: process.env.NODE_ENV === 'production' ? 'Something went wrong' : message
  });
};
