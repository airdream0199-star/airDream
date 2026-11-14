import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import publicApi from '../../services/publicApi';

export default function TransfersPage() {
  const { onBookItem } = useOutletContext() || {};
  const [transfers, setTransfers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);
    const load = async () => {
      try {
        const data = await publicApi.getTransfers();
        setTransfers(data || []);
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
          VIP Airport & City Chauffeur Transfers
        </h1>
        <p style={{ maxWidth: '650px', margin: '0 auto', color: '#94a3b8', fontSize: '1.05rem' }}>
          Reliable Dubai International Airport (DXB) and Al Maktoum (DWC) transfers with meet-and-greet, flight tracking, and luxury fleet.
        </p>
      </div>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '80px 0' }}>
            <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: '2.5rem', color: '#0284c7' }}></i>
            <p style={{ marginTop: '16px', color: '#64748b' }}>Loading vehicles...</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '28px' }}>
            {transfers.map((item) => {
              const priceStr = typeof item.price === 'object' ? `${item.price.currency || 'USD'} ${item.price.amount}` : item.price;
              const img = item.image || '/assets/vehicles/toyota-land-cruiser.jpg';

              return (
                <div
                  key={item._id || item.id}
                  style={{
                    background: '#fff',
                    borderRadius: '18px',
                    overflow: 'hidden',
                    boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
                    display: 'flex',
                    flexDirection: 'column',
                  }}
                >
                  <div style={{ height: '210px', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                    <img
                      src={img}
                      alt={item.title}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      onError={(e) => { e.target.src = '/assets/cards/card6.jpg'; }}
                    />
                  </div>
                  <div style={{ padding: '22px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <h3 style={{ margin: '0 0 6px 0', fontSize: '1.2rem', fontWeight: 700, color: '#0f172a' }}>
                      {item.title}
                    </h3>
                    <div style={{ display: 'flex', gap: '14px', fontSize: '0.82rem', color: '#64748b', marginBottom: '14px' }}>
                      <span><i className="fa-solid fa-users" style={{ marginRight: '5px', color: '#0284c7' }}></i> {item.capacity || '4 Passengers'}</span>
                      <span><i className="fa-solid fa-car" style={{ marginRight: '5px', color: '#0284c7' }}></i> {item.vehicle || 'Luxury SUV'}</span>
                    </div>
                    <p style={{ margin: '0 0 16px 0', color: '#64748b', fontSize: '0.88rem', flex: 1 }}>
                      {item.description || 'Chauffeur meet and greet at arrival terminal, luggage handling, free Wi-Fi, and bottled water included.'}
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid #f1f5f9', paddingTop: '14px' }}>
                      <div>
                        <span style={{ display: 'block', fontSize: '0.72rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600 }}>One-way rate</span>
                        <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0284c7' }}>{priceStr}</span>
                      </div>
                      <button
                        onClick={() => onBookItem(`Airport Transfer - ${item.title}`, priceStr)}
                        style={{
                          padding: '9px 18px',
                          borderRadius: '10px',
                          background: '#0284c7',
                          color: '#fff',
                          border: 'none',
                          fontWeight: 600,
                          fontSize: '0.85rem',
                          cursor: 'pointer',
                        }}
                      >
                        Book Ride
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
