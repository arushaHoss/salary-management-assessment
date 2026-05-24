// backend/src/middleware/errorHandler.js

/**
 * Centralized error handler middleware
 * Converts business logic errors into appropriate HTTP responses
 */
const errorHandler = (err, req, res, next) => {
  const isExpectedClientError =
    err.statusCode ||
    err.name === 'SequelizeValidationError' ||
    err.name === 'SequelizeUniqueConstraintError';

  if (process.env.NODE_ENV !== 'test' || !isExpectedClientError) {
    console.error('Error:', err.message);
  }

  // Sequelize validation errors
  if (err.name === 'SequelizeValidationError') {
    return res.status(400).json({
      error: 'Validation Error',
      details: err.errors.map(e => ({
        field: e.path,
        message: e.message
      }))
    });
  }

  // Sequelize unique constraint errors
  if (err.name === 'SequelizeUniqueConstraintError') {
    return res.status(409).json({
      error: 'Conflict',
      message: `${err.errors[0].path} already exists`
    });
  }

  // Custom business logic errors
  if (err.statusCode) {
    return res.status(err.statusCode).json({
      error: err.message
    });
  }

  // Fallback
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Unknown error'
  });
};

module.exports = errorHandler;
