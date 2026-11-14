import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { useAutoManualScroll } from '../hooks/useAutoManualScroll';
import ScrollControlBar from './ScrollControlBar';
import { useSiteData } from '../context/SiteDataContext';

const DEFAULT_HOLIDAY_PACKAGES = [
  {
    id: 'hp-1',
    title: 'Atlantis Aquaventure & Lost Chambers VIP Pass',
    location: 'Palm Jumeirah, Dubai',
    rating: '5.0',
    hours: 'Full Day',
    carHours: 'Luxury Sprinter',
    guide: 'Park Concierge',
    capacity: '2–8 Guests',
    price: '$135',
    image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'hp-2',
    title: 'Dubai Marina Luxury Dhow Dinner Cruise & Live Show',
    location: 'Dubai Marina, UAE',
    rating: '4.9',
    hours: '03-Hrs',
    carHours: 'Glass Dhow Yacht',
    guide: 'On-board Host',
    capacity: '4–10 Guests',
    price: '$65',
    image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'hp-3',
    title: 'Musandam Oman Fjords Cruise, Snorkeling & Dolphins',
    location: 'Khasab, Musandam',
    rating: '5.0',
    hours: '10-Hrs',
    carHours: 'A/C VIP Coach',
    guide: 'Marine Guide',
    capacity: '6–12 Guests',
    price: '$115',
    image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'hp-4',
    title: 'Sunrise Hot Air Balloon Over Margham Red Dunes',
    location: 'Al Margham Desert',
    rating: '5.0',
    hours: '05-Hrs',
    carHours: '4WD Cruiser',
    guide: 'Licensed Pilot',
    capacity: '2–6 Guests',
    price: '$285',
    image: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'hp-5',
    title: 'Ferrari World & Warner Bros World Yas Island Pass',
    location: 'Yas Island, Abu Dhabi',
    rating: '4.9',
    hours: '09-Hrs',
    carHours: 'Executive Van',
    guide: 'English Guide',
    capacity: '4–8 Guests',
    price: '$175',
    image: 'https://images.unsplash.com/photo-1518684079-3c830dcef090?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'hp-6',
    title: 'Al Ain Garden City, Jebel Hafeet & Hot Springs Tour',
    location: 'Al Ain, UAE',
    rating: '4.9',
    hours: '08-Hrs',
    carHours: '4WD Cruiser',
    guide: 'Heritage Guide',
    capacity: '4–6 Guests',
    price: '$145',
    image: 'https://images.unsplash.com/photo-1512632570417-a6032a6f446f?auto=format&fit=crop&w=800&q=80'
  }
];

export default function HolidayPackagesSection({ onBookPackage }) {
  const { siteData } = useSiteData();
  const [packages, setPackages] = useState(() => {
    if (siteData?.holidayPackages && siteData.holidayPackages.length > 0) {
      return siteData.holidayPackages;
    }
    return DEFAULT_HOLIDAY_PACKAGES;
  });

  const {
    scrollPrev,
    scrollNext,
    hasDragged,
    containerProps
  } = useAutoManualScroll({ speed: 1.0, cardWidth: 336, setsCount: 4 });

  const formatPackageDuration = (val, hoursFallback) => {
    if (typeof val === 'string' && val.trim()) return val;
    if (typeof hoursFallback === 'string' && hoursFallback.trim()) return hoursFallback;
    if (val && typeof val === 'object') {
      const days = val.days ?? 0;
      const nights = val.nights ?? 0;
      if (days && nights) return `${days}D / ${nights}N`;
      if (days) return `${days} Day${days > 1 ? 's' : ''}`;
      if (nights) return `${nights} Night${nights > 1 ? 's' : ''}`;
    }
    return 'Full Day';
  };

  const formatPackagePrice = (priceVal, currencyVal = 'AED') => {
    if (priceVal === null || priceVal === undefined || priceVal === '') return 'AED 299';
    if (typeof priceVal === 'object') {
      const curr = priceVal.currency || currencyVal || 'AED';
      const amt = priceVal.amount ?? priceVal.value ?? '';
      return amt !== '' ? `${curr} ${amt}` : 'AED 299';
    }
    if (typeof priceVal === 'number') {
      return `${currencyVal || 'AED'} ${priceVal}`;
    }
    if (typeof priceVal === 'string') {
      return priceVal.startsWith('$') || priceVal.startsWith('AED') ? priceVal : `${currencyVal || 'AED'} ${priceVal}`;
    }
    return 'AED 299';
  };

  const mapPackage = (item, idx) => ({
    id: item.id || item._id || `hp-${idx}`,
    title: item.title,
    location: item.location || item.tagline || 'Dubai, UAE',
    rating: item.rating ? `${item.rating}` : '5.0',
    hours: formatPackageDuration(item.duration, item.hours),
    carHours: item.vehicle || item.carHours || 'VIP Transfer',
    guide: item.guide || 'Driver-guide',
    capacity: item.capacity || item.groupSize || '4 Persons',
    price: formatPackagePrice(item.price, item.currency),
    image:
      item.image ||
      item.coverImage ||
      (item.images && item.images[0]) ||
      DEFAULT_HOLIDAY_PACKAGES[idx % DEFAULT_HOLIDAY_PACKAGES.length].image
  });

  useEffect(() => {
    if (siteData?.holidayPackages && siteData.holidayPackages.length > 0) {
      setPackages(siteData.holidayPackages.map(mapPackage));
    }
  }, [siteData?.holidayPackages]);

  useEffect(() => {
    // Initial fetch from backend if siteData not ready
    api.get('/holiday-packages')
      .then((res) => {
        if (res.data?.length > 0) {
          setPackages(res.data.map(mapPackage));
        }
      })
      .catch(() => {});

    const handleUpdate = (e) => {
      if (e?.detail?.holidayPackages && Array.isArray(e.detail.holidayPackages)) {
        setPackages(e.detail.holidayPackages.map(mapPackage));
      } else {
        try {
          const stored = localStorage.getItem('air_dream_site_data_v2');
          if (stored) {
            const parsed = JSON.parse(stored);
            if (parsed.holidayPackages?.length > 0) {
              setPackages(parsed.holidayPackages.map(mapPackage));
              return;
            }
          }
        } catch (err) {}

        api.get('/holiday-packages')
          .then((res) => {
            if (res.data?.length > 0) {
              setPackages(res.data.map(mapPackage));
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

  const renderCard = (pkg, keyPrefix) => (
    <div
      key={`${keyPrefix}-${pkg.id}`}
      className="tour-trip-card"
      onClick={() => {
        if (!hasDragged()) {
          onBookPackage && onBookPackage(pkg.title, pkg.price);
        }
      }}
    >
      <div className="tour-card-img-wrap">
        <img
          src={pkg.image}
          alt={pkg.title}
          className="tour-card-img"
          loading="lazy"
          onError={(e) => {
            e.target.onerror = null;
            const fallbackIdx = typeof pkg.id === 'number' ? pkg.id : 0;
            e.target.src = DEFAULT_HOLIDAY_PACKAGES[fallbackIdx % DEFAULT_HOLIDAY_PACKAGES.length].image;
          }}
        />
      </div>
      <div className="tour-card-body">
        <div className="tour-card-header-meta">
          <span className="tour-location-tag">
            <i className="fa-solid fa-location-dot"></i> {pkg.location}
          </span>
          <span className="tour-rating-stars">
            {pkg.rating} <i className="fa-solid fa-star"></i>
          </span>
        </div>
        <h3 className="tour-card-title">{pkg.title}</h3>
        <div className="tour-card-grid-meta">
          <div className="tour-meta-item">
            <i className="fa-regular fa-clock"></i> {pkg.hours}
          </div>
          <div className="tour-meta-item">
            <i className="fa-solid fa-car-side"></i> {pkg.carHours}
          </div>
          <div className="tour-meta-item">
            <i className="fa-solid fa-user-tie"></i> {pkg.guide}
          </div>
          <div className="tour-meta-item">
            <i className="fa-solid fa-users"></i> {pkg.capacity}
          </div>
        </div>
        <div className="tour-card-footer">
          <div className="tour-price-box">
            <span className="tour-price-value">{pkg.price}</span>
            <span className="tour-price-unit">/Per person</span>
          </div>
          <button
            type="button"
            className="btn-book-tour"
            onClick={(e) => {
              e.stopPropagation();
              if (onBookPackage) onBookPackage(pkg.title, pkg.price);
            }}
          >
            Book Now
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <section className="tours-trips-section" id="holiday-packages">
      <div className="container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
          <div>
            <div className="section-badge-center" style={{ margin: 0, justifyContent: 'flex-start' }}>
              <span className="pill-badge-outline">Special Holiday</span>
            </div>
            <h2 className="section-title" style={{ fontSize: 'clamp(1.6rem, 2.5vw, 2.3rem)', margin: '8px 0 0', fontWeight: 800, color: '#0A1F44' }}>
              Special Holiday Packages
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
          {packages.map((p) => renderCard(p, 'hp1'))}
          {packages.map((p) => renderCard(p, 'hp2'))}
          {packages.map((p) => renderCard(p, 'hp3'))}
          {packages.map((p) => renderCard(p, 'hp4'))}
        </div>
      </div>

      <div className="section-readmore-footer">
        <a href="#packages" className="section-footer-readmore-link">
          READ MORE
        </a>
      </div>
    </section>
  );
}
