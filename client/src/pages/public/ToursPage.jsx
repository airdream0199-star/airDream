import React, { useState, useEffect } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import publicApi from '../../services/publicApi';

export default function ToursPage() {
  const { onBookItem } = useOutletContext() || {};
  const [tours, setTours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    window.scrollTo(0, 0);
    const load = async () => {
      try {
        const data = await publicApi.getTours();
        setTours(data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const categories = ['All', ...new Set(tours.map((t) => t.category).filter(Boolean))];

  const filtered = tours.filter((tour) => {
    const matchCat = selectedCategory === 'All' || tour.category === selectedCategory;
    const matchSearch =
      !searchTerm ||
      tour.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tour.description?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div style={{ paddingTop: '100px', paddingBottom: '80px', background: '#f8fafc', minHeight: '100vh' }}>
      {/* Banner */}
      <div style={{ background: 'linear-gradient(135deg, #0b192c 0%, #1e3a5f 100%)', color: '#fff', padding: '60px 20px', textAlign: 'center', marginBottom: '40px' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '12px', fontFamily: 'Poppins, sans-serif' }}>
          Discover Dubai & International Tours
        </h1>
        <p style={{ maxWidth: '650px', margin: '0 auto', color: '#94a3b8', fontSize: '1.05rem' }}>
          Hand-crafted desert adventures, city sightseeing, luxury yacht cruises, and unforgettable experiences.
        </p>
      </div>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
        {/* Controls */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                style={{
                  padding: '8px 18px',
                  borderRadius: '20px',
                  border: 'none',
                  background: selectedCategory === cat ? '#0284c7' : '#ffffff',
                  color: selectedCategory === cat ? '#ffffff' : '#475569',
                  fontWeight: 600,
                  fontSize: '0.88rem',
                  cursor: 'pointer',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.06)',
                  transition: 'all 0.2s',
                }}
              >
                {cat}
              </button>
            ))}
          </div>

          <div style={{ position: 'relative', width: '280px' }}>
            <input
              type="text"
              placeholder="Search tours..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '9px 14px 9px 36px',
                borderRadius: '20px',
                border: '1px solid #cbd5e1',
                fontSize: '0.88rem',
                outline: 'none',
                background: '#fff',
              }}
            />
            <i className="fa-solid fa-magnifying-glass" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', fontSize: '0.85rem' }}></i>
          </div>
        </div>

        {/* Grid */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '80px 0' }}>
            <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: '2.5rem', color: '#0284c7' }}></i>
            <p style={{ marginTop: '16px', color: '#64748b' }}>Loading experiences...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 0', background: '#fff', borderRadius: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.04)' }}>
            <i className="fa-solid fa-map-location-dot" style={{ fontSize: '3rem', color: '#cbd5e1', marginBottom: '16px' }}></i>
            <h3 style={{ margin: 0, color: '#334155' }}>No tours found</h3>
            <p style={{ color: '#64748b', marginTop: '8px' }}>Try searching for a different destination or category.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '28px' }}>
            {filtered.map((tour) => {
              const tourPrice = typeof tour.price === 'object' ? `${tour.price.currency || 'AED'} ${tour.price.amount}` : (typeof tour.price === 'number' ? `AED ${tour.price}` : tour.price);
              const img = (tour.images && tour.images[0]) || '/assets/cards/card5.jpg';
              return (
                <div
                  key={tour._id || tour.id}
                  style={{
                    background: '#ffffff',
                    borderRadius: '18px',
                    overflow: 'hidden',
                    boxShadow: '0 6px 20px rgba(0,0,0,0.06)',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'transform 0.25s, box-shadow 0.25s',
                  }}
                >
                  <div style={{ height: '210px', position: 'relative', overflow: 'hidden' }}>
                    <img
                      src={img}
                      alt={tour.title}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      onError={(e) => { e.target.src = '/assets/cards/card5.jpg'; }}
                    />
                    <div style={{ position: 'absolute', top: '14px', left: '14px', background: 'rgba(11, 25, 44, 0.75)', backdropFilter: 'blur(4px)', color: '#fff', padding: '4px 12px', borderRadius: '12px', fontSize: '0.78rem', fontWeight: 600 }}>
                      {tour.category || 'Tour'}
                    </div>
                    {tour.rating && (
                      <div style={{ position: 'absolute', top: '14px', right: '14px', background: '#fff', color: '#eab308', padding: '4px 8px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px', boxShadow: '0 2px 6px rgba(0,0,0,0.1)' }}>
                        <i className="fa-solid fa-star"></i>
                        <span style={{ color: '#1e293b' }}>{tour.rating}</span>
                      </div>
                    )}
                  </div>

                  <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <h3 style={{ margin: '0 0 10px 0', fontSize: '1.2rem', fontWeight: 700, color: '#0f172a', lineHeight: 1.35 }}>
                      <Link to={`/tours/${tour.slug || tour._id}`} style={{ color: 'inherit', textDecoration: 'none' }}>
                        {tour.title}
                      </Link>
                    </h3>
                    <p style={{ margin: '0 0 16px 0', color: '#64748b', fontSize: '0.88rem', lineHeight: 1.5, flex: 1, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {tour.description || 'Experience the beauty and culture of Dubai with our guided tour packages.'}
                    </p>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid #f1f5f9', paddingTop: '16px' }}>
                      <div>
                        <span style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600 }}>Starting from</span>
                        <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0284c7' }}>{tourPrice}</span>
                      </div>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <Link
                          to={`/tours/${tour.slug || tour._id}`}
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
                          Details
                        </Link>
                        <button
                          onClick={() => onBookItem(tour.title, tourPrice)}
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
