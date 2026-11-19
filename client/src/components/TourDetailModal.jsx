import React, { useState, useEffect } from 'react';

export default function TourDetailModal({ tour, onClose, onBookTour }) {
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  // Close on Escape key press and lock background body scroll
  useEffect(() => {
    if (!tour) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [tour, onClose]);

  if (!tour) return null;

  const images = Array.isArray(tour.images) && tour.images.length > 0
    ? tour.images
    : [tour.image || '/assets/cards/card5.jpg'];
  const activeImg = images[activeImageIndex] || images[0] || '/assets/cards/card5.jpg';

  // Compute fallback highlights if empty
  const highlights = Array.isArray(tour.highlights) && tour.highlights.length > 0
    ? tour.highlights
    : [
        'Door-to-door private or group hotel pickup and drop-off',
        'Certified licensed tour chauffeur & dedicated local specialist',
        'Iconic scenic viewpoints, architectural photo stops & landmark admissions',
        'Complimentary chilled bottled water & onboard comfort amenities',
        'Instant mobile voucher confirmation & flexible booking terms',
      ];

  // Default overview description if empty
  const overviewText = tour.description && tour.description.trim().length > 0
    ? tour.description
    : `Experience the best of ${tour.location || 'the destination'} with Air Dream Travel & Tourism. This signature tour features certified local guide accompaniment, comfortable transport, and handpicked landmark stops tailored for solo travelers, couples, and families alike.`;

  const handleBook = () => {
    onClose();
    if (onBookTour) {
      onBookTour(tour.title, tour.price);
    }
  };

  const whatsappMessage = encodeURIComponent(
    `Hello Air Dream Travel & Tourism, I would like to inquire about booking the tour: "${tour.title}" (${tour.price}).`
  );

  return (
    <div
      className="tour-detail-modal-overlay"
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(7, 21, 43, 0.82)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        zIndex: 99998,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        animation: 'fadeIn 0.25s ease-out',
      }}
    >
      <div
        className="tour-detail-modal-card"
        onClick={(e) => e.stopPropagation()}
        style={{
          background: '#FFFFFF',
          borderRadius: '24px',
          width: '100%',
          maxWidth: '740px',
          maxHeight: '92vh',
          boxShadow: '0 25px 70px rgba(0, 0, 0, 0.45)',
          overflow: 'hidden',
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          animation: 'slideUpModal 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        {/* Modal Close Button */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close Tour Details"
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            zIndex: 10,
            background: 'rgba(11, 25, 44, 0.65)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.25)',
            color: '#FFFFFF',
            width: '38px',
            height: '38px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            fontSize: '1.25rem',
            lineHeight: 1,
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#EF4444';
            e.currentTarget.style.transform = 'scale(1.08)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(11, 25, 44, 0.65)';
            e.currentTarget.style.transform = 'scale(1)';
          }}
        >
          &times;
        </button>

        {/* Scrollable Body Content */}
        <div
          style={{
            overflowY: 'auto',
            flex: '1 1 auto',
            maxHeight: 'calc(92vh - 86px)',
          }}
        >
          {/* Hero Image & Gallery Section */}
          <div style={{ position: 'relative', width: '100%', height: '310px', background: '#07152B', overflow: 'hidden' }}>
            <img
              src={activeImg}
              alt={tour.title}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                transition: 'opacity 0.3s ease',
              }}
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = '/assets/cards/card5.jpg';
              }}
            />
            {/* Top/Bottom Gradient Overlays */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background:
                  'linear-gradient(to top, rgba(7, 21, 43, 0.85) 0%, rgba(7, 21, 43, 0.2) 50%, rgba(7, 21, 43, 0.6) 100%)',
                pointerEvents: 'none',
              }}
            />

            {/* Badges Overlay */}
            <div
              style={{
                position: 'absolute',
                bottom: '18px',
                left: '24px',
                right: '24px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-end',
                flexWrap: 'wrap',
                gap: '10px',
                pointerEvents: 'none',
              }}
            >
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <span
                  style={{
                    background: '#0284C7',
                    color: '#FFFFFF',
                    padding: '5px 13px',
                    borderRadius: '20px',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    letterSpacing: '0.5px',
                    textTransform: 'uppercase',
                    boxShadow: '0 4px 10px rgba(2, 132, 199, 0.3)',
                  }}
                >
                  {tour.category || 'Sightseeing Tour'}
                </span>
                {tour.section && (
                  <span
                    style={{
                      background: 'rgba(255, 255, 255, 0.2)',
                      backdropFilter: 'blur(6px)',
                      color: '#FFFFFF',
                      padding: '5px 12px',
                      borderRadius: '20px',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      textTransform: 'capitalize',
                    }}
                  >
                    {tour.section.replace('-', ' ')}
                  </span>
                )}
              </div>

              <div
                style={{
                  background: 'rgba(234, 179, 8, 0.95)',
                  color: '#07152B',
                  padding: '5px 12px',
                  borderRadius: '20px',
                  fontSize: '0.82rem',
                  fontWeight: 800,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                  boxShadow: '0 4px 10px rgba(0, 0, 0, 0.2)',
                }}
              >
                <i className="fa-solid fa-star"></i> {tour.rating} (Verified Tour)
              </div>
            </div>
          </div>

          {/* Multiple Image Thumbnails Strip (if > 1 image) */}
          {images.length > 1 && (
            <div
              style={{
                display: 'flex',
                gap: '10px',
                padding: '12px 24px',
                background: '#F8FAFC',
                borderBottom: '1px solid #E2E8F0',
                overflowX: 'auto',
              }}
            >
              {images.map((img, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setActiveImageIndex(idx)}
                  style={{
                    width: '64px',
                    height: '48px',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    border: activeImageIndex === idx ? '2.5px solid #0284C7' : '1.5px solid #CBD5E1',
                    padding: 0,
                    cursor: 'pointer',
                    flexShrink: 0,
                    opacity: activeImageIndex === idx ? 1 : 0.7,
                    transition: 'all 0.2s',
                  }}
                >
                  <img src={img} alt={`thumb-${idx}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </button>
              ))}
            </div>
          )}

          {/* Main Details Body */}
          <div style={{ padding: '24px 28px' }}>
            {/* Title & Location Header */}
            <div style={{ marginBottom: '18px' }}>
              <div
                style={{
                  color: '#0284C7',
                  fontSize: '0.9rem',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  marginBottom: '6px',
                }}
              >
                <i className="fa-solid fa-location-dot"></i> {tour.location}
              </div>
              <h2
                style={{
                  fontSize: 'clamp(1.4rem, 2.5vw, 1.85rem)',
                  fontWeight: 800,
                  color: '#0A1F44',
                  lineHeight: 1.3,
                  margin: '0 0 10px',
                }}
              >
                {tour.title}
              </h2>

              {/* Price Banner */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '12px',
                  padding: '14px 18px',
                  background: '#F0F9FF',
                  borderRadius: '14px',
                  border: '1px solid #BAE6FD',
                  margin: '14px 0 20px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                  <span style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0369A1' }}>
                    {tour.price}
                  </span>
                  <span style={{ fontSize: '0.85rem', color: '#64748B', fontWeight: 600 }}>/ Per person</span>
                  {tour.originalPrice && (
                    <span
                      style={{
                        fontSize: '1rem',
                        color: '#94A3B8',
                        textDecoration: 'line-through',
                        marginLeft: '6px',
                      }}
                    >
                      {tour.originalPrice}
                    </span>
                  )}
                </div>

                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <span
                    style={{
                      background: '#DCFCE7',
                      color: '#15803D',
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      padding: '4px 10px',
                      borderRadius: '8px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    <i className="fa-solid fa-bolt"></i> Instant Confirmation
                  </span>
                  <span
                    style={{
                      background: '#FEF3C7',
                      color: '#B45309',
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      padding: '4px 10px',
                      borderRadius: '8px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    <i className="fa-solid fa-shield-check"></i> Best Fare Guaranteed
                  </span>
                </div>
              </div>
            </div>

            {/* 4 Essential Specs Pill Cards */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                gap: '12px',
                marginBottom: '26px',
              }}
            >
              <div
                style={{
                  background: '#F8FAFC',
                  border: '1px solid #E2E8F0',
                  borderRadius: '12px',
                  padding: '12px 14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                }}
              >
                <div
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '10px',
                    background: '#E0F2FE',
                    color: '#0284C7',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.1rem',
                    flexShrink: 0,
                  }}
                >
                  <i className="fa-regular fa-clock"></i>
                </div>
                <div>
                  <div style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 600, textTransform: 'uppercase' }}>
                    Duration
                  </div>
                  <div style={{ fontSize: '0.88rem', color: '#0F172A', fontWeight: 700 }}>{tour.hours}</div>
                </div>
              </div>

              <div
                style={{
                  background: '#F8FAFC',
                  border: '1px solid #E2E8F0',
                  borderRadius: '12px',
                  padding: '12px 14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                }}
              >
                <div
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '10px',
                    background: '#E0F2FE',
                    color: '#0284C7',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.1rem',
                    flexShrink: 0,
                  }}
                >
                  <i className="fa-solid fa-car-side"></i>
                </div>
                <div>
                  <div style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 600, textTransform: 'uppercase' }}>
                    Transport
                  </div>
                  <div style={{ fontSize: '0.88rem', color: '#0F172A', fontWeight: 700 }}>{tour.carHours}</div>
                </div>
              </div>

              <div
                style={{
                  background: '#F8FAFC',
                  border: '1px solid #E2E8F0',
                  borderRadius: '12px',
                  padding: '12px 14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                }}
              >
                <div
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '10px',
                    background: '#E0F2FE',
                    color: '#0284C7',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.1rem',
                    flexShrink: 0,
                  }}
                >
                  <i className="fa-solid fa-user-tie"></i>
                </div>
                <div>
                  <div style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 600, textTransform: 'uppercase' }}>
                    Tour Guide
                  </div>
                  <div style={{ fontSize: '0.88rem', color: '#0F172A', fontWeight: 700 }}>{tour.guide}</div>
                </div>
              </div>

              <div
                style={{
                  background: '#F8FAFC',
                  border: '1px solid #E2E8F0',
                  borderRadius: '12px',
                  padding: '12px 14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                }}
              >
                <div
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '10px',
                    background: '#E0F2FE',
                    color: '#0284C7',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.1rem',
                    flexShrink: 0,
                  }}
                >
                  <i className="fa-solid fa-users"></i>
                </div>
                <div>
                  <div style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 600, textTransform: 'uppercase' }}>
                    Group Size
                  </div>
                  <div style={{ fontSize: '0.88rem', color: '#0F172A', fontWeight: 700 }}>{tour.capacity}</div>
                </div>
              </div>
            </div>

            {/* About / Overview Section */}
            <div style={{ marginBottom: '26px' }}>
              <h3
                style={{
                  fontSize: '1.15rem',
                  fontWeight: 700,
                  color: '#0A1F44',
                  marginBottom: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <i className="fa-solid fa-circle-info" style={{ color: '#0284C7' }}></i> About This Experience
              </h3>
              <p
                style={{
                  fontSize: '0.96rem',
                  color: '#475569',
                  lineHeight: 1.7,
                  margin: 0,
                }}
              >
                {overviewText}
              </p>
            </div>

            {/* Highlights Section */}
            <div style={{ marginBottom: '26px' }}>
              <h3
                style={{
                  fontSize: '1.15rem',
                  fontWeight: 700,
                  color: '#0A1F44',
                  marginBottom: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <i className="fa-solid fa-wand-magic-sparkles" style={{ color: '#0284C7' }}></i> Tour Highlights
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '9px' }}>
                {highlights.map((hl, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '10px',
                      fontSize: '0.92rem',
                      color: '#334155',
                      lineHeight: 1.5,
                    }}
                  >
                    <i
                      className="fa-solid fa-circle-check"
                      style={{ color: '#0284C7', marginTop: '3px', flexShrink: 0 }}
                    ></i>
                    <span>{hl}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Inclusions & Amenities Included */}
            <div
              style={{
                background: '#F8FAFC',
                borderRadius: '16px',
                border: '1px solid #E2E8F0',
                padding: '18px 20px',
                marginBottom: '10px',
              }}
            >
              <h4
                style={{
                  fontSize: '0.98rem',
                  fontWeight: 700,
                  color: '#0A1F44',
                  margin: '0 0 12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <i className="fa-solid fa-check-double" style={{ color: '#10B981' }}></i> What's Included
              </h4>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: '10px',
                  fontSize: '0.86rem',
                  color: '#475569',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <i className="fa-solid fa-hotel" style={{ color: '#0284C7' }}></i>
                  <span>Hotel Pick &amp; Drop (Selected Areas)</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <i className="fa-solid fa-user-shield" style={{ color: '#0284C7' }}></i>
                  <span>Licensed Driver / Tour Guide</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <i className="fa-solid fa-bottle-water" style={{ color: '#0284C7' }}></i>
                  <span>Chilled Mineral Water &amp; Soft Drinks</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <i className="fa-solid fa-ticket" style={{ color: '#0284C7' }}></i>
                  <span>All Access &amp; Landmark Entry Fees</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <i className="fa-solid fa-gas-pump" style={{ color: '#0284C7' }}></i>
                  <span>All Fuel, Road Tolls &amp; Parking</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <i className="fa-solid fa-headset" style={{ color: '#0284C7' }}></i>
                  <span>24/7 Air Dream Traveler Support</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Sticky Bottom Action Footer */}
        <div
          style={{
            padding: '16px 24px',
            background: '#FFFFFF',
            borderTop: '1px solid #E2E8F0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '16px',
            flexWrap: 'wrap',
            boxShadow: '0 -4px 16px rgba(0, 0, 0, 0.04)',
            zIndex: 5,
          }}
        >
          <div>
            <div style={{ fontSize: '0.78rem', color: '#64748B', fontWeight: 600 }}>Total Price</div>
            <div style={{ fontSize: '1.45rem', fontWeight: 800, color: '#0A1F44', lineHeight: 1 }}>
              {tour.price}
              <span style={{ fontSize: '0.8rem', color: '#64748B', fontWeight: 500, marginLeft: '4px' }}>
                / person
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
            {/* WhatsApp Direct Inquire Button */}
            <a
              href={`https://wa.me/971588774280?text=${whatsappMessage}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '11px 18px',
                borderRadius: '12px',
                background: '#25D366',
                color: '#FFFFFF',
                fontWeight: 700,
                fontSize: '0.9rem',
                textDecoration: 'none',
                transition: 'all 0.2s ease',
                boxShadow: '0 4px 12px rgba(37, 211, 102, 0.25)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 6px 18px rgba(37, 211, 102, 0.35)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(37, 211, 102, 0.25)';
              }}
            >
              <i className="fa-brands fa-whatsapp" style={{ fontSize: '1.15rem' }}></i>
              <span>WhatsApp</span>
            </a>

            {/* Book Now Button */}
            <button
              type="button"
              onClick={handleBook}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '11px 26px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #0284C7 0%, #0369A1 100%)',
                color: '#FFFFFF',
                fontWeight: 700,
                fontSize: '0.92rem',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: '0 4px 14px rgba(2, 132, 199, 0.35)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 6px 20px rgba(2, 132, 199, 0.45)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 14px rgba(2, 132, 199, 0.35)';
              }}
            >
              <i className="fa-solid fa-plane-departure"></i>
              <span>Book This Tour</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
