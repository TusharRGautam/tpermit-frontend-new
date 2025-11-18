import React from 'react';
import './BookCarsSection.css';

const BookCarsSection: React.FC = () => {
  return (
    <section className="book-cars-section">
      <div className="book-cars-container">
        <h2 className="book-cars-title">BOOK CARS</h2>
        <p className="book-cars-subtitle">Your Dream Car is Just One Click Away</p>
        <div className="book-cars-divider"></div>
      </div>
    </section>
  );
};

export default BookCarsSection;