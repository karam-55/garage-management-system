import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../core/constants/app_constants.dart';
import '../../../../core/services/storage_service.dart';
import '../../../../core/utils/logger.dart';
import '../models/booking_model.dart';

class BookingRepository {
  final Dio _dio;

  BookingRepository(this._dio) {
    _setupInterceptors();
  }

  void _setupInterceptors() {
    _dio.interceptors.add(
      InterceptorsWrapper(
        onRequest: (options, handler) {
          Logger.api('Booking Request: ${options.method} ${options.path}');
          handler.next(options);
        },
        onResponse: (response, handler) {
          Logger.api('Booking Response: ${response.statusCode}', data: response.data);
          handler.next(response);
        },
        onError: (error, handler) {
          Logger.error('Booking API Error: ${error.message}', error);
          handler.next(error);
        },
      ),
    );
  }

  Future<List<BookingWithDetails>> getUserBookings({
    String? status,
    int page = 1,
    int limit = 10,
  }) async {
    try {
      final token = await StorageService.getToken();
      if (token == null) {
        throw Exception('No authentication token found');
      }

      final queryParams = <String, dynamic>{
        'page': page,
        'limit': limit,
      };

      if (status != null && status.isNotEmpty) {
        queryParams['status'] = status;
      }

      final response = await _dio.get(
        '${AppConstants.baseUrl}${ApiEndpoints.userBookings}',
        queryParameters: queryParams,
        options: Options(
          headers: {
            'Authorization': 'Bearer $token',
          },
        ),
      );

      if (response.statusCode == 200 && response.data['success'] == true) {
        final List<dynamic> data = response.data['data'];
        return data
            .map((json) => BookingWithDetails.fromJson(json as Map<String, dynamic>))
            .toList();
      } else {
        throw Exception(response.data['message'] ?? 'Failed to get bookings');
      }
    } on DioException catch (e) {
      Logger.error('Get user bookings Dio error', e);
      throw Exception(_handleDioError(e));
    } catch (e) {
      Logger.error('Get user bookings error', e);
      throw Exception('Failed to load bookings. Please try again.');
    }
  }

  Future<BookingWithDetails> getBookingById(String bookingId) async {
    try {
      final token = await StorageService.getToken();
      if (token == null) {
        throw Exception('No authentication token found');
      }

      final response = await _dio.get(
        '${AppConstants.baseUrl}${ApiEndpoints.bookings}/$bookingId',
        options: Options(
          headers: {
            'Authorization': 'Bearer $token',
          },
        ),
      );

      if (response.statusCode == 200 && response.data['success'] == true) {
        return BookingWithDetails.fromJson(response.data['data']);
      } else {
        throw Exception(response.data['message'] ?? 'Failed to get booking');
      }
    } on DioException catch (e) {
      Logger.error('Get booking by ID Dio error', e);
      throw Exception(_handleDioError(e));
    } catch (e) {
      Logger.error('Get booking by ID error', e);
      throw Exception('Failed to load booking details. Please try again.');
    }
  }

  Future<BookingWithDetails> createBooking(CreateBookingRequest request) async {
    try {
      final token = await StorageService.getToken();
      if (token == null) {
        throw Exception('No authentication token found');
      }

      final response = await _dio.post(
        '${AppConstants.baseUrl}${ApiEndpoints.bookings}',
        data: request.toJson(),
        options: Options(
          headers: {
            'Authorization': 'Bearer $token',
          },
        ),
      );

      if (response.statusCode == 201 && response.data['success'] == true) {
        return BookingWithDetails.fromJson(response.data['data']);
      } else {
        throw Exception(response.data['message'] ?? 'Failed to create booking');
      }
    } on DioException catch (e) {
      Logger.error('Create booking Dio error', e);
      throw Exception(_handleDioError(e));
    } catch (e) {
      Logger.error('Create booking error', e);
      throw Exception('Failed to create booking. Please try again.');
    }
  }

  Future<BookingWithDetails> updateBooking(
    String bookingId,
    UpdateBookingRequest request,
  ) async {
    try {
      final token = await StorageService.getToken();
      if (token == null) {
        throw Exception('No authentication token found');
      }

      final response = await _dio.put(
        '${AppConstants.baseUrl}${ApiEndpoints.bookings}/$bookingId',
        data: request.toJson(),
        options: Options(
          headers: {
            'Authorization': 'Bearer $token',
          },
        ),
      );

      if (response.statusCode == 200 && response.data['success'] == true) {
        return BookingWithDetails.fromJson(response.data['data']);
      } else {
        throw Exception(response.data['message'] ?? 'Failed to update booking');
      }
    } on DioException catch (e) {
      Logger.error('Update booking Dio error', e);
      throw Exception(_handleDioError(e));
    } catch (e) {
      Logger.error('Update booking error', e);
      throw Exception('Failed to update booking. Please try again.');
    }
  }

  Future<void> cancelBooking(String bookingId) async {
    try {
      final token = await StorageService.getToken();
      if (token == null) {
        throw Exception('No authentication token found');
      }

      final response = await _dio.put(
        '${AppConstants.baseUrl}${ApiEndpoints.bookings}/$bookingId/cancel',
        options: Options(
          headers: {
            'Authorization': 'Bearer $token',
          },
        ),
      );

      if (response.statusCode == 200 && response.data['success'] == true) {
        Logger.info('Booking cancelled successfully: $bookingId');
      } else {
        throw Exception(response.data['message'] ?? 'Failed to cancel booking');
      }
    } on DioException catch (e) {
      Logger.error('Cancel booking Dio error', e);
      throw Exception(_handleDioError(e));
    } catch (e) {
      Logger.error('Cancel booking error', e);
      throw Exception('Failed to cancel booking. Please try again.');
    }
  }

  Future<List<BookingWithDetails>> getGarageBookings(
    String garageId, {
    String? status,
    int page = 1,
    int limit = 10,
  }) async {
    try {
      final token = await StorageService.getToken();
      if (token == null) {
        throw Exception('No authentication token found');
      }

      final queryParams = <String, dynamic>{
        'page': page,
        'limit': limit,
      };

      if (status != null && status.isNotEmpty) {
        queryParams['status'] = status;
      }

      final response = await _dio.get(
        '${AppConstants.baseUrl}${ApiEndpoints.garages}/$garageId${ApiEndpoints.garageBookings}',
        queryParameters: queryParams,
        options: Options(
          headers: {
            'Authorization': 'Bearer $token',
          },
        ),
      );

      if (response.statusCode == 200 && response.data['success'] == true) {
        final List<dynamic> data = response.data['data'];
        return data
            .map((json) => BookingWithDetails.fromJson(json as Map<String, dynamic>))
            .toList();
      } else {
        throw Exception(response.data['message'] ?? 'Failed to get garage bookings');
      }
    } on DioException catch (e) {
      Logger.error('Get garage bookings Dio error', e);
      throw Exception(_handleDioError(e));
    } catch (e) {
      Logger.error('Get garage bookings error', e);
      throw Exception('Failed to load garage bookings. Please try again.');
    }
  }

  Future<List<DateTime>> getAvailableTimeSlots(
    String garageId,
    String serviceId,
    DateTime date,
  ) async {
    try {
      final token = await StorageService.getToken();
      if (token == null) {
        throw Exception('No authentication token found');
      }

      final response = await _dio.get(
        '${AppConstants.baseUrl}${ApiEndpoints.bookings}/available-slots',
        queryParameters: {
          'garageId': garageId,
          'serviceTypeId': serviceId,
          'date': date.toIso8601String().split('T')[0],
        },
        options: Options(
          headers: {
            'Authorization': 'Bearer $token',
          },
        ),
      );

      if (response.statusCode == 200 && response.data['success'] == true) {
        final List<dynamic> data = response.data['data'];
        final dateStr = date.toIso8601String().split('T')[0];
        return data
            .where((slot) => slot is Map && slot['available'] == true)
            .map((slot) {
              final time = (slot as Map)['time'] as String;
              return DateTime.parse('${dateStr}T$time:00');
            })
            .toList();
      } else {
        throw Exception(response.data['message'] ?? 'Failed to get available time slots');
      }
    } on DioException catch (e) {
      Logger.error('Get available time slots Dio error', e);
      throw Exception(_handleDioError(e));
    } catch (e) {
      Logger.error('Get available time slots error', e);
      throw Exception('Failed to load available time slots. Please try again.');
    }
  }

  String _handleDioError(DioException error) {
    switch (error.type) {
      case DioExceptionType.connectionTimeout:
        return 'Connection timeout. Please check your internet connection.';
      case DioExceptionType.sendTimeout:
        return 'Request timeout. Please try again.';
      case DioExceptionType.receiveTimeout:
        return 'Server timeout. Please try again later.';
      case DioExceptionType.badResponse:
        if (error.response?.data is Map<String, dynamic>) {
          final data = error.response!.data as Map<String, dynamic>;
          final err = data['error'];
          if (err is Map) return err['message']?.toString() ?? 'Server error occurred.';
          return data['message']?.toString() ?? err?.toString() ?? 'Server error occurred.';
        }
        return 'Server error: ${error.response?.statusCode}';
      case DioExceptionType.cancel:
        return 'Request was cancelled.';
      case DioExceptionType.connectionError:
        return 'No internet connection. Please check your network.';
      case DioExceptionType.badCertificate:
        return 'SSL certificate error. Please contact support.';
      case DioExceptionType.unknown:
      default:
        return 'An unexpected error occurred. Please try again.';
    }
  }
}

// Provider for BookingRepository
final bookingRepositoryProvider = Provider<BookingRepository>((ref) {
  final dio = Dio();
  
  // Configure Dio
  dio.options = BaseOptions(
    connectTimeout: AppConstants.connectTimeout,
    receiveTimeout: AppConstants.receiveTimeout,
    sendTimeout: AppConstants.sendTimeout,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
  );

  return BookingRepository(dio);
});
