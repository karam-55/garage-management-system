import { useState, useEffect } from 'react';
import apiClient from '@/lib/api-client';

export function useVehicles() {
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchVehicles = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get('/vehicles');
      setVehicles(response.data);
    } catch (error) {
      console.error('Error fetching vehicles:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  const createVehicle = async (vehicleData: any) => {
    try {
      const response = await apiClient.post('/vehicles', vehicleData);
      setVehicles([...vehicles, response.data]);
      return response.data;
    } catch (error) {
      console.error('Error creating vehicle:', error);
      throw error;
    }
  };

  const updateVehicle = async (id: string, vehicleData: any) => {
    try {
      const response = await apiClient.put(`/vehicles/${id}`, vehicleData);
      setVehicles(vehicles.map((v) => (v.id === id ? response.data : v)));
      return response.data;
    } catch (error) {
      console.error('Error updating vehicle:', error);
      throw error;
    }
  };

  const deleteVehicle = async (id: string) => {
    try {
      await apiClient.delete(`/vehicles/${id}`);
      setVehicles(vehicles.filter((v) => v.id !== id));
    } catch (error) {
      console.error('Error deleting vehicle:', error);
      throw error;
    }
  };

  return {
    vehicles,
    loading,
    fetchVehicles,
    createVehicle,
    updateVehicle,
    deleteVehicle,
  };
}
