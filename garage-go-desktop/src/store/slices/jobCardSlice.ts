import { createSlice } from '@reduxjs/toolkit';

const jobCardSlice = createSlice({
  name: 'jobCard',
  initialState: { selectedJobCard: null as any },
  reducers: {
    setSelectedJobCard: (state, action) => { state.selectedJobCard = action.payload; },
    clearSelectedJobCard: (state) => { state.selectedJobCard = null; },
  },
});
export const { setSelectedJobCard, clearSelectedJobCard } = jobCardSlice.actions;
export default jobCardSlice.reducer;
