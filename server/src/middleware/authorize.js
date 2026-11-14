const { sendError } = require('../utils/apiResponse');

const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.admin) {
      return sendError(res, 'Authentication required.', 401);
    }

    if (allowedRoles.length > 0 && !allowedRoles.includes(req.admin.role)) {
      return sendError(res, 'Forbidden: Insufficient privileges for this operation.', 403);
    }

    next();
  };
};

module.exports = authorize;
