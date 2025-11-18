import React, { useState, useEffect } from 'react';
import { showroomService } from '../../services/showroomService';
import OptimizedImage from '../OptimizedImage/OptimizedImage';
import './OurPartners.css';

interface Showroom {
  id: number;
  showroom_name: string;
  showroom_address: string;
  state: string;
  address_city: string;
  showroom_city: string;
  brand: string;
  created_at?: string;
  updated_at?: string;
}

const OurPartners: React.FC = () => {
  const [showrooms, setShowrooms] = useState<Showroom[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedBrands, setExpandedBrands] = useState<{ [key: string]: boolean }>({});

  // Brand logos data
  const brandLogos = [
    {
      id: 1,
      name: 'Toyota',
      image: '/Website-Images/Brands/Toyota.jpg'
    },
    {
      id: 2,
      name: 'Hyundai',
      image: '/Website-Images/Brands/Hyundai.jpg'
    },
    {
      id: 3,
      name: 'Maruti Suzuki',
      image: '/Website-Images/Brands/Maruti-Suzuki-Logo.png'
    }
  ];

  useEffect(() => {
    const fetchShowrooms = async () => {
      try {
        setLoading(true);
        const data = await showroomService.getAllShowrooms();
        setShowrooms(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching showrooms:', err);
        setError('Failed to load our partners');
      } finally {
        setLoading(false);
      }
    };

    fetchShowrooms();
  }, []);

  const getShowroomImage = (brand: string) => {
    if (brand.toLowerCase().includes('hyundai')) {
      return '/Website-Images/showroom/Shreenath Hyundai.webp';
    } else if (brand.toLowerCase().includes('maruti')) {
      return '/Website-Images/showroom/Maruti Suzuki ARENA Velox Motors.webp';
    }
    return '/Website-Images/Cars/placeholder.svg';
  };

  const groupShowroomsByBrand = () => {
    const grouped: { [key: string]: Showroom[] } = {};
    showrooms.forEach(showroom => {
      if (!grouped[showroom.brand]) {
        grouped[showroom.brand] = [];
      }
      grouped[showroom.brand].push(showroom);
    });
    return grouped;
  };

  const handleBrandClick = (brand: string) => {
    setExpandedBrands(prev => ({
      ...prev,
      [brand]: !prev[brand]
    }));
  };

  const handleBrandMouseLeave = (brand: string) => {
    setTimeout(() => {
      setExpandedBrands(prev => ({
        ...prev,
        [brand]: false
      }));
    }, 300); // Small delay to allow hover transition
  };

  if (loading) {
    return (
      <section className="our-partners">
        <div className="container">
          <h2 className="section-title">OUR PARTNERS</h2>
          <div className="loading">Loading our partners...</div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="our-partners">
        <div className="container">
          <h2 className="section-title">OUR PARTNERS</h2>
          <div className="error">{error}</div>
        </div>
      </section>
    );
  }

  const groupedShowrooms = groupShowroomsByBrand();

  return (
    <section className="our-partners">
      <div className="container">
        <h2 className="section-title">OUR PARTNERS</h2>
        <p className="section-description">
          We work with trusted showrooms across Maharashtra to provide you with the best car buying experience
        </p>

        {/* Brand Logos Section */}
        <div className="brand-logos-section">
          <h3 className="brand-logos-title">Authorized Brands</h3>
          <div className="brand-logos-container">
            {brandLogos.map(brand => (
              <div className="brand-logo-item" key={brand.id}>
                <OptimizedImage 
                  src={brand.image} 
                  alt={brand.name}
                  loading="lazy"
                />
                <span className="brand-name">{brand.name}</span>
              </div>
            ))}
          </div>
        </div>
        
        <div className="showroom-partners-section">
          <h3 className="showroom-partners-title">Showroom Partners</h3>
          <div className="brands-container">
          {Object.entries(groupedShowrooms).map(([brand, brandShowrooms]) => {
            const isExpanded = expandedBrands[brand];
            const firstShowroom = brandShowrooms[0];
            
            return (
              <div 
                key={brand} 
                className="brand-section"
                onMouseLeave={() => handleBrandMouseLeave(brand)}
              >
                <h3 className="brand-title">{brand}</h3>
                
                <div className="brand-content">
                  <div className="brand-image">
                    <img 
                      src={getShowroomImage(brand)}
                      alt={`${brand} showroom`}
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = '/Website-Images/Cars/placeholder.svg';
                      }}
                    />
                  </div>
                  
                  <div className="showroom-addresses">
                    {/* Always show first address */}
                    <div className="address-item first-address">
                      <h4 className="showroom-name">{firstShowroom.showroom_name}</h4>
                      <p className="showroom-location">
                        {firstShowroom.showroom_city && `${firstShowroom.showroom_city}, `}
                        {firstShowroom.address_city}
                      </p>
                      <p className="showroom-address">{firstShowroom.showroom_address}</p>
                      
                      {brandShowrooms.length > 1 && (
                        <button 
                          className={`expand-btn ${isExpanded ? 'expanded' : ''}`}
                          onClick={() => handleBrandClick(brand)}
                          title={isExpanded ? 'Hide other locations' : `Show ${brandShowrooms.length - 1} more locations`}
                        >
                          <span className="expand-text">
                            {isExpanded ? 'Less' : `+${brandShowrooms.length - 1} More`}
                          </span>
                          <span className={`arrow ${isExpanded ? 'up' : 'down'}`}>
                            ▼
                          </span>
                        </button>
                      )}
                    </div>
                    
                    {/* Show additional addresses when expanded */}
                    <div className={`additional-addresses ${isExpanded ? 'expanded' : ''}`}>
                      {brandShowrooms.slice(1).map((showroom) => (
                        <div key={showroom.id} className="address-item additional-item">
                          <h4 className="showroom-name">{showroom.showroom_name}</h4>
                          <p className="showroom-location">
                            {showroom.showroom_city && `${showroom.showroom_city}, `}
                            {showroom.address_city}
                          </p>
                          <p className="showroom-address">{showroom.showroom_address}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default OurPartners;