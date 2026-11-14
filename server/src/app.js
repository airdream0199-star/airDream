const express = require('express');
const corsMiddleware = require('./config/cors');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');
const notFound = require('./middleware/notFound');

// Route imports
const authRoutes = require('./routes/authRoutes');
const tourRoutes = require('./routes/tourRoutes');
const activityRoutes = require('./routes/activityRoutes');
const travelDealRoutes = require('./routes/travelDealRoutes');
const visaRoutes = require('./routes/visaRoutes');
const transferRoutes = require('./routes/transferRoutes');
const enquiryRoutes = require('./routes/enquiryRoutes');
const testimonialRoutes = require('./routes/testimonialRoutes');
const popupRoutes = require('./routes/popupRoutes');
const galleryRoutes = require('./routes/galleryRoutes');
const contentRoutes = require('./routes/contentRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const settingsRoutes = require('./routes/settingsRoutes');
const heroSlideRoutes = require('./routes/heroSlideRoutes');
const featureCardRoutes = require('./routes/featureCardRoutes');

const app = express();

// Security & Parsing Middleware
app.use(corsMiddleware);
app.options('*', corsMiddleware);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Vercel serverless path normalization
app.use((req, res, next) => {
  if (req.url.startsWith('/server.js')) {
    req.url = req.url.slice('/server.js'.length) || '/';
  } else if (req.url.startsWith('/server/server.js')) {
    req.url = req.url.slice('/server/server.js'.length) || '/';
  }
  next();
});

// Database connection assurance for serverless environments
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    console.error('[DB Middleware Error]', err.message);
    res.status(503).json({
      success: false,
      message: 'Database service is currently unavailable. Please try again shortly.',
      errors: [err.message],
    });
  }
});

// Canonical Version 1 API Routes
const v1Router = express.Router();

v1Router.use('/auth', authRoutes);
v1Router.use('/tours', tourRoutes);
v1Router.use('/activities', activityRoutes);
v1Router.use('/travel-deals', travelDealRoutes);
v1Router.use('/holiday-packages', travelDealRoutes); // Alias
v1Router.use('/packages', travelDealRoutes); // Alias
v1Router.use('/visas', visaRoutes);
v1Router.use('/transfers', transferRoutes);
v1Router.use('/enquiries', enquiryRoutes);
v1Router.use('/testimonials', testimonialRoutes);
v1Router.use('/reviews', testimonialRoutes); // Alias
v1Router.use('/popups', popupRoutes);
v1Router.use('/gallery', galleryRoutes);
v1Router.use('/site-content', contentRoutes);
v1Router.use('/upload', uploadRoutes);
v1Router.use('/settings', settingsRoutes);
v1Router.use('/wallpapers', heroSlideRoutes);
v1Router.use('/hero-slides', heroSlideRoutes);
v1Router.use('/why-choose-us', featureCardRoutes);
v1Router.use('/feature-cards', featureCardRoutes);

// Admin namespace: provides direct /api/v1/admin/ endpoints
const adminRouter = express.Router();
adminRouter.use('/tours', tourRoutes);
adminRouter.use('/activities', activityRoutes);
adminRouter.use('/travel-deals', travelDealRoutes);
adminRouter.use('/holiday-packages', travelDealRoutes);
adminRouter.use('/visas', visaRoutes);
adminRouter.use('/transfers', transferRoutes);
adminRouter.use('/enquiries', enquiryRoutes);
adminRouter.use('/testimonials', testimonialRoutes);
adminRouter.use('/popups', popupRoutes);
adminRouter.use('/gallery', galleryRoutes);
adminRouter.use('/upload', uploadRoutes);
adminRouter.use('/settings', settingsRoutes);
adminRouter.use('/hero-slides', heroSlideRoutes);
adminRouter.use('/wallpapers', heroSlideRoutes);
adminRouter.use('/feature-cards', featureCardRoutes);
adminRouter.use('/why-choose-us', featureCardRoutes);

v1Router.use('/admin', adminRouter);

// Healthcheck
v1Router.get('/health', (req, res) => {
  res.json({
    success: true,
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  });
});

// Mount Canonical /api/v1
app.use('/api/v1', v1Router);

// Backwards-compatibility mount for legacy /api callers
app.use('/api', v1Router);

// Root greeting
app.get('/', (req, res) => {
  res.json({
    success: true,
    name: 'Air Dream Travel & Tourism API',
    version: 'v1',
    status: 'operational',
    documentation: '/api/v1/health',
  });
});

// 404 & Centralized Error Handlers
app.use(notFound);
app.use(errorHandler);

module.exports = app;
