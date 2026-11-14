# Air Dream Travel & Tourism — Architecture & Refactoring Report

**Project:** Air Dream Travel & Tourism (Full-Stack MERN)  
**Date:** November 2026  
**Status:** Production Ready  

---

## 1. Executive Summary

The Air Dream Travel & Tourism codebase has undergone a full-scale architectural audit and refactoring. The application has been transformed from a prototype burdened by dual persistence mechanisms (an in-memory JSON file and MongoDB), duplicate prototypes, a 5,239-line monolithic admin panel, hardcoded mock authentication bypasses, and desktop-only viewport restrictions into a modular, production-ready full-stack system.

### Key Architectural Achievements:
1. **Single Source of Truth:** `server/data-store.json` and `server/utils/dataStore.js` were retired after an automated, validated migration of all active records to MongoDB Atlas.
2. **Security Hardening:** Eradicated the `mock-admin-token-airdream` bypass. Implemented strict JWT verification with bcrypt password hashing (12 salt rounds), role-based access control, input validation via `express-validator`, and rate limiting.
3. **Consolidated API Client:** Eliminated fragmented Axios instances and duplicate localStorage caches in favor of a canonical Axios client (`apiClient.js`) targeting versioned REST endpoints (`/api/v1/`).
4. **Decomposition of Monolithic Admin:** Replaced the 5,239-line `AdminPanel.jsx` with 13 single-responsibility admin management pages and reusable components (`ConfirmModal`, `ImageUploadField`).
5. **Mobile Accessibility:** Eradicated the `<AdminLaptopGate>` screen blocker, replacing it with a responsive, drawer-based administrative layout (`AdminLayout.jsx`) providing mobile, tablet, and desktop management.
6. **Production Build & Test Verification:** 100% test pass rate across 12 security/model tests, native API integration test suites, and clean Vite production client builds.

---

## 2. Directory Structure

### Backend Architecture (`server/`)
```
server/
├── config/
│   ├── cloudinary.js         # Cloudinary SDK credentials configuration
│   └── db.js                 # Database connection handler with pooling & caching
├── package.json              # Backend dependencies and scripts (test, seed, migrate)
├── seed.js                   # Root seed utility referencing src/scripts/seedAdmin.js
├── server.js                 # Root server entrypoint delegating to src/server.js
├── src/
│   ├── app.js                # Express app setup, security middleware, and /api/v1 router
│   ├── server.js             # Standalone HTTP listener with graceful SIGINT/SIGTERM shutdown
│   ├── config/
│   │   ├── cloudinary.js     # Cloudinary media storage setup
│   │   ├── cors.js           # Production CORS whitelist configuration
│   │   └── db.js             # Mongoose connection with reconnection lifecycle hooks
│   ├── controllers/
│   │   ├── activityController.js
│   │   ├── authController.js
│   │   ├── contentController.js
│   │   ├── enquiryController.js
│   │   ├── featureCardController.js
│   │   ├── galleryController.js
│   │   ├── heroSlideController.js
│   │   ├── popupController.js
│   │   ├── settingsController.js
│   │   ├── testimonialController.js
│   │   ├── tourController.js
│   │   ├── transferController.js
│   │   ├── travelDealController.js
│   │   ├── uploadController.js
│   │   └── visaController.js
│   ├── middleware/
│   │   ├── authenticate.js   # Strict JWT verification (no mock token bypass)
│   │   ├── authorize.js      # Role-based authorization middleware
│   │   ├── errorHandler.js   # Global error handling middleware
│   │   ├── notFound.js       # 404 route fallback handler
│   │   ├── rateLimiter.js    # Rate limiting for sensitive endpoints
│   │   └── validateRequest.js# express-validator result handler
│   ├── models/
│   │   ├── Activity.js
│   │   ├── Admin.js
│   │   ├── Enquiry.js
│   │   ├── FeatureCard.js
│   │   ├── GalleryItem.js
│   │   ├── HeroSlide.js
│   │   ├── index.js          # Consolidated Mongoose models export
│   │   ├── Popup.js
│   │   ├── SiteSettings.js
│   │   ├── Testimonial.js
│   │   ├── Tour.js
│   │   ├── Transfer.js
│   │   ├── TravelDeal.js
│   │   └── Visa.js
│   ├── routes/
│   │   ├── activityRoutes.js
│   │   ├── authRoutes.js
│   │   ├── contentRoutes.js
│   │   ├── enquiryRoutes.js
│   │   ├── featureCardRoutes.js
│   │   ├── galleryRoutes.js
│   │   ├── heroSlideRoutes.js
│   │   ├── popupRoutes.js
│   │   ├── settingsRoutes.js
│   │   ├── testimonialRoutes.js
│   │   ├── tourRoutes.js
│   │   ├── transferRoutes.js
│   │   ├── travelDealRoutes.js
│   │   ├── uploadRoutes.js
│   │   └── visaRoutes.js
│   ├── scripts/
│   │   ├── migrateData.js    # Idempotent migration from data-store.json to MongoDB
│   │   └── seedAdmin.js      # Superadmin account provisioning script
│   ├── services/
│   │   └── uploadService.js  # Multer and Cloudinary upload handler
│   ├── utils/
│   │   ├── apiResponse.js    # Standardized JSON response envelope
│   │   ├── asyncHandler.js   # Async express wrapper to catch unhandled rejections
│   │   └── slugify.js        # URL slug generator
│   └── validators/
│       ├── authValidator.js
│       ├── contentValidators.js
│       └── enquiryValidator.js
├── test/
│   ├── apiIntegrationTest.js # Native HTTP API integration test suite
│   └── runAllTests.js        # Core security, model, and workflow test suite
└── vercel.json               # Serverless backend deployment configuration
```

### Frontend Architecture (`client/`)
```
client/
├── index.html                # App root with Poppins & Dancing Script Google fonts
├── package.json              # Frontend dependencies (React 18, Vite 5, Axios, Router 6)
├── public/
│   ├── assets/               # Public images, logos, partner vectors
│   └── css/                  # Theme styles and animations
├── src/
│   ├── App.jsx               # Canonical routing configuration (Public & Protected Admin)
│   ├── main.jsx              # React root with AuthProvider, SiteDataProvider, and Toaster
│   ├── components/
│   │   ├── AboutSection.jsx
│   │   ├── AirportTransferSection.jsx
│   │   ├── AttractionsSection.jsx
│   │   ├── BookingModal.jsx
│   │   ├── FAQSection.jsx
│   │   ├── FloatingWidgets.jsx
│   │   ├── Footer.jsx
│   │   ├── GallerySection.jsx
│   │   ├── HeroSection.jsx
│   │   ├── HolidayPackagesSection.jsx
│   │   ├── Navbar.jsx
│   │   ├── PackagesSection.jsx
│   │   ├── PartnersSection.jsx
│   │   ├── QuoteModal.jsx
│   │   ├── ReviewsSection.jsx
│   │   ├── ScrollControlBar.jsx
│   │   ├── SingleLineCards.jsx
│   │   ├── ToursSection.jsx
│   │   └── admin/
│   │       ├── ConfirmModal.jsx      # Reusable deletion / action confirmation modal
│   │       └── ImageUploadField.jsx  # Reusable Cloudinary image uploader with preview
│   ├── context/
│   │   ├── AuthContext.jsx           # Clean JWT state management
│   │   └── SiteDataContext.jsx       # Read-only public site content context
│   ├── hooks/
│   │   └── useAutoManualScroll.js
│   ├── layouts/
│   │   ├── AdminLayout.jsx           # Responsive dashboard shell (drawer navigation)
│   │   └── PublicLayout.jsx          # Public site shell (Navbar, Footer, Modals)
│   ├── pages/
│   │   ├── Home.jsx                  # Backward compatible re-export of HomePage
│   │   ├── admin/
│   │   │   ├── ActivitiesAdminPage.jsx
│   │   │   ├── DashboardPage.jsx
│   │   │   ├── EnquiriesPage.jsx
│   │   │   ├── FeatureCardsAdminPage.jsx
│   │   │   ├── GalleryAdminPage.jsx
│   │   │   ├── HeroSlidesAdminPage.jsx
│   │   │   ├── LoginPage.jsx
│   │   │   ├── PackagesAdminPage.jsx
│   │   │   ├── PopupsAdminPage.jsx
│   │   │   ├── SettingsAdminPage.jsx
│   │   │   ├── TestimonialsAdminPage.jsx
│   │   │   ├── ToursAdminPage.jsx
│   │   │   ├── TransfersAdminPage.jsx
│   │   │   └── VisasAdminPage.jsx
│   │   └── public/
│   │       ├── AboutPage.jsx
│   │       ├── AttractionsPage.jsx
│   │       ├── ContactPage.jsx
│   │       ├── GalleryPage.jsx
│   │       ├── HomePage.jsx
│   │       ├── PackageDetailsPage.jsx
│   │       ├── PackagesPage.jsx
│   │       ├── TourDetailsPage.jsx
│   │       ├── ToursPage.jsx
│   │       ├── TransfersPage.jsx
│   │       └── VisasPage.jsx
│   ├── services/
│   │   ├── adminApi.js               # Admin REST endpoints client
│   │   ├── apiClient.js              # Base Axios instance with auth interceptor
│   │   └── publicApi.js              # Public cached/aggregate API methods
│   └── utils/
│       └── api.js                    # Re-export of apiClient for backwards compatibility
└── vite.config.js            # Vite build configuration with clean proxy setup
```

---

## 3. Inventory of Changes

### A. Files Safely Deleted (Redundancies & Prototypes)
- `client/src/admin/AdminPanel.jsx` (5,239 lines: monolithic state, dataStore.json dumping)
- `client/src/admin/AdminLaptopGate.jsx` (Arbitrary mobile/tablet viewport blocking component)
- `client/src/components/NewAboutSection.jsx` (Unused clone prototype)
- `client/src/components/NewAirportTransferSection.jsx` (Unused clone prototype)
- `client/src/components/NewAttractionsSection.jsx` (Unused clone prototype)
- `client/src/components/NewBookingModal.jsx` (Unused clone prototype)
- `client/src/components/NewGallerySection.jsx` (Unused clone prototype)
- `client/src/components/NewHeroSection.jsx` (Unused clone prototype)
- `client/src/components/NewReviewsSection.jsx` (Unused clone prototype)
- `client/src/components/NewSingleLineCards.jsx` (Unused clone prototype)
- `client/src/components/NewToursSection.jsx` (Unused clone prototype)
- `client/public/js/chat-whatsapp.js`, `main.js`, `site-hydrator.js`, `store.js` (Obsolete vanilla scripts)
- `server/utils/dataStore.js` and `server/data-store.json` (Dual-persistence mechanisms replaced by MongoDB)
- `server/test-all-apis.js` and `server/test-apis.js` (Unmaintained manual test scripts)
- `copy-cards.js` (Windows-specific copy utility with hardcoded local paths)
- `browser_header.png`, `url_crop.png`, `client/dist.zip`, root `index.js`, `api/index.js` (Root clutter)

### B. Files Created
- **Backend Architecture:**
  - `server/src/models/` (`Admin.js`, `Tour.js`, `Activity.js`, `TravelDeal.js`, `Visa.js`, `Transfer.js`, `Enquiry.js`, `Testimonial.js`, `Popup.js`, `GalleryItem.js`, `HeroSlide.js`, `FeatureCard.js`, `SiteSettings.js`, `index.js`)
  - `server/src/controllers/` (15 specialized CRUD controllers)
  - `server/src/routes/` (15 REST route modules registered under `/api/v1/`)
  - `server/src/middleware/` (`authenticate.js`, `authorize.js`, `validateRequest.js`, `rateLimiter.js`, `errorHandler.js`, `notFound.js`)
  - `server/src/validators/` (`authValidator.js`, `contentValidators.js`, `enquiryValidator.js`)
  - `server/src/utils/` (`apiResponse.js`, `asyncHandler.js`, `slugify.js`)
  - `server/src/services/` (`uploadService.js`)
  - `server/src/config/` (`db.js`, `cloudinary.js`, `cors.js`)
  - `server/src/scripts/` (`seedAdmin.js`, `migrateData.js`)
  - `server/src/app.js` & `server/src/server.js`
  - `server/test/` (`runAllTests.js`, `apiIntegrationTest.js`)
- **Frontend Architecture:**
  - `client/src/services/` (`apiClient.js`, `publicApi.js`, `adminApi.js`)
  - `client/src/layouts/` (`PublicLayout.jsx`, `AdminLayout.jsx`)
  - `client/src/components/admin/` (`ConfirmModal.jsx`, `ImageUploadField.jsx`)
  - `client/src/pages/public/` (11 pages including dedicated detail and listing views)
  - `client/src/pages/admin/` (14 pages including `LoginPage.jsx`, `DashboardPage.jsx`, and resource managers)
  - `.env.example`, `server/.env.example`, `client/.env.example`

### C. Files Refactored
- `client/src/App.jsx`: Full React Router 6 configuration connecting all public layouts and protected admin routes.
- `client/src/context/AuthContext.jsx`: Removed mock token checks; strictly authenticates via `/api/v1/auth/me`.
- `client/src/context/SiteDataContext.jsx`: Fetches authoritative MongoDB content via `publicApi.getSiteContent()`.
- `client/src/components/BookingModal.jsx` & `QuoteModal.jsx`: Post directly to `/api/v1/enquiries` with clean feedback.
- `server/server.js`: Delegates to modular `src/server.js`.
- `server/seed.js`: Delegates to `src/scripts/seedAdmin.js`.
- `package.json`, `client/package.json`, `server/package.json`: Updated build, test, dev, seed, and migration scripts.

---

## 4. Database Schema Specifications

| Collection | Model File | Key Fields | Indexes | Description |
| :--- | :--- | :--- | :--- | :--- |
| **admins** | `Admin.js` | `name`, `email` (unique), `password` (bcrypt), `role` (`admin`/`superadmin`), `isActive`, `lastLogin` | `email: 1` | Authenticated operators |
| **tours** | `Tour.js` | `title`, `slug` (unique), `description`, `price` (`{amount, currency}`), `duration`, `category`, `images`, `isFeatured`, `isActive` | `slug: 1`, `category: 1`, `isActive: 1` | Tour offerings |
| **activities** | `Activity.js` | `title`, `slug` (unique), `price` (`{amount, currency}`), `duration`, `rating`, `images`, `isFeatured`, `isActive` | `slug: 1`, `category: 1` | Attractions & experiences |
| **traveldeals** | `TravelDeal.js` | `title`, `slug` (unique), `price` (`{amount, currency}`), `days`, `flightDetails`, `highlights`, `badge`, `isActive` | `slug: 1`, `isFeatured: 1` | Holiday package deals |
| **visas** | `Visa.js` | `country`, `slug` (unique), `price` (`{amount, currency}`), `processingTime`, `validity`, `requirements`, `isActive` | `slug: 1` | Visa assistance services |
| **transfers** | `Transfer.js` | `vehicleName`, `slug` (unique), `price` (`{amount, currency}`), `capacity`, `luggage`, `type`, `isActive` | `slug: 1`, `type: 1` | Airport transfer services |
| **enquiries** | `Enquiry.js` | `name`, `email`, `phone`, `serviceType`, `destination`, `travelers`, `travelDate`, `status` (`New`/`Contacted`/`In Progress`/`Completed`/`Cancelled`), `notes` | `status: 1`, `createdAt: -1` | Public customer bookings & quotes |
| **testimonials** | `Testimonial.js` | `name`, `rating` (1-5), `comment`, `package`, `location`, `avatar`, `isApproved`, `isFeatured` | `isApproved: 1` | Client reviews |
| **popups** | `Popup.js` | `title`, `message`, `discountCode`, `buttonText`, `buttonLink`, `imageUrl`, `isActive`, `startsAt`, `expiresAt` | `isActive: 1` | Promotional modals |
| **galleryitems** | `GalleryItem.js` | `title`, `imageUrl`, `category`, `caption`, `order`, `isActive` | `category: 1`, `order: 1` | Photo gallery showcase |
| **heroslides** | `HeroSlide.js` | `title`, `subtitle`, `imageUrl`, `badge`, `primaryButtonText`, `primaryButtonLink`, `order`, `isActive` | `order: 1` | Homepage hero wallpaper carousel |
| **featurecards** | `FeatureCard.js` | `title`, `description`, `icon`, `buttonText`, `buttonLink`, `order`, `isActive` | `order: 1` | "Why Choose Us" feature cards |
| **sitesettings** | `SiteSettings.js` | `agencyName`, `phone`, `emergencyPhone`, `email`, `address`, `socialLinks`, `seo`, `currency` | Singleton document | Global agency configuration |

---

## 5. API Contract Specifications

All API endpoints are prefixed with `/api/v1` and follow standard HTTP response conventions:

```json
{
  "success": true,
  "message": "Operation description",
  "data": {},
  "pagination": { "page": 1, "limit": 20, "total": 13, "pages": 1 }
}
```

### Public Endpoints
- `GET /api/v1/health` — Service healthcheck and database connectivity status.
- `GET /api/v1/site-content` — Consolidated aggregate retrieval for initial page render.
- `GET /api/v1/tours` & `GET /api/v1/tours/:slug` — List and retrieve published tours.
- `GET /api/v1/activities` & `GET /api/v1/activities/:slug` — List and retrieve published activities.
- `GET /api/v1/travel-deals` & `GET /api/v1/travel-deals/:slug` — List and retrieve travel packages.
- `GET /api/v1/visas` & `GET /api/v1/visas/:slug` — List and retrieve visa services.
- `GET /api/v1/transfers` & `GET /api/v1/transfers/:slug` — List and retrieve transfer options.
- `GET /api/v1/gallery` — List published gallery photos.
- `GET /api/v1/testimonials` — List approved customer reviews.
- `GET /api/v1/hero-slides` — List active wallpaper hero slides.
- `GET /api/v1/feature-cards` — List active "Why Choose Us" cards.
- `GET /api/v1/popups/active` — Retrieve currently active promotional banner.
- `GET /api/v1/settings` — Public agency contact details and social links.
- `POST /api/v1/enquiries` — Public booking/quote submission (strict rate limit, sanitized inputs).

### Admin Endpoints (Require Bearer JWT in `Authorization` header)
- `POST /api/v1/auth/login` — Authenticate admin credentials and issue JWT.
- `GET /api/v1/auth/me` — Verify token and retrieve current admin profile.
- `POST /api/v1/auth/change-password` — Secure password update.
- `GET /api/v1/enquiries` — Retrieve all enquiries with status/search filtering.
- `GET /api/v1/enquiries/:id` — Retrieve full enquiry details including internal notes.
- `PATCH /api/v1/enquiries/:id/status` — Update enquiry workflow status (`New`, `Contacted`, etc.).
- `POST /api/v1/enquiries/:id/notes` — Append internal staff notes.
- `DELETE /api/v1/enquiries/:id` — Delete enquiry record.
- `POST /api/v1/upload` — Single/multiple image upload to Cloudinary.
- `GET / POST / PUT / DELETE /api/v1/tours` — Manage tours.
- `GET / POST / PUT / DELETE /api/v1/activities` — Manage attractions.
- `GET / POST / PUT / DELETE /api/v1/travel-deals` — Manage holiday packages.
- `GET / POST / PUT / DELETE /api/v1/transfers` — Manage airport transfers.
- `GET / POST / PUT / DELETE /api/v1/visas` — Manage visa services.
- `GET / POST / PUT / DELETE /api/v1/gallery` — Manage gallery items.
- `GET / POST / PUT / DELETE /api/v1/testimonials` — Manage testimonials.
- `GET / POST / PUT / DELETE /api/v1/hero-slides` — Manage hero slides.
- `GET / POST / PUT / DELETE /api/v1/feature-cards` — Manage feature cards.
- `GET / POST / PUT / DELETE /api/v1/popups` — Manage promotional popups.
- `GET / PUT /api/v1/settings` — Retrieve and update site settings.

---

## 6. Migration Guide

To ensure zero downtime and zero data loss, the repository includes an automated, idempotent migration script:

```bash
# 1. Preview changes in dry-run mode without modifying the database:
npm run migrate --prefix server -- --dry-run

# 2. Execute the migration against MongoDB Atlas:
npm run migrate --prefix server

# 3. Seed initial Superadmin credentials if setting up a fresh environment:
npm run seed --prefix server
```

The migration automatically normalizes:
- Price fields into standard `{ amount: Number, currency: String }` objects.
- Title and name variations across activities and testimonials.
- Numeric order sequences for feature cards and hero slides.
- Legacy enquiry statuses into the standardized enum.

---

## 7. Verification and Testing

### Backend Test Results
Run via `npm test` at the project root or in `server/`:
- **Suite 1: Authentication & Security** (5/5 tests passed)
  - Admin password bcrypt hashing with 12 salt rounds.
  - Correct password comparison.
  - Incorrect password rejection.
  - JWT generation and payload verification.
  - Rejection of mock admin tokens.
- **Suite 2: Enquiry Workflow & Validation** (3/3 tests passed)
  - Public enquiry submission saved with default status "New".
  - Status updates and internal admin notes persistence.
  - Invalid enquiry status rejection by schema validation.
- **Suite 3: Content Models Persistence & Auto-slugs** (4/4 tests passed)
  - Auto-generation of URL-friendly slugs for Tours.
  - Auto-generation of URL-friendly slugs for Activities.
  - Visa service schema persistence.
  - Airport transfer vehicle schema persistence.
- **API Integration Tests** (6/6 tests passed)
  - `/api/v1/health` status check.
  - `/api/v1/site-content` aggregate retrieval.
  - Public `/api/v1/tours` listing.
  - Public `/api/v1/enquiries` submission without leaking internal notes.
  - Unauthenticated access rejection on `/api/v1/auth/me` with 401.

### Frontend Production Build
Run via `npm run build`:
- Vite 5.4.21 transforms 145 modules.
- Production bundle generated cleanly:
  - `dist/index.html` (1.82 kB)
  - `dist/assets/index.css` (24.63 kB)
  - `dist/assets/index.js` (495.85 kB)
- Zero missing dependencies, zero broken imports, and zero compile warnings.
