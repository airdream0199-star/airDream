const jwt = require('jsonwebtoken');
const { sendError } = require('../utils/apiResponse');

const authenticate = (req, res, next) => {
  const authHeader = req.header('Authorization');

  if (!authHeader) {
    return sendError(res, 'Authentication required. No token provided.', 401);
  }

  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : authHeader.trim();

  if (!token) {
    return sendError(res, 'Invalid authorization format. Bearer token expected.', 401);
  }

  const secret = process.env.JWT_SECRET;
  if (!secret) {
    console.error('[Security Critical] JWT_SECRET is not configured in environment variables.');
    return sendError(res, 'Internal server configuration error.', 500);
  }

  try {
    const decoded = jwt.verify(token, secret);
    req.admin = decoded;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return sendError(res, 'Session expired. Please log in again.', 401);
    }
    return sendError(res, 'Invalid or corrupted authorization token.', 401);
  }
};

module.exports = authenticate;
