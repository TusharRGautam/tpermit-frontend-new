import React from 'react';
import { Link } from 'react-router-dom';
import OptimizedImage from '../../components/OptimizedImage/OptimizedImage';
import './NewCars.css';

interface CarVariant {
  name: string;
  colors: string[];
}

interface CarModel {
  id: string;
  name: string;
  image: string;
  variants: CarVariant[];
  startingPrice: string;
}

const NewCars: React.FC = () => {
  const aswCarsInventory: CarModel[] = [
    {
      id: 'ertiga',
      name: 'Maruti Suzuki Ertiga',
      image: '/Website-Images/Cars/ertiga.jpg',
      startingPrice: '₹10,97,500',
      variants: [
        {
          name: 'VXI CNG',
          colors: ['White', 'Silver', 'Grey', 'Red', 'Blue']
        },
        {
          name: 'Tour M',
          colors: ['White']
        }
      ]
    },
    {
      id: 'dzire',
      name: 'Maruti Suzuki Dzire',
      image: '/Website-Images/Cars/Dzire.jpg',
      startingPrice: '₹8,97,500',
      variants: [
        {
          name: 'Tour S CNG',
          colors: ['White']
        }
      ]
    },
    {
      id: 'wagnor',
      name: 'Maruti Suzuki Wagon-R',
      image: '/Website-Images/Cars/wagnor.jpg',
      startingPrice: '₹5,97,500',
      variants: [
        {
          name: 'Tour H',
          colors: ['White']
        },
        {
          name: 'LXI CNG',
          colors: ['White', 'Silver', 'Grey', 'Red', 'Blue']
        },
        {
          name: 'VXI CNG',
          colors: ['White', 'Silver', 'Grey', 'Red', 'Blue']
        }
      ]
    },
    {
      id: 'rumion',
      name: 'Maruti Suzuki Rumion',
      image: '/Website-Images/Cars/Ruminum.jpg',
      startingPrice: '₹10,97,500',
      variants: [
        {
          name: 'S CNG',
          colors: ['White', 'Silver', 'Grey']
        }
      ]
    },
    {
      id: 'aura',
      name: 'Hyundai Aura',
      image: '/Website-Images/Cars/Aura.jpg',
      startingPrice: '₹7,97,500',
      variants: [
        {
          name: 'E CNG',
          colors: ['White', 'Silver', 'Grey', 'Cherry Night']
        },
        {
          name: 'S CNG',
          colors: ['White', 'Silver', 'Grey', 'Cherry Night']
        },
        {
          name: 'SX CNG',
          colors: ['White', 'Silver', 'Grey', 'Cherry Night']
        }
      ]
    },
    {
      id: 'crysta',
      name: 'Toyota Innova Crysta',
      image: '/Website-Images/Cars/Crysta.jpg',
      startingPrice: '₹17,97,500',
      variants: [
        {
          name: 'GX Diesel',
          colors: ['White', 'Silver', 'Pearl White']
        },
        {
          name: 'GXT Diesel',
          colors: ['White', 'Silver', 'Pearl White']
        },
        {
          name: 'VX Diesel',
          colors: ['White', 'Silver', 'Pearl White']
        },
        {
          name: 'ZX Diesel',
          colors: ['White', 'Silver', 'Pearl White']
        }
      ]
    }
  ];

  return (
    <div className="new-cars-container">
      <div className="new-cars-header">
        <h1>New Cars at ASW Cars</h1>
        <p>Explore our complete range of vehicles with detailed specifications and pricing</p>
      </div>

      <div className="cars-inventory">
        {aswCarsInventory.map((car) => (
          <div key={car.id} className="car-model-section">
            <div className="car-model-header">
              <div className="car-model-image">
                <OptimizedImage 
                  src={car.image} 
                  alt={car.name}
                  loading="lazy"
                />
              </div>
              <div className="car-model-info">
                <h2>{car.name}</h2>
                <div className="car-starting-price">
                  Starting from <span className="price">{car.startingPrice}</span>
                </div>
              </div>
              <div className="car-action">
                <Link 
                  to={`/car/${car.id}`} 
                  className="view-details-btn"
                >
                  View Details & Finance Options
                </Link>
              </div>
            </div>

            <div className="variants-section">
              <h3>Available Variants & Colors</h3>
              <div className="variants-grid">
                {car.variants.map((variant, index) => (
                  <div key={index} className="variant-card">
                    <div className="variant-name">{variant.name}</div>
                    <div className="variant-colors">
                      <span className="colors-label">Available Colors:</span>
                      <div className="colors-list">
                        {variant.colors.map((color, colorIndex) => (
                          <span key={colorIndex} className="color-tag">
                            {color}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="cars-cta-section">
        <h2>Ready to Buy Your Dream Car?</h2>
        <p>Contact ASW Cars for personalized financing solutions and best deals</p>
        <div className="cta-buttons">
          <Link to="/finance-offers" className="cta-btn primary">
            View Finance Offers
          </Link>
          <Link to="/about-us" className="cta-btn secondary">
            Contact Us
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NewCars; 