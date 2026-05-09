import { useState, useEffect } from 'react';
import apiClient from '@/lib/api-client';

export function useInvoices() {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchInvoices = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get('/invoices');
      setInvoices(response.data);
    } catch (error) {
      console.error('Error fetching invoices:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  const createInvoice = async (invoiceData: any) => {
    try {
      const response = await apiClient.post('/invoices', invoiceData);
      setInvoices([...invoices, response.data]);
      return response.data;
    } catch (error) {
      console.error('Error creating invoice:', error);
      throw error;
    }
  };

  const createFromBooking = async (bookingId: string) => {
    try {
      const response = await apiClient.post('/invoices/from-booking', { bookingId });
      setInvoices([...invoices, response.data]);
      return response.data;
    } catch (error) {
      console.error('Error creating invoice from booking:', error);
      throw error;
    }
  };

  const updateInvoice = async (id: string, invoiceData: any) => {
    try {
      const response = await apiClient.put(`/invoices/${id}`, invoiceData);
      setInvoices(invoices.map((i) => (i.id === id ? response.data : i)));
      return response.data;
    } catch (error) {
      console.error('Error updating invoice:', error);
      throw error;
    }
  };

  const deleteInvoice = async (id: string) => {
    try {
      await apiClient.delete(`/invoices/${id}`);
      setInvoices(invoices.filter((i) => i.id !== id));
    } catch (error) {
      console.error('Error deleting invoice:', error);
      throw error;
    }
  };

  return {
    invoices,
    loading,
    fetchInvoices,
    createInvoice,
    createFromBooking,
    updateInvoice,
    deleteInvoice,
  };
}
