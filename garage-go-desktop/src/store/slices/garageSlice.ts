import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface GarageState {
  id: string | null;
  name: string | null;
  address: string | null;
  phone: string | null;
  logo: string | null;
  settings: Record<string, any>;
}

const initialState: GarageState = {
  id: null,
  name: null,
  address: null,
  phone: null,
  logo: null,
  settings: {},
};

const garageSlice = createSlice({
  name: 'garage',
  initialState,
  reducers: {
    setGarage: (state, action: PayloadAction<Partial<GarageState>>) => {
      return { ...state, ...action.payload };
    },
    clearGarage: () => initialState,
    updateSettings: (state, action: PayloadAction<Record<string, any>>) => {
      state.settings = { ...state.settings, ...action.payload };
    },
  },
});

export const { setGarage, clearGarage, updateSettings } = garageSlice.actions;
export default garageSlice.reducer;
