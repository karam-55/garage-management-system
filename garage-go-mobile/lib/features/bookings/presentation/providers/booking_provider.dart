import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../core/utils/logger.dart';
import '../../data/models/booking_model.dart';
import '../../data/repositories/booking_repository.dart';

// Booking State
class BookingState {
  final List<BookingWithDetails> bookings;
  final BookingWithDetails? selectedBooking;
  final List<DateTime> availableTimeSlots;
  final bool isLoading;
  final bool isLoadingMore;
  final bool isCreating;
  final bool isUpdating;
  final String? error;
  final int currentPage;
  final bool hasMore;
  final String? selectedStatus;

  const BookingState({
    this.bookings = const [],
    this.selectedBooking,
    this.availableTimeSlots = const [],
    this.isLoading = false,
    this.isLoadingMore = false,
    this.isCreating = false,
    this.isUpdating = false,
    this.error,
    this.currentPage = 1,
    this.hasMore = true,
    this.selectedStatus,
  });

  BookingState copyWith({
    List<BookingWithDetails>? bookings,
    BookingWithDetails? selectedBooking,
    List<DateTime>? availableTimeSlots,
    bool? isLoading,
    bool? isLoadingMore,
    bool? isCreating,
    bool? isUpdating,
    String? error,
    int? currentPage,
    bool? hasMore,
    String? selectedStatus,
  }) {
    return BookingState(
      bookings: bookings ?? this.bookings,
      selectedBooking: selectedBooking ?? this.selectedBooking,
      availableTimeSlots: availableTimeSlots ?? this.availableTimeSlots,
      isLoading: isLoading ?? this.isLoading,
      isLoadingMore: isLoadingMore ?? this.isLoadingMore,
      isCreating: isCreating ?? this.isCreating,
      isUpdating: isUpdating ?? this.isUpdating,
      error: error ?? this.error,
      currentPage: currentPage ?? this.currentPage,
      hasMore: hasMore ?? this.hasMore,
      selectedStatus: selectedStatus ?? this.selectedStatus,
    );
  }

  @override
  bool operator ==(Object other) {
    if (identical(this, other)) return true;
    return other is BookingState &&
        other.bookings == bookings &&
        other.selectedBooking == selectedBooking &&
        other.availableTimeSlots == availableTimeSlots &&
        other.isLoading == isLoading &&
        other.isLoadingMore == isLoadingMore &&
        other.isCreating == isCreating &&
        other.isUpdating == isUpdating &&
        other.error == error &&
        other.currentPage == currentPage &&
        other.hasMore == hasMore &&
        other.selectedStatus == selectedStatus;
  }

  @override
  int get hashCode {
    return bookings.hashCode ^
        selectedBooking.hashCode ^
        availableTimeSlots.hashCode ^
        isLoading.hashCode ^
        isLoadingMore.hashCode ^
        isCreating.hashCode ^
        isUpdating.hashCode ^
        error.hashCode ^
        currentPage.hashCode ^
        hasMore.hashCode ^
        selectedStatus.hashCode;
  }
}

// Booking Provider
final bookingProvider = StateNotifierProvider<BookingNotifier, BookingState>((ref) {
  return BookingNotifier(ref.read(bookingRepositoryProvider));
});

class BookingNotifier extends StateNotifier<BookingState> {
  final BookingRepository _bookingRepository;

  BookingNotifier(this._bookingRepository) : super(const BookingState());

  Future<void> loadBookings({
    String? status,
    bool refresh = false,
  }) async {
    if (refresh) {
      state = state.copyWith(
        bookings: [],
        currentPage: 1,
        hasMore: true,
        error: null,
        selectedStatus: status,
      );
    }

    if (state.isLoading || (!state.hasMore && !refresh)) return;

    state = state.copyWith(isLoading: true, error: null);

    try {
      final bookings = await _bookingRepository.getUserBookings(
        status: status ?? state.selectedStatus,
        page: state.currentPage,
        limit: 10,
      );

      final updatedBookings = refresh
          ? bookings
          : [...state.bookings, ...bookings];

      state = state.copyWith(
        bookings: updatedBookings,
        isLoading: false,
        currentPage: state.currentPage + 1,
        hasMore: bookings.length == 10,
      );

      Logger.info('Loaded ${bookings.length} bookings');
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        error: e.toString(),
      );
      Logger.error('Failed to load bookings', e);
    }
  }

  Future<void> loadBookingById(String bookingId) async {
    state = state.copyWith(isLoading: true, error: null);

    try {
      final booking = await _bookingRepository.getBookingById(bookingId);

      state = state.copyWith(
        selectedBooking: booking,
        isLoading: false,
      );

      Logger.info('Loaded booking details: ${booking.booking.id}');
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        error: e.toString(),
      );
      Logger.error('Failed to load booking details', e);
    }
  }

  Future<BookingWithDetails> createBooking(CreateBookingRequest request) async {
    state = state.copyWith(isCreating: true, error: null);

    try {
      final booking = await _bookingRepository.createBooking(request);

      // Add to the beginning of the list
      final updatedBookings = [booking, ...state.bookings];

      state = state.copyWith(
        bookings: updatedBookings,
        isCreating: false,
      );

      Logger.info('Created booking: ${booking.booking.id}');
      return booking;
    } catch (e) {
      state = state.copyWith(
        isCreating: false,
        error: e.toString(),
      );
      Logger.error('Failed to create booking', e);
      rethrow;
    }
  }

  Future<BookingWithDetails> updateBooking(
    String bookingId,
    UpdateBookingRequest request,
  ) async {
    state = state.copyWith(isUpdating: true, error: null);

    try {
      final updatedBooking = await _bookingRepository.updateBooking(
        bookingId,
        request,
      );

      // Update the booking in the list
      final updatedBookings = state.bookings.map((booking) {
        return booking.booking.id == bookingId ? updatedBooking : booking;
      }).toList();

      // Update selected booking if it's the same
      final selectedBooking = state.selectedBooking?.booking.id == bookingId
          ? updatedBooking
          : state.selectedBooking;

      state = state.copyWith(
        bookings: updatedBookings,
        selectedBooking: selectedBooking,
        isUpdating: false,
      );

      Logger.info('Updated booking: $bookingId');
      return updatedBooking;
    } catch (e) {
      state = state.copyWith(
        isUpdating: false,
        error: e.toString(),
      );
      Logger.error('Failed to update booking', e);
      rethrow;
    }
  }

  Future<void> cancelBooking(String bookingId) async {
    try {
      await _bookingRepository.cancelBooking(bookingId);

      // Remove from the list
      final updatedBookings = state.bookings
          .where((booking) => booking.booking.id != bookingId)
          .toList();

      // Clear selected booking if it's the same
      final selectedBooking = state.selectedBooking?.booking.id == bookingId
          ? null
          : state.selectedBooking;

      state = state.copyWith(
        bookings: updatedBookings,
        selectedBooking: selectedBooking,
      );

      Logger.info('Cancelled booking: $bookingId');
    } catch (e) {
      Logger.error('Failed to cancel booking', e);
      rethrow;
    }
  }

  Future<void> loadAvailableTimeSlots(
    String garageId,
    String serviceId,
    DateTime date,
  ) async {
    try {
      final timeSlots = await _bookingRepository.getAvailableTimeSlots(
        garageId,
        serviceId,
        date,
      );

      state = state.copyWith(availableTimeSlots: timeSlots);

      Logger.info('Loaded ${timeSlots.length} available time slots');
    } catch (e) {
      Logger.error('Failed to load available time slots', e);
    }
  }

  void filterByStatus(String? status) {
    state = state.copyWith(selectedStatus: status);
    loadBookings(refresh: true);
  }

  void clearError() {
    state = state.copyWith(error: null);
  }

  void clearSelectedBooking() {
    state = state.copyWith(selectedBooking: null);
  }

  void clearAvailableTimeSlots() {
    state = state.copyWith(availableTimeSlots: []);
  }

  Future<void> refresh() async {
    await loadBookings(refresh: true);
  }
}

// Specific providers for easier access
final bookingsProvider = Provider<List<BookingWithDetails>>((ref) {
  return ref.watch(bookingProvider).bookings;
});

final selectedBookingProvider = Provider<BookingWithDetails?>((ref) {
  return ref.watch(bookingProvider).selectedBooking;
});

final availableTimeSlotsProvider = Provider<List<DateTime>>((ref) {
  return ref.watch(bookingProvider).availableTimeSlots;
});

final bookingLoadingProvider = Provider<bool>((ref) {
  return ref.watch(bookingProvider).isLoading;
});

final bookingCreatingProvider = Provider<bool>((ref) {
  return ref.watch(bookingProvider).isCreating;
});

final bookingUpdatingProvider = Provider<bool>((ref) {
  return ref.watch(bookingProvider).isUpdating;
});

final bookingErrorProvider = Provider<String?>((ref) {
  return ref.watch(bookingProvider).error;
});

// Status filter provider
final bookingStatusFilterProvider = Provider<String?>((ref) {
  return ref.watch(bookingProvider).selectedStatus;
});

// Booking status options
const List<String> bookingStatuses = [
  'ALL',
  'PENDING',
  'CONFIRMED',
  'IN_PROGRESS',
  'COMPLETED',
  'CANCELLED',
];
