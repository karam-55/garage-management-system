import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../core/constants/app_constants.dart';
import '../../../../core/services/storage_service.dart';
import '../../../../core/utils/logger.dart';
import '../models/vehicle_model.dart';

class VehicleRepository {
  final Dio _dio;

  VehicleRepository(this._dio) {
    _setupInterceptors();
  }

  void _setupInterceptors() {
    _dio.interceptors.add(
      InterceptorsWrapper(
        onRequest: (options, handler) {
          Logger.api('Vehicle Request: ${options.method} ${options.path}');
          handler.next(options);
        },
        onResponse: (response, handler) {
          Logger.api('Vehicle Response: ${response.statusCode}', data: response.data);
          handler.next(response);
        },
        onError: (error, handler) {
          Logger.error('Vehicle API Error: ${error.message}', error);
          handler.next(error);
        },
      ),
    );
  }

  Future<List<Vehicle>> getUserVehicles({
    bool? isActive,
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

      if (isActive != null) {
        queryParams['isActive'] = isActive;
      }

      final response = await _dio.get(
        '${AppConstants.baseUrl}${ApiEndpoints.userVehicles}',
        queryParameters: queryParams,
        options: Options(
          headers: {
            'Authorization': 'Bearer $token',
          },
        ),
      );

      if (response.statusCode == 200 && response.data['success'] == true) {
        final List<dynamic> data = response.data['data'];
        return data.map((json) => Vehicle.fromJson(json as Map<String, dynamic>)).toList();
      } else {
        throw Exception(response.data['message'] ?? 'Failed to get vehicles');
      }
    } on DioException catch (e) {
      Logger.error('Get user vehicles Dio error', e);
      throw Exception(_handleDioError(e));
    } catch (e) {
      Logger.error('Get user vehicles error', e);
      throw Exception('Failed to load vehicles. Please try again.');
    }
  }

  Future<Vehicle> getVehicleById(String vehicleId) async {
    try {
      final token = await StorageService.getToken();
      if (token == null) {
        throw Exception('No authentication token found');
      }

      final response = await _dio.get(
        '${AppConstants.baseUrl}${ApiEndpoints.vehicles}/$vehicleId',
        options: Options(
          headers: {
            'Authorization': 'Bearer $token',
          },
        ),
      );

      if (response.statusCode == 200 && response.data['success'] == true) {
        return Vehicle.fromJson(response.data['data']);
      } else {
        throw Exception(response.data['message'] ?? 'Failed to get vehicle');
      }
    } on DioException catch (e) {
      Logger.error('Get vehicle by ID Dio error', e);
      throw Exception(_handleDioError(e));
    } catch (e) {
      Logger.error('Get vehicle by ID error', e);
      throw Exception('Failed to load vehicle details. Please try again.');
    }
  }

  Future<Vehicle> createVehicle(CreateVehicleRequest request) async {
    try {
      final token = await StorageService.getToken();
      if (token == null) {
        throw Exception('No authentication token found');
      }

      final response = await _dio.post(
        '${AppConstants.baseUrl}${ApiEndpoints.vehicles}',
        data: request.toJson(),
        options: Options(
          headers: {
            'Authorization': 'Bearer $token',
          },
        ),
      );

      if (response.statusCode == 201 && response.data['success'] == true) {
        return Vehicle.fromJson(response.data['data']);
      } else {
        throw Exception(response.data['message'] ?? 'Failed to create vehicle');
      }
    } on DioException catch (e) {
      Logger.error('Create vehicle Dio error', e);
      throw Exception(_handleDioError(e));
    } catch (e) {
      Logger.error('Create vehicle error', e);
      throw Exception('Failed to create vehicle. Please try again.');
    }
  }

  Future<Vehicle> updateVehicle(
    String vehicleId,
    UpdateVehicleRequest request,
  ) async {
    try {
      final token = await StorageService.getToken();
      if (token == null) {
        throw Exception('No authentication token found');
      }

      final response = await _dio.put(
        '${AppConstants.baseUrl}${ApiEndpoints.vehicles}/$vehicleId',
        data: request.toJson(),
        options: Options(
          headers: {
            'Authorization': 'Bearer $token',
          },
        ),
      );

      if (response.statusCode == 200 && response.data['success'] == true) {
        return Vehicle.fromJson(response.data['data']);
      } else {
        throw Exception(response.data['message'] ?? 'Failed to update vehicle');
      }
    } on DioException catch (e) {
      Logger.error('Update vehicle Dio error', e);
      throw Exception(_handleDioError(e));
    } catch (e) {
      Logger.error('Update vehicle error', e);
      throw Exception('Failed to update vehicle. Please try again.');
    }
  }

  Future<void> deleteVehicle(String vehicleId) async {
    try {
      final token = await StorageService.getToken();
      if (token == null) {
        throw Exception('No authentication token found');
      }

      final response = await _dio.delete(
        '${AppConstants.baseUrl}${ApiEndpoints.vehicles}/$vehicleId',
        options: Options(
          headers: {
            'Authorization': 'Bearer $token',
          },
        ),
      );

      if (response.statusCode == 200 && response.data['success'] == true) {
        Logger.info('Vehicle deleted successfully: $vehicleId');
      } else {
        throw Exception(response.data['message'] ?? 'Failed to delete vehicle');
      }
    } on DioException catch (e) {
      Logger.error('Delete vehicle Dio error', e);
      throw Exception(_handleDioError(e));
    } catch (e) {
      Logger.error('Delete vehicle error', e);
      throw Exception('Failed to delete vehicle. Please try again.');
    }
  }

  Future<VehicleStats> getVehicleStats() async {
    try {
      final vehicles = await getUserVehicles(limit: 100);
      final active = vehicles.where((v) => v.isActive).length;
      return VehicleStats(
        totalVehicles: vehicles.length,
        activeVehicles: active,
        inactiveVehicles: vehicles.length - active,
        makeCounts: [],
        yearCounts: [],
      );
    } catch (e) {
      Logger.error('Get vehicle stats error', e);
      throw Exception('Failed to load vehicle statistics. Please try again.');
    }
  }

  Future<List<VehicleServiceHistory>> getVehicleServiceHistory(
    String vehicleId, {
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

      final response = await _dio.get(
        '${AppConstants.baseUrl}${ApiEndpoints.vehicles}/$vehicleId/maintenance',
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
            .map((json) => VehicleServiceHistory.fromJson(json as Map<String, dynamic>))
            .toList();
      } else {
        throw Exception(response.data['message'] ?? 'Failed to get service history');
      }
    } on DioException catch (e) {
      Logger.error('Get vehicle service history Dio error', e);
      throw Exception(_handleDioError(e));
    } catch (e) {
      Logger.error('Get vehicle service history error', e);
      throw Exception('Failed to load service history. Please try again.');
    }
  }

  Future<List<Vehicle>> searchVehicles(String query) async {
    try {
      final token = await StorageService.getToken();
      if (token == null) {
        throw Exception('No authentication token found');
      }

      final response = await _dio.get(
        '${AppConstants.baseUrl}${ApiEndpoints.vehicles}',
        queryParameters: {
          'search': query,
        },
        options: Options(
          headers: {
            'Authorization': 'Bearer $token',
          },
        ),
      );

      if (response.statusCode == 200 && response.data['success'] == true) {
        final List<dynamic> data = response.data['data'];
        return data.map((json) => Vehicle.fromJson(json as Map<String, dynamic>)).toList();
      } else {
        throw Exception(response.data['message'] ?? 'Failed to search vehicles');
      }
    } on DioException catch (e) {
      Logger.error('Search vehicles Dio error', e);
      throw Exception(_handleDioError(e));
    } catch (e) {
      Logger.error('Search vehicles error', e);
      throw Exception('Failed to search vehicles. Please try again.');
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

// Provider for VehicleRepository
final vehicleRepositoryProvider = Provider<VehicleRepository>((ref) {
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

  return VehicleRepository(dio);
});
