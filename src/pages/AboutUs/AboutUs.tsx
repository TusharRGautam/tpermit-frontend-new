import React from 'react';
import OptimizedImage from '../../components/OptimizedImage/OptimizedImage';
import './AboutUs.css';

const AboutUs: React.FC = () => {
  return (
    <div className="about-us-container">
      <div className="about-us-header">
        <h1>About T-Permit Cars</h1>
        <div className="about-us-divider"></div>
      </div>

      {/* Company Stats Section */}
      <section className="company-stats">
        <div className="stats-grid">
          <div className="stat-item">
            <div className="stat-number">11+</div>
            <div className="stat-label">Years of Excellence</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">5</div>
            <div className="stat-label">Expert Team Members</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">2013</div>
            <div className="stat-label">Established Since</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">4000+</div>
            <div className="stat-label">Happy Customers</div>
          </div>
        </div>
      </section>

      <section className="about-us-section">
        <h2>Our Story</h2>
        <p>
          Welcome to <strong>T-Permit Cars and Finance</strong>, your premier destination for quality automobiles 
          and comprehensive automotive finance solutions. Established in <strong>June 2013</strong>, we have built our 
          reputation on trust, excellence, and unwavering commitment to customer satisfaction.
        </p>
        <p>
          What began as a vision to revolutionize the car buying experience has grown into a trusted name in the 
          automotive industry. With over 11 years of dedicated service, our expert team of 5 professionals brings 
          extensive knowledge and personalized attention to every customer interaction.
        </p>
      </section>

      {/* Proprietor Section */}
      <section className="about-us-section proprietor-section">
        <h2>Meet Our Proprietor</h2>
        <div className="proprietor-container">
          <div className="proprietor-image">
            <OptimizedImage 
              src="/Website-Images/Proprietor-owner/Proprietor.webp" 
              alt="GAUTAM MOTORS Proprietor"
              loading="eager"
              priority={true}
            />
          </div>
          <div className="proprietor-content">
            <h3>Leadership & Vision</h3>
            <p>
              Under experienced leadership, T-Permit Cars has established itself as a reliable partner in the automotive 
              journey of countless families. Our proprietor's vision of transparent dealings, customer-first approach, 
              and innovative financing solutions continues to drive our success.
            </p>
            <p>
              With a deep understanding of the automotive market and customer needs, our leadership ensures that 
              GAUTAM MOTORS remains at the forefront of providing exceptional automotive experiences.
            </p>
          </div>
        </div>
      </section>

      <div className="team-grid">
          <div className="team-member">
            <OptimizedImage 
              src="/Website-Images/Team members/Prakash madal.webp" 
              alt="Prakash Madal - GAUTAM MOTORS Team"
              loading="lazy"
            />
            <h3>Prakash Madal</h3>
            <p>Sales & Customer Relations</p>
          </div>
          
          <div className="team-member">
            <OptimizedImage 
              src="/Website-Images/Team members/Mithilesh Mandal.webp" 
              alt="Mithilesh Mandal - GAUTAM MOTORS Team"
              loading="lazy"
            />
            <h3>Mithilesh Mandal</h3>
            <p>Finance & Documentation</p>
          </div>
          <div className="team-member">
            <OptimizedImage 
              src="/Website-Images/Team members/Manikant mandal.webp" 
              alt="Manikant mandal - GAUTAM MOTORS Team"
              loading="lazy"
            />
            <h3>Manikant mandal</h3>
            <p>Finance Advisor</p>
          </div>
          <div className="team-member">
            <OptimizedImage 
              src="/Website-Images/Team members/Pintu Varma.webp" 
              alt="Pintu Varma- GAUTAM MOTORS Team"
              loading="lazy"
            />
            <h3>Pintu Varma</h3>
            <p>Finance Manager</p>
          </div>
        </div>
        
      <section className="about-us-section">
        <h2>Our Vision</h2>
        <p>
          To be the most trusted automotive partner for every Indian family, delivering automotive 
          solutions that enhance lives and create lasting relationships through honest dealings and 
          exceptional service.
        </p>
        
        <h2>Our Mission</h2>
        <p>
          To provide unparalleled automotive experiences through transparent pricing, personalized service, 
          and innovative financing solutions that make quality vehicles accessible to all, while maintaining 
          the highest standards of customer satisfaction.
        </p>
      </section>

      {/* <section className="about-us-section">
        <h2>What Sets Us Apart</h2>
        
        <div className="features-grid">
          <div className="feature">
            <div className="feature-icon">
              <i className="fa fa-check-circle"></i>
            </div>
            <h3>Quality Selection</h3>
            <p>
              Every vehicle in our inventory undergoes rigorous quality inspection to ensure 
              you drive home a reliable automobile that meets our high standards.
            </p>
          </div>
          
          <div className="feature">
            <div className="feature-icon">
              <i className="fa fa-money"></i>
            </div>
            <h3>Comprehensive Finance Solutions</h3>
            <p>
              As A S Wheel Cars and Finance, we offer complete financing solutions with 
              competitive rates and flexible terms tailored to your budget and requirements.
            </p>
          </div>
          
          <div className="feature">
            <div className="feature-icon">
              <i className="fa fa-users"></i>
            </div>
            <h3>Personalized Service</h3>
            <p>
              Our dedicated team of 5 professionals provides individual attention and expert guidance 
              to help you make informed decisions throughout your automotive journey.
            </p>
          </div>
          
          <div className="feature">
            <div className="feature-icon">
              <i className="fa fa-handshake-o"></i>
            </div>
            <h3>Long-term Partnership</h3>
            <p>
              Our relationship extends beyond the sale. We provide ongoing support and assistance 
              to ensure your ownership experience remains smooth and hassle-free.
            </p>
          </div>
        </div>
      </section> */}

      <section className="about-us-section">
        <h2>Our Expert Team</h2>
        <p>
          Behind T-Permit Cars' success is our dedicated team of 5 passionate professionals who bring years of 
          experience and expertise to serve you better. From sales consultation to finance solutions and 
          customer service, each team member is committed to delivering excellence at every step.
        </p>
        
       
      </section>
      
      <section className="about-us-section cta-section">
        <h2>Experience the T-Permit Difference</h2>
        <p>
          Since June 2013, T-Permit Cars has been committed to making your automotive dreams a reality. 
          Visit our showroom or connect with our expert team to discover how we can help you find 
          the perfect vehicle with the perfect financing solution.
        </p>
        <button className="cta-button">Contact GAUTAM MOTORS Today</button>
      </section>
    </div>
  );
};

export default AboutUs; 