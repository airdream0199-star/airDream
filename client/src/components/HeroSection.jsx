import React, { useState, useEffect, useCallback, useRef } from "react";
import { useSiteData } from "../context/SiteDataContext";
import publicApi from "../services/publicApi";

const DEFAULT_SLIDES = [
  {
    id: "slide-1",
    bg: "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=1920&q=80",
  },
  {
    id: "slide-2",
    bg: "https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?auto=format&fit=crop&w=1920&q=80",
  },
  {
    id: "slide-3",
    bg: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1920&q=80",
  },
  {
    id: "slide-4",
    bg: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=1920&q=80",
  },
];

const formatSlide = (item, idx) => {
  const fallbackBg =
    DEFAULT_SLIDES[idx % DEFAULT_SLIDES.length]?.bg ||
    "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=1920&q=80";

  const rawBg = item?.image || item?.bg;
  const bg =
    rawBg && typeof rawBg === "string" && rawBg.trim().length > 0
      ? rawBg.trim()
      : fallbackBg;

  return {
    id: item?._id || item?.id || `slide-${idx}`,
    bg,
  };
};

export default function HeroSection() {
  const { siteData } = useSiteData();
  const [slides, setSlides] = useState(() => {
    const initial = siteData?.wallpapers || siteData?.heroSlides;
    if (Array.isArray(initial) && initial.length > 0) {
      const valid = initial.filter((s) => s.image || s.bg);
      if (valid.length > 0) return valid.map(formatSlide);
    }
    return DEFAULT_SLIDES;
  });
  const [currentSlide, setCurrentSlide] = useState(0);
  const [navHeight, setNavHeight] = useState(118);
  const [partnerSliderHeight, setPartnerSliderHeight] = useState(116);

  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  // Dynamically calculate exact total navbar height and partner slider height
  // so that both the hero image slider and the slider below it fit in the initial screen
  useEffect(() => {
    const updateDimensions = () => {
      const topBar = document.querySelector(".top-bar, .air-dream-top-bar");
      const header = document.querySelector(".main-header");
      const topBarH = topBar ? topBar.offsetHeight : 0;
      const headerH =
        header && header.offsetHeight > 0
          ? header.offsetHeight
          : window.innerWidth <= 768
          ? 64
          : 84;
      const total = topBarH + headerH;
      if (total > 0) {
        setNavHeight(total);
      }

      const partners = document.querySelector(".partners-section");
      if (partners && partners.offsetHeight > 0) {
        setPartnerSliderHeight(partners.offsetHeight);
      }
    };

    updateDimensions();
    const t1 = setTimeout(updateDimensions, 100);
    const t2 = setTimeout(updateDimensions, 400);

    window.addEventListener("resize", updateDimensions);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      window.removeEventListener("resize", updateDimensions);
    };
  }, []);

  const loadFreshWallpapers = useCallback(async () => {
    try {
      const data = await publicApi.getHeroSlides();
      const list = Array.isArray(data)
        ? data
        : Array.isArray(data?.data)
        ? data.data
        : [];
      const valid = list.filter((s) => s.image || s.bg);
      if (valid.length > 0) {
        setSlides(valid.map(formatSlide));
        return;
      }
    } catch (err) {
      console.warn("[HeroSection] Error loading hero slides directly:", err);
    }

    try {
      const scData = await publicApi.getSiteContent();
      const wallpapers = scData?.wallpapers || scData?.heroSlides;
      if (Array.isArray(wallpapers)) {
        const valid = wallpapers.filter((s) => s.image || s.bg);
        if (valid.length > 0) {
          setSlides(valid.map(formatSlide));
        }
      }
    } catch (e) {}
  }, []);

  // Sync with global siteData from SiteDataContext
  useEffect(() => {
    const list = siteData?.wallpapers || siteData?.heroSlides;
    if (Array.isArray(list)) {
      const valid = list.filter((s) => s.image || s.bg);
      if (valid.length > 0) {
        setSlides(valid.map(formatSlide));
      }
    }
  }, [siteData]);

  // Live real-time event listeners for instant admin updates
  useEffect(() => {
    const handleUpdate = () => {
      loadFreshWallpapers();
    };

    window.addEventListener("airdream:data_updated", handleUpdate);
    window.addEventListener("airdream-data-updated", handleUpdate);
    window.addEventListener("storage", handleUpdate);

    return () => {
      window.removeEventListener("airdream:data_updated", handleUpdate);
      window.removeEventListener("airdream-data-updated", handleUpdate);
      window.removeEventListener("storage", handleUpdate);
    };
  }, [loadFreshWallpapers]);

  // Slideshow auto-advance interval (every 5 seconds)
  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const activeIndex = currentSlide % (slides.length || 1);

  // Mobile Touch Swipe Handlers
  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e) => {
    touchEndX.current = e.changedTouches[0].clientX;
    const diff = touchStartX.current - touchEndX.current;
    if (diff > 50) {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    } else if (diff < -50) {
      setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
    }
  };

  const totalOffset = (navHeight || 118) + (partnerSliderHeight || 116);
  const computedHeight = `calc(100vh - ${totalOffset}px)`;
  const computedDvh = `calc(100dvh - ${totalOffset}px)`;

  return (
    <section
      className="hero-section hero-image-only"
      id="hero"
      style={{
        "--hero-calc-height": computedHeight,
        "--hero-calc-dvh": computedDvh,
        height: computedHeight,
        minHeight: computedHeight,
        maxHeight: computedDvh,
      }}
    >
      {/* Full-Page Wallpaper Slider - Starts directly below navbar */}
      <div
        className="hero-slider-container"
        id="heroSlider"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div className="hero-slider-track">
          {slides.map((slide, idx) => (
            <div
              key={slide.id || idx}
              className={`hero-slide ${idx === activeIndex ? "active" : ""}`}
            >
              <div
                className="hero-slide-bg"
                style={{ backgroundImage: `url(${slide.bg})` }}
              ></div>
            </div>
          ))}
        </div>

        {/* Slider Navigation Arrows (shown if > 1 slide) */}
        {slides.length > 1 && (
          <>
            <button
              type="button"
              className="slider-arrow-btn slider-arrow-prev"
              onClick={() =>
                setCurrentSlide(
                  (currentSlide - 1 + slides.length) % slides.length
                )
              }
              aria-label="Previous Slide"
            >
              <i className="fa-solid fa-chevron-left"></i>
            </button>

            <button
              type="button"
              className="slider-arrow-btn slider-arrow-next"
              onClick={() =>
                setCurrentSlide((currentSlide + 1) % slides.length)
              }
              aria-label="Next Slide"
            >
              <i className="fa-solid fa-chevron-right"></i>
            </button>
          </>
        )}

        {/* Slider Navigation Dots */}
        {slides.length > 1 && (
          <div className="slider-dots-container">
            {slides.map((_, idx) => (
              <button
                key={idx}
                type="button"
                className={`slider-dot ${idx === activeIndex ? "active" : ""}`}
                onClick={() => setCurrentSlide(idx)}
                aria-label={`Slide ${idx + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
