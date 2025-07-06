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

// Get fallback car data
const getFallbackCarData = () => [
  {
    id: 'maruti-suzuki-ertiga',
    image: '/Website-Images/Cars/ertiga.jpg',
    name: 'Maruti Suzuki ERTIGA',
    downPayment: '₹99,347',
    monthlyEmi: '₹23,367/month',
    globalExShowroomPrice: 1000000,
    globalLoanAmount: 875000,
    globalInterestRate: 8.5,
    globalTotalOnRoadPrice: 1125000,
    variants: [
      { name: 'VXI CNG 1.5 MT', colors: ['White', 'Silver', 'Grey', 'Red', 'Blue'] },
      { name: 'Tour M CNG 1.5 MT', colors: ['White'] }
    ]
  },
  {
    id: 'maruti-suzuki-dzire',
    image: '/Website-Images/Cars/Dzire.jpg',
    name: 'Maruti Suzuki Dzire',
    downPayment: '₹1,35,971',
    monthlyEmi: '₹17,531/month',
    globalExShowroomPrice: 750000,
    globalLoanAmount: 665000,
    globalInterestRate: 8.5,
    globalTotalOnRoadPrice: 850000,
    variants: [
      { name: 'Tour S CNG', colors: ['White'] },
      { name: 'Tour S CNG', colors: ['White'] }
    ]
  },
  {
    id: 'maruti-suzuki-wagon-r',
    image: '/Website-Images/Cars/wagnor.jpg',
    name: 'Maruti Suzuki Wagon-R',
    downPayment: '₹92,821',
    monthlyEmi: '₹11,884/month',
    globalExShowroomPrice: 650000,
    globalLoanAmount: 585000,
    globalInterestRate: 8.5,
    globalTotalOnRoadPrice: 715000,
    variants: [
      { name: 'LXI CNG', colors: ['White', 'Silver', 'Grey', 'Red', 'Blue'] },
      { name: 'Tour H', colors: ['White'] }
    ]
  },
  {
    id: 'toyota-rumion',
    image: '/Website-Images/Cars/Ruminum.jpg',
    name: 'TOYOTA RUMION',
    downPayment: '₹1,03,647',
    monthlyEmi: '₹23,344/month',
    globalExShowroomPrice: 850000,
    globalLoanAmount: 755000,
    globalInterestRate: 8.5,
    globalTotalOnRoadPrice: 950000,
    variants: [
      { name: 'S CNG 1.5 MT', colors: ['White', 'Silver', 'Grey'] }
    ]
  },
  {
    id: 'hyundai-aura',
    image: '/Website-Images/Cars/Aura.jpg',
    name: 'HYUNDAI AURA',
    downPayment: '₹1,23,821',
    monthlyEmi: '₹15,809/month',
    globalExShowroomPrice: 700000,
    globalLoanAmount: 625000,
    globalInterestRate: 8.5,
    globalTotalOnRoadPrice: 775000,
    variants: [
      { name: 'E CNG', colors: ['White', 'Silver', 'Grey', 'Cherry Night'] },
      { name: 'S CNG', colors: ['White', 'Silver', 'Grey', 'Cherry Night'] }
    ]
  },
  {
    id: 'toyota-innova-crysta',
    image: '/Website-Images/Cars/Crysta.jpg',
    name: 'Toyota Innova Crysta',
    downPayment: '₹1,59,547',
    monthlyEmi: '₹38,557/month',
    globalExShowroomPrice: 1800000,
    globalLoanAmount: 1650000,
    globalInterestRate: 8.5,
    globalTotalOnRoadPrice: 1950000,
    variants: [
      { name: 'GX', colors: ['White', 'Silver', 'Pearl White'] },
      { name: 'GX+', colors: ['White', 'Silver', 'Pearl White'] }
    ]
  }
];

// Async thunk for fetching car data
export const globalFetchCarsData = createAsyncThunk(
  'globalCars/fetchCarsData',
  async (_, { rejectWithValue }) => {
    try {
      // Try to fetch from backend
      const quotationService = await import('../../services/quotationService');
      const carSummaries = await quotationService.default.getCarSummaries();
      
      if (carSummaries && carSummaries.length > 0) {
        console.log('✅ Successfully fetched car data from backend');
        return carSummaries;
      } else {
        console.log('⚠️ Backend returned empty data, using fallback');
        return getFallbackCarData();
      }
    } catch (error) {
      console.log('⚠️ Backend fetch failed, using fallback:', error);
      // Always return fallback data instead of rejecting
      return getFallbackCarData();
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