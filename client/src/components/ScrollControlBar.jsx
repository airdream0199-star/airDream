import React from 'react';

/**
 * Modern auto/manual scroll controls (< and >) with mode toggle button for carousels.
 */
export default function ScrollControlBar({ onPrev, onNext }) {
  return (
    <div className="carousel-scroll-controls" aria-label="Carousel navigation controls">
      <div className="scroll-arrow-group">
        <button
          type="button"
          className="scroll-arrow-btn"
          onClick={onPrev}
          title="Scroll Left"
          aria-label="Previous items"
        >
          <i className="fa-solid fa-chevron-left"></i>
        </button>
        <button
          type="button"
          className="scroll-arrow-btn"
          onClick={onNext}
          title="Scroll Right"
          aria-label="Next items"
        >
          <i className="fa-solid fa-chevron-right"></i>
        </button>
      </div>
    </div>
  );
}
