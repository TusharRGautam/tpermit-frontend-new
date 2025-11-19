import React, { useState, useEffect, useCallback } from 'react';
import OptimizedImage from '../OptimizedImage/OptimizedImage';
import './GallerySection.css';

const GallerySection: React.FC = () => {
  // Use the client images from the public folder
  const galleryImages = [
    '/Website-Images/our-clients/newphotos/A1.webp',
    '/Website-Images/our-clients/newphotos/A4.webp',
    '/Website-Images/our-clients/newphotos/A5.webp',
    '/Website-Images/our-clients/newphotos/A6.webp',
    '/Website-Images/our-clients/newphotos/A7.webp',
    '/Website-Images/our-clients/newphotos/A8.webp',
    '/Website-Images/our-clients/newphotos/A9.webp',
    '/Website-Images/our-clients/1 (1).webp',
    '/Website-Images/our-clients/1 (2).webp',
    '/Website-Images/our-clients/1 (3).webp',
    '/Website-Images/our-clients/1 (4).webp',
    '/Website-Images/our-clients/1 (5).webp',
    '/Website-Images/our-clients/1 (6).webp',
    '/Website-Images/our-clients/1 (7).webp',
    '/Website-Images/our-clients/1 (8).webp',
    '/Website-Images/our-clients/1.jpg',
    '/Website-Images/our-clients/2.jpg',
    '/Website-Images/our-clients/3.jpg',
    '/Website-Images/our-clients/4.jpg',
    '/Website-Images/our-clients/5.jpg',
    '/Website-Images/our-clients/6.jpg',
    '/Website-Images/our-clients/7.jpg',
    '/Website-Images/our-clients/8.jpg',
    '/Website-Images/our-clients/9.jpg',
    '/Website-Images/our-clients/10.jpg',
    '/Website-Images/our-clients/11.jpg',
    '/Website-Images/our-clients/12.jpg',
    '/Website-Images/our-clients/13.jpg',
    '/Website-Images/our-clients/14.jpg',
    '/Website-Images/our-clients/15.jpg',
    '/Website-Images/our-clients/16.jpg',
    '/Website-Images/our-clients/17.jpg',
    '/Website-Images/our-clients/18.jpg',
    '/Website-Images/our-clients/19.jpg',
    '/Website-Images/our-clients/20.jpg',
    '/Website-Images/our-clients/21.jpg',
    '/Website-Images/our-clients/22.jpg',
  ];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [deviceType, setDeviceType] = useState('desktop');
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  // Determine device type and how many images to show
  const getImagesPerView = useCallback(() => {
    if (deviceType === 'mobile') return 1;
    if (deviceType === 'tablet') return 2;
    return 3; // desktop
  }, [deviceType]);

  // Update device type based on screen width
  const updateDeviceType = useCallback(() => {
    const width = window.innerWidth;
    if (width <= 576) {
      setDeviceType('mobile');
    } else if (width <= 992) {
      setDeviceType('tablet');
    } else {
      setDeviceType('desktop');
    }
  }, []);

  useEffect(() => {
    updateDeviceType();
    window.addEventListener('resize', updateDeviceType);

    const maxIndex = galleryImages.length - getImagesPerView();

    // Auto-slide every 3 seconds (only for mobile and tablet)
    const interval = deviceType !== 'desktop' ? setInterval(() => {
      if (!isAnimating) {
        setCurrentIndex((prevIndex) => 
          prevIndex >= maxIndex ? 0 : prevIndex + 1
        );
      }
    }, 3000) : null;

    return () => {
      if (interval) clearInterval(interval);
      window.removeEventListener('resize', updateDeviceType);
    };
  }, [galleryImages.length, deviceType, getImagesPerView, isAnimating]);

  // Handle manual navigation
  const goToSlide = (index: number) => {
    setIsAnimating(true);
    setCurrentIndex(index);
    
    // Reset animation flag after transition completes
    setTimeout(() => {
      setIsAnimating(false);
    }, 700); // Should match CSS transition time
  };

  // Touch handlers for swipe functionality
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!isAnimating) {
      const imagesPerView = getImagesPerView();
      const maxIndex = galleryImages.length - imagesPerView;
      
      if (touchStart - touchEnd > 75) { // Minimum swipe distance
        // Swipe left (next)
        setCurrentIndex(prev => Math.min(prev + 1, maxIndex));
      } else if (touchEnd - touchStart > 75) {
        // Swipe right (prev)
        setCurrentIndex(prev => Math.max(prev - 1, 0));
      }
    }
    // Reset touch values
    setTouchStart(0);
    setTouchEnd(0);
  };

  const imagesPerView = getImagesPerView();
  const maxDotsCount = galleryImages.length - imagesPerView + 1;

  return (
    <section className="gallery-section">
      <div className="section-container">
        <h2 className="section-title">Our Happy Clients</h2>
        <p className="section-description">
          See our satisfied customers with their new cars from T-Permit Auto
        </p>
        {/* Desktop Grid Gallery */}
        {deviceType === 'desktop' ? (
          <div className="desktop-gallery-container">
            <div className="desktop-gallery-grid">
              {galleryImages.map((image, index) => (
                <div key={index} className="desktop-gallery-item">
                  <OptimizedImage 
                    src={image} 
                    alt={`Happy client ${index + 1} with their new car from T-Permit Auto`} 
                    loading={index < 8 ? "eager" : "lazy"} 
                    priority={index < 4}
                  />
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* Mobile/Tablet Sliding Gallery */
          <div className={`gallery-container gallery-${deviceType}`}>
            <div 
              className="gallery-slide" 
              style={{ transform: `translateX(-${currentIndex * (100 / imagesPerView)}%)` }}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              {galleryImages.map((image, index) => (
                <div 
                  className="gallery-image" 
                  key={index} 
                  style={{ flex: `0 0 calc(100% / ${imagesPerView})` }}
                >
                  <OptimizedImage 
                    src={image} 
                    alt={`Happy client ${index + 1} with their new car from T-Permit Auto`} 
                    loading={index < 4 ? "eager" : "lazy"} 
                    priority={index < 2}
                  />
                </div>
              ))}
            </div>
            
            {/* Navigation arrows for tablet */}
            {deviceType === 'tablet' && (
              <div className="gallery-nav">
                <button 
                  className="gallery-nav-btn prev" 
                  onClick={() => !isAnimating && currentIndex > 0 && goToSlide(currentIndex - 1)}
                  disabled={currentIndex === 0 || isAnimating}
                  aria-label="Previous client photos"
                >
                  &lt;
                </button>
                <button 
                  className="gallery-nav-btn next" 
                  onClick={() => !isAnimating && currentIndex < maxDotsCount - 1 && goToSlide(currentIndex + 1)}
                  disabled={currentIndex >= maxDotsCount - 1 || isAnimating}
                  aria-label="Next client photos"
                >
                  &gt;
                </button>
              </div>
            )}
          </div>
        )}
        
      </div>
    </section>
  );
};

export default GallerySection; 