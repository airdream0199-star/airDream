const cors = require('cors');

const defaultOrigins = [
  'https://airdreamtraveltourism.com',
  'https://www.airdreamtraveltourism.com',
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:3000',
];

const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, server-to-server)
    if (!origin) return callback(null, true);

    const clientUrl = process.env.CLIENT_URL;
    const allowed = [...defaultOrigins];
    if (clientUrl && !allowed.includes(clientUrl)) {
      allowed.push(clientUrl);
    }

    if (
      allowed.includes(origin) ||
      /^http:\/\/(localhost|127\.0\.0\.1):\d+$/.test(origin) ||
      /\.vercel\.app$/.test(origin)
    ) {
      return callback(null, true);
    }

    // In production or other origins
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  optionsSuccessStatus: 204,
};

module.exports = cors(corsOptions);
