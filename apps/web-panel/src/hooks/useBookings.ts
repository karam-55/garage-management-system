import { useState, useEffect } from 'react';
import apiClient from '@/lib/api-client';

export function useBookings() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get('/bookings');
      setBookings(response.data);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const createBooking = async (bookingData: any) => {
    try {
      const response = await apiClient.post('/bookings', bookingData);
      setBookings([...bookings, response.data]);
      return response.data;
    } catch (error) {
      console.error('Error creating booking:', error);
      throw error;
    }
  };

  const updateBooking = async (id: string, bookingData: any) => {
    try {
      const response = await apiClient.put(`/bookings/${id}`, bookingData);
      setBookings(bookings.map((b) => (b.id === id ? response.data : b)));
      return response.data;
    } catch (error) {
      console.error('Error updating booking:', error);
      throw error;
    }
  };

  const deleteBooking = async (id: string) => {
    try {
      await apiClient.delete(`/bookings/${id}`);
      setBookings(bookings.filter((b) => b.id !== id));
    } catch (error) {
      console.error('Error deleting booking:', error);
      throw error;
    }
  };

  return {
    bookings,
    loading,
    fetchBookings,
    createBooking,
    updateBooking,
    deleteBooking,
  };
}
