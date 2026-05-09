import React, { useState, useEffect } from 'react';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Bookings from './pages/Bookings';
import Customers from './pages/Customers';
import Vehicles from './pages/Vehicles';
import Mechanics from './pages/Mechanics';
import Inventory from './pages/Inventory';
import Invoices from './pages/Invoices';
import Payments from './pages/Payments';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import Notifications from './pages/Notifications';

type PageType = 'login' | 'register' | 'dashboard' | 'bookings' | 'customers' | 'vehicles' | 'mechanics' | 'inventory' | 'invoices' | 'payments' | 'reports' | 'settings' | 'notifications';

function App() {
  const [currentPage, setCurrentPage] = useState<PageType>('login');

  // Handle URL routing
  useEffect(() => {
    const handleUrlChange = () => {
      const hash = window.location.hash.replace('#', '') || '/login';
      const pageMap: Record<string, PageType> = {
        '/login': 'login',
        '/register': 'register',
        '/dashboard': 'dashboard',
        '/bookings': 'bookings',
        '/customers': 'customers',
        '/vehicles': 'vehicles',
        '/mechanics': 'mechanics',
        '/inventory': 'inventory',
        '/invoices': 'invoices',
        '/payments': 'payments',
        '/reports': 'reports',
        '/settings': 'settings',
        '/notifications': 'notifications',
      };
      setCurrentPage(pageMap[hash] || 'login');
    };

    window.addEventListener('hashchange', handleUrlChange);
    handleUrlChange(); // Initial check

    return () => window.removeEventListener('hashchange', handleUrlChange);
  }, []);

  // Simple routing based on page state
  const renderPage = () => {
    switch (currentPage) {
      case 'login':
        return <Login />;
      case 'register':
        return <Register />;
      case 'dashboard':
        return <Dashboard />;
      case 'bookings':
        return <Bookings />;
      case 'customers':
        return <Customers />;
      case 'vehicles':
        return <Vehicles />;
      case 'mechanics':
        return <Mechanics />;
      case 'inventory':
        return <Inventory />;
      case 'invoices':
        return <Invoices />;
      case 'payments':
        return <Payments />;
      case 'reports':
        return <Reports />;
      case 'settings':
        return <Settings />;
      case 'notifications':
        return <Notifications />;
      default:
        return <Dashboard />;
    }
  };

  return renderPage();
}

export default App;
