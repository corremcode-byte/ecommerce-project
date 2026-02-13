import React, { useState } from 'react';

const PromotionalBanner = () => {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <div className="promotional-banner">
      <div className="promotional-content">
        <span className="promotional-text">
          SUBSCRIBE & SAVE 20% + FREE DELIVERY OVER ₹10,000
        </span>
        <button 
          className="promotional-close" 
          aria-label="Close banner"
          onClick={() => setIsVisible(false)}
        >
          ×
        </button>
      </div>
    </div>
  );
};

export default PromotionalBanner;
