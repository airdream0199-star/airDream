import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

// Layouts
import PublicLayout from './layouts/PublicLayout';
import AdminLayout from './layouts/AdminLayout';

// Public Pages
import HomePage from './pages/public/HomePage';
import ToursPage from './pages/public/ToursPage';
import TourDetailsPage from './pages/public/TourDetailsPage';
import PackagesPage from './pages/public/PackagesPage';
import PackageDetailsPage from './pages/public/PackageDetailsPage';
import AttractionsPage from './pages/public/AttractionsPage';
import TransfersPage from './pages/public/TransfersPage';
import VisasPage from './pages/public/VisasPage';
import GalleryPage from './pages/public/GalleryPage';
import AboutPage from './pages/public/AboutPage';
import ContactPage from './pages/public/ContactPage';

// Admin Pages
import LoginPage from './pages/admin/LoginPage';
import DashboardPage from './pages/admin/DashboardPage';
import EnquiriesPage from './pages/admin/EnquiriesPage';
import ToursAdminPage from './pages/admin/ToursAdminPage';
import PackagesAdminPage from './pages/admin/PackagesAdminPage';
import ActivitiesAdminPage from './pages/admin/ActivitiesAdminPage';
import TransfersAdminPage from './pages/admin/TransfersAdminPage';
import VisasAdminPage from './pages/admin/VisasAdminPage';
import GalleryAdminPage from './pages/admin/GalleryAdminPage';
import TestimonialsAdminPage from './pages/admin/TestimonialsAdminPage';
import HeroSlidesAdminPage from './pages/admin/HeroSlidesAdminPage';
import FeatureCardsAdminPage from './pages/admin/FeatureCardsAdminPage';
import PopupsAdminPage from './pages/admin/PopupsAdminPage';
import SettingsAdminPage from './pages/admin/SettingsAdminPage';

// Protected Route Component for Admin Dashboard
function ProtectedAdminRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          background: '#0b192c',
          color: '#fff',
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <i
            className="fa-solid fa-spinner fa-spin"
            style={{ fontSize: '2.5rem', color: '#0284c7', marginBottom: '16px' }}
          ></i>
          <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: '0.95rem' }}>
            Loading Admin Control Center...
          </p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  return children;
}

export default function App() {
  return (
    <Routes>
      {/* Public Main Site wrapped in PublicLayout */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/tours" element={<ToursPage />} />
        <Route path="/tours/:slug" element={<TourDetailsPage />} />
        <Route path="/packages" element={<PackagesPage />} />
        <Route path="/packages/:slug" element={<PackageDetailsPage />} />
        <Route path="/attractions" element={<AttractionsPage />} />
        <Route path="/airport-transfers" element={<TransfersPage />} />
        <Route path="/transfers" element={<TransfersPage />} />
        <Route path="/visas" element={<VisasPage />} />
        <Route path="/gallery" element={<GalleryPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/contact" element={<ContactPage />} />
      </Route>

      {/* Admin Login Route (Responsive, Mobile/Tablet/Desktop) */}
      <Route path="/admin/login" element={<LoginPage />} />

      {/* Protected Admin Control Center (Responsive AdminLayout with mobile drawer) */}
      <Route
        path="/admin"
        element={
          <ProtectedAdminRoute>
            <AdminLayout />
          </ProtectedAdminRoute>
        }
      >
        <Route index element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="enquiries" element={<EnquiriesPage />} />
        <Route path="tours" element={<ToursAdminPage />} />
        <Route path="packages" element={<PackagesAdminPage />} />
        <Route path="activities" element={<ActivitiesAdminPage />} />
        <Route path="transfers" element={<TransfersAdminPage />} />
        <Route path="visas" element={<VisasAdminPage />} />
        <Route path="gallery" element={<GalleryAdminPage />} />
        <Route path="testimonials" element={<TestimonialsAdminPage />} />
        <Route path="hero-slides" element={<HeroSlidesAdminPage />} />
        <Route path="feature-cards" element={<FeatureCardsAdminPage />} />
        <Route path="popups" element={<PopupsAdminPage />} />
        <Route path="settings" element={<SettingsAdminPage />} />
      </Route>

      {/* Catch-all Wildcard Route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
