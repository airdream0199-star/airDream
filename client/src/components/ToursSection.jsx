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
    return priceVal.startsWith('$') || priceVal.startsWith('AED') ? priceVal : `${currencyVal || 'AED'} ${priceVal}`;
  }
  return 'AED 150';
};

// 1. Top Places to Visit in Dubai
const DUBAI_DEFAULT_TOURS = [
  {
    id: 'dxb-1',
    title: 'Sunset Desert Safari & Bedouin BBQ Camp',
    location: 'Dubai Desert Conservation, UAE',
    rating: '5.0',
    hours: '06-Hrs',
    carHours: '4WD Land Cruiser',
    guide: 'Safari Guide',
    capacity: '6 Persons',
    price: 'AED 150',
    image: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'dxb-2',
    title: 'Burj Khalifa At The Top & Sky Views Observatory',
    location: 'Downtown Dubai, UAE',
    rating: '4.9',
    hours: '03-Hrs',
    carHours: 'Private Sedan',
    guide: 'Host / Audio',
    capacity: 'Solo / Family',
    price: 'AED 179',
    image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'dxb-3',
    title: 'Dubai Marina Luxury Yacht Cruise & Buffet Dinner',
    location: 'Dubai Marina & JBR, UAE',
    rating: '4.9',
    hours: '04-Hrs',
    carHours: 'Luxury Yacht',
    guide: 'Marine Captain',
    capacity: '8 Persons',
    price: 'AED 220',
    image: 'https://images.unsplash.com/photo-1570481662006-a3a1374699e8?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'dxb-4',
    title: 'Museum of the Future & Dubai Frame City Tour',
    location: 'Sheikh Zayed Road, Dubai',
    rating: '4.8',
    hours: '05-Hrs',
    carHours: 'VIP Executive Van',
    guide: 'Certified Guide',
    capacity: '7 Persons',
    price: 'AED 195',
    image: 'https://images.unsplash.com/photo-1634148545855-32a8427fefb3?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'dxb-5',
    title: 'Old Dubai Heritage, Gold Souk & Abra Creek Ride',
    location: 'Al Fahidi & Deira, Dubai',
    rating: '4.9',
    hours: '04-Hrs',
    carHours: 'Walking & Abra',
    guide: 'Cultural Guide',
    capacity: '10 Persons',
    price: 'AED 95',
    image: 'https://images.unsplash.com/photo-1580674285054-bed31e145f59?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'dxb-6',
    title: 'Hatta Mountain Dam Kayaking & Heritage Village',
    location: 'Hatta & Al Hajar Mountains',
    rating: '4.9',
    hours: '08-Hrs',
    carHours: '4WD Off-Roader',
    guide: 'Mountain Guide',
    capacity: '4 Persons',
    price: 'AED 280',
    image: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=800&q=80',
  },
];

// 2. Abu Dhabi Awaits You
const ABU_DHABI_DEFAULT_TOURS = [
  {
    id: 'auh-1',
    title: 'Sheikh Zayed Grand Mosque & Louvre Palace Tour',
    location: 'Abu Dhabi, UAE',
    rating: '5.0',
    hours: '09-Hrs',
    carHours: 'Executive SUV',
    guide: 'Certified Guide',
    capacity: '5 Persons',
    price: 'AED 290',
    image: 'https://images.unsplash.com/photo-1512632570417-a6032a6f446f?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'auh-2',
    title: 'Ferrari World & Yas Island Theme Park Day Pass',
    location: 'Yas Island, Abu Dhabi',
    rating: '4.9',
    hours: '10-Hrs',
    carHours: 'AC Luxury Coach',
    guide: 'Tour Escort',
    capacity: 'Family Pass',
    price: 'AED 340',
    image: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'auh-3',
    title: 'Qasr Al Watan Presidential Palace & Heritage Walk',
    location: 'Al Ras Al Akhdar, Abu Dhabi',
    rating: '4.9',
    hours: '04-Hrs',
    carHours: 'Chauffeur Sedan',
    guide: 'Palace Guide',
    capacity: '4 Persons',
    price: 'AED 165',
    image: 'https://images.unsplash.com/photo-1578895101408-1a36b834405b?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'auh-4',
    title: 'Warner Bros World & Yas Waterworld Adventure',
    location: 'Yas Island, Abu Dhabi',
    rating: '4.8',
    hours: '08-Hrs',
    carHours: 'Private Van',
    guide: 'Theme Park Pass',
    capacity: '6 Persons',
    price: 'AED 310',
    image: 'https://images.unsplash.com/photo-1513889961551-628c1e5e2ee9?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'auh-5',
    title: 'Abu Dhabi Eastern Mangroves Kayaking & Eco Safari',
    location: 'Mangrove National Park, Abu Dhabi',
    rating: '4.9',
    hours: '03-Hrs',
    carHours: 'Kayak & Gear',
    guide: 'Eco Guide',
    capacity: 'Small Group',
    price: 'AED 140',
    image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'auh-6',
    title: 'Yas Marina Circuit VIP Driving Experience',
    location: 'Yas Marina, Abu Dhabi',
    rating: '5.0',
    hours: '04-Hrs',
    carHours: 'Track Supercar',
    guide: 'Race Instructor',
    capacity: '1-2 Persons',
    price: 'AED 450',
    image: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=800&q=80',
  },
];

// 3. Explore Beautiful Baku
const BAKU_DEFAULT_TOURS = [
  {
    id: 'baku-1',
    title: 'Baku Old City (Icherisheher) & Maiden Tower Tour',
    location: 'Baku, Azerbaijan',
    rating: '4.9',
    hours: '05-Hrs',
    carHours: 'Comfort Minivan',
    guide: 'Local Historian',
    capacity: '6 Persons',
    price: 'AED 240',
    image: 'https://images.unsplash.com/photo-1541432901042-2d8bd64b4a9b?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'baku-2',
    title: 'Flame Towers & Baku Caspian Boulevard Promenade',
    location: 'Highland Park, Baku',
    rating: '4.8',
    hours: '04-Hrs',
    carHours: 'Private Sedan',
    guide: 'City Guide',
    capacity: '4 Persons',
    price: 'AED 195',
    image: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'baku-3',
    title: 'Gobustan Rock Art & Mud Volcanoes Off-Road Safari',
    location: 'Gobustan National Park, Azerbaijan',
    rating: '5.0',
    hours: '06-Hrs',
    carHours: '4x4 Lada / SUV',
    guide: 'Geology Guide',
    capacity: '4 Persons',
    price: 'AED 280',
    image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'baku-4',
    title: 'Ateshgah Fire Temple & Yanardag Burning Mountain',
    location: 'Absheron Peninsula, Azerbaijan',
    rating: '4.9',
    hours: '05-Hrs',
    carHours: 'Executive Van',
    guide: 'Cultural Guide',
    capacity: '6 Persons',
    price: 'AED 230',
    image: 'https://images.unsplash.com/photo-1518684079-3c830dcef090?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'baku-5',
    title: 'Shahdag Mountain Resort & Cable Car Ski Adventure',
    location: 'Greater Caucasus Mountains',
    rating: '5.0',
    hours: 'Full Day',
    carHours: 'Winter 4WD Coach',
    guide: 'Resort Escort',
    capacity: 'Family Pass',
    price: 'AED 390',
    image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'baku-6',
    title: 'Gabala Lakes & Tufandag Ropeway Scenic Escape',
    location: 'Gabala Nature Forest, Azerbaijan',
    rating: '4.9',
    hours: 'Full Day',
    carHours: 'VIP Sprinter',
    guide: 'Nature Guide',
    capacity: '8 Persons',
    price: 'AED 360',
    image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80',
  },
];

// 4. Your Perfect Umrah Journey
const UMRAH_DEFAULT_TOURS = [
  {
    id: 'umrah-1',
    title: 'VIP 5-Star Executive Umrah Package (Clock Tower)',
    location: 'Makkah & Madinah, KSA',
    rating: '5.0',
    hours: '10 Days / 9 Nights',
    carHours: 'Private GMC Yukon',
    guide: 'Dedicated Mutawwif',
    capacity: 'Family / Group',
    price: 'AED 3,850',
    image: 'https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'umrah-2',
    title: 'Deluxe Ramadan Spiritual Umrah Retreat',
    location: 'Haram Central Area, Makkah',
    rating: '5.0',
    hours: '14 Days / 13 Nights',
    carHours: 'Haramain Bullet Train',
    guide: 'Scholarly Guide',
    capacity: 'Group Package',
    price: 'AED 4,950',
    image: 'https://images.unsplash.com/photo-1564769625905-50e93615e769?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'umrah-3',
    title: 'Makkah & Madinah Historical Ziyarat Guided Tour',
    location: 'Jabal Al Nour, Quba & Uhud',
    rating: '4.9',
    hours: '06-Hrs',
    carHours: 'VIP Coaster / Sedan',
    guide: 'Certified Scholar',
    capacity: '8 Persons',
    price: 'AED 350',
    image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'umrah-4',
    title: 'Economy Comfort Umrah Group Journey',
    location: 'Makkah 4-Star & Madinah 4-Star',
    rating: '4.8',
    hours: '07 Days / 06 Nights',
    carHours: 'VIP AC Bus',
    guide: 'Group Coordinator',
    capacity: 'All Inclusive',
    price: 'AED 2,150',
    image: 'https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'umrah-5',
    title: 'Custom Luxury Umrah with Madinah First Entry',
    location: "Prophet's Mosque & Kaaba",
    rating: '5.0',
    hours: '08 Days / 07 Nights',
    carHours: 'Chauffeured Mercedes Van',
    guide: 'Private Guide',
    capacity: '4-6 Persons',
    price: 'AED 3,450',
    image: 'https://images.unsplash.com/photo-1565552645632-d725f8bfc19a?auto=format&fit=crop&w=800&q=80',
  },
];

// 5. Visit Visa and Tickets
const VISA_TICKET_DEFAULT_TOURS = [
  {
    id: 'visa-1',
    title: 'UAE 30/60 Days Tourist Visit Visa (Express 24h)',
    location: 'UAE Nationwide Entry',
    rating: '5.0',
    hours: '24-48 Hrs Processing',
    carHours: 'Digital Delivery',
    guide: 'Visa Specialist',
    capacity: '99% Success Rate',
    price: 'AED 365',
    image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'visa-2',
    title: 'Schengen Visa Fast-Track Appointment & File Prep',
    location: 'France, Italy, Germany & Europe',
    rating: '4.9',
    hours: 'Priority Slot',
    carHours: 'Consultation Desk',
    guide: 'Senior Immigration Agent',
    capacity: 'Full Documentation',
    price: 'AED 499',
    image: 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'visa-3',
    title: 'Saudi Arabia Tourist & Multiple Entry Umrah Visa',
    location: 'Kingdom of Saudi Arabia',
    rating: '5.0',
    hours: '1 Year Multiple Entry',
    carHours: 'Direct MoFA Approval',
    guide: 'GCC Visa Consultant',
    capacity: 'Instant E-Visa',
    price: 'AED 460',
    image: 'https://images.unsplash.com/photo-1580674684081-7617fbf3d745?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'visa-4',
    title: 'UK & USA Visa Complete Application Assistance',
    location: 'London & United States',
    rating: '4.8',
    hours: 'Full Application Service',
    carHours: 'Document Review',
    guide: 'Certified Visa Agent',
    capacity: 'Mock Interview Prep',
    price: 'AED 590',
    image: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'visa-5',
    title: 'Worldwide Cheap Flight Booking & Airline Tickets',
    location: 'Emirates, Qatar, Saudia & Global',
    rating: '4.9',
    hours: 'Instant E-Ticket',
    carHours: 'Best Fare Guarantee',
    guide: '24/7 Ticketing Desk',
    capacity: 'Economy & Business',
    price: 'AED 299',
    image: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'visa-6',
    title: 'Oman 10/30 Days GCC Resident Visa & Border Pass',
    location: 'Muscat, Salalah & Oman Borders',
    rating: '4.9',
    hours: 'Same-Day Approval',
    carHours: 'Express E-Visa',
    guide: 'Border Clearance',
    capacity: 'Families & Expats',
    price: 'AED 180',
    image: 'https://images.unsplash.com/photo-1432405972618-c60b0225b8f9?auto=format&fit=crop&w=800&q=80',
  },
];

// 6. World Best Places Tours
const WORLD_DEFAULT_TOURS = [
  {
    id: 'world-1',
    title: 'Tropical Maldives Luxury Overwater Villa Escape',
    location: 'Male & South Atolls, Maldives',
    rating: '5.0',
    hours: '05 Days / 04 Nights',
    carHours: 'Speedboat / Seaplane',
    guide: 'Resort Butler',
    capacity: 'Couples & Families',
    price: 'AED 2,890',
    image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'world-2',
    title: 'Swiss Alpine Peaks, Zurich & Lucerne Scenic Train',
    location: 'Switzerland, Europe',
    rating: '5.0',
    hours: '07 Days / 06 Nights',
    carHours: 'Swiss Rail Pass',
    guide: 'English Speaking Guide',
    capacity: 'Small Group Tour',
    price: 'AED 4,200',
    image: 'https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'world-3',
    title: 'Bali Island Paradise, Ubud Waterfalls & Rice Terraces',
    location: 'Bali & Nusa Penida, Indonesia',
    rating: '4.9',
    hours: '06 Days / 05 Nights',
    carHours: 'Private AC Van',
    guide: 'Balinese Local Guide',
    capacity: '4 Persons',
    price: 'AED 1,950',
    image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'world-4',
    title: 'Turkey Wonders: Istanbul Bosphorus & Cappadocia Balloon',
    location: 'Istanbul & Cappadocia, Turkey',
    rating: '4.9',
    hours: '06 Days / 05 Nights',
    carHours: 'VIP Coach & Balloon',
    guide: 'Licensed Tour Guide',
    capacity: 'Group Package',
    price: 'AED 2,450',
    image: 'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'world-5',
    title: 'East Salalah Mountain Safari, Waterfalls & Coast',
    location: 'Salalah, Dhofar, Oman',
    rating: '5.0',
    hours: '08-Hrs',
    carHours: '4WD Cruiser',
    guide: 'Driver-guide',
    capacity: '4 Persons',
    price: 'AED 310',
    image: 'https://images.unsplash.com/photo-1432405972618-c60b0225b8f9?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'world-6',
    title: 'Thailand Tropical Escape: Phuket & Phi Phi Islands',
    location: 'Phuket & Krabi, Thailand',
    rating: '4.8',
    hours: '06 Days / 05 Nights',
    carHours: 'Speedboat & Private Van',
    guide: 'Island Guide',
    capacity: 'Couples / Groups',
    price: 'AED 1,850',
    image: 'https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?auto=format&fit=crop&w=800&q=80',
  },
];

const mapTourItem = (item, idx, fallbackList) => ({
  id: item.id || item._id || `tour-${idx}`,
  title: item.title,
  location: item.location || item.tagline || 'Dubai, UAE',
  rating: item.rating ? `${item.rating}` : '5.0',
  hours: formatTourDuration(item.duration, item.hours),
  carHours: item.vehicle || item.carHours || '4WD Cruiser',
  guide: item.guide || 'Certified Guide',
  capacity: item.capacity || item.groupSize || '4 Persons',
  price: formatTourPrice(item.price, item.currency),
  image:
    item.image ||
    item.coverImage ||
    (item.images && item.images[0]) ||
    fallbackList[idx % fallbackList.length]?.image ||
    'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=800&q=80',
});

// Reusable Tour Slider Sub-component with independent marquee scroll
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
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=800&q=80';
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

  useEffect(() => {
    if (siteData?.tours && siteData.tours.length > 0) {
      setLiveTours(siteData.tours);
    }
  }, [siteData?.tours]);

  // Initial fetch / live sync listener
  useEffect(() => {
    const handleUpdate = (e) => {
      if (e?.detail?.tours && Array.isArray(e.detail.tours)) {
        setLiveTours(e.detail.tours);
      } else {
        api.get('/tours')
          .then((res) => {
            const data = Array.isArray(res.data) ? res.data : res.data?.data;
            if (Array.isArray(data) && data.length > 0) {
              setLiveTours(data);
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

  // Configure the 6 requested sliders with dynamic database integration
  const sliders = useMemo(() => {
    const matchesSection = (t, sectionKey, fallbackKeywords) => {
      if (t.section) {
        return t.section.toLowerCase().trim() === sectionKey.toLowerCase();
      }
      const text = `${t.title || ''} ${t.location || ''} ${t.category || ''}`.toLowerCase();
      return fallbackKeywords.some((kw) => text.includes(kw));
    };

    const filterAndMerge = (filterFn, defaultList) => {
      const dbMatches = liveTours.filter(filterFn);
      if (dbMatches.length > 0) {
        const mappedDb = dbMatches.map((t, idx) => mapTourItem(t, idx, defaultList));
        // Combine DB matches with curated defaults, avoiding duplicates by title
        const existingTitles = new Set(mappedDb.map((m) => m.title.toLowerCase().trim()));
        const remainingDefaults = defaultList.filter(
          (d) => !existingTitles.has(d.title.toLowerCase().trim())
        );
        return [...mappedDb, ...remainingDefaults];
      }
      return defaultList;
    };

    return [
      {
        id: 'slider-dubai',
        badge: 'Dubai Iconic Experiences',
        icon: 'fa-city',
        title: '1. Top Places to Visit in Dubai',
        subtitle:
          'From thrilling desert dune bashing to Burj Khalifa heights, luxury yacht cruises, and historical creek souks.',
        items: filterAndMerge(
          (t) => matchesSection(t, 'dubai', ['dubai', 'desert', 'burj', 'marina', 'safari']),
          DUBAI_DEFAULT_TOURS
        ),
      },
      {
        id: 'slider-abu-dhabi',
        badge: 'Capital Splendor & Thrills',
        icon: 'fa-mosque',
        title: '2. Abu Dhabi Awaits You',
        subtitle:
          'Experience the architectural marvel of Sheikh Zayed Grand Mosque, Louvre art, Ferrari World, and royal palaces.',
        items: filterAndMerge(
          (t) => matchesSection(t, 'abu-dhabi', ['abu dhabi', 'sheikh zayed', 'ferrari', 'yas', 'qasr']),
          ABU_DHABI_DEFAULT_TOURS
        ),
      },
      {
        id: 'slider-baku',
        badge: 'Azerbaijan Jewels',
        icon: 'fa-mountain-sun',
        title: '3. Explore Beautiful Baku',
        subtitle:
          'Step into ancient cobblestone alleys, futuristic Flame Towers, bubbling mud volcanoes, and snowy Shahdag slopes.',
        items: filterAndMerge(
          (t) => matchesSection(t, 'baku', ['baku', 'azerbaijan', 'shahdag', 'gabala']),
          BAKU_DEFAULT_TOURS
        ),
      },
      {
        id: 'slider-umrah',
        badge: 'Sacred Pilgrimage Services',
        icon: 'fa-kaaba',
        title: '4. Your Perfect Umrah Journey',
        subtitle:
          'VIP 5-star packages near the Haramain, private GMC transport, certified Mutawwif guidance, and Ziyarat tours.',
        items: filterAndMerge(
          (t) => matchesSection(t, 'umrah', ['umrah', 'makkah', 'madinah', 'ziyarat', 'haram']),
          UMRAH_DEFAULT_TOURS
        ),
      },
      {
        id: 'slider-visas',
        badge: 'Visas & Travel Documentation',
        icon: 'fa-passport',
        title: '5. Visit Visa and Tickets',
        subtitle:
          'Fast 24-48h UAE visit visas, Schengen priority assistance, Saudi e-visas, and worldwide airline ticket bookings.',
        items: filterAndMerge(
          (t) => matchesSection(t, 'visa-tickets', ['visa', 'ticket', 'flight', 'entry']),
          VISA_TICKET_DEFAULT_TOURS
        ),
      },
      {
        id: 'slider-world',
        badge: 'Global Dream Destinations',
        icon: 'fa-earth-americas',
        title: '6. World Best Places Tours',
        subtitle:
          'Overwater villa retreats in Maldives, Swiss Alpine rail scenic journeys, tropical Bali, and Cappadocia skies.',
        items: filterAndMerge(
          (t) => matchesSection(t, 'world-tours', ['maldives', 'swiss', 'bali', 'turkey', 'salalah', 'world']),
          WORLD_DEFAULT_TOURS
        ),
      },
    ];
  }, [liveTours]);

  return (
    <section className="tours-trips-section" id="tours">
      {/* Master Section Header */}
      <div className="container" style={{ marginBottom: '36px' }}>
        <div style={{ textAlign: 'center', maxWidth: '800px', margin: '0 auto' }}>
          <div className="section-badge-center" style={{ margin: '0 auto 12px' }}>
            <span className="pill-badge-outline" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <i className="fa-solid fa-compass" style={{ color: '#0284c7' }}></i> Curated Tour Collections
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
            Choose from our 6 signature travel collections: from iconic Dubai and Abu Dhabi sights to Azerbaijan mountain escapes, sacred Umrah journeys, and global luxury retreats.
          </p>

          {/* Quick Category Jump Navigation Pills */}
          <div
            style={{
              display: 'flex',
              gap: '10px',
              flexWrap: 'wrap',
              justifyContent: 'center',
              margin: '0 auto',
            }}
          >
            {sliders.map((s, idx) => (
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
        </div>
      </div>

      {/* Render all 6 individual sliders */}
      {sliders.map((slider) => (
        <SingleTourSlider
          key={slider.id}
          slider={slider}
          onBookTour={onBookTour}
        />
      ))}

      {/* Section Footer */}
      <div className="section-readmore-footer" style={{ marginTop: '20px' }}>
        <a href="#contact" className="section-footer-readmore-link">
          REQUEST CUSTOM TOUR ITINERARY
        </a>
      </div>
    </section>
  );
}
