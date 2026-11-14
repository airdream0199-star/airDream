import React from 'react';
import { useOutletContext, Link } from 'react-router-dom';
import { useSiteData } from '../../context/SiteDataContext';

export default function AboutPage() {
  const { onOpenQuote } = useOutletContext() || {};
  const { siteData } = useSiteData();
  const settings = siteData?.settings || {};

  return (
    <div style={{ paddingTop: '100px', paddingBottom: '80px', background: '#f8fafc', minHeight: '100vh' }}>
      <div style={{ background: 'linear-gradient(135deg, #0b192c 0%, #1e3a5f 100%)', color: '#fff', padding: '60px 20px', textAlign: 'center', marginBottom: '50px' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '12px', fontFamily: 'Poppins, sans-serif' }}>
          About Air Dream Travel & Tourism LLC
        </h1>
        <p style={{ maxWidth: '650px', margin: '0 auto', color: '#94a3b8', fontSize: '1.05rem' }}>
          {settings.brandTagline || 'Fly Your Dreams'} — Premier Destination Management Company based in Dubai, UAE.
        </p>
      </div>

      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 20px' }}>
        <div style={{ background: '#fff', borderRadius: '24px', padding: '40px', boxShadow: '0 4px 20px rgba(0,0,0,0.06)', marginBottom: '40px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '40px', alignItems: 'center' }}>
            <div>
              <span style={{ color: '#0284c7', fontWeight: 700, fontSize: '0.88rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
                Our Story & Commitment
              </span>
              <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0f172a', margin: '8px 0 16px 0', lineHeight: 1.3 }}>
                Crafting Extraordinary Travel Experiences Since Inception
              </h2>
              <p style={{ color: '#475569', lineHeight: 1.8, fontSize: '0.98rem', marginBottom: '16px' }}>
                {settings.aboutQuote || 'We, at Air Dream Travel Tourism LLC, cater to our clients a lifestyle at its best where they can feel the pulse of Dubai and the unseen facets of the world, through our exclusive guided tours and other value-added services.'}
              </p>
              <p style={{ color: '#475569', lineHeight: 1.8, fontSize: '0.98rem' }}>
                From luxury desert safaris and Arabian dhow cruises to tailor-made international holiday packages, flight reservations, and fast visa approvals, we deliver end-to-end travel concierge services for families, corporate delegations, and discerning adventurers.
              </p>
            </div>
            <div style={{ position: 'relative' }}>
              <img
                src={settings.aboutArchImg || '/assets/cards/card2.jpg'}
                alt="Air Dream Dubai"
                style={{ width: '100%', height: '360px', objectFit: 'cover', borderRadius: '20px', boxShadow: '0 12px 30px rgba(0,0,0,0.15)' }}
                onError={(e) => { e.target.src = '/assets/cards/card2.jpg'; }}
              />
            </div>
          </div>
        </div>

        {/* Core Pillars */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px', marginBottom: '50px' }}>
          <div style={{ background: '#fff', padding: '30px', borderRadius: '18px', boxShadow: '0 4px 14px rgba(0,0,0,0.04)' }}>
            <div style={{ width: '50px', height: '50px', borderRadius: '14px', background: '#dbeafe', color: '#0284c7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem', marginBottom: '16px' }}>
              <i className="fa-solid fa-plane-departure"></i>
            </div>
            <h3 style={{ margin: '0 0 8px 0', fontSize: '1.2rem', color: '#0f172a' }}>Global Airline Network</h3>
            <p style={{ margin: 0, color: '#64748b', fontSize: '0.9rem', lineHeight: 1.6 }}>Direct connections with top global carriers ensuring best fares, flexible booking, and premium seats.</p>
          </div>

          <div style={{ background: '#fff', padding: '30px', borderRadius: '18px', boxShadow: '0 4px 14px rgba(0,0,0,0.04)' }}>
            <div style={{ width: '50px', height: '50px', borderRadius: '14px', background: '#e0f2fe', color: '#0284c7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem', marginBottom: '16px' }}>
              <i className="fa-solid fa-kaaba"></i>
            </div>
            <h3 style={{ margin: '0 0 8px 0', fontSize: '1.2rem', color: '#0f172a' }}>VIP Umrah Packages</h3>
            <p style={{ margin: 0, color: '#64748b', fontSize: '0.9rem', lineHeight: 1.6 }}>Comprehensive 5-star spiritual itineraries with Haram-facing hotels, private transfers, and experienced Ziyarat guides.</p>
          </div>

          <div style={{ background: '#fff', padding: '30px', borderRadius: '18px', boxShadow: '0 4px 14px rgba(0,0,0,0.04)' }}>
            <div style={{ width: '50px', height: '50px', borderRadius: '14px', background: '#dcfce7', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem', marginBottom: '16px' }}>
              <i className="fa-solid fa-headset"></i>
            </div>
            <h3 style={{ margin: '0 0 8px 0', fontSize: '1.2rem', color: '#0f172a' }}>24/7 Concierge Support</h3>
            <p style={{ margin: 0, color: '#64748b', fontSize: '0.9rem', lineHeight: 1.6 }}>Dedicated bilingual specialists available around the clock via WhatsApp, phone, and in-person assistance.</p>
          </div>
        </div>

        {/* CTA */}
        <div style={{ background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)', borderRadius: '24px', padding: '40px', color: '#fff', textAlign: 'center' }}>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 800, margin: '0 0 12px 0' }}>Ready to Plan Your Next Journey?</h2>
          <p style={{ maxWidth: '550px', margin: '0 auto 24px', color: '#e0f2fe', fontSize: '1rem' }}>
            Get in touch with our Dubai travel experts to curate a personalized itinerary tailored to your schedule and budget.
          </p>
          <button
            onClick={() => onOpenQuote('Custom Vacation Planning')}
            style={{ padding: '12px 28px', background: '#fff', color: '#0284c7', border: 'none', borderRadius: '12px', fontWeight: 700, fontSize: '0.95rem', cursor: 'pointer', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}
          >
            Start Free Consultation
          </button>
        </div>
      </div>
    </div>
  );
}
