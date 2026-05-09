import { configureStore } from '@reduxjs/toolkit';
import authSlice from './slices/authSlice';
import garageSlice from './slices/garageSlice';
import bookingSlice from './slices/bookingSlice';
import jobCardSlice from './slices/jobCardSlice';
import inventorySlice from './slices/inventorySlice';
import invoiceSlice from './slices/invoiceSlice';
import customerSlice from './slices/customerSlice';
import uiSlice from './slices/uiSlice';

export const store = configureStore({
  reducer: {
    auth: authSlice,
    garage: garageSlice,
    booking: bookingSlice,
    jobCard: jobCardSlice,
    inventory: inventorySlice,
    invoice: invoiceSlice,
    customer: customerSlice,
    ui: uiSlice,
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
