import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { apiService } from '../../services/api';

export interface User {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  avatar?: string;
  role: string;
  permissions: string[];
  garageId?: string;
  garage?: {
    id: string;
    name: string;
    address: string;
    phone: string;
    logo?: string;
  };
}

interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: window.garageAPI?.getUserInfo() || null,
  token: window.garageAPI?.getAuthToken() || null,
  refreshToken: null,
  isAuthenticated: !!window.garageAPI?.getAuthToken(),
  loading: false,
  error: null,
};

// Async thunks
export const login = createAsyncThunk(
  'auth/login',
  async (credentials: { email: string; password: string }, { rejectWithValue }) => {
    try {
      const response = await apiService.post('/auth/login', {
        ...credentials,
      });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Login failed');
    }
  }
);

export const logout = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      await apiService.post('/auth/logout');
    } catch (error) {
      // Silent fail on logout
    }
    window.garageAPI?.clearAllData();
    return true;
  }
);

export const refreshTokenThunk = createAsyncThunk(
  'auth/refreshToken',
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { auth: AuthState };
      const response = await apiService.post('/auth/refresh', {
        refreshToken: state.auth.refreshToken,
      });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Token refresh failed');
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
    },
    setToken: (state, action: PayloadAction<string>) => {
      state.token = action.payload;
      state.isAuthenticated = true;
    },
    clearAuth: (state) => {
      state.user = null;
      state.token = null;
      state.refreshToken = null;
      state.isAuthenticated = false;
      state.error = null;
      window.garageAPI?.clearAllData();
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Login
    builder.addCase(login.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(login.fulfilled, (state, action) => {
      state.loading = false;
      state.user = action.payload.data.user;
      state.token = action.payload.data.token;
      state.refreshToken = action.payload.data.refreshToken;
      state.isAuthenticated = true;
      state.error = null;
      // Persist to storage
      window.garageAPI?.setAuthToken(action.payload.data.token);
      window.garageAPI?.setUserInfo(action.payload.data.user);
      if (action.payload.data.user.garage) {
        window.garageAPI?.setGarageInfo(action.payload.data.user.garage);
      }
    });
    builder.addCase(login.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Logout
    builder.addCase(logout.fulfilled, (state) => {
      state.user = null;
      state.token = null;
      state.refreshToken = null;
      state.isAuthenticated = false;
    });

    // Refresh token
    builder.addCase(refreshTokenThunk.fulfilled, (state, action) => {
      state.token = action.payload.data.token;
      state.refreshToken = action.payload.data.refreshToken;
      window.garageAPI?.setAuthToken(action.payload.data.token);
    });
    builder.addCase(refreshTokenThunk.rejected, (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      window.garageAPI?.clearAllData();
    });
  },
});

export const { setUser, setToken, clearAuth, clearError } = authSlice.actions;
export default authSlice.reducer;
