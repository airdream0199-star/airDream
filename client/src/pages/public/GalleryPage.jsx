import React, { useState, useEffect } from 'react';
import publicApi from '../../services/publicApi';

export default function GalleryPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    const load = async () => {
      try {
        const data = await publicApi.getGallery();
        setItems(data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div style={{ paddingTop: '100px', paddingBottom: '80px', background: '#f8fafc', minHeight: '100vh' }}>
      <div style={{ background: 'linear-gradient(135deg, #0b192c 0%, #1e3a5f 100%)', color: '#fff', padding: '60px 20px', textAlign: 'center', marginBottom: '40px' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '12px', fontFamily: 'Poppins, sans-serif' }}>
          Photo Gallery & Travel Moments
        </h1>
        <p style={{ maxWidth: '650px', margin: '0 auto', color: '#94a3b8', fontSize: '1.05rem' }}>
          Immerse yourself in snapshots captured by our travelers across Dubai, Oman, and global destinations.
        </p>
      </div>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '80px 0' }}>
            <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: '2.5rem', color: '#0284c7' }}></i>
            <p style={{ marginTop: '16px', color: '#64748b' }}>Loading gallery photos...</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
            {items.map((item, idx) => (
              <div
                key={item._id || item.id || idx}
                onClick={() => setActiveImage(item)}
                style={{
                  height: '240px',
                  borderRadius: '16px',
                  overflow: 'hidden',
                  cursor: 'pointer',
                  position: 'relative',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                  transition: 'transform 0.25s',
                }}
              >
                <img
                  src={item.image}
                  alt={item.title || 'Air Dream Gallery'}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  onError={(e) => { e.target.src = '/assets/cards/card1.png'; }}
                />
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 60%)', display: 'flex', alignItems: 'flex-end', padding: '16px' }}>
                  <span style={{ color: '#fff', fontWeight: 600, fontSize: '0.95rem' }}>{item.title || 'Voyager Experience'}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox Modal */}
      {activeImage && (
        <div
          onClick={() => setActiveImage(null)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.88)',
            zIndex: 999999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
          }}
        >
          <div style={{ maxWidth: '800px', width: '100%', position: 'relative' }} onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setActiveImage(null)}
              style={{ position: 'absolute', top: '-40px', right: '0', background: 'none', border: 'none', color: '#fff', fontSize: '1.5rem', cursor: 'pointer' }}
            >
              <i className="fa-solid fa-xmark"></i>
            </button>
            <img
              src={activeImage.image}
              alt={activeImage.title}
              style={{ width: '100%', maxHeight: '75vh', objectFit: 'contain', borderRadius: '12px' }}
            />
            {activeImage.title && (
              <div style={{ color: '#fff', textAlign: 'center', marginTop: '12px', fontSize: '1.1rem', fontWeight: 600 }}>
                {activeImage.title}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
