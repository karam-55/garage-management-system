import { createSlice } from '@reduxjs/toolkit';

const bookingSlice = createSlice({
  name: 'booking',
  initialState: { selectedBooking: null as any },
  reducers: {
    setSelectedBooking: (state, action) => { state.selectedBooking = action.payload; },
    clearSelectedBooking: (state) => { state.selectedBooking = null; },
  },
});
export const { setSelectedBooking, clearSelectedBooking } = bookingSlice.actions;
export default bookingSlice.reducer;
