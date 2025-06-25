# Redux Global State Management

This directory contains the Redux store setup for managing global state variables throughout the ASW website application.

## 🌍 Global Variables Architecture

All global state variables are prefixed with `global` to maintain consistency and clarity across the application.

### Global Cars State (`globalCars`)

**Global Variables:**
- `globalCarsList`: Array of all available cars with financial details
- `globalSelectedCar`: Currently selected car for detailed viewing
- `globalSelectedVariant`: Selected car variant
- `globalSelectedBank`: Selected bank for car financing
- `globalIsLoading`: Loading state for car data fetching
- `globalError`: Error messages from car data operations
- `globalLastUpdated`: Timestamp of last data update

**Key Features:**
- Automatic car data fetching from quotation service
- Fallback data when backend is unavailable
- Real-time financial calculations for each car
- Centralized car selection management

### Global Finance State (`globalFinance`)

**Global Variables:**
- `globalBankOptions`: Available bank financing options
- `globalCurrentCalculation`: Current EMI and financial calculation
- `globalSelectedBankId`: ID of selected bank
- `globalSelectedTenure`: Loan tenure in months
- `globalCustomDownPayment`: User-defined down payment amount
- `globalIsCalculating`: Loading state for EMI calculations
- `globalCalculationError`: Error messages from financial calculations
- `globalDefaultCharges`: Default insurance, registration, and other charges

**Financial Calculations Include:**
- `globalExShowroomPrice`: Ex-showroom price of vehicle
- `globalDownPayment`: Required down payment
- `globalLoanAmount`: Total loan amount
- `globalInterestRate`: Interest rate from selected bank
- `globalMonthlyEmi`: Calculated monthly EMI
- `globalTotalInterest`: Total interest over loan tenure
- `globalTotalAmount`: Total amount to be paid
- `globalProcessingFee`: Bank processing fee
- `globalInsurance`: Insurance amount
- `globalRegistration`: Registration charges
- `globalOtherCharges`: Other miscellaneous charges
- `globalTotalOnRoadPrice`: Total on-road price

## 📁 File Structure

```
redux/
├── store.ts                    # Main Redux store configuration
├── hooks.ts                    # Typed Redux hooks
├── selectors.ts                # Memoized selectors for global state
├── index.ts                    # Centralized exports
├── slices/
│   ├── globalCarsSlice.ts      # Global cars state management
│   └── globalFinanceSlice.ts   # Global finance state management
└── README.md                   # This documentation
```

## 🚀 Usage Examples

### Basic Usage in Components

```typescript
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import { 
  selectGlobalCarsList, 
  selectGlobalCarsLoading 
} from '../redux/selectors';
import { globalFetchCarsData } from '../redux/slices/globalCarsSlice';

const MyComponent = () => {
  const dispatch = useAppDispatch();
  const globalCarsList = useAppSelector(selectGlobalCarsList);
  const globalIsLoading = useAppSelector(selectGlobalCarsLoading);

  useEffect(() => {
    dispatch(globalFetchCarsData());
  }, [dispatch]);

  return (
    <div>
      {globalIsLoading ? (
        <p>Loading global cars data...</p>
      ) : (
        globalCarsList.map(car => (
          <div key={car.id}>{car.name}</div>
        ))
      )}
    </div>
  );
};
```

### EMI Calculation

```typescript
import { globalCalculateEmi } from '../redux/slices/globalFinanceSlice';

const calculateCarEmi = (carId: string, price: number) => {
  dispatch(globalCalculateEmi({
    globalCarId: carId,
    globalExShowroomPrice: price,
  }));
};
```

### Bank Selection

```typescript
import { globalSetSelectedBank } from '../redux/slices/globalFinanceSlice';

const selectBank = (bankId: string) => {
  dispatch(globalSetSelectedBank(bankId));
};
```

## 🔍 Available Selectors

### Car Selectors
- `selectGlobalCarsList` - All cars with financial data
- `selectGlobalSelectedCar` - Currently selected car
- `selectGlobalCarsLoading` - Loading state
- `selectGlobalCarsError` - Error messages
- `selectGlobalCarById(carId)` - Specific car by ID
- `selectGlobalCarsWithEmi` - Cars with calculated EMI

### Finance Selectors
- `selectGlobalBankOptions` - Available banks
- `selectGlobalCurrentCalculation` - Current EMI calculation
- `selectGlobalSelectedBankId` - Selected bank ID
- `selectGlobalSelectedTenure` - Loan tenure
- `selectGlobalIsCalculating` - Calculation loading state
- `selectGlobalCalculationError` - Calculation errors

### Combined Selectors
- `selectGlobalCarWithFinance` - Selected car with finance details
- `selectGlobalSelectedBankDetails` - Details of selected bank

## 🛠 Available Actions

### Car Actions
- `globalFetchCarsData()` - Fetch all car data
- `globalSetSelectedCar(car)` - Select a car
- `globalSetSelectedVariant(variant)` - Select car variant
- `globalUpdateCarFinancialData({ carId, financialData })` - Update financial data
- `globalResetCarSelection()` - Reset car selection

### Finance Actions
- `globalSetSelectedBank(bankId)` - Select financing bank
- `globalSetSelectedTenure(months)` - Set loan tenure
- `globalSetCustomDownPayment(amount)` - Set custom down payment
- `globalCalculateEmi({ globalCarId, globalExShowroomPrice })` - Calculate EMI
- `globalUpdateBankOptions(banks)` - Update available banks
- `globalClearCalculation()` - Clear current calculation
- `globalResetFinanceState()` - Reset all finance state

## 🎯 Integration Points

### FindYourRightCar Component
- Uses `globalCarsWithEmi` selector to display cars with calculated EMI
- Automatically fetches global car data on mount
- Shows loading states and error messages from global state

### GlobalStateProvider Component
- Initializes global state on application startup
- Manages automatic EMI calculations when parameters change
- Provides centralized state management for the entire application

## 🔧 Configuration

### Bank Options
Default banks are configured in `globalFinanceSlice.ts`:
- SBI Bank (8.5% interest)
- AU Bank (8.75% interest)
- Union Bank (8.25% interest)
- IndusInd Bank (9.0% interest)

### Default Charges
- Insurance: 3.5% of ex-showroom price
- Registration: ₹39,500
- Other charges: ₹15,000

## 🚨 Error Handling

All global state operations include comprehensive error handling:
- Network failures during data fetching
- Invalid calculation parameters
- Bank selection validation
- Loan amount limits validation

## 📊 Performance Optimizations

- **Memoized Selectors**: Using `createSelector` for optimized re-renders
- **Automatic Caching**: Car data is cached and only refetched when necessary
- **Lazy Loading**: Data is fetched only when components mount
- **Background Calculations**: EMI calculations happen automatically without blocking UI

## 🔄 State Persistence

Currently, the global state is maintained in memory during the session. For persistence across browser sessions, consider adding Redux Persist middleware.

## 🧪 Testing

Each global state slice includes comprehensive test coverage for:
- Action creators
- Reducer functions
- Async thunks
- Selector functions
- Error scenarios

This global state management system ensures that financial data, car information, and user selections are consistently available throughout the ASW website application. 