import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import publicApi from '../../services/publicApi';

export default function VisasPage() {
  const { onOpenQuote } = useOutletContext() || {};
  const [visas, setVisas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);
    const load = async () => {
      try {
        const data = await publicApi.getVisas();
        setVisas(data || []);
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
          Worldwide Visa & Fast-Track Assistance
        </h1>
        <p style={{ maxWidth: '650px', margin: '0 auto', color: '#94a3b8', fontSize: '1.05rem' }}>
          Expert visa consultancy for UAE, Schengen, UK, USA, Saudi Arabia, and GCC. Over 98% approved applications.
        </p>
      </div>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '80px 0' }}>
            <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: '2.5rem', color: '#0284c7' }}></i>
            <p style={{ marginTop: '16px', color: '#64748b' }}>Loading visa services...</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '26px' }}>
            {visas.map((visa) => {
              const priceStr = typeof visa.price === 'object' ? `${visa.price.currency || 'INR'} ${visa.price.amount}` : (typeof visa.price === 'number' ? `₹${visa.price}` : visa.price);

              return (
                <div
                  key={visa._id || visa.id}
                  style={{
                    background: '#fff',
                    borderRadius: '16px',
                    padding: '24px',
                    boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
                    display: 'flex',
                    flexDirection: 'column',
                    position: 'relative',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ width: '42px', height: '42px', borderRadius: '50%', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem' }}>
                        🛂
                      </div>
                      <div>
                        <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700, color: '#0f172a' }}>{visa.country}</h3>
                        <span style={{ fontSize: '0.8rem', color: '#64748b' }}>{visa.type || 'Tourist'} Visa</span>
                      </div>
                    </div>
                    {visa.badgeText && (
                      <span style={{ background: '#dbeafe', color: '#1d4ed8', fontSize: '0.72rem', fontWeight: 700, padding: '3px 8px', borderRadius: '10px' }}>
                        {visa.badgeText}
                      </span>
                    )}
                  </div>

                  <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '10px', fontSize: '0.85rem', color: '#475569', marginBottom: '18px' }}>
                    <div style={{ marginBottom: '6px' }}>
                      <i className="fa-solid fa-clock" style={{ color: '#0284c7', marginRight: '6px' }}></i> Processing: <strong>{visa.processingTime || '3-5 Working Days'}</strong>
                    </div>
                    <div>
                      <i className="fa-solid fa-file-circle-check" style={{ color: '#16a34a', marginRight: '6px' }}></i> Documentation check & filing assistance
                    </div>
                  </div>

                  <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid #f1f5f9', paddingTop: '16px' }}>
                    <div>
                      <span style={{ display: 'block', fontSize: '0.72rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600 }}>Fee from</span>
                      <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0284c7' }}>{priceStr}</span>
                    </div>
                    <button
                      onClick={() => onOpenQuote(`${visa.country} Visa Assistance`)}
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
                      Apply Now
                    </button>
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
