import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function AdminLayout() {
  const { admin, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    toast.success('Logged out from Admin Hub.');
    navigate('/admin/login', { replace: true });
  };

  const navItems = [
    { to: '/admin/dashboard', icon: 'fa-gauge-high', label: 'Dashboard' },
    { to: '/admin/enquiries', icon: 'fa-envelope-open-text', label: 'Enquiries' },
    { to: '/admin/tours', icon: 'fa-mountain-sun', label: 'Tours' },
    { to: '/admin/packages', icon: 'fa-suitcase-rolling', label: 'Packages & Deals' },
    { to: '/admin/activities', icon: 'fa-ticket', label: 'Attractions' },
    { to: '/admin/transfers', icon: 'fa-car-side', label: 'Airport Transfers' },
    { to: '/admin/visas', icon: 'fa-passport', label: 'Visa Assistance' },
    { to: '/admin/gallery', icon: 'fa-images', label: 'Photo Gallery' },
    { to: '/admin/testimonials', icon: 'fa-comment-dots', label: 'Testimonials' },
    { to: '/admin/hero-slides', icon: 'fa-sliders', label: 'Hero Slides' },
    { to: '/admin/feature-cards', icon: 'fa-cubes', label: 'Feature Cards' },
    { to: '/admin/popups', icon: 'fa-bullhorn', label: 'Promotions' },
    { to: '/admin/settings', icon: 'fa-gear', label: 'Site Settings' },
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f1f5f9', fontFamily: 'Poppins, sans-serif' }}>
      {/* Mobile Drawer Overlay */}
      {mobileMenuOpen && (
        <div
          onClick={() => setMobileMenuOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(11, 25, 44, 0.6)',
            zIndex: 9998,
          }}
        />
      )}

      {/* Sidebar Navigation */}
      <aside
        style={{
          width: '260px',
          background: '#0b192c',
          color: '#fff',
          display: 'flex',
          flexDirection: 'column',
          position: 'fixed',
          top: 0,
          bottom: 0,
          left: 0,
          zIndex: 9999,
          transition: 'transform 0.3s ease',
          transform: typeof window !== 'undefined' && window.innerWidth < 1024
            ? (mobileMenuOpen ? 'translateX(0)' : 'translateX(-100%)')
            : 'translateX(0)',
          overflowY: 'auto',
          boxShadow: '4px 0 20px rgba(0,0,0,0.15)',
        }}
      >
        {/* Brand Header */}
        <div style={{ padding: '24px 20px', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <img
            src="/assets/air-dream-logo.png"
            alt="Air Dream"
            style={{ width: '40px', height: '40px', borderRadius: '8px', objectFit: 'contain' }}
            onError={(e) => { e.target.src = '/assets/cards/card1.png'; }}
          />
          <div>
            <div style={{ fontWeight: 800, fontSize: '1rem', letterSpacing: '0.5px' }}>AIR DREAM</div>
            <div style={{ fontSize: '0.68rem', color: '#00d2ff', textTransform: 'uppercase', letterSpacing: '1px' }}>Admin Control Center</div>
          </div>
        </div>

        {/* Navigation Items */}
        <nav style={{ padding: '16px 12px', flex: 1 }}>
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => setMobileMenuOpen(false)}
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '11px 16px',
                borderRadius: '10px',
                marginBottom: '4px',
                color: isActive ? '#ffffff' : '#94a3b8',
                background: isActive ? '#0284c7' : 'transparent',
                fontWeight: isActive ? 600 : 500,
                fontSize: '0.88rem',
                textDecoration: 'none',
                transition: 'all 0.15s ease',
              })}
            >
              <i className={`fa-solid ${item.icon}`} style={{ width: '20px', fontSize: '0.95rem' }}></i>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Bottom User Profile */}
        <div style={{ padding: '16px 20px', borderTop: '1px solid rgba(255,255,255,0.08)', background: 'rgba(0,0,0,0.2)' }}>
          <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#f8fafc', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {admin?.name || 'Administrator'}
          </div>
          <div style={{ fontSize: '0.72rem', color: '#94a3b8', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginBottom: '10px' }}>
            {admin?.email || 'admin@airdream.com'}
          </div>
          <button
            onClick={handleLogout}
            style={{
              width: '100%',
              padding: '8px 12px',
              borderRadius: '8px',
              background: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              color: '#f87171',
              fontWeight: 600,
              fontSize: '0.8rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
            }}
          >
            <i className="fa-solid fa-arrow-right-from-bracket"></i>
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          marginLeft: typeof window !== 'undefined' && window.innerWidth >= 1024 ? '260px' : '0',
          width: '100%',
          minHeight: '100vh',
        }}
      >
        {/* Top Navbar */}
        <header
          style={{
            height: '64px',
            background: '#ffffff',
            borderBottom: '1px solid #e2e8f0',
            padding: '0 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            position: 'sticky',
            top: 0,
            zIndex: 999,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              style={{
                display: typeof window !== 'undefined' && window.innerWidth < 1024 ? 'flex' : 'none',
                alignItems: 'center',
                justifyContent: 'center',
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                background: '#f1f5f9',
                border: 'none',
                cursor: 'pointer',
                fontSize: '1rem',
                color: '#334155',
              }}
              aria-label="Toggle Navigation"
            >
              <i className="fa-solid fa-bars"></i>
            </button>
            <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: '#0f172a' }}>
              Air Dream Control Center
            </h2>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <Link
              to="/"
              target="_blank"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '0.82rem',
                color: '#0284c7',
                textDecoration: 'none',
                fontWeight: 600,
                padding: '6px 12px',
                borderRadius: '8px',
                background: '#f0f9ff',
              }}
            >
              <i className="fa-solid fa-arrow-up-right-from-square"></i>
              <span>View Live Website</span>
            </Link>
          </div>
        </header>

        {/* Page View Container */}
        <main style={{ padding: '28px', flex: 1, overflowY: 'auto' }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
