import React, { useState, useEffect, useRef } from 'react';
import './OptimizedImage.css';

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  loading?: 'lazy' | 'eager';
  priority?: boolean;
  width?: number;
  height?: number;
  onLoad?: () => void;
  onError?: () => void;
  placeholder?: string;
}

const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  className = '',
  loading = 'lazy',
  priority = false,
  width,
  height,
  onLoad,
  onError,
  placeholder
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isInView, setIsInView] = useState(priority || loading === 'eager');
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (priority || loading === 'eager') {
      setIsInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      {
        rootMargin: '50px'
      }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, [priority, loading]);

  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  const handleError = () => {
    setHasError(true);
    onError?.();
  };

  if (hasError) {
    return (
      <div className={`optimized-image error ${className}`} ref={imgRef}>
        <div className="error-placeholder">
          <span>Failed to load image</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`optimized-image ${className}`} ref={imgRef}>
      {!isLoaded && (
        <div className="image-placeholder">
          {placeholder ? (
            <img src={placeholder} alt="" aria-hidden="true" />
          ) : (
            <div className="loading-skeleton"></div>
          )}
        </div>
      )}
      {isInView && (
        <img
          src={src}
          alt={alt}
          loading={loading}
          decoding="async"
          width={width}
          height={height}
          onLoad={handleLoad}
          onError={handleError}
          style={{
            opacity: isLoaded ? 1 : 0,
            transition: 'opacity 0.3s ease-in-out',
            position: 'relative',
            zIndex: 10
          }}
        />
      )}
    </div>
  );
};

export default OptimizedImage;