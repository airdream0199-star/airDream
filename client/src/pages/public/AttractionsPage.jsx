import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import publicApi from '../../services/publicApi';

export default function AttractionsPage() {
  const { onBookItem } = useOutletContext() || {};
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);
    const load = async () => {
      try {
        const data = await publicApi.getActivities();
        setActivities(data || []);
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
          Top Dubai Attractions & Things To Do
        </h1>
        <p style={{ maxWidth: '650px', margin: '0 auto', color: '#94a3b8', fontSize: '1.05rem' }}>
          Burj Khalifa observation decks, desert quad biking, yacht rentals, Aquaventure Waterpark, and premier sights.
        </p>
      </div>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '80px 0' }}>
            <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: '2.5rem', color: '#0284c7' }}></i>
            <p style={{ marginTop: '16px', color: '#64748b' }}>Loading attractions...</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '26px' }}>
            {activities.map((act) => {
              const priceStr = typeof act.price === 'object' ? `${act.price.currency || 'AED'} ${act.price.amount}` : (typeof act.price === 'number' ? `AED ${act.price}` : act.price);
              const img = (act.images && act.images[0]) || '/assets/cards/card5.jpg';

              return (
                <div
                  key={act._id || act.id}
                  style={{
                    background: '#fff',
                    borderRadius: '16px',
                    overflow: 'hidden',
                    boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
                    display: 'flex',
                    flexDirection: 'column',
                  }}
                >
                  <div style={{ height: '200px', overflow: 'hidden' }}>
                    <img
                      src={img}
                      alt={act.title}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      onError={(e) => { e.target.src = '/assets/cards/card5.jpg'; }}
                    />
                  </div>
                  <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <h3 style={{ margin: '0 0 8px 0', fontSize: '1.15rem', fontWeight: 700, color: '#0f172a' }}>
                      {act.title}
                    </h3>
                    <p style={{ margin: '0 0 16px 0', color: '#64748b', fontSize: '0.88rem', flex: 1 }}>
                      {act.description || 'Instant entry confirmation, flexible booking, and skip-the-line privileges.'}
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid #f1f5f9', paddingTop: '14px' }}>
                      <span style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0284c7' }}>{priceStr}</span>
                      <button
                        onClick={() => onBookItem(act.title, priceStr)}
                        style={{
                          padding: '8px 16px',
                          borderRadius: '8px',
                          background: '#0284c7',
                          color: '#fff',
                          border: 'none',
                          fontWeight: 600,
                          fontSize: '0.82rem',
                          cursor: 'pointer',
                        }}
                      >
                        Book Ticket
                      </button>
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
