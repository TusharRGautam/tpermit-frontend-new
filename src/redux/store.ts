import { configureStore } from '@reduxjs/toolkit';
import globalCarsReducer from './slices/globalCarsSlice';
import globalFinanceReducer from './slices/globalFinanceSlice';

export const store = configureStore({
  reducer: {
    globalCars: globalCarsReducer,
    globalFinance: globalFinanceReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch; 