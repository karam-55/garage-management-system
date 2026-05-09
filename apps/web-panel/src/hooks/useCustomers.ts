import { useState, useEffect } from 'react';
import apiClient from '@/lib/api-client';

export function useCustomers() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get('/customers');
      setCustomers(response.data);
    } catch (error) {
      console.error('Error fetching customers:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const createCustomer = async (customerData: any) => {
    try {
      const response = await apiClient.post('/customers', customerData);
      setCustomers([...customers, response.data]);
      return response.data;
    } catch (error) {
      console.error('Error creating customer:', error);
      throw error;
    }
  };

  const updateCustomer = async (id: string, customerData: any) => {
    try {
      const response = await apiClient.put(`/customers/${id}`, customerData);
      setCustomers(customers.map((c) => (c.id === id ? response.data : c)));
      return response.data;
    } catch (error) {
      console.error('Error updating customer:', error);
      throw error;
    }
  };

  const deleteCustomer = async (id: string) => {
    try {
      await apiClient.delete(`/customers/${id}`);
      setCustomers(customers.filter((c) => c.id !== id));
    } catch (error) {
      console.error('Error deleting customer:', error);
      throw error;
    }
  };

  return {
    customers,
    loading,
    fetchCustomers,
    createCustomer,
    updateCustomer,
    deleteCustomer,
  };
}
