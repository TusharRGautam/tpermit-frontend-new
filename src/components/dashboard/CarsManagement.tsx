import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './Dashboard.css';

interface CarItem {
  id: string;
  name: string;
  brand: string;
  image: string;
  category: string;
  fuelType: string;
  seating: string;
  downPayment: string;
  monthlyEmi: string;
  exShowroom: string;
  onRoadPrice: string;
  variants: string[];
  status: 'Active' | 'Available';
}

const CARS_DATA: CarItem[] = [
  {
    id: 'maruti-suzuki-wagon-r',
    name: 'Maruti Suzuki Wagon-R',
    brand: 'Maruti Suzuki',
    image: '/Website-Images/Cars/wagnor.png',
    category: 'Hatchback / Commercial Taxi',
    fuelType: 'CNG / Petrol',
    seating: '5 Seater',
    downPayment: '₹1,09,240',
    monthlyEmi: '₹9,748/mo',
    exShowroom: '₹6,68,500',
    onRoadPrice: '₹7,55,000',
    variants: ['H3 CNG', 'LXI CNG', 'VXI CNG'],
    status: 'Active'
  },
  {
    id: 'hyundai-aura',
    name: 'Hyundai Aura',
    brand: 'Hyundai',
    image: '/Website-Images/Cars/Aura.png',
    category: 'Compact Sedan / Tourist Cab',
    fuelType: 'CNG / Petrol',
    seating: '5 Seater',
    downPayment: '₹1,26,950',
    monthlyEmi: '₹12,737/mo',
    exShowroom: '₹8,37,000',
    onRoadPrice: '₹9,37,800',
    variants: ['E CNG', 'S CNG', 'SX CNG'],
    status: 'Active'
  },
  {
    id: 'maruti-suzuki-dzire',
    name: 'Maruti Suzuki Dzire Tour S',
    brand: 'Maruti Suzuki',
    image: '/Website-Images/Cars/Dzire.png',
    category: 'Compact Sedan / Commercial Taxi',
    fuelType: 'CNG / Petrol',
    seating: '5 Seater',
    downPayment: '₹1,55,080',
    monthlyEmi: '₹11,773/mo',
    exShowroom: '₹7,77,000',
    onRoadPrice: '₹8,81,520',
    variants: ['Tour S CNG', 'VXI CNG', 'ZXI CNG'],
    status: 'Active'
  },
  {
    id: 'maruti-suzuki-ertiga',
    name: 'Maruti Suzuki Ertiga Tour M',
    brand: 'Maruti Suzuki',
    image: '/Website-Images/Cars/ertiga.png',
    category: '7-Seater MPV / Tourist Taxi',
    fuelType: 'CNG / Petrol Hybrid',
    seating: '7 Seater',
    downPayment: '₹2,19,132',
    monthlyEmi: '₹19,696/mo',
    exShowroom: '₹11,12,500',
    onRoadPrice: '₹12,24,625',
    variants: ['Tour M CNG 1.5 MT', 'VXI CNG', 'ZXI CNG'],
    status: 'Active'
  },
  {
    id: 'toyota-rumion',
    name: 'Toyota Rumion',
    brand: 'Toyota',
    image: '/Website-Images/Cars/Rumion.png',
    category: '7-Seater MPV / Commercial Fleet',
    fuelType: 'CNG / Petrol',
    seating: '7 Seater',
    downPayment: '₹2,24,517',
    monthlyEmi: '₹22,573/mo',
    exShowroom: '₹11,61,500',
    onRoadPrice: '₹12,83,115',
    variants: ['S CNG 1.5 MT', 'G Petrol', 'V Petrol'],
    status: 'Active'
  },
  {
    id: 'toyota-innova-crysta',
    name: 'Toyota Innova Crysta',
    brand: 'Toyota',
    image: '/Website-Images/Cars/Crysta.png',
    category: 'Premium MPV / Tourist Taxi',
    fuelType: 'Diesel',
    seating: '7 / 8 Seater',
    downPayment: '₹3,67,808',
    monthlyEmi: '₹30,064/mo',
    exShowroom: '₹19,99,000',
    onRoadPrice: '₹21,77,490',
    variants: ['GX 2.4L Diesel', 'GX+', 'VX', 'ZX'],
    status: 'Active'
  }
];

const CarsManagement: React.FC = () => {
  const [selectedBrand, setSelectedBrand] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const brands = ['All', 'Maruti Suzuki', 'Hyundai', 'Toyota'];

  const filteredCars = CARS_DATA.filter(car => {
    const matchesBrand = selectedBrand === 'All' || car.brand === selectedBrand;
    const matchesSearch = car.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          car.variants.some(v => v.toLowerCase().includes(searchQuery.toLowerCase())) ||
                          car.fuelType.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesBrand && matchesSearch;
  });

  return (
    <div className="cars-mgmt-container">
      {/* Top Header */}
      <div className="cars-mgmt-header">
        <div>
          <h1 className="cars-mgmt-title">Commercial Vehicle Inventory</h1>
          <p className="cars-mgmt-subtitle">
            Manage and view T-Permit tourist taxi cars, pricing, down payments, and loan structures
          </p>
        </div>
        <div className="cars-mgmt-header-actions">
          <Link to="/dashboard/quotation" className="btn-primary-action">
            Create Quotation
          </Link>
          <Link to="/dashboard/booking-order" className="btn-secondary-action">
            New Booking Order
          </Link>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="cars-metrics-grid">
        <div className="cars-metric-card">
          <span className="cars-metric-label">Total Models</span>
          <span className="cars-metric-val">{CARS_DATA.length}</span>
          <span className="cars-metric-desc">Available for Booking</span>
        </div>
        <div className="cars-metric-card">
          <span className="cars-metric-label">Commercial Fleet</span>
          <span className="cars-metric-val">100%</span>
          <span className="cars-metric-desc">T-Permit Ready (Yellow Plates)</span>
        </div>
        <div className="cars-metric-card">
          <span className="cars-metric-label">Brands</span>
          <span className="cars-metric-val">{brands.length - 1}</span>
          <span className="cars-metric-desc">Authorized OEM Partners</span>
        </div>
        <div className="cars-metric-card">
          <span className="cars-metric-label">Starting EMI</span>
          <span className="cars-metric-val">₹9,748</span>
          <span className="cars-metric-desc">Affordable Monthly Plans</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="cars-filter-bar">
        <div className="brand-pill-group">
          {brands.map(brand => (
            <button
              key={brand}
              type="button"
              className={`brand-pill ${selectedBrand === brand ? 'active' : ''}`}
              onClick={() => setSelectedBrand(brand)}
            >
              {brand}
            </button>
          ))}
        </div>
        <div className="cars-search-wrap">
          <input
            type="text"
            placeholder="Search by car name or variant..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="cars-search-input"
          />
          {searchQuery && (
            <button
              type="button"
              className="clear-search-btn"
              onClick={() => setSearchQuery('')}
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Cars Grid */}
      <div className="cars-grid-container">
        {filteredCars.length === 0 ? (
          <div className="no-cars-found">
            <p>No vehicles found matching your criteria.</p>
            <button onClick={() => { setSelectedBrand('All'); setSearchQuery(''); }} className="btn-secondary-action">
              Reset Filters
            </button>
          </div>
        ) : (
          filteredCars.map(car => (
            <div key={car.id} className="car-admin-card">
              <div className="car-admin-badge-strip">
                <span className="badge-brand">{car.brand}</span>
                <span className="badge-tpermit">T-Permit Commercial</span>
              </div>

              <div className="car-admin-img-wrap">
                <img src={car.image} alt={car.name} className="car-admin-img" />
              </div>

              <div className="car-admin-body">
                <div className="car-admin-title-row">
                  <h3 className="car-admin-name">{car.name}</h3>
                  <span className="car-admin-cat">{car.category}</span>
                </div>

                <div className="car-admin-tags">
                  <span className="tag-pill">{car.fuelType}</span>
                  <span className="tag-pill">{car.seating}</span>
                </div>

                <div className="car-admin-variants-list">
                  <span className="variants-label">Variants:</span>
                  <div className="variant-chips-wrap">
                    {car.variants.map((v, i) => (
                      <span key={i} className="variant-chip">{v}</span>
                    ))}
                  </div>
                </div>

                {/* Price breakdown box */}
                <div className="car-admin-price-box">
                  <div className="price-box-row">
                    <span className="p-label">Down Payment:</span>
                    <span className="p-val down-val">{car.downPayment}</span>
                  </div>
                  <div className="price-box-row">
                    <span className="p-label">Monthly EMI:</span>
                    <span className="p-val emi-val">{car.monthlyEmi}</span>
                  </div>
                  <div className="price-box-row subtle">
                    <span className="p-label">On-Road Approx:</span>
                    <span className="p-val">{car.onRoadPrice}</span>
                  </div>
                </div>

                {/* Card actions */}
                <div className="car-admin-card-actions">
                  <Link
                    to={`/dashboard/quotation?model=${encodeURIComponent(car.name)}`}
                    className="btn-card-action primary"
                  >
                    Quotation
                  </Link>
                  <Link
                    to={`/dashboard/booking-order?model=${encodeURIComponent(car.name)}`}
                    className="btn-card-action secondary"
                  >
                    Booking Order
                  </Link>
                  <Link
                    to={`/car/${car.id}`}
                    className="btn-card-action outline"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Public Page &rarr;
                  </Link>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default CarsManagement;
