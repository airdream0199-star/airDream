import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { useAutoManualScroll } from '../hooks/useAutoManualScroll';
import ScrollControlBar from './ScrollControlBar';
import { useSiteData } from '../context/SiteDataContext';

const DEFAULT_TOURS = [
  {
    id: 'tour-1',
    title: 'Sunset Desert Safari & BBQ Dinner at Bedouin Camp',
    location: 'Dubai Desert, UAE',
    rating: '5.0',
    hours: '06-Hrs',
    carHours: '4WD Cruiser',
    guide: 'Driver-guide',
    capacity: '6 Persons',
    price: '$120',
    image: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'tour-2',
    title: 'Private Dubai City & Modern Wonders 4WD Tour',
    location: 'Dubai & Beyond',
    rating: '4.9',
    hours: '08-Hrs',
    carHours: 'VIP Luxury 4WD',
    guide: 'Private Guide',
    capacity: '4 Persons',
    price: '$290',
    image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'tour-3',
    title: 'East Salalah Mountain Safari & Waterfalls',
    location: 'Salalah / Oman',
    rating: '5.0',
    hours: '08-Hrs',
    carHours: '4WD Cruiser',
    guide: 'Driver-guide',
    capacity: '4 Persons',
    price: '$85',
    image: 'https://images.unsplash.com/photo-1432405972618-c60b0225b8f9?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'tour-4',
    title: 'Coastal Dolphin Watching & Snorkeling Cruise',
    location: 'Dubai Marina & Coast',
    rating: '4.9',
    hours: '04-Hrs',
    carHours: 'Luxury Yacht',
    guide: 'Marine Captain',
    capacity: '8 Persons',
    price: '$65',
    image: 'https://images.unsplash.com/photo-1570481662006-a3a1374699e8?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'tour-5',
    title: 'Abu Dhabi Grand Mosque & Louvre Palace Tour',
    location: 'Abu Dhabi, UAE',
    rating: '5.0',
    hours: '09-Hrs',
    carHours: 'Executive SUV',
    guide: 'Certified Guide',
    capacity: '5 Persons',
    price: '$150',
    image: 'https://images.unsplash.com/photo-1512632570417-a6032a6f446f?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'tour-6',
    title: 'Hatta Mountain Heritage & Kayaking Tour',
    location: 'Hatta & Al Hajar',
    rating: '4.9',
    hours: '07-Hrs',
    carHours: '4WD Off-Roader',
    guide: 'Mountain Guide',
    capacity: '4 Persons',
    price: '$110',
    image: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=800&q=80'
  }
];

export default function ToursSection({ onBookTour }) {
  const { siteData } = useSiteData();
  const [tours, setTours] = useState(() => {
    if (siteData?.tours && siteData.tours.length > 0) {
      return siteData.tours;
    }
    return DEFAULT_TOURS;
  });

  const {
    scrollPrev,
    scrollNext,
    hasDragged,
    containerProps
  } = useAutoManualScroll({ speed: 1.0, cardWidth: 336, setsCount: 4 });

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
    if (priceVal === null || priceVal === undefined || priceVal === '') return 'AED 120';
    if (typeof priceVal === 'object') {
      const curr = priceVal.currency || currencyVal || 'AED';
      const amt = priceVal.amount ?? priceVal.value ?? '';
      return amt !== '' ? `${curr} ${amt}` : 'AED 120';
    }
    if (typeof priceVal === 'number') {
      return `${currencyVal || 'AED'} ${priceVal}`;
    }
    if (typeof priceVal === 'string') {
      return priceVal.startsWith('$') || priceVal.startsWith('AED') ? priceVal : `${currencyVal || 'AED'} ${priceVal}`;
    }
    return 'AED 120';
  };

  const mapTour = (item, idx) => ({
    id: item.id || item._id || `tour-${idx}`,
    title: item.title,
    location: item.location || item.tagline || 'Dubai, UAE',
    rating: item.rating ? `${item.rating}` : '5.0',
    hours: formatTourDuration(item.duration, item.hours),
    carHours: item.vehicle || item.carHours || '4WD Cruiser',
    guide: item.guide || 'Driver-guide',
    capacity: item.capacity || item.groupSize || '4 Persons',
    price: formatTourPrice(item.price, item.currency),
    image:
      item.image ||
      item.coverImage ||
      (item.images && item.images[0]) ||
      DEFAULT_TOURS[idx % DEFAULT_TOURS.length].image
  });

  useEffect(() => {
    if (siteData?.tours && siteData.tours.length > 0) {
      setTours(siteData.tours.map(mapTour));
    }
  }, [siteData?.tours]);

  useEffect(() => {
    const handleUpdate = (e) => {
      if (e?.detail?.tours && Array.isArray(e.detail.tours)) {
        setTours(e.detail.tours.map(mapTour));
      } else {
        try {
          const stored = localStorage.getItem('air_dream_site_data_v2');
          if (stored) {
            const parsed = JSON.parse(stored);
            if (parsed.tours?.length > 0) {
              setTours(parsed.tours.map(mapTour));
              return;
            }
          }
        } catch (err) {}

        api.get('/tours')
          .then((res) => {
            if (res.data?.length > 0) {
              setTours(res.data.map(mapTour));
            }
          })
          .catch(() => {});
      }
    };

    window.addEventListener('airdream-data-updated', handleUpdate);
    window.addEventListener('airdream:data_updated', handleUpdate);

    return () => {
      window.removeEventListener('airdream-data-updated', handleUpdate);
      window.removeEventListener('airdream:data_updated', handleUpdate);
    };
  }, []);

  const renderCard = (tour, keyPrefix) => (
    <div
      key={`${keyPrefix}-${tour.id}`}
      className="tour-trip-card"
      onClick={() => {
        if (!hasDragged()) {
          onBookTour && onBookTour(tour.title, tour.price);
        }
      }}
    >
      <div className="tour-card-img-wrap">
        <img
          src={tour.image}
          alt={tour.title}
          className="tour-card-img"
          loading="lazy"
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
    <section className="tours-trips-section" id="tours">
      <div className="container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
          <div>
            <div className="section-badge-center" style={{ margin: 0, justifyContent: 'flex-start' }}>
              <span className="pill-badge-outline">Attractions - Ticket</span>
            </div>
            <h2 className="section-title" style={{ fontSize: 'clamp(1.6rem, 2.5vw, 2.3rem)', margin: '8px 0 0', fontWeight: 800, color: '#0A1F44' }}>
              Featured Tour Packages
            </h2>
          </div>
          <ScrollControlBar
            onPrev={scrollPrev}
            onNext={scrollNext}
          />
        </div>
      </div>

      <div className="tours-marquee-container" {...containerProps}>
        <div className="tours-marquee-track">
          {tours.map((t) => renderCard(t, 't1'))}
          {tours.map((t) => renderCard(t, 't2'))}
          {tours.map((t) => renderCard(t, 't3'))}
          {tours.map((t) => renderCard(t, 't4'))}
        </div>
      </div>

      <div className="section-readmore-footer">
        <a href="#contact" className="section-footer-readmore-link">
          READ MORE
        </a>
      </div>
    </section>
  );
}
