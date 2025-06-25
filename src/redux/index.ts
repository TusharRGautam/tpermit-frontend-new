// Redux store exports
export { store } from './store';
export type { RootState, AppDispatch } from './store';

// Redux hooks
export { useAppDispatch, useAppSelector } from './hooks';

// Global Cars slice exports
export {
  globalFetchCarsData,
  globalSetSelectedCar,
  globalSetSelectedVariant,
  globalSetSelectedBank,
  globalUpdateCarFinancialData,
  globalClearError,
  globalResetCarSelection,
} from './slices/globalCarsSlice';
export type { GlobalCarData, GlobalCarVariant } from './slices/globalCarsSlice';

// Global Finance slice exports
export {
  globalSetSelectedBank as globalSetFinanceBank,
  globalSetSelectedTenure,
  globalSetCustomDownPayment,
  globalCalculateEmi,
  globalUpdateBankOptions,
  globalClearCalculation,
  globalResetFinanceState,
  globalUpdateDefaultCharges,
} from './slices/globalFinanceSlice';
export type { GlobalBankOption, GlobalFinancialCalculation } from './slices/globalFinanceSlice';

// Selectors
export {
  selectGlobalCarsList,
  selectGlobalSelectedCar,
  selectGlobalSelectedVariant,
  selectGlobalSelectedBank,
  selectGlobalCarsLoading,
  selectGlobalCarsError,
  selectGlobalCarById,
  selectGlobalBankOptions,
  selectGlobalCurrentCalculation,
  selectGlobalSelectedBankId,
  selectGlobalSelectedTenure,
  selectGlobalCustomDownPayment,
  selectGlobalIsCalculating,
  selectGlobalCalculationError,
  selectGlobalDefaultCharges,
  selectGlobalSelectedBankDetails,
  selectGlobalCarWithFinance,
  selectGlobalCarsWithEmi,
} from './selectors'; 