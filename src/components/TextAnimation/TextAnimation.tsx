import React from 'react';
import './TextAnimation.css';

const TextAnimation: React.FC = () => {
  return (
    <div className="text-animation-container">
      <div className="animation-flip">
        <div>
          <div>Select Car</div>
        </div>
        <div>
          <div>Book Now</div>
        </div>
        <div>
          <div>Payment</div>
        </div>
      </div>
    </div>
  );
};

export default TextAnimation;