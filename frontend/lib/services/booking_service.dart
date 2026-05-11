import 'package:dio/dio.dart';
import '../models/booking.dart';
import '../utils/api_config.dart';

class BookingService {
  final Dio _dio = Dio(BaseOptions(baseUrl: ApiConfig.baseUrl));

  Future<List<Booking>> getBookings() async {
    final response = await _dio.get('/bookings');
    return (response.data as List).map((json) => Booking.fromJson(json)).toList();
  }

  Future<List<Booking>> getBookingsByTechnician(String technicianId) async {
    final response = await _dio.get('/bookings/technician/$technicianId');
    return (response.data as List).map((json) => Booking.fromJson(json)).toList();
  }

  Future<Booking> createBooking(Booking booking) async {
    final response = await _dio.post('/bookings', data: booking.toJson());
    return Booking.fromJson(response.data);
  }

  Future<Booking> updateBooking(String id, Booking booking) async {
    final response = await _dio.put('/bookings/$id', data: booking.toJson());
    return Booking.fromJson(response.data);
  }

  Future<void> deleteBooking(String id) async {
    await _dio.delete('/bookings/$id');
  }
}
