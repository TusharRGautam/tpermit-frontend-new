import { createSelector } from '@reduxjs/toolkit';
import { RootState } from './store';

// Global Cars Selectors
export const selectGlobalCarsState = (state: RootState) => state.globalCars;

export const selectGlobalCarsList = createSelector(
  [selectGlobalCarsState],
  (globalCarsState) => globalCarsState.globalCarsList
);

export const selectGlobalSelectedCar = createSelector(
  [selectGlobalCarsState],
  (globalCarsState) => globalCarsState.globalSelectedCar
);

export const selectGlobalSelectedVariant = createSelector(
  [selectGlobalCarsState],
  (globalCarsState) => globalCarsState.globalSelectedVariant
);

export const selectGlobalSelectedBank = createSelector(
  [selectGlobalCarsState],
  (globalCarsState) => globalCarsState.globalSelectedBank
);

export const selectGlobalCarsLoading = createSelector(
  [selectGlobalCarsState],
  (globalCarsState) => globalCarsState.globalIsLoading
);

export const selectGlobalCarsError = createSelector(
  [selectGlobalCarsState],
  (globalCarsState) => globalCarsState.globalError
);

export const selectGlobalCarById = createSelector(
  [selectGlobalCarsList, (state: RootState, carId: string) => carId],
  (globalCarsList, carId) => globalCarsList.find(car => car.id === carId)
);

// Global Finance Selectors
export const selectGlobalFinanceState = (state: RootState) => state.globalFinance;

export const selectGlobalBankOptions = createSelector(
  [selectGlobalFinanceState],
  (globalFinanceState) => globalFinanceState.globalBankOptions
);

export const selectGlobalCurrentCalculation = createSelector(
  [selectGlobalFinanceState],
  (globalFinanceState) => globalFinanceState.globalCurrentCalculation
);

export const selectGlobalSelectedBankId = createSelector(
  [selectGlobalFinanceState],
  (globalFinanceState) => globalFinanceState.globalSelectedBankId
);

export const selectGlobalSelectedTenure = createSelector(
  [selectGlobalFinanceState],
  (globalFinanceState) => globalFinanceState.globalSelectedTenure
);

export const selectGlobalCustomDownPayment = createSelector(
  [selectGlobalFinanceState],
  (globalFinanceState) => globalFinanceState.globalCustomDownPayment
);

export const selectGlobalIsCalculating = createSelector(
  [selectGlobalFinanceState],
  (globalFinanceState) => globalFinanceState.globalIsCalculating
);

export const selectGlobalCalculationError = createSelector(
  [selectGlobalFinanceState],
  (globalFinanceState) => globalFinanceState.globalCalculationError
);

export const selectGlobalDefaultCharges = createSelector(
  [selectGlobalFinanceState],
  (globalFinanceState) => globalFinanceState.globalDefaultCharges
);

export const selectGlobalSelectedBankDetails = createSelector(
  [selectGlobalBankOptions, selectGlobalSelectedBankId],
  (globalBankOptions, globalSelectedBankId) => 
    globalBankOptions.find(bank => bank.globalBankId === globalSelectedBankId)
);

// Combined Selectors
export const selectGlobalCarWithFinance = createSelector(
  [selectGlobalSelectedCar, selectGlobalCurrentCalculation],
  (globalSelectedCar, globalCurrentCalculation) => ({
    globalCar: globalSelectedCar,
    globalFinanceDetails: globalCurrentCalculation,
  })
);

export const selectGlobalCarsWithEmi = createSelector(
  [selectGlobalCarsList, selectGlobalBankOptions, selectGlobalSelectedTenure],
  (globalCarsList, globalBankOptions, globalSelectedTenure) => {
    const defaultBank = globalBankOptions[0]; // Use first bank as default
    
    return globalCarsList.map(car => {
      if (car.globalExShowroomPrice && defaultBank) {
        // Quick EMI calculation for display
        const loanAmount = car.globalExShowroomPrice * 0.8; // Assuming 20% down payment
        const monthlyRate = defaultBank.globalInterestRate / 100 / 12;
        const emi = (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, globalSelectedTenure)) / 
                   (Math.pow(1 + monthlyRate, globalSelectedTenure) - 1);
        
        return {
          ...car,
          monthlyEmi: `₹${Math.round(emi).toLocaleString()}/month`,
        };
      }
      return car;
    });
  }
); 