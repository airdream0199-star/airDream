const { sendError } = require('../utils/apiResponse');

/**
 * Lightweight in-memory rate limiter
 */
const rateLimiter = ({ windowMs = 15 * 60 * 1000, max = 100, message = 'Too many requests, please try again later.' }) => {
  const requests = new Map();

  return (req, res, next) => {
    // Identify client by IP
    const ip = req.headers['x-forwarded-for']?.split(',')[0] || req.socket.remoteAddress || 'unknown';
    const now = Date.now();

    const record = requests.get(ip) || { count: 0, resetTime: now + windowMs };

    if (now > record.resetTime) {
      record.count = 1;
      record.resetTime = now + windowMs;
    } else {
      record.count++;
    }

    requests.set(ip, record);

    if (record.count > max) {
      return sendError(res, message, 429);
    }

    next();
  };
};

module.exports = rateLimiter;
