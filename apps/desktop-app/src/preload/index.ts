import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
  // Window controls
  getVersion: () => ipcRenderer.invoke('get-version'),
  minimizeWindow: () => ipcRenderer.invoke('minimize-window'),
  maximizeWindow: () => ipcRenderer.invoke('maximize-window'),
  closeWindow: () => ipcRenderer.invoke('close-window'),
  
  // API calls to backend
  getBookings: () => ipcRenderer.invoke('api-get-bookings'),
  getCustomers: () => ipcRenderer.invoke('api-get-customers'),
  getVehicles: () => ipcRenderer.invoke('api-get-vehicles'),
  getMechanics: () => ipcRenderer.invoke('api-get-mechanics'),
  getInventory: () => ipcRenderer.invoke('api-get-inventory'),
  getInvoices: () => ipcRenderer.invoke('api-get-invoices'),
  getPayments: () => ipcRenderer.invoke('api-get-payments'),
  getReports: (params: any) => ipcRenderer.invoke('api-get-reports', params),
  getSettings: () => ipcRenderer.invoke('api-get-settings'),
  getNotifications: () => ipcRenderer.invoke('api-get-notifications'),
  
  // CRUD operations
  createBooking: (data: any) => ipcRenderer.invoke('api-create-booking', data),
  updateBooking: (id: string, data: any) => ipcRenderer.invoke('api-update-booking', id, data),
  deleteBooking: (id: string) => ipcRenderer.invoke('api-delete-booking', id),
  
  createCustomer: (data: any) => ipcRenderer.invoke('api-create-customer', data),
  updateCustomer: (id: string, data: any) => ipcRenderer.invoke('api-update-customer', id, data),
  deleteCustomer: (id: string) => ipcRenderer.invoke('api-delete-customer', id),
  
  createVehicle: (data: any) => ipcRenderer.invoke('api-create-vehicle', data),
  updateVehicle: (id: string, data: any) => ipcRenderer.invoke('api-update-vehicle', id, data),
  deleteVehicle: (id: string) => ipcRenderer.invoke('api-delete-vehicle', id),
  
  updateInventory: (id: string, data: any) => ipcRenderer.invoke('api-update-inventory', id, data),
  
  updateSettings: (data: any) => ipcRenderer.invoke('api-update-settings', data),
  
  // Authentication
  login: (credentials: any) => ipcRenderer.invoke('api-login', credentials),
  logout: () => ipcRenderer.invoke('api-logout'),
});

