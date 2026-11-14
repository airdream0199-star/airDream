import React, { useState, useEffect } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import publicApi from '../../services/publicApi';

export default function PackagesPage() {
  const { onBookItem } = useOutletContext() || {};
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');

  useEffect(() => {
    window.scrollTo(0, 0);
    const load = async () => {
      try {
        const data = await publicApi.getPackages();
        setPackages(data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const categories = ['All', 'holiday', 'umrah', 'flights', 'tours'];

  const filtered = packages.filter((pkg) => {
    if (selectedCategory === 'All') return true;
    return pkg.category?.toLowerCase() === selectedCategory.toLowerCase();
  });

  return (
    <div style={{ paddingTop: '100px', paddingBottom: '80px', background: '#f8fafc', minHeight: '100vh' }}>
      <div style={{ background: 'linear-gradient(135deg, #0b192c 0%, #1e3a5f 100%)', color: '#fff', padding: '60px 20px', textAlign: 'center', marginBottom: '40px' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '12px', fontFamily: 'Poppins, sans-serif' }}>
          Holiday Packages & Curated Itineraries
        </h1>
        <p style={{ maxWidth: '650px', margin: '0 auto', color: '#94a3b8', fontSize: '1.05rem' }}>
          Explore Georgia, Azerbaijan, Turkey, VIP Umrah, and exotic international destinations with all-inclusive ease.
        </p>
      </div>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
        {/* Category Pills */}
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '36px' }}>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              style={{
                padding: '9px 20px',
                borderRadius: '24px',
                border: 'none',
                background: selectedCategory === cat ? '#0284c7' : '#ffffff',
                color: selectedCategory === cat ? '#ffffff' : '#475569',
                fontWeight: 600,
                fontSize: '0.9rem',
                cursor: 'pointer',
                textTransform: 'capitalize',
                boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                transition: 'all 0.2s',
              }}
            >
              {cat === 'All' ? 'All Packages' : `${cat} Packages`}
            </button>
          ))}
        </div>

        {/* Grid */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '80px 0' }}>
            <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: '2.5rem', color: '#0284c7' }}></i>
            <p style={{ marginTop: '16px', color: '#64748b' }}>Loading packages...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 0', background: '#fff', borderRadius: '16px' }}>
            <h3>No packages available in this category</h3>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '30px' }}>
            {filtered.map((pkg) => {
              const priceStr = typeof pkg.price === 'object' ? `${pkg.price.currency || 'USD'} ${pkg.price.amount}` : (typeof pkg.price === 'number' ? `$${pkg.price}` : pkg.price);
              const img = pkg.image || (pkg.images && pkg.images[0]) || '/assets/cards/card3.jpg';

              return (
                <div
                  key={pkg._id || pkg.id}
                  style={{
                    background: '#ffffff',
                    borderRadius: '20px',
                    overflow: 'hidden',
                    boxShadow: '0 6px 20px rgba(0,0,0,0.06)',
                    display: 'flex',
                    flexDirection: 'column',
                  }}
                >
                  <div style={{ height: '220px', position: 'relative', overflow: 'hidden' }}>
                    <img
                      src={img}
                      alt={pkg.title}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      onError={(e) => { e.target.src = '/assets/cards/card3.jpg'; }}
                    />
                    {pkg.badge && (
                      <div style={{ position: 'absolute', top: '14px', left: '14px', background: '#ef4444', color: '#fff', padding: '4px 12px', borderRadius: '12px', fontSize: '0.78rem', fontWeight: 700 }}>
                        {pkg.badge}
                      </div>
                    )}
                    {pkg.duration && (
                      <div style={{ position: 'absolute', bottom: '14px', left: '14px', background: 'rgba(11,25,44,0.8)', color: '#fff', padding: '4px 10px', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 500 }}>
                        <i className="fa-solid fa-calendar-days" style={{ marginRight: '6px' }}></i> {typeof pkg.duration === 'string' ? pkg.duration : `${pkg.duration?.days || 5} Days`}
                      </div>
                    )}
                  </div>

                  <div style={{ padding: '22px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <div style={{ fontSize: '0.82rem', color: '#0284c7', fontWeight: 600, marginBottom: '6px', textTransform: 'uppercase' }}>
                      {pkg.location || 'International Destination'}
                    </div>
                    <h3 style={{ margin: '0 0 10px 0', fontSize: '1.25rem', fontWeight: 700, color: '#0f172a' }}>
                      <Link to={`/packages/${pkg.slug || pkg._id}`} style={{ color: 'inherit', textDecoration: 'none' }}>
                        {pkg.title}
                      </Link>
                    </h3>
                    <p style={{ margin: '0 0 18px 0', color: '#64748b', fontSize: '0.9rem', lineHeight: 1.5, flex: 1 }}>
                      {pkg.description || pkg.tagline || 'Complete holiday package with return flights, star accommodation, and tours.'}
                    </p>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid #f1f5f9', paddingTop: '16px' }}>
                      <div>
                        <span style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600 }}>Total Price</span>
                        <span style={{ fontSize: '1.3rem', fontWeight: 800, color: '#0284c7' }}>{priceStr}</span>
                      </div>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <Link
                          to={`/packages/${pkg.slug || pkg._id}`}
                          style={{
                            padding: '9px 14px',
                            borderRadius: '10px',
                            background: '#f1f5f9',
                            color: '#334155',
                            textDecoration: 'none',
                            fontWeight: 600,
                            fontSize: '0.82rem',
                          }}
                        >
                          Itinerary
                        </Link>
                        <button
                          onClick={() => onBookItem(pkg.title, priceStr)}
                          style={{
                            padding: '9px 16px',
                            borderRadius: '10px',
                            background: '#0284c7',
                            color: '#ffffff',
                            border: 'none',
                            fontWeight: 600,
                            fontSize: '0.82rem',
                            cursor: 'pointer',
                          }}
                        >
                          Book Now
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
