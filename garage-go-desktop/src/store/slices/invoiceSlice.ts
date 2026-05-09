import { createSlice } from '@reduxjs/toolkit';

const invoiceSlice = createSlice({
  name: 'invoice',
  initialState: { selectedInvoice: null as any },
  reducers: {
    setSelectedInvoice: (state, action) => { state.selectedInvoice = action.payload; },
    clearSelectedInvoice: (state) => { state.selectedInvoice = null; },
  },
});
export const { setSelectedInvoice, clearSelectedInvoice } = invoiceSlice.actions;
export default invoiceSlice.reducer;
