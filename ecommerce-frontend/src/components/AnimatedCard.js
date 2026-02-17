import React, { useState, useRef, useEffect } from 'react';

const AnimatedCard = ({ children, className = '', delay = 0, ...props }) => {
  const [isVisible, setIsVisible] = useState(false);
  const cardRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => {
            setIsVisible(true);
          }, delay);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.1 }
    );

    const node = cardRef.current;
    if (node) {
      observer.observe(node);
    }

    return () => {
      if (node) {
        observer.unobserve(node);
      }
    };
  }, [delay]);

  return (
    <div
      ref={cardRef}
      className={`animated-card ${isVisible ? 'visible' : ''} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export default AnimatedCard;
