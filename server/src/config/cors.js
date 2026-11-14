const cors = require('cors');

/**
 * Full Permissive CORS Configuration for All Origins (*)
 * Grants unrestricted cross-origin resource sharing access across all domains,
 * ports, mobile apps, and deployment environments for all HTTP verbs and headers.
 */
const corsOptions = {
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS', 'HEAD'],
  allowedHeaders: '*',
  exposedHeaders: ['*'],
  optionsSuccessStatus: 200,
};

module.exports = cors(corsOptions);
