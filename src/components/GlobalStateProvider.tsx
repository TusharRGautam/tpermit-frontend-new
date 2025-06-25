import React, { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import { 
  globalFetchCarsData
} from '../redux/slices/globalCarsSlice';
import {
  globalCalculateEmi
} from '../redux/slices/globalFinanceSlice';
import { 
  selectGlobalCarsList,
  selectGlobalSelectedBankId,
  selectGlobalSelectedTenure 
} from '../redux/selectors';

interface GlobalStateProviderProps {
  children: React.ReactNode;
}

/**
 * Global State Provider Component
 * 
 * This component initializes and manages the global state for the application.
 * It fetches initial data and performs calculations based on global variables.
 * 
 * Global variables managed:
 * - globalCarsList: List of all available cars
 * - globalSelectedBank: Currently selected bank for financing
 * - globalSelectedTenure: Selected loan tenure
 * - globalFinancialCalculations: EMI and other financial calculations
 */
const GlobalStateProvider: React.FC<GlobalStateProviderProps> = ({ children }) => {
  const dispatch = useAppDispatch();
  
  // Global state selectors
  const globalCarsList = useAppSelector(selectGlobalCarsList);
  const globalSelectedBankId = useAppSelector(selectGlobalSelectedBankId);
  const globalSelectedTenure = useAppSelector(selectGlobalSelectedTenure);

  // Initialize global data on mount
  useEffect(() => {
    console.log('🌍 Initializing global state...');
    
    // Fetch global cars data if not already loaded
    if (globalCarsList.length === 0) {
      console.log('🚗 Fetching global cars data...');
      dispatch(globalFetchCarsData());
    }
  }, [dispatch, globalCarsList.length]);

  // Auto-calculate EMI for cars when global financial parameters change
  useEffect(() => {
    if (globalCarsList.length > 0 && globalSelectedBankId) {
      console.log(`💰 Calculating global EMI for ${globalCarsList.length} cars with bank: ${globalSelectedBankId}, tenure: ${globalSelectedTenure} months`);
      
      globalCarsList.forEach(car => {
        if (car.globalExShowroomPrice) {
          dispatch(globalCalculateEmi({
            globalCarId: car.id,
            globalExShowroomPrice: car.globalExShowroomPrice,
          }));
        }
      });
    }
  }, [dispatch, globalCarsList, globalSelectedBankId, globalSelectedTenure]);

  return <>{children}</>;
};

export default GlobalStateProvider; 