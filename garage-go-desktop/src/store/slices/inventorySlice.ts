import { createSlice } from '@reduxjs/toolkit';

const inventorySlice = createSlice({
  name: 'inventory',
  initialState: { selectedPart: null as any, filters: {} as any },
  reducers: {
    setSelectedPart: (state, action) => { state.selectedPart = action.payload; },
    setFilters: (state, action) => { state.filters = action.payload; },
    clearSelectedPart: (state) => { state.selectedPart = null; },
  },
});
export const { setSelectedPart, setFilters, clearSelectedPart } = inventorySlice.actions;
export default inventorySlice.reducer;
