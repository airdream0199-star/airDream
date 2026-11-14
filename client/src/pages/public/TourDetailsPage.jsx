import React, { useState, useEffect } from 'react';
import { useParams, Link, useOutletContext } from 'react-router-dom';
import publicApi from '../../services/publicApi';

export default function TourDetailsPage() {
  const { slug } = useParams();
  const { onBookItem, onOpenQuote } = useOutletContext() || {};
  const [tour, setTour] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    const load = async () => {
      try {
        const data = await publicApi.getTourBySlugOrId(slug);
        setTour(data);
      } catch (err) {
        setError(err.message || 'Tour not found');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [slug]);

  if (loading) {
    return (
      <div style={{ paddingTop: '160px', paddingBottom: '100px', textAlign: 'center' }}>
        <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: '2.5rem', color: '#0284c7' }}></i>
        <p style={{ marginTop: '16px', color: '#64748b' }}>Loading tour details...</p>
      </div>
    );
  }

  if (error || !tour) {
    return (
      <div style={{ paddingTop: '160px', paddingBottom: '100px', textAlign: 'center', maxWidth: '600px', margin: '0 auto' }}>
        <i className="fa-solid fa-circle-exclamation" style={{ fontSize: '3rem', color: '#ef4444', marginBottom: '16px' }}></i>
        <h2>Tour Not Found</h2>
        <p style={{ color: '#64748b', marginBottom: '24px' }}>The requested tour could not be loaded or may no longer be available.</p>
        <Link to="/tours" style={{ padding: '10px 20px', background: '#0284c7', color: '#fff', borderRadius: '10px', textDecoration: 'none', fontWeight: 600 }}>
          Browse All Tours
        </Link>
      </div>
    );
  }

  const tourPrice = typeof tour.price === 'object' ? `${tour.price.currency || 'AED'} ${tour.price.amount}` : (typeof tour.price === 'number' ? `AED ${tour.price}` : tour.price);
  const heroImage = (tour.images && tour.images[0]) || '/assets/cards/card5.jpg';

  return (
    <div style={{ paddingTop: '90px', paddingBottom: '80px', background: '#f8fafc' }}>
      {/* Hero Visual */}
      <div style={{ position: 'relative', height: '420px', overflow: 'hidden' }}>
        <img
          src={heroImage}
          alt={tour.title}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          onError={(e) => { e.target.src = '/assets/cards/card5.jpg'; }}
        />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(11,25,44,0.9) 0%, rgba(11,25,44,0.3) 100%)' }} />
        <div style={{ position: 'absolute', bottom: '40px', left: 0, right: 0, maxWidth: '1200px', margin: '0 auto', padding: '0 20px', color: '#fff' }}>
          <div style={{ display: 'inline-block', background: '#0284c7', color: '#fff', padding: '4px 14px', borderRadius: '12px', fontSize: '0.82rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '12px' }}>
            {tour.category || 'Sightseeing'}
          </div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 800, margin: '0 0 10px 0', fontFamily: 'Poppins, sans-serif' }}>
            {tour.title}
          </h1>
          <div style={{ display: 'flex', gap: '20px', alignItems: 'center', fontSize: '0.95rem', color: '#cbd5e1' }}>
            {tour.rating && (
              <span><i className="fa-solid fa-star" style={{ color: '#eab308' }}></i> {tour.rating} Rating</span>
            )}
            {tour.duration && (
              <span><i className="fa-solid fa-clock"></i> {tour.duration.days} Day(s) {tour.duration.nights ? `/ ${tour.duration.nights} Night(s)` : ''}</span>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ maxWidth: '1200px', margin: '40px auto 0', padding: '0 20px', display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '36px' }}>
        {/* Left column */}
        <div>
          <div style={{ background: '#fff', borderRadius: '18px', padding: '32px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', marginBottom: '28px' }}>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#0f172a', marginBottom: '16px' }}>Overview</h2>
            <p style={{ color: '#475569', fontSize: '1rem', lineHeight: 1.7, margin: 0 }}>
              {tour.description || 'Join us on this iconic tour. Enjoy top-tier chauffeur transfers, certified local guides, and an experience of a lifetime.'}
            </p>
          </div>

          {tour.highlights && tour.highlights.length > 0 && (
            <div style={{ background: '#fff', borderRadius: '18px', padding: '32px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', marginBottom: '28px' }}>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#0f172a', marginBottom: '16px' }}>Tour Highlights</h2>
              <ul style={{ margin: 0, paddingLeft: '20px', color: '#475569', lineHeight: 1.8 }}>
                {tour.highlights.map((h, i) => (
                  <li key={i} style={{ marginBottom: '6px' }}>{h}</li>
                ))}
              </ul>
            </div>
          )}

          {tour.included && tour.included.length > 0 && (
            <div style={{ background: '#fff', borderRadius: '18px', padding: '32px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#0f172a', marginBottom: '16px' }}>What's Included</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '14px' }}>
                {tour.included.map((inc, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#334155', fontSize: '0.92rem' }}>
                    <i className="fa-solid fa-circle-check" style={{ color: '#16a34a' }}></i>
                    <span>{typeof inc === 'object' ? inc.name : inc}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right column: Booking sidebar */}
        <div>
          <div style={{ background: '#fff', borderRadius: '18px', padding: '28px', boxShadow: '0 8px 24px rgba(0,0,0,0.08)', position: 'sticky', top: '100px' }}>
            <div style={{ marginBottom: '20px' }}>
              <span style={{ fontSize: '0.85rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600 }}>Standard Rate</span>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: '#0284c7' }}>{tourPrice}</div>
            </div>

            <div style={{ borderTop: '1px solid #f1f5f9', borderBottom: '1px solid #f1f5f9', padding: '16px 0', marginBottom: '20px', fontSize: '0.88rem', color: '#64748b', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div><i className="fa-solid fa-shield-halved" style={{ color: '#0284c7', marginRight: '8px' }}></i> Free cancellation up to 24h before</div>
              <div><i className="fa-solid fa-bolt" style={{ color: '#0284c7', marginRight: '8px' }}></i> Instant confirmation via WhatsApp</div>
              <div><i className="fa-solid fa-headset" style={{ color: '#0284c7', marginRight: '8px' }}></i> 24/7 dedicated trip concierge</div>
            </div>

            <button
              onClick={() => onBookItem(tour.title, tourPrice)}
              style={{
                width: '100%',
                padding: '14px',
                borderRadius: '12px',
                background: '#0284c7',
                color: '#fff',
                border: 'none',
                fontWeight: 700,
                fontSize: '1rem',
                cursor: 'pointer',
                marginBottom: '12px',
                boxShadow: '0 4px 12px rgba(2, 132, 199, 0.3)',
              }}
            >
              Book This Tour
            </button>

            <button
              onClick={() => onOpenQuote(tour.title)}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '12px',
                background: '#f1f5f9',
                color: '#334155',
                border: 'none',
                fontWeight: 600,
                fontSize: '0.9rem',
                cursor: 'pointer',
              }}
            >
              Request Custom Quote
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
