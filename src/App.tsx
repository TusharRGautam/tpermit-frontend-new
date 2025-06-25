import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './redux/store';
import './App.css';
import Header from './components/Header/Header';
import BannerSection from './components/BannerSection/BannerSection';
import FindYourRightCar from './components/FindYourRightCar/FindYourRightCar';
import LogosContainer from './components/LogosContainer/LogosContainer';
import GallerySection from './components/GallerySection/GallerySection';
import CarDetailWithInvoices from './components/CarDetailWithInvoices/CarDetailWithInvoices';
import BankLoans from './components/BankLoans/BankLoans';
import Footer from './components/Footer/Footer';
import NewCars from './pages/NewCars/NewCars';
import FinanceOffers from './pages/FinanceOffers/FinanceOffers';
import BusinessLoan from './pages/BusinessLoan/BusinessLoan';
import AboutUs from './pages/AboutUs/AboutUs';
import DashboardLayout from './components/dashboard/DashboardLayout';
import GlobalStateProvider from './components/GlobalStateProvider';
// TEMPORARY DEVELOPMENT CHANGES:
// - Login functionality is temporarily commented out
// - Dashboard access is enabled without authentication
// - To re-enable login: uncomment the imports below and restore the login route
// - Files affected: Login.tsx, ProtectedRoute.tsx, App.tsx
// import Login from './components/auth/Login';
// import ProtectedRoute from './components/auth/ProtectedRoute';

// ScrollToTop component that scrolls the page to the top when navigation occurs
const ScrollToTop: React.FC = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

// App component - root component of the application
const App: React.FC = () => {
  return (
    <Provider store={store}>
      <GlobalStateProvider>
        <Router>
          <Routes>
            {/* Temporarily commented out login route for development */}
            {/* <Route path="/login" element={<Login />} /> */}
            {/* Temporarily removed ProtectedRoute wrapper for development */}
            <Route path="/dashboard/*" element={<DashboardLayout />} />
            <Route path="/*" element={<AppContent />} />
          </Routes>
        </Router>
      </GlobalStateProvider>
    </Provider>
  );
};

// This component handles which routes should show the homepage components
const AppContent = () => {
  const location = useLocation();
  const isHomePage = location.pathname === '/';
  const isFinanceOffers = location.pathname === '/finance-offers';
  const isBusinessLoan = location.pathname === '/business-loan';
  const isAboutUs = location.pathname === '/about-us';
  
  return (
    <div className="App">
      <ScrollToTop />
      <Header />
      
      {/* Banner section - only on homepage */}
      {isHomePage && <BannerSection />}
      
      {/* Content area */}
      <div className="content-area">
        {/* Homepage specific components */}
        {isHomePage && (
          <>
            <FindYourRightCar />
            <LogosContainer />
            <GallerySection />
          </>
        )}
        
        {/* Finance Offers page specific components */}
        {isFinanceOffers && (
          <>
            <BankLoans />
          </>
        )}
        
        {/* Business Loan page specific components */}
        {isBusinessLoan && (
          <>
            <BusinessLoan />
          </>
        )}
        
        {/* Page specific content */}
        <Routes>
          <Route path="/" element={null} />
          <Route path="/car/:carId" element={<CarDetailWithInvoices />} />
          <Route path="/new-cars" element={<NewCars />} />
          <Route path="/finance-offers" element={<></>} />
          { <Route path="/business-loan" element={null} /> }
          <Route path="/about-us" element={<AboutUs />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
      
      <Footer />
    </div>
  );
};

export default App;
