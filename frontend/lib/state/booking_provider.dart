import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../models/booking.dart';
import '../services/booking_service.dart';

final bookingServiceProvider = Provider((ref) => BookingService());

final bookingsProvider = FutureProvider<List<Booking>>((ref) async {
  return ref.read(bookingServiceProvider).getBookings();
});
