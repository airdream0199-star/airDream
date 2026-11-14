import React, { useState, useEffect } from 'react';
import { useParams, Link, useOutletContext } from 'react-router-dom';
import publicApi from '../../services/publicApi';

export default function PackageDetailsPage() {
  const { slug } = useParams();
  const { onBookItem, onOpenQuote } = useOutletContext() || {};
  const [pkg, setPkg] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    const load = async () => {
      try {
        const data = await publicApi.getPackageBySlugOrId(slug);
        setPkg(data);
      } catch (err) {
        setError(err.message || 'Package not found');
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
        <p style={{ marginTop: '16px', color: '#64748b' }}>Loading package details...</p>
      </div>
    );
  }

  if (error || !pkg) {
    return (
      <div style={{ paddingTop: '160px', paddingBottom: '100px', textAlign: 'center', maxWidth: '600px', margin: '0 auto' }}>
        <i className="fa-solid fa-circle-exclamation" style={{ fontSize: '3rem', color: '#ef4444', marginBottom: '16px' }}></i>
        <h2>Package Not Found</h2>
        <p style={{ color: '#64748b', marginBottom: '24px' }}>The requested travel package could not be found.</p>
        <Link to="/packages" style={{ padding: '10px 20px', background: '#0284c7', color: '#fff', borderRadius: '10px', textDecoration: 'none', fontWeight: 600 }}>
          View All Packages
        </Link>
      </div>
    );
  }

  const priceStr = typeof pkg.price === 'object' ? `${pkg.price.currency || 'USD'} ${pkg.price.amount}` : (typeof pkg.price === 'number' ? `$${pkg.price}` : pkg.price);
  const heroImage = pkg.image || (pkg.images && pkg.images[0]) || '/assets/cards/card3.jpg';

  return (
    <div style={{ paddingTop: '90px', paddingBottom: '80px', background: '#f8fafc' }}>
      <div style={{ position: 'relative', height: '420px', overflow: 'hidden' }}>
        <img
          src={heroImage}
          alt={pkg.title}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          onError={(e) => { e.target.src = '/assets/cards/card3.jpg'; }}
        />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(11,25,44,0.9) 0%, rgba(11,25,44,0.3) 100%)' }} />
        <div style={{ position: 'absolute', bottom: '40px', left: 0, right: 0, maxWidth: '1200px', margin: '0 auto', padding: '0 20px', color: '#fff' }}>
          <div style={{ display: 'inline-block', background: '#0284c7', color: '#fff', padding: '4px 14px', borderRadius: '12px', fontSize: '0.82rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '12px' }}>
            {pkg.location || 'Curated Itinerary'}
          </div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 800, margin: '0 0 10px 0', fontFamily: 'Poppins, sans-serif' }}>
            {pkg.title}
          </h1>
          <div style={{ display: 'flex', gap: '20px', alignItems: 'center', fontSize: '0.95rem', color: '#cbd5e1' }}>
            <span>
              <i className="fa-solid fa-clock"></i>{' '}
              {typeof pkg.duration === 'string'
                ? pkg.duration
                : pkg.duration && typeof pkg.duration === 'object'
                ? `${pkg.duration.days || 5} Days${pkg.duration.nights ? ` / ${pkg.duration.nights} Nights` : ''}`
                : '5 Days / 4 Nights'}
            </span>
            {pkg.vehicle && <span><i className="fa-solid fa-car"></i> {pkg.vehicle}</span>}
            {pkg.capacity && <span><i className="fa-solid fa-users"></i> {pkg.capacity}</span>}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: '1200px', margin: '40px auto 0', padding: '0 20px', display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '36px' }}>
        <div>
          <div style={{ background: '#fff', borderRadius: '18px', padding: '32px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', marginBottom: '28px' }}>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#0f172a', marginBottom: '16px' }}>Package Details</h2>
            <p style={{ color: '#475569', fontSize: '1rem', lineHeight: 1.7, margin: 0 }}>
              {pkg.description || pkg.tagline || 'Experience the best of this destination with our comprehensive travel package. Return flights, star hotel, private transfers, and English-speaking tour guides included.'}
            </p>
          </div>

          {pkg.activities && pkg.activities.length > 0 && (
            <div style={{ background: '#fff', borderRadius: '18px', padding: '32px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', marginBottom: '28px' }}>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#0f172a', marginBottom: '16px' }}>Included Activities</h2>
              <ul style={{ margin: 0, paddingLeft: '20px', color: '#475569', lineHeight: 1.8 }}>
                {pkg.activities.map((act, i) => (
                  <li key={i}>{act}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div>
          <div style={{ background: '#fff', borderRadius: '18px', padding: '28px', boxShadow: '0 8px 24px rgba(0,0,0,0.08)', position: 'sticky', top: '100px' }}>
            <div style={{ marginBottom: '20px' }}>
              <span style={{ fontSize: '0.85rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600 }}>All-Inclusive Price</span>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: '#0284c7' }}>{priceStr}</div>
            </div>

            <button
              onClick={() => onBookItem(pkg.title, priceStr)}
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
              }}
            >
              Book Package
            </button>

            <button
              onClick={() => onOpenQuote(pkg.title)}
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
              Request Custom Itinerary
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
