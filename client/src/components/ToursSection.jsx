import React, { useState, useEffect, useMemo } from 'react';
import api from '../utils/api';
import { useAutoManualScroll } from '../hooks/useAutoManualScroll';
import ScrollControlBar from './ScrollControlBar';
import { useSiteData } from '../context/SiteDataContext';

// Safe Duration & Price String Formatters
const formatTourDuration = (val, hoursFallback) => {
  if (typeof val === 'string' && val.trim()) return val;
  if (typeof hoursFallback === 'string' && hoursFallback.trim()) return hoursFallback;
  if (val && typeof val === 'object') {
    const days = val.days ?? 0;
    const nights = val.nights ?? 0;
    if (days && nights) return `${days}D / ${nights}N`;
    if (days) return `${days} Day${days > 1 ? 's' : ''}`;
    if (nights) return `${nights} Night${nights > 1 ? 's' : ''}`;
  }
  return '08-Hrs';
};

const formatTourPrice = (priceVal, currencyVal = 'AED') => {
  if (priceVal === null || priceVal === undefined || priceVal === '') return 'AED 150';
  if (typeof priceVal === 'object') {
    const curr = priceVal.currency || currencyVal || 'AED';
    const amt = priceVal.amount ?? priceVal.value ?? '';
    return amt !== '' ? `${curr} ${amt}` : 'AED 150';
  }
  if (typeof priceVal === 'number') {
    return `${currencyVal || 'AED'} ${priceVal}`;
  }
  if (typeof priceVal === 'string') {
    return priceVal.startsWith('$') || priceVal.startsWith('AED')
      ? priceVal
      : `${currencyVal || 'AED'} ${priceVal}`;
  }
  return 'AED 150';
};

// UI Section Layout Definitions (no hardcoded tours)
const TOUR_SECTIONS_CONFIG = [
  {
    id: 'slider-dubai',
    sectionKey: 'dubai',
    badge: 'Dubai Iconic Experiences',
    icon: 'fa-city',
    title: '1. Top Places to Visit in Dubai',
    subtitle:
      'From thrilling desert dune bashing to Burj Khalifa heights, luxury yacht cruises, and historical creek souks.',
    keywords: ['dubai', 'desert', 'burj', 'marina', 'safari'],
  },
  {
    id: 'slider-abu-dhabi',
    sectionKey: 'abu-dhabi',
    badge: 'Capital Splendor & Thrills',
    icon: 'fa-mosque',
    title: '2. Abu Dhabi Awaits You',
    subtitle:
      'Experience the architectural marvel of Sheikh Zayed Grand Mosque, Louvre art, Ferrari World, and royal palaces.',
    keywords: ['abu dhabi', 'sheikh zayed', 'ferrari', 'yas', 'qasr'],
  },
  {
    id: 'slider-baku',
    sectionKey: 'baku',
    badge: 'Azerbaijan Jewels',
    icon: 'fa-mountain-sun',
    title: '3. Explore Beautiful Baku',
    subtitle:
      'Step into ancient cobblestone alleys, futuristic Flame Towers, bubbling mud volcanoes, and snowy Shahdag slopes.',
    keywords: ['baku', 'azerbaijan', 'shahdag', 'gabala'],
  },
  {
    id: 'slider-umrah',
    sectionKey: 'umrah',
    badge: 'Sacred Pilgrimage Services',
    icon: 'fa-kaaba',
    title: '4. Your Perfect Umrah Journey',
    subtitle:
      'VIP 5-star packages near the Haramain, private GMC transport, certified Mutawwif guidance, and Ziyarat tours.',
    keywords: ['umrah', 'makkah', 'madinah', 'ziyarat', 'haram'],
  },
  {
    id: 'slider-visas',
    sectionKey: 'visa-tickets',
    badge: 'Visas & Travel Documentation',
    icon: 'fa-passport',
    title: '5. Visit Visa and Tickets',
    subtitle:
      'Fast 24-48h UAE visit visas, Schengen priority assistance, Saudi e-visas, and worldwide airline ticket bookings.',
    keywords: ['visa', 'ticket', 'flight', 'entry'],
  },
  {
    id: 'slider-world',
    sectionKey: 'world-tours',
    badge: 'Global Dream Destinations',
    icon: 'fa-earth-americas',
    title: '6. World Best Places Tours',
    subtitle:
      'Overwater villa retreats in Maldives, Swiss Alpine rail scenic journeys, tropical Bali, and Cappadocia skies.',
    keywords: ['maldives', 'swiss', 'bali', 'turkey', 'salalah', 'world'],
  },
];

// Map backend DB tour document to frontend card model
const mapTourItem = (item, idx) => ({
  id: item._id || item.id || `tour-${idx}`,
  title: item.title || 'Tour Package',
  location: item.location || 'Dubai, UAE',
  rating: item.rating ? String(item.rating) : '5.0',
  hours: formatTourDuration(item.duration, item.hours),
  carHours: item.vehicle || item.carHours || '4WD Cruiser',
  guide: item.guide || 'Certified Guide',
  capacity: item.capacity || item.groupSize || '4 Persons',
  price: formatTourPrice(item.price, item.currency),
  image:
    (Array.isArray(item.images) && item.images[0]) ||
    item.image ||
    item.coverImage ||
    '/assets/cards/card5.jpg',
});

// Single Reusable Slider Sub-component with independent marquee controller
function SingleTourSlider({ slider, onBookTour }) {
  const { scrollPrev, scrollNext, hasDragged, containerProps } = useAutoManualScroll({
    speed: 0.9,
    cardWidth: 336,
    setsCount: 4,
  });

  const renderCard = (tour, keyPrefix) => (
    <div
      key={`${keyPrefix}-${tour.id}`}
      className="tour-trip-card"
      onClick={() => {
        if (!hasDragged() && onBookTour) {
          onBookTour(tour.title, tour.price);
        }
      }}
    >
      <div className="tour-card-img-wrap">
        <img
          src={tour.image}
          alt={tour.title}
          className="tour-card-img"
          loading="lazy"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = '/assets/cards/card5.jpg';
          }}
        />
      </div>
      <div className="tour-card-body">
        <div className="tour-card-header-meta">
          <span className="tour-location-tag">
            <i className="fa-solid fa-location-dot"></i> {tour.location}
          </span>
          <span className="tour-rating-stars">
            {tour.rating} <i className="fa-solid fa-star"></i>
          </span>
        </div>
        <h3 className="tour-card-title">{tour.title}</h3>
        <div className="tour-card-grid-meta">
          <div className="tour-meta-item">
            <i className="fa-regular fa-clock"></i> {tour.hours}
          </div>
          <div className="tour-meta-item">
            <i className="fa-solid fa-car-side"></i> {tour.carHours}
          </div>
          <div className="tour-meta-item">
            <i className="fa-solid fa-user-tie"></i> {tour.guide}
          </div>
          <div className="tour-meta-item">
            <i className="fa-solid fa-users"></i> {tour.capacity}
          </div>
        </div>
        <div className="tour-card-footer">
          <div className="tour-price-box">
            <span className="tour-price-value">{tour.price}</span>
            <span className="tour-price-unit">/Per person</span>
          </div>
          <button
            type="button"
            className="btn-book-tour"
            onClick={(e) => {
              e.stopPropagation();
              if (onBookTour) onBookTour(tour.title, tour.price);
            }}
          >
            Book Now
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div id={slider.id} style={{ marginBottom: '56px', scrollMarginTop: '100px' }}>
      <div className="container">
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            flexWrap: 'wrap',
            gap: '16px',
            marginBottom: '20px',
          }}
        >
          <div>
            <div className="section-badge-center" style={{ margin: 0, justifyContent: 'flex-start' }}>
              <span
                className="pill-badge-outline"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '7px' }}
              >
                <i className={`fa-solid ${slider.icon}`}></i> {slider.badge}
              </span>
            </div>
            <h2
              className="section-title"
              style={{
                fontSize: 'clamp(1.5rem, 2.2vw, 2.05rem)',
                margin: '8px 0 4px',
                fontWeight: 800,
                color: '#0A1F44',
              }}
            >
              {slider.title}
            </h2>
            {slider.subtitle && (
              <p style={{ margin: 0, color: '#64748b', fontSize: '0.92rem', maxWidth: '650px' }}>
                {slider.subtitle}
              </p>
            )}
          </div>
          <ScrollControlBar onPrev={scrollPrev} onNext={scrollNext} />
        </div>
      </div>

      <div className="tours-marquee-container" {...containerProps}>
        <div className="tours-marquee-track">
          {slider.items.map((t) => renderCard(t, `${slider.id}-set1`))}
          {slider.items.map((t) => renderCard(t, `${slider.id}-set2`))}
          {slider.items.map((t) => renderCard(t, `${slider.id}-set3`))}
          {slider.items.map((t) => renderCard(t, `${slider.id}-set4`))}
        </div>
      </div>
    </div>
  );
}

export default function ToursSection({ onBookTour }) {
  const { siteData } = useSiteData();
  const [liveTours, setLiveTours] = useState([]);
  const [loading, setLoading] = useState(true);

  // Sync with SiteDataContext
  useEffect(() => {
    if (siteData?.tours && siteData.tours.length > 0) {
      setLiveTours(siteData.tours);
      setLoading(false);
    }
  }, [siteData?.tours]);

  // Direct initial fetch and live update listeners
  useEffect(() => {
    const fetchTours = () => {
      api
        .get('/tours')
        .then((res) => {
          const data = Array.isArray(res.data) ? res.data : res.data?.data;
          if (Array.isArray(data)) {
            setLiveTours(data);
          }
        })
        .catch((err) => {
          console.error('[ToursSection] Error fetching tours:', err);
        })
        .finally(() => {
          setLoading(false);
        });
    };

    fetchTours();

    const handleUpdate = (e) => {
      if (e?.detail?.tours && Array.isArray(e.detail.tours)) {
        setLiveTours(e.detail.tours);
      } else {
        fetchTours();
      }
    };

    window.addEventListener('airdream-data-updated', handleUpdate);
    window.addEventListener('airdream:data_updated', handleUpdate);

    return () => {
      window.removeEventListener('airdream-data-updated', handleUpdate);
      window.removeEventListener('airdream:data_updated', handleUpdate);
    };
  }, []);

  // Dynamically partition backend tours into the 6 sections
  const sliders = useMemo(() => {
    return TOUR_SECTIONS_CONFIG.map((secConfig) => {
      const items = liveTours
        .filter((t) => {
          if (t.section) {
            const sec = t.section.toLowerCase().trim();
            if (sec === secConfig.sectionKey) return true;
            if (secConfig.sectionKey === 'visa-tickets' && (sec === 'visas' || sec === 'visa')) return true;
            if (secConfig.sectionKey === 'world-tours' && (sec === 'world' || sec === 'international')) return true;
            return false;
          }
          // Fallback matching for any legacy tours without explicit section
          const text = `${t.title || ''} ${t.location || ''} ${t.category || ''}`.toLowerCase();
          return secConfig.keywords.some((kw) => text.includes(kw));
        })
        .map((t, idx) => mapTourItem(t, idx));

      return {
        ...secConfig,
        items,
      };
    });
  }, [liveTours]);

  // Only display sliders that have tours from the backend
  const activeSliders = useMemo(() => {
    return sliders.filter((s) => s.items.length > 0);
  }, [sliders]);

  return (
    <section className="tours-trips-section" id="tours">
      {/* Master Section Header */}
      <div className="container" style={{ marginBottom: '36px' }}>
        <div style={{ textAlign: 'center', maxWidth: '800px', margin: '0 auto' }}>
          <div className="section-badge-center" style={{ margin: '0 auto 12px' }}>
            <span
              className="pill-badge-outline"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              <i className="fa-solid fa-compass" style={{ color: '#0284c7' }}></i>
              Curated Tour Collections
            </span>
          </div>
          <h2
            className="section-title"
            style={{
              fontSize: 'clamp(1.8rem, 3vw, 2.7rem)',
              margin: '0 0 12px 0',
              fontWeight: 800,
              color: '#0A1F44',
            }}
          >
            Explore Handcrafted Destinations &amp; Experiences
          </h2>
          <p style={{ color: '#64748b', fontSize: '1.02rem', lineHeight: 1.6, margin: '0 0 24px' }}>
            Discover our curated travel collections direct from our specialists: iconic Emirates sights, Azerbaijan escapes, sacred Umrah pilgrimages, and world-class retreats.
          </p>

          {/* Quick Category Jump Navigation Pills */}
          {activeSliders.length > 0 && (
            <div
              style={{
                display: 'flex',
                gap: '10px',
                flexWrap: 'wrap',
                justifyContent: 'center',
                margin: '0 auto',
              }}
            >
              {activeSliders.map((s, idx) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => {
                    const el = document.getElementById(s.id);
                    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '24px',
                    border: '1px solid #e2e8f0',
                    background: '#ffffff',
                    color: '#0f172a',
                    fontWeight: 600,
                    fontSize: '0.84rem',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '7px',
                    boxShadow: '0 2px 8px rgba(10,31,68,0.04)',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#0284c7';
                    e.currentTarget.style.color = '#0284c7';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = '#e2e8f0';
                    e.currentTarget.style.color = '#0f172a';
                    e.currentTarget.style.transform = 'none';
                  }}
                >
                  <i className={`fa-solid ${s.icon}`} style={{ color: '#0284c7' }}></i>
                  <span>{idx + 1}. {s.title.replace(/^\d+\.\s*/, '')}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Loading State */}
      {loading && liveTours.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
          <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: '2.5rem', color: '#0284c7' }}></i>
          <p style={{ marginTop: '16px', color: '#64748b' }}>Loading experiences from server...</p>
        </div>
      ) : activeSliders.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: '#94a3b8' }}>
          <i className="fa-solid fa-map-location-dot" style={{ fontSize: '3rem', opacity: 0.5, marginBottom: '16px' }}></i>
          <h3>No tours available at the moment</h3>
          <p style={{ fontSize: '0.92rem' }}>Please check back shortly or request a custom itinerary below.</p>
        </div>
      ) : (
        /* Render all active backend sliders */
        activeSliders.map((slider) => (
          <SingleTourSlider
            key={slider.id}
            slider={slider}
            onBookTour={onBookTour}
          />
        ))
      )}

      {/* Section Footer */}
      <div className="section-readmore-footer" style={{ marginTop: '20px' }}>
        <a href="#contact" className="section-footer-readmore-link">
          REQUEST CUSTOM TOUR ITINERARY
        </a>
      </div>
    </section>
  );
}
