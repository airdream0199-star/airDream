import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { useSiteData } from '../context/SiteDataContext';

const DEFAULT_PACKAGES = [
  {
    id: 1,
    category: 'tours',
    title: 'Dubai Luxury Skyline & Red Dune Desert Safari',
    image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=800&q=80',
    badge: 'Best Seller',
    badgeClass: 'gold',
    duration: '5 Days / 4 Nights',
    ratingCategory: 'Holiday Escape',
    rating: 4.9,
    reviews: 128,
    featured: true,
    inclusions: [
      { icon: 'fa-hotel', text: '5-Star Hotel' },
      { icon: 'fa-car', text: 'VIP Transfers' },
      { icon: 'fa-utensils', text: 'Daily Breakfast' }
    ],
    price: '$649'
  },
  {
    id: 2,
    category: 'umrah',
    title: 'Executive 5-Star Umrah Package (Front of Haram)',
    image: 'https://images.unsplash.com/photo-1564769625905-50e93615e769?auto=format&fit=crop&w=800&q=80',
    badge: 'Spiritual VIP',
    badgeClass: '',
    duration: '10 Days / 9 Nights',
    ratingCategory: 'Hajj & Umrah',
    rating: 5.0,
    reviews: 340,
    featured: true,
    inclusions: [
      { icon: 'fa-plane', text: 'Return Flights' },
      { icon: 'fa-hotel', text: 'Clock Tower Hotel' },
      { icon: 'fa-passport', text: 'Umrah Visa' }
    ],
    price: '$1,199'
  },
  {
    id: 3,
    category: 'tours',
    title: 'Bali Tropical Paradise, Ubud & Nusa Penida Island',
    image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=800&q=80',
    badge: 'Trending',
    badgeClass: 'gold',
    duration: '7 Days / 6 Nights',
    ratingCategory: 'Tropical Holiday',
    rating: 4.8,
    reviews: 95,
    featured: false,
    inclusions: [
      { icon: 'fa-house-chimney-window', text: 'Pool Villa' },
      { icon: 'fa-ship', text: 'Speedboat Cruise' },
      { icon: 'fa-spa', text: 'Balinese Spa' }
    ],
    price: '$899'
  },
  {
    id: 4,
    category: 'flights',
    title: 'Roundtrip Dubai to London Heathrow (Emirates)',
    image: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=800&q=80',
    badge: 'Direct Flight',
    badgeClass: '',
    duration: 'Flexible Return',
    ratingCategory: 'International Air',
    rating: 4.9,
    reviews: 210,
    featured: false,
    inclusions: [
      { icon: 'fa-plane-departure', text: 'Direct Emirates' },
      { icon: 'fa-suitcase', text: '2x 23kg Luggage' },
      { icon: 'fa-utensils', text: 'Gourmet Dining' }
    ],
    price: '$580'
  },
  {
    id: 5,
    category: 'tours',
    title: 'Swiss Alps Panoramic Trains, Zurich & Interlaken',
    image: 'https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?auto=format&fit=crop&w=800&q=80',
    badge: 'Luxury Alpine',
    badgeClass: '',
    duration: '8 Days / 7 Nights',
    ratingCategory: 'Scenic Escapes',
    rating: 4.9,
    reviews: 112,
    featured: true,
    inclusions: [
      { icon: 'fa-train-subway', text: 'Glacier Express' },
      { icon: 'fa-hotel', text: '4-Star Alpine Lodge' },
      { icon: 'fa-cable-car', text: 'Jungfrau Pass' }
    ],
    price: '$1,450'
  },
  {
    id: 6,
    category: 'flights',
    title: 'Roundtrip Dubai to New York JFK (Etihad Airways)',
    image: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?auto=format&fit=crop&w=800&q=80',
    badge: 'Special Fare',
    badgeClass: 'gold',
    duration: '1 Stop • Fast Transit',
    ratingCategory: 'International Air',
    rating: 4.8,
    reviews: 84,
    featured: false,
    inclusions: [
      { icon: 'fa-plane', text: 'Etihad Airways' },
      { icon: 'fa-tv', text: 'Full Entertainment' },
      { icon: 'fa-clock', text: 'Flexible Dates' }
    ],
    price: '$790'
  },
  {
    id: 7,
    category: 'tours',
    title: 'Istanbul & Cappadocia Cave Suites Hot Air Balloon',
    image: 'https://images.unsplash.com/photo-1527838832700-5059252407fa?auto=format&fit=crop&w=800&q=80',
    badge: 'Hot Deal',
    badgeClass: 'gold',
    duration: '6 Days / 5 Nights',
    ratingCategory: 'Historical Escapes',
    rating: 4.95,
    reviews: 168,
    featured: true,
    inclusions: [
      { icon: 'fa-hotel', text: 'Cave Hotel' },
      { icon: 'fa-plane', text: 'Hot Air Balloon' },
      { icon: 'fa-utensils', text: 'Turkish Breakfast' }
    ],
    price: '$920'
  },
  {
    id: 8,
    category: 'umrah',
    title: 'Deluxe Madinah & Makkah 14-Day Spiritual Journey',
    image: 'https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?auto=format&fit=crop&w=800&q=80',
    badge: 'All Inclusive VIP',
    badgeClass: '',
    duration: '14 Days / 13 Nights',
    ratingCategory: 'Hajj & Umrah',
    rating: 5.0,
    reviews: 295,
    featured: true,
    inclusions: [
      { icon: 'fa-plane', text: 'Direct Saudi Airlines' },
      { icon: 'fa-hotel', text: 'Haram Front View' },
      { icon: 'fa-car', text: 'Private GMC Transport' }
    ],
    price: '$1,590'
  },
  {
    id: 9,
    category: 'flights',
    title: 'Nonstop Dubai to Singapore Changi (Singapore Airlines)',
    image: 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?auto=format&fit=crop&w=800&q=80',
    badge: 'Direct Flight',
    badgeClass: 'gold',
    duration: 'Direct • 7h 20m',
    ratingCategory: 'International Air',
    rating: 4.9,
    reviews: 142,
    featured: false,
    inclusions: [
      { icon: 'fa-plane', text: 'Singapore Airlines' },
      { icon: 'fa-suitcase', text: '30kg Luggage' },
      { icon: 'fa-utensils', text: 'World-Class Catering' }
    ],
    price: '$640'
  }
];

export default function PackagesSection({ onBookPackage }) {
  const { siteData } = useSiteData();
  const [activeFilter, setActiveFilter] = useState('all');
  const [showAll, setShowAll] = useState(false);
  const [packages, setPackages] = useState(() => {
    if (siteData?.packages && siteData.packages.length > 0) {
      return siteData.packages;
    }
    return DEFAULT_PACKAGES;
  });

  const mapPackage = (item, idx) => {
    const rawCat = (item.category || 'tours').toLowerCase();
    let normalizedCategory = 'tours';
    if (rawCat.includes('umrah')) normalizedCategory = 'umrah';
    else if (rawCat.includes('flight')) normalizedCategory = 'flights';
    else if (rawCat.includes('holiday')) normalizedCategory = 'tours';

    let durationText = '5 Days / 4 Nights';
    if (typeof item.duration === 'string') {
      durationText = item.duration;
    } else if (item.duration && typeof item.duration === 'object') {
      durationText = `${item.duration.days || 5} Days / ${item.duration.nights || 4} Nights`;
    }

    const defaultIncls = [
      { icon: 'fa-hotel', text: 'Hotel Included' },
      { icon: 'fa-car', text: 'Transfers' },
      { icon: 'fa-certificate', text: 'Guided Tour' }
    ];

    let inclusionsList = defaultIncls;
    if (Array.isArray(item.inclusions) && item.inclusions.length > 0) {
      inclusionsList = item.inclusions.map((inc) => {
        if (typeof inc === 'string') {
          const lower = inc.toLowerCase();
          let icon = 'fa-circle-check';
          if (lower.includes('hotel') || lower.includes('resort') || lower.includes('villa') || lower.includes('lodge') || lower.includes('room') || lower.includes('haram')) icon = 'fa-hotel';
          else if (lower.includes('flight') || lower.includes('plane') || lower.includes('air') || lower.includes('emirates') || lower.includes('saudi')) icon = 'fa-plane';
          else if (lower.includes('transfer') || lower.includes('car') || lower.includes('chauffeur') || lower.includes('pickup') || lower.includes('gmc')) icon = 'fa-car';
          else if (lower.includes('breakfast') || lower.includes('dining') || lower.includes('meal') || lower.includes('dinner') || lower.includes('food') || lower.includes('catering')) icon = 'fa-utensils';
          else if (lower.includes('visa') || lower.includes('passport')) icon = 'fa-passport';
          else if (lower.includes('train') || lower.includes('express')) icon = 'fa-train-subway';
          else if (lower.includes('cruise') || lower.includes('boat') || lower.includes('ship')) icon = 'fa-ship';
          else if (lower.includes('guide') || lower.includes('tour') || lower.includes('safari') || lower.includes('balloon') || lower.includes('ziyarat') || lower.includes('excursion')) icon = 'fa-certificate';
          else if (lower.includes('spa') || lower.includes('bath')) icon = 'fa-spa';
          else if (lower.includes('luggage') || lower.includes('bag')) icon = 'fa-suitcase';
          else if (lower.includes('wifi')) icon = 'fa-wifi';
          return { icon, text: inc };
        }
        return inc;
      });
    }

    const isFeatured =
      item.featured === true ||
      item.isFeatured === true ||
      item.featured === 'true' ||
      item.isFeatured === 'true';

    return {
      id: item.id || item._id || idx,
      category: normalizedCategory,
      title: item.title,
      image: item.image || (item.images && item.images[0]) || DEFAULT_PACKAGES[idx % DEFAULT_PACKAGES.length].image,
      badge: item.badge || (isFeatured ? 'Featured Package' : 'Best Seller'),
      badgeClass: isFeatured ? 'gold' : (item.badgeClass || 'gold'),
      duration: durationText,
      ratingCategory: item.tag || (isFeatured ? 'Featured Deal' : 'Holiday Escape'),
      rating: item.rating || 4.9,
      reviews: item.reviews || (50 + idx * 12),
      inclusions: inclusionsList,
      price: item.price
        ? (typeof item.price === 'string' ? (item.price.includes('$') ? item.price : `$${item.price}`) : `$${item.price}`)
        : '$649',
      featured: isFeatured
    };
  };

  useEffect(() => {
    if (siteData?.packages && siteData.packages.length > 0) {
      setPackages(siteData.packages.map(mapPackage));
    }
  }, [siteData?.packages]);

  useEffect(() => {
    const handleUpdate = (e) => {
      if (e?.detail?.packages && Array.isArray(e.detail.packages)) {
        setPackages(e.detail.packages.map(mapPackage));
      } else {
        try {
          const stored = localStorage.getItem('air_dream_site_data_v2');
          if (stored) {
            const parsed = JSON.parse(stored);
            if (parsed.packages?.length > 0) {
              setPackages(parsed.packages.map(mapPackage));
              return;
            }
          }
        } catch (err) {}

        api.get('/travel-deals')
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

  const handleFilterChange = (filter) => {
    setActiveFilter(filter);
    setShowAll(false);
  };

  const filtered =
    activeFilter === 'all'
      ? packages
      : packages.filter((p) => p.category === activeFilter);

  // Requirement: only show 6 cards initially; other cards show on clicking See More
  const displayedPackages = showAll ? filtered : filtered.slice(0, 6);

  return (
    <section className="section-padding packages-section" id="packages">
      <div className="container">
        {/* Section Header */}
        <div className="section-header">
          <div className="section-tag">
            <i className="fa-solid fa-suitcase-rolling"></i> Handpicked Getaways
          </div>
          <h2 className="section-title">
            Popular Destinations &amp; <span className="script-accent">Featured Packages</span>
          </h2>
          <p className="section-subtitle">
            Browse our top-rated international flights, sacred Umrah pilgrimages, and tailor-made worldwide holiday escapes.
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="package-filter-tabs">
          <button
            type="button"
            className={`filter-pill-btn ${activeFilter === 'all' ? 'active' : ''}`}
            onClick={() => handleFilterChange('all')}
          >
            All Packages
          </button>
          <button
            type="button"
            className={`filter-pill-btn ${activeFilter === 'umrah' ? 'active' : ''}`}
            onClick={() => handleFilterChange('umrah')}
          >
            Hajj &amp; Umrah
          </button>
          <button
            type="button"
            className={`filter-pill-btn ${activeFilter === 'tours' ? 'active' : ''}`}
            onClick={() => handleFilterChange('tours')}
          >
            Holiday Tours
          </button>
          <button
            type="button"
            className={`filter-pill-btn ${activeFilter === 'flights' ? 'active' : ''}`}
            onClick={() => handleFilterChange('flights')}
          >
            International Flights
          </button>
        </div>

        {/* Packages Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(310px, 1fr))',
            gap: '24px'
          }}
        >
          {displayedPackages.map((pkg) => (
            <article key={pkg.id} className="package-card" style={{ flex: 'unset' }}>
              <div className="package-image-holder">
                <img
                  src={pkg.image}
                  alt={pkg.title}
                  className="package-img"
                  loading="lazy"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                {pkg.featured && (
                  <span className="package-featured-flag">
                    <i className="fa-solid fa-star"></i> Featured
                  </span>
                )}
                {pkg.badge && (
                  <span className={`package-badge-tag ${pkg.badgeClass || ''}`}>
                    {pkg.badge}
                  </span>
                )}
                <span className="package-duration-tag">
                  <i className="fa-regular fa-clock"></i> {pkg.duration}
                </span>
              </div>

              <div className="package-body">
                <div>
                  <div className="package-rating-row">
                    <span className="package-category">{pkg.ratingCategory}</span>
                    <div className="package-stars">
                      <i className="fa-solid fa-star"></i>
                      <i className="fa-solid fa-star"></i>
                      <i className="fa-solid fa-star"></i>
                      <i className="fa-solid fa-star"></i>
                      <i className="fa-solid fa-star"></i>
                      <span className="package-score">
                        {pkg.rating} ({pkg.reviews})
                      </span>
                    </div>
                  </div>

                  <h3 className="package-title">{pkg.title}</h3>

                  <div className="package-inclusions">
                    {pkg.inclusions.map((inc, i) => (
                      <span key={i} className="inclusion-pill">
                        <i className={`fa-solid ${inc.icon}`}></i> {inc.text}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="package-footer">
                  <div className="package-price-wrap">
                    <span className="price-sub">Starting from</span>
                    <span className="price-val">
                      {pkg.price} <span>/ person</span>
                    </span>
                  </div>
                  <button
                    type="button"
                    className="btn-book-tour"
                    onClick={() =>
                      onBookPackage && onBookPackage(pkg.title, pkg.price)
                    }
                  >
                    Book Now
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* See More Button: Shown when more than 6 cards exist in current view */}
        {filtered.length > 6 && (
          <div className="packages-see-more-wrap">
            <button
              type="button"
              className="btn-see-more-packages"
              onClick={() => setShowAll((prev) => !prev)}
              id="btn-packages-see-more"
            >
              <span>
                {showAll
                  ? 'Show Less Packages'
                  : `See More Packages (${filtered.length - 6} more)`}
              </span>
              <i className={`fa-solid ${showAll ? 'fa-chevron-up' : 'fa-chevron-down'}`}></i>
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
