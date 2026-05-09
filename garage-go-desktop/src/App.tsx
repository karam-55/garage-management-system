import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline, Box } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import 'dayjs/locale/ar';

import { store } from './store';
import { useAuth } from './hooks/useAuth';
import { Layout } from './components/Layout';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Bookings } from './pages/Bookings';
import { NewBooking } from './pages/Bookings/new';
import { JobCards } from './pages/JobCards';
import { NewJobCard } from './pages/JobCards/new';
import { Inventory } from './pages/Inventory';
import { Invoices } from './pages/Invoices';
import { Customers } from './pages/Customers';
import { NewCustomer } from './pages/Customers/new';
import { Reports } from './pages/Reports';
import { Tracking } from './pages/Tracking';
import { Settings } from './pages/Settings';
import { LoadingScreen } from './components/LoadingScreen';
import { NotificationProvider } from './components/NotificationProvider';

// Create React Query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

// Create theme
const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
    background: {
      default: '#f5f5f5',
    },
  },
  typography: {
    fontFamily: '"Cairo", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontFamily: '"Cairo", sans-serif',
    },
    h2: {
      fontFamily: '"Cairo", sans-serif',
    },
    h3: {
      fontFamily: '"Cairo", sans-serif',
    },
    h4: {
      fontFamily: '"Cairo", sans-serif',
    },
    h5: {
      fontFamily: '"Cairo", sans-serif',
    },
    h6: {
      fontFamily: '"Cairo", sans-serif',
    },
  },
  direction: 'rtl',
});

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

// Public Route Component (only accessible when not authenticated)
const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

function App() {
  useEffect(() => {
    // Set up menu event listeners
    if (window.electronAPI) {
      window.electronAPI.onMenuNewBooking(() => {
        // Navigate to new booking page
        window.location.hash = '/bookings/new';
      });

      window.electronAPI.onMenuNewJobCard(() => {
        // Navigate to new job card page
        window.location.hash = '/job-cards/new';
      });
    }

    // Cleanup
    return () => {
      if (window.electronAPI) {
        window.electronAPI.removeAllListeners('menu-new-booking');
        window.electronAPI.removeAllListeners('menu-new-job-card');
      }
    };
  }, []);

  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="ar">
            <NotificationProvider>
              <Router>
                <Box sx={{ display: 'flex', minHeight: '100vh' }}>
                  <Routes>
                    {/* Public Routes */}
                    <Route
                      path="/login"
                      element={
                        <PublicRoute>
                          <Login />
                        </PublicRoute>
                      }
                    />

                    {/* Public Tracking Route - accessible without login */}
                    <Route path="/tracking" element={<Tracking />} />

                    {/* Protected Routes */}
                    <Route
                      path="/*"
                      element={
                        <ProtectedRoute>
                          <Layout>
                            <Routes>
                              <Route path="/" element={<Navigate to="/dashboard" replace />} />
                              <Route path="/dashboard" element={<Dashboard />} />
                              
                              {/* Bookings */}
                              <Route path="/bookings" element={<Bookings />} />
                              <Route path="/bookings/new" element={<NewBooking />} />
                              <Route path="/bookings/:id" element={<Bookings />} />
                              
                              {/* Job Cards */}
                              <Route path="/job-cards" element={<JobCards />} />
                              <Route path="/job-cards/new" element={<NewJobCard />} />
                              <Route path="/job-cards/:id" element={<JobCards />} />
                              
                              {/* Inventory */}
                              <Route path="/inventory" element={<Inventory />} />
                              <Route path="/inventory/parts" element={<Inventory />} />
                              <Route path="/inventory/purchase-orders" element={<Inventory />} />
                              
                              {/* Invoices */}
                              <Route path="/invoices" element={<Invoices />} />
                              <Route path="/invoices/new" element={<Invoices />} />
                              <Route path="/invoices/:id" element={<Invoices />} />
                              
                              {/* Customers */}
                              <Route path="/customers" element={<Customers />} />
                              <Route path="/customers/new" element={<NewCustomer />} />
                              <Route path="/customers/:id" element={<Customers />} />
                              
                              {/* Reports */}
                              <Route path="/reports" element={<Reports />} />
                              <Route path="/reports/financial" element={<Reports />} />
                              <Route path="/reports/inventory" element={<Reports />} />
                              <Route path="/reports/performance" element={<Reports />} />
                              
                              {/* Settings */}
                              <Route path="/settings" element={<Settings />} />
                              <Route path="/settings/profile" element={<Settings />} />
                              <Route path="/settings/garage" element={<Settings />} />
                              <Route path="/settings/system" element={<Settings />} />
                              
                              {/* 404 */}
                              <Route path="*" element={<Navigate to="/dashboard" replace />} />
                            </Routes>
                          </Layout>
                        </ProtectedRoute>
                      }
                    />
                  </Routes>
                </Box>
              </Router>
            </NotificationProvider>
          </LocalizationProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </Provider>
  );
}

export default App;
