import '../models/booking.dart';
import 'api_service.dart';

class BookingService {
  final ApiService _api = ApiService();

  Future<List<Booking>> getBookings() async {
    final response = await _api.get('/bookings');
    return (response.data as List).map((json) => Booking.fromJson(json)).toList();
  }

  Future<List<Booking>> getBookingsByTechnician(String technicianId) async {
    final response = await _api.get('/bookings/technician/$technicianId');
    return (response.data as List).map((json) => Booking.fromJson(json)).toList();
  }

  Future<Booking> createBooking(Booking booking) async {
    final response = await _api.post('/bookings', booking.toJson());
    return Booking.fromJson(response.data);
  }

  Future<Booking> updateBooking(String id, Booking booking) async {
    final response = await _api.put('/bookings/$id', booking.toJson());
    return Booking.fromJson(response.data);
  }

  Future<void> deleteBooking(String id) async {
    await _api.delete('/bookings/$id');
  }
}
