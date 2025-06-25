import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// Define interfaces for financial data
export interface GlobalBankOption {
  globalBankId: string;
  globalBankName: string;
  globalInterestRate: number;
  globalProcessingFee: number;
  globalMaxLoanAmount: number;
  globalMinDownPayment: number;
  globalMaxTenure: number;
}

export interface GlobalFinancialCalculation {
  globalCarId: string;
  globalBankId: string;
  globalExShowroomPrice: number;
  globalDownPayment: number;
  globalLoanAmount: number;
  globalInterestRate: number;
  globalTenureMonths: number;
  globalMonthlyEmi: number;
  globalTotalInterest: number;
  globalTotalAmount: number;
  globalProcessingFee: number;
  globalInsurance: number;
  globalRegistration: number;
  globalOtherCharges: number;
  globalTotalOnRoadPrice: number;
}

interface GlobalFinanceState {
  globalBankOptions: GlobalBankOption[];
  globalCurrentCalculation: GlobalFinancialCalculation | null;
  globalSelectedBankId: string | null;
  globalSelectedTenure: number;
  globalCustomDownPayment: number | null;
  globalIsCalculating: boolean;
  globalCalculationError: string | null;
  globalDefaultCharges: {
    globalInsurancePercentage: number;
    globalRegistrationAmount: number;
    globalOtherChargesAmount: number;
  };
}

const initialState: GlobalFinanceState = {
  globalBankOptions: [
    {
      globalBankId: 'sbi',
      globalBankName: 'SBI Bank',
      globalInterestRate: 8.5,
      globalProcessingFee: 15000,
      globalMaxLoanAmount: 5000000,
      globalMinDownPayment: 20,
      globalMaxTenure: 84,
    },
    {
      globalBankId: 'au',
      globalBankName: 'AU Bank',
      globalInterestRate: 8.75,
      globalProcessingFee: 12000,
      globalMaxLoanAmount: 4000000,
      globalMinDownPayment: 15,
      globalMaxTenure: 84,
    },
    {
      globalBankId: 'union',
      globalBankName: 'Union Bank',
      globalInterestRate: 8.25,
      globalProcessingFee: 18000,
      globalMaxLoanAmount: 3500000,
      globalMinDownPayment: 25,
      globalMaxTenure: 72,
    },
    {
      globalBankId: 'indusind',
      globalBankName: 'IndusInd Bank',
      globalInterestRate: 9.0,
      globalProcessingFee: 20000,
      globalMaxLoanAmount: 6000000,
      globalMinDownPayment: 20,
      globalMaxTenure: 96,
    },
  ],
  globalCurrentCalculation: null,
  globalSelectedBankId: 'sbi',
  globalSelectedTenure: 60,
  globalCustomDownPayment: null,
  globalIsCalculating: false,
  globalCalculationError: null,
  globalDefaultCharges: {
    globalInsurancePercentage: 3.5,
    globalRegistrationAmount: 39500,
    globalOtherChargesAmount: 15000,
  },
};

const globalFinanceSlice = createSlice({
  name: 'globalFinance',
  initialState,
  reducers: {
    globalSetSelectedBank: (state, action: PayloadAction<string>) => {
      state.globalSelectedBankId = action.payload;
    },
    globalSetSelectedTenure: (state, action: PayloadAction<number>) => {
      state.globalSelectedTenure = action.payload;
    },
    globalSetCustomDownPayment: (state, action: PayloadAction<number | null>) => {
      state.globalCustomDownPayment = action.payload;
    },
    globalCalculateEmi: (state, action: PayloadAction<{ 
      globalCarId: string; 
      globalExShowroomPrice: number; 
      globalDownPaymentOverride?: number 
    }>) => {
      const { globalCarId, globalExShowroomPrice, globalDownPaymentOverride } = action.payload;
      
      const selectedBank = state.globalBankOptions.find(
        bank => bank.globalBankId === state.globalSelectedBankId
      );
      
      if (!selectedBank) {
        state.globalCalculationError = 'Selected bank not found';
        return;
      }

      try {
        state.globalIsCalculating = true;
        state.globalCalculationError = null;

        // Calculate insurance and other charges
        const globalInsurance = (globalExShowroomPrice * state.globalDefaultCharges.globalInsurancePercentage) / 100;
        const globalRegistration = state.globalDefaultCharges.globalRegistrationAmount;
        const globalOtherCharges = state.globalDefaultCharges.globalOtherChargesAmount;
        const globalTotalOnRoadPrice = globalExShowroomPrice + globalInsurance + globalRegistration + globalOtherCharges;

        // Calculate down payment
        const minDownPaymentAmount = (globalTotalOnRoadPrice * selectedBank.globalMinDownPayment) / 100;
        const globalDownPayment = globalDownPaymentOverride || 
                                state.globalCustomDownPayment || 
                                minDownPaymentAmount;

        // Calculate loan amount
        const globalLoanAmount = globalTotalOnRoadPrice - globalDownPayment;

        // Validate loan amount
        if (globalLoanAmount > selectedBank.globalMaxLoanAmount) {
          state.globalCalculationError = `Loan amount exceeds maximum limit of ₹${selectedBank.globalMaxLoanAmount.toLocaleString()}`;
          state.globalIsCalculating = false;
          return;
        }

        // Calculate EMI using standard formula: EMI = [P * R * (1+R)^N] / [(1+R)^N - 1]
        const monthlyRate = selectedBank.globalInterestRate / 100 / 12;
        const numPayments = state.globalSelectedTenure;
        
        const globalMonthlyEmi = (globalLoanAmount * monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / 
                               (Math.pow(1 + monthlyRate, numPayments) - 1);

        const globalTotalAmount = globalMonthlyEmi * numPayments;
        const globalTotalInterest = globalTotalAmount - globalLoanAmount;

        state.globalCurrentCalculation = {
          globalCarId,
          globalBankId: selectedBank.globalBankId,
          globalExShowroomPrice,
          globalDownPayment,
          globalLoanAmount,
          globalInterestRate: selectedBank.globalInterestRate,
          globalTenureMonths: state.globalSelectedTenure,
          globalMonthlyEmi: Math.round(globalMonthlyEmi),
          globalTotalInterest: Math.round(globalTotalInterest),
          globalTotalAmount: Math.round(globalTotalAmount),
          globalProcessingFee: selectedBank.globalProcessingFee,
          globalInsurance: Math.round(globalInsurance),
          globalRegistration,
          globalOtherCharges,
          globalTotalOnRoadPrice: Math.round(globalTotalOnRoadPrice),
        };

        state.globalIsCalculating = false;
      } catch (error) {
        state.globalCalculationError = 'Error calculating EMI';
        state.globalIsCalculating = false;
      }
    },
    globalUpdateBankOptions: (state, action: PayloadAction<GlobalBankOption[]>) => {
      state.globalBankOptions = action.payload;
    },
    globalClearCalculation: (state) => {
      state.globalCurrentCalculation = null;
      state.globalCalculationError = null;
    },
    globalResetFinanceState: (state) => {
      state.globalCurrentCalculation = null;
      state.globalSelectedBankId = 'sbi';
      state.globalSelectedTenure = 60;
      state.globalCustomDownPayment = null;
      state.globalCalculationError = null;
    },
    globalUpdateDefaultCharges: (state, action: PayloadAction<Partial<typeof initialState.globalDefaultCharges>>) => {
      state.globalDefaultCharges = { ...state.globalDefaultCharges, ...action.payload };
    },
  },
});

export const {
  globalSetSelectedBank,
  globalSetSelectedTenure,
  globalSetCustomDownPayment,
  globalCalculateEmi,
  globalUpdateBankOptions,
  globalClearCalculation,
  globalResetFinanceState,
  globalUpdateDefaultCharges,
} = globalFinanceSlice.actions;

export default globalFinanceSlice.reducer; 