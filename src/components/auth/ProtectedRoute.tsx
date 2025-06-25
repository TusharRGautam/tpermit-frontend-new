/*
// Temporarily commented out for development - will uncomment later
import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import apiService from '../../services/apiService';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    const checkAuthentication = async () => {
      const sessionToken = localStorage.getItem('aswSessionToken');
      
      if (!sessionToken) {
        setIsAuthenticated(false);
        setIsLoading(false);
        return;
      }

      try {
        console.log('Verifying session token...');
        const data = await apiService.verifySession(sessionToken);
        
        if (data.success && data.valid) {
          console.log('Session verification successful');
          setIsAuthenticated(true);
          // Update user info in localStorage if needed
          if (data.user) {
            localStorage.setItem('aswUser', JSON.stringify(data.user));
          }
        } else {
          console.log('Session verification failed - invalid session');
          // Invalid session, clear storage
          localStorage.removeItem('aswSessionToken');
          localStorage.removeItem('aswUser');
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error('Authentication check failed:', error);
        // On network error, assume session is invalid
        localStorage.removeItem('aswSessionToken');
        localStorage.removeItem('aswUser');
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthentication();
  }, []);

  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      }}>
        <div style={{
          background: 'white',
          padding: '30px',
          borderRadius: '12px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
          textAlign: 'center'
        }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '4px solid #f3f3f3',
            borderTop: '4px solid #667eea',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 15px'
          }}></div>
          <p style={{ margin: 0, color: '#666' }}>Checking authentication...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Redirect to login with the current location as state
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
*/

import React from 'react';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

// Temporarily disabled authentication - will uncomment later
// For now, always allowing access for development
const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  return <>{children}</>;
};

export default ProtectedRoute; 