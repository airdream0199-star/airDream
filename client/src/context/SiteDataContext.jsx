import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import publicApi from '../services/publicApi';

const SiteDataContext = createContext();

export function SiteDataProvider({ children }) {
  const [siteData, setSiteData] = useState({
    wallpapers: [],
    attractions: [],
    activities: [],
    tours: [],
    transfers: [],
    holidayPackages: [],
    packages: [],
    travelDeals: [],
    gallery: [],
    reviews: [],
    testimonials: [],
    whyChooseUs: [],
    settings: {
      brandName: 'AIR DREAM',
      brandTagline: 'TRAVEL TOURISM LLC',
      logoUrl: '/assets/air-dream-logo.png',
      phone: '+971 58 833 8927',
      whatsapp: '971588338927',
      email: 'info@airdreamtravel.com',
      address: 'Office 402, Al Asmawi Building, Sheikh Zayed Road, Dubai, UAE',
      aboutQuote:
        'We, at Air Dream Travel Tourism LLC, cater to our clients a lifestyle at its best where they can feel the pulse of Dubai and the unseen facets of the world, through our exclusive guided tours and other value-added services.',
      aboutArchImg: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=800&q=80',
      bubble1Img: 'https://images.unsplash.com/photo-1518684079-3c830dcef090?auto=format&fit=crop&w=400&q=80',
      bubble2Img: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=300&q=80',
      bubble3Img: 'https://images.unsplash.com/photo-1580674684081-7617fbf3d745?auto=format&fit=crop&w=400&q=80',
    },
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchSiteData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await publicApi.getSiteContent();
      if (data) {
        setSiteData((prev) => ({
          ...prev,
          ...data,
          wallpapers: data.wallpapers || data.heroSlides || prev.wallpapers,
          heroSlides: data.heroSlides || data.wallpapers || prev.heroSlides || prev.wallpapers,
          attractions: data.activities || data.attractions || prev.attractions,
          reviews: data.testimonials || data.reviews || prev.reviews,
        }));
      }
    } catch (err) {
      console.warn('[SiteData] Error loading authoritative site data from API:', err.message);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSiteData();

    const handleUpdate = () => {
      fetchSiteData();
    };

    window.addEventListener('airdream:data_updated', handleUpdate);
    window.addEventListener('airdream-data-updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);

    return () => {
      window.removeEventListener('airdream:data_updated', handleUpdate);
      window.removeEventListener('airdream-data-updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, [fetchSiteData]);

  return (
    <SiteDataContext.Provider
      value={{
        siteData,
        loading,
        error,
        refreshSiteData: fetchSiteData,
      }}
    >
      {children}
    </SiteDataContext.Provider>
  );
}

export function useSiteData() {
  const context = useContext(SiteDataContext);
  if (!context) {
    throw new Error('useSiteData must be used within a SiteDataProvider');
  }
  return context;
}
