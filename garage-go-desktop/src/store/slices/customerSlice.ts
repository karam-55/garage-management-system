import { createSlice } from '@reduxjs/toolkit';

const customerSlice = createSlice({
  name: 'customer',
  initialState: { selectedCustomer: null as any },
  reducers: {
    setSelectedCustomer: (state, action) => { state.selectedCustomer = action.payload; },
    clearSelectedCustomer: (state) => { state.selectedCustomer = null; },
  },
});
export const { setSelectedCustomer, clearSelectedCustomer } = customerSlice.actions;
export default customerSlice.reducer;
