const { sendError } = require('../utils/apiResponse');

const notFound = (req, res) => {
  return sendError(res, `Route not found: ${req.method} ${req.originalUrl}`, 404);
};

module.exports = notFound;
