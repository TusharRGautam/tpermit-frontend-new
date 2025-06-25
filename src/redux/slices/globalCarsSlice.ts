import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

// Define interfaces for car data
export interface GlobalCarVariant {
  name: string;
  colors: string[];
}

export interface GlobalCarData {
  id: string;
  image: string;
  name: string;
  downPayment: string;
  monthlyEmi?: string;
  variants: GlobalCarVariant[];
  // Financial details
  globalExShowroomPrice?: number;
  globalLoanAmount?: number;
  globalInterestRate?: number;
  globalProcessingFee?: number;
  globalInsurance?: number;
  globalRegistration?: number;
  globalOtherCharges?: number;
  globalTotalOnRoadPrice?: number;
}

interface GlobalCarsState {
  globalCarsList: GlobalCarData[];
  globalSelectedCar: GlobalCarData | null;
  globalSelectedVariant: string | null;
  globalSelectedBank: string | null;
  globalIsLoading: boolean;
  globalError: string | null;
  globalLastUpdated: string | null;
}

const initialState: GlobalCarsState = {
  globalCarsList: [],
  globalSelectedCar: null,
  globalSelectedVariant: null,
  globalSelectedBank: null,
  globalIsLoading: false,
  globalError: null,
  globalLastUpdated: null,
};

// Async thunk for fetching car data
export const globalFetchCarsData = createAsyncThunk(
  'globalCars/fetchCarsData',
  async (_, { rejectWithValue }) => {
    try {
      // This will be connected to your quotation service
      const quotationService = await import('../../services/quotationService');
      const carSummaries = await quotationService.default.getCarSummaries();
      
      if (carSummaries && carSummaries.length > 0) {
        return carSummaries;
      } else {
        // Fallback data
        return [
          {
            id: 'maruti-suzuki-ertiga',
            image: '/Website-Images/Cars/ertiga.jpg',
            name: 'Maruti Suzuki Ertiga',
            downPayment: '₹1,25,000',
            monthlyEmi: '₹18,500/month',
            globalExShowroomPrice: 1000000,
            globalLoanAmount: 875000,
            globalInterestRate: 8.5,
            globalTotalOnRoadPrice: 1125000,
            variants: [
              { name: 'VXI CNG', colors: ['White', 'Silver', 'Grey', 'Red', 'Blue'] },
              { name: 'Tour M', colors: ['White'] }
            ]
          },
          {
            id: 'maruti-suzuki-dzire',
            image: '/Website-Images/Cars/Dzire.jpg',
            name: 'Maruti Suzuki Dzire',
            downPayment: '₹85,000',
            monthlyEmi: '₹14,200/month',
            globalExShowroomPrice: 750000,
            globalLoanAmount: 665000,
            globalInterestRate: 8.5,
            globalTotalOnRoadPrice: 850000,
            variants: [
              { name: 'Tour S CNG', colors: ['White'] }
            ]
          },
          {
            id: 'maruti-suzuki-wagon-r',
            image: '/Website-Images/Cars/wagnor.jpg',
            name: 'Maruti Suzuki Wagon-R',
            downPayment: '₹65,000',
            monthlyEmi: '₹12,800/month',
            globalExShowroomPrice: 650000,
            globalLoanAmount: 585000,
            globalInterestRate: 8.5,
            globalTotalOnRoadPrice: 715000,
            variants: [
              { name: 'Tour H', colors: ['White'] },
              { name: 'LXI CNG', colors: ['White', 'Silver', 'Grey', 'Red', 'Blue'] },
              { name: 'VXI CNG', colors: ['White', 'Silver', 'Grey', 'Red', 'Blue'] }
            ]
          },
          {
            id: 'maruti-suzuki-rumion',
            image: '/Website-Images/Cars/Ruminum.jpg',
            name: 'Maruti Suzuki Rumion',
            downPayment: '₹95,000',
            monthlyEmi: '₹15,900/month',
            globalExShowroomPrice: 850000,
            globalLoanAmount: 755000,
            globalInterestRate: 8.5,
            globalTotalOnRoadPrice: 950000,
            variants: [
              { name: 'S CNG', colors: ['White', 'Silver', 'Grey'] }
            ]
          },
          {
            id: 'hyundai-aura',
            image: '/Website-Images/Cars/Aura.jpg',
            name: 'Hyundai Aura',
            downPayment: '₹75,000',
            monthlyEmi: '₹13,500/month',
            globalExShowroomPrice: 700000,
            globalLoanAmount: 625000,
            globalInterestRate: 8.5,
            globalTotalOnRoadPrice: 775000,
            variants: [
              { name: 'E CNG', colors: ['White', 'Silver', 'Grey', 'Cherry Night'] },
              { name: 'S CNG', colors: ['White', 'Silver', 'Grey', 'Cherry Night'] },
              { name: 'SX CNG', colors: ['White', 'Silver', 'Grey', 'Cherry Night'] }
            ]
          },
          {
            id: 'toyota-innova-crysta',
            image: '/Website-Images/Cars/Crysta.jpg',
            name: 'Toyota Innova Crysta',
            downPayment: '₹1,50,000',
            monthlyEmi: '₹28,500/month',
            globalExShowroomPrice: 1800000,
            globalLoanAmount: 1650000,
            globalInterestRate: 8.5,
            globalTotalOnRoadPrice: 1950000,
            variants: [
              { name: 'GX Diesel', colors: ['White', 'Silver', 'Pearl White'] },
              { name: 'GXT Diesel', colors: ['White', 'Silver', 'Pearl White'] },
              { name: 'VX Diesel', colors: ['White', 'Silver', 'Pearl White'] },
              { name: 'ZX Diesel', colors: ['White', 'Silver', 'Pearl White'] }
            ]
          }
        ];
      }
    } catch (error) {
      return rejectWithValue(`Failed to fetch car data: ${error}`);
    }
  }
);

const globalCarsSlice = createSlice({
  name: 'globalCars',
  initialState,
  reducers: {
    globalSetSelectedCar: (state, action: PayloadAction<GlobalCarData>) => {
      state.globalSelectedCar = action.payload;
    },
    globalSetSelectedVariant: (state, action: PayloadAction<string>) => {
      state.globalSelectedVariant = action.payload;
    },
    globalSetSelectedBank: (state, action: PayloadAction<string>) => {
      state.globalSelectedBank = action.payload;
    },
    globalUpdateCarFinancialData: (state, action: PayloadAction<{ carId: string; financialData: Partial<GlobalCarData> }>) => {
      const { carId, financialData } = action.payload;
      const carIndex = state.globalCarsList.findIndex(car => car.id === carId);
      if (carIndex !== -1) {
        state.globalCarsList[carIndex] = { ...state.globalCarsList[carIndex], ...financialData };
      }
      // Update selected car if it matches
      if (state.globalSelectedCar?.id === carId) {
        state.globalSelectedCar = { ...state.globalSelectedCar, ...financialData };
      }
    },
    globalClearError: (state) => {
      state.globalError = null;
    },
    globalResetCarSelection: (state) => {
      state.globalSelectedCar = null;
      state.globalSelectedVariant = null;
      state.globalSelectedBank = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(globalFetchCarsData.pending, (state) => {
        state.globalIsLoading = true;
        state.globalError = null;
      })
      .addCase(globalFetchCarsData.fulfilled, (state, action) => {
        state.globalIsLoading = false;
        state.globalCarsList = action.payload;
        state.globalLastUpdated = new Date().toISOString();
        state.globalError = null;
      })
      .addCase(globalFetchCarsData.rejected, (state, action) => {
        state.globalIsLoading = false;
        state.globalError = action.payload as string;
      });
  },
});

export const {
  globalSetSelectedCar,
  globalSetSelectedVariant,
  globalSetSelectedBank,
  globalUpdateCarFinancialData,
  globalClearError,
  globalResetCarSelection,
} = globalCarsSlice.actions;

export default globalCarsSlice.reducer; 