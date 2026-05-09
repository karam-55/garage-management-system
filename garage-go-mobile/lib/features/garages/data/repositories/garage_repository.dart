import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../core/constants/app_constants.dart';
import '../../../../core/services/storage_service.dart';
import '../../../../core/utils/logger.dart';
import '../models/garage_model.dart';

class GarageRepository {
  final Dio _dio;

  GarageRepository(this._dio) {
    _setupInterceptors();
  }

  void _setupInterceptors() {
    _dio.interceptors.add(
      InterceptorsWrapper(
        onRequest: (options, handler) {
          Logger.api('Garage Request: ${options.method} ${options.path}');
          handler.next(options);
        },
        onResponse: (response, handler) {
          Logger.api('Garage Response: ${response.statusCode}', data: response.data);
          handler.next(response);
        },
        onError: (error, handler) {
          Logger.error('Garage API Error: ${error.message}', error);
          handler.next(error);
        },
      ),
    );
  }

  Future<List<Garage>> getGarages({
    String? search,
    int page = 1,
    int limit = 10,
    bool? isActive,
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

      if (search != null && search.isNotEmpty) {
        queryParams['search'] = search;
      }

      if (isActive != null) {
        queryParams['isActive'] = isActive;
      }

      final response = await _dio.get(
        '${AppConstants.baseUrl}${ApiEndpoints.garages}',
        queryParameters: queryParams,
        options: Options(
          headers: {
            'Authorization': 'Bearer $token',
          },
        ),
      );

      if (response.statusCode == 200 && response.data['success'] == true) {
        final List<dynamic> data = response.data['data'];
        return data.map((json) => Garage.fromJson(json as Map<String, dynamic>)).toList();
      } else {
        throw Exception(response.data['message'] ?? 'Failed to get garages');
      }
    } on DioException catch (e) {
      Logger.error('Get garages Dio error', e);
      throw Exception(_handleDioError(e));
    } catch (e) {
      Logger.error('Get garages error', e);
      throw Exception('Failed to load garages. Please try again.');
    }
  }

  Future<GarageWithServices> getGarageById(String garageId) async {
    try {
      final token = await StorageService.getToken();
      if (token == null) {
        throw Exception('No authentication token found');
      }

      final response = await _dio.get(
        '${AppConstants.baseUrl}${ApiEndpoints.garages}/$garageId',
        options: Options(
          headers: {
            'Authorization': 'Bearer $token',
          },
        ),
      );

      if (response.statusCode == 200 && response.data['success'] == true) {
        return GarageWithServices.fromJson(response.data['data']);
      } else {
        throw Exception(response.data['message'] ?? 'Failed to get garage');
      }
    } on DioException catch (e) {
      Logger.error('Get garage by ID Dio error', e);
      throw Exception(_handleDioError(e));
    } catch (e) {
      Logger.error('Get garage by ID error', e);
      throw Exception('Failed to load garage details. Please try again.');
    }
  }

  Future<List<Service>> getGarageServices(String garageId) async {
    try {
      final token = await StorageService.getToken();
      if (token == null) {
        throw Exception('No authentication token found');
      }

      final response = await _dio.get(
        '${AppConstants.baseUrl}${ApiEndpoints.garages}/$garageId${ApiEndpoints.garageServices}',
        options: Options(
          headers: {
            'Authorization': 'Bearer $token',
          },
        ),
      );

      if (response.statusCode == 200 && response.data['success'] == true) {
        final List<dynamic> data = response.data['data'];
        return data.map((json) => Service.fromJson(json as Map<String, dynamic>)).toList();
      } else {
        throw Exception(response.data['message'] ?? 'Failed to get garage services');
      }
    } on DioException catch (e) {
      Logger.error('Get garage services Dio error', e);
      throw Exception(_handleDioError(e));
    } catch (e) {
      Logger.error('Get garage services error', e);
      throw Exception('Failed to load garage services. Please try again.');
    }
  }

  Future<List<Garage>> getNearbyGarages({
    double? latitude,
    double? longitude,
    double radius = 10.0, // in kilometers
    int limit = 10,
  }) async {
    try {
      final token = await StorageService.getToken();
      if (token == null) {
        throw Exception('No authentication token found');
      }

      final queryParams = <String, dynamic>{
        'limit': limit,
      };

      if (latitude != null) {
        queryParams['latitude'] = latitude;
      }

      if (longitude != null) {
        queryParams['longitude'] = longitude;
      }

      queryParams['radius'] = radius;

      final response = await _dio.get(
        '${AppConstants.baseUrl}${ApiEndpoints.garages}',
        queryParameters: queryParams,
        options: Options(
          headers: {
            'Authorization': 'Bearer $token',
          },
        ),
      );

      if (response.statusCode == 200 && response.data['success'] == true) {
        final List<dynamic> data = response.data['data'];
        return data.map((json) => Garage.fromJson(json as Map<String, dynamic>)).toList();
      } else {
        throw Exception(response.data['message'] ?? 'Failed to get nearby garages');
      }
    } on DioException catch (e) {
      Logger.error('Get nearby garages Dio error', e);
      throw Exception(_handleDioError(e));
    } catch (e) {
      Logger.error('Get nearby garages error', e);
      throw Exception('Failed to load nearby garages. Please try again.');
    }
  }

  Future<List<Garage>> getTopRatedGarages({int limit = 10}) async {
    try {
      final token = await StorageService.getToken();
      if (token == null) {
        throw Exception('No authentication token found');
      }

      final queryParams = {'limit': limit};

      final response = await _dio.get(
        '${AppConstants.baseUrl}${ApiEndpoints.garages}',
        queryParameters: queryParams,
        options: Options(
          headers: {
            'Authorization': 'Bearer $token',
          },
        ),
      );

      if (response.statusCode == 200 && response.data['success'] == true) {
        final List<dynamic> data = response.data['data'];
        return data.map((json) => Garage.fromJson(json as Map<String, dynamic>)).toList();
      } else {
        throw Exception(response.data['message'] ?? 'Failed to get top rated garages');
      }
    } on DioException catch (e) {
      Logger.error('Get top rated garages Dio error', e);
      throw Exception(_handleDioError(e));
    } catch (e) {
      Logger.error('Get top rated garages error', e);
      throw Exception('Failed to load top rated garages. Please try again.');
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

// Provider for GarageRepository
final garageRepositoryProvider = Provider<GarageRepository>((ref) {
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

  return GarageRepository(dio);
});
