import { configureStore } from '@reduxjs/toolkit';
import globalCarsReducer from './slices/globalCarsSlice';
import globalFinanceReducer from './slices/globalFinanceSlice';
import cartReducer from './slices/cartSlice';

export const store = configureStore({
  reducer: {
    globalCars: globalCarsReducer,
    globalFinance: globalFinanceReducer,
    cart: cartReducer,
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