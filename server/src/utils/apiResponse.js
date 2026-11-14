/**
 * Standardized API Response Utilities
 */

const sendSuccess = (res, data = {}, message = 'Operation successful', statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    data,
    message,
  });
};

const sendPaginated = (res, data = [], meta = {}, message = 'Data retrieved successfully', statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    data,
    meta: {
      page: Number(meta.page) || 1,
      limit: Number(meta.limit) || data.length,
      total: Number(meta.total) || data.length,
      totalPages: Number(meta.totalPages) || 1,
    },
    message,
  });
};

const sendError = (res, message = 'An error occurred', statusCode = 500, errors = []) => {
  return res.status(statusCode).json({
    success: false,
    message,
    errors: Array.isArray(errors) ? errors : [errors],
  });
};

module.exports = {
  sendSuccess,
  sendPaginated,
  sendError,
};
