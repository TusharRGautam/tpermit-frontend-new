import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface CartItem {
  id: string;
  carName: string;
  carImage: string;
  variant: {
    id: string;
    name: string;
    exShowroom: number;
    onRoadPrice: number;
    monthlyEmi: number;
    downPayment: number;
    bookingAmount: number;
  };
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  customerAddress: string;
  customerCity: string;
  customerPincode: string;
  bookingAmount: number;
  dateAdded: string;
}

interface CartState {
  items: CartItem[];
  totalAmount: number;
  totalItems: number;
}

const initialState: CartState = {
  items: [],
  totalAmount: 0,
  totalItems: 0,
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart: (state, action: PayloadAction<Omit<CartItem, 'id' | 'dateAdded'>>) => {
      const newItem: CartItem = {
        ...action.payload,
        id: `cart-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        dateAdded: new Date().toISOString(),
      };
      
      state.items.push(newItem);
      state.totalItems = state.items.length;
      state.totalAmount = state.items.reduce((total, item) => total + item.bookingAmount, 0);
    },
    
    removeFromCart: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter(item => item.id !== action.payload);
      state.totalItems = state.items.length;
      state.totalAmount = state.items.reduce((total, item) => total + item.bookingAmount, 0);
    },
    
    updateCartItem: (state, action: PayloadAction<{ id: string; updates: Partial<CartItem> }>) => {
      const { id, updates } = action.payload;
      const itemIndex = state.items.findIndex(item => item.id === id);
      
      if (itemIndex !== -1) {
        state.items[itemIndex] = { ...state.items[itemIndex], ...updates };
        state.totalAmount = state.items.reduce((total, item) => total + item.bookingAmount, 0);
      }
    },
    
    clearCart: (state) => {
      state.items = [];
      state.totalItems = 0;
      state.totalAmount = 0;
    },
    
    loadCartFromStorage: (state, action: PayloadAction<CartItem[]>) => {
      state.items = action.payload;
      state.totalItems = action.payload.length;
      state.totalAmount = action.payload.reduce((total, item) => total + item.bookingAmount, 0);
    },
  },
});

export const {
  addToCart,
  removeFromCart,
  updateCartItem,
  clearCart,
  loadCartFromStorage,
} = cartSlice.actions;

export default cartSlice.reducer;