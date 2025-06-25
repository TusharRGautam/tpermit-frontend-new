import React, { useState, useEffect, useCallback } from 'react';
import './GallerySection.css';

const GallerySection: React.FC = () => {
  // Use the Gallery images from the public folder
  const galleryImages = [
    '/Website-Images/Gallery/A1.jpg',
    '/Website-Images/Gallery/A2.jpg',
    '/Website-Images/Gallery/A3.jpg',
    '/Website-Images/Gallery/A4.jpg',
    '/Website-Images/Gallery/A5.jpg',
    '/Website-Images/Gallery/A6.jpg',
    '/Website-Images/Gallery/A7.jpg',
    '/Website-Images/Gallery/A8.jpg',
    '/Website-Images/Gallery/A9.jpg',
    '/Website-Images/Gallery/A10.jpg',
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

    // Auto-slide every 3 seconds
    const interval = setInterval(() => {
      if (!isAnimating) {
        setCurrentIndex((prevIndex) => 
          prevIndex >= maxIndex ? 0 : prevIndex + 1
        );
      }
    }, 3000);

    return () => {
      clearInterval(interval);
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
        <h2 className="section-title">Our Gallery</h2>
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
                <img 
                  src={image} 
                  alt={`Gallery image ${index + 1}`} 
                  loading={index < 4 ? "eager" : "lazy"} 
                />
              </div>
            ))}
          </div>
          
          {/* Navigation arrows for devices with more space */}
          {deviceType !== 'mobile' && (
            <div className="gallery-nav">
              <button 
                className="gallery-nav-btn prev" 
                onClick={() => !isAnimating && currentIndex > 0 && goToSlide(currentIndex - 1)}
                disabled={currentIndex === 0 || isAnimating}
                aria-label="Previous images"
              >
                &lt;
              </button>
              <button 
                className="gallery-nav-btn next" 
                onClick={() => !isAnimating && currentIndex < maxDotsCount - 1 && goToSlide(currentIndex + 1)}
                disabled={currentIndex >= maxDotsCount - 1 || isAnimating}
                aria-label="Next images"
              >
                &gt;
              </button>
            </div>
          )}
        </div>
        
        {/* Pagination dots - show fewer on mobile */}
        <div className="gallery-dots">
          {Array.from({ length: maxDotsCount }).map((_, index) => (
            <button 
              key={index} 
              className={`gallery-dot ${currentIndex === index ? 'active' : ''}`}
              onClick={() => !isAnimating && goToSlide(index)}
              disabled={isAnimating}
              aria-label={`Go to gallery image set ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default GallerySection; 