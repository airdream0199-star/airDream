import React from 'react';
import { useOutletContext } from 'react-router-dom';
import HeroSection from '../../components/HeroSection';
import PartnersSection from '../../components/PartnersSection';
import SingleLineCards from '../../components/SingleLineCards';
import AttractionsSection from '../../components/AttractionsSection';
import AboutSection from '../../components/AboutSection';
import ToursSection from '../../components/ToursSection';
import AirportTransferSection from '../../components/AirportTransferSection';
import HolidayPackagesSection from '../../components/HolidayPackagesSection';
import GallerySection from '../../components/GallerySection';
import PackagesSection from '../../components/PackagesSection';
import ReviewsSection from '../../components/ReviewsSection';
import FAQSection from '../../components/FAQSection';

export default function HomePage() {
  const context = useOutletContext() || {};
  const onBookItem = context.onBookItem || (() => {});
  const onOpenQuote = context.onOpenQuote || (() => {});

  return (
    <div className="airdream-home-page" style={{ position: 'relative' }}>
      {/* 1. Hero Wallpaper Slider with Ken Burns & Call-to-Actions */}
      <HeroSection onOpenQuote={onOpenQuote} />

      {/* 2. Partners & Trusted Airlines Marquee */}
      <PartnersSection />

      {/* 3. Why Choose Air Dream Travel & Tourism? (3D Flip/Open Cards) */}
      <SingleLineCards onBookTrip={onBookItem} />

      {/* 4. Tour Packages (Auto/Manual Scroll Carousel with Cards) */}
      <ToursSection onBookTour={onBookItem} />

      {/* 5. Recommended Attractions Marquee */}
      <AttractionsSection onBookAttraction={onBookItem} />

      {/* 6. About Us (Arched Visual Composition with Overlapping Bubble Badges) */}
      <AboutSection onOpenQuote={onOpenQuote} />

      {/* 7. Airport Transfer Marquee */}
      <AirportTransferSection onBookTransfer={onBookItem} />

      {/* 7.5. Special Holiday Packages (Distinct Cards - Same as Attractions - Ticket) */}
      <HolidayPackagesSection onBookPackage={onBookItem} />

      {/* 8. Photo Gallery */}
      <GallerySection onOpenPhoto={onBookItem} />

      {/* 9. Popular Destinations & Featured Packages (With Category Filter Pills) */}
      <PackagesSection onBookPackage={onBookItem} />

      {/* 10. Loved by Over 25,000+ Voyagers Traveler Reviews Marquee */}
      <ReviewsSection />

      {/* 11. Frequently Asked Questions Accordion */}
      <FAQSection />
    </div>
  );
}
