import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../core/constants/app_constants.dart';
import '../../../../core/services/storage_service.dart';
import '../../../../core/utils/logger.dart';
import '../models/user_model.dart';

class AuthRepository {
  final Dio _dio;

  AuthRepository(this._dio) {
    _setupInterceptors();
  }

  void _setupInterceptors() {
    _dio.interceptors.add(
      InterceptorsWrapper(
        onRequest: (options, handler) {
          Logger.api('Request: ${options.method} ${options.path}');
          handler.next(options);
        },
        onResponse: (response, handler) {
          Logger.api('Response: ${response.statusCode}', data: response.data);
          handler.next(response);
        },
        onError: (error, handler) {
          Logger.error('API Error: ${error.message}', error);
          handler.next(error);
        },
      ),
    );
  }

  Future<AuthResponse> login({
    required String email,
    required String password,
  }) async {
    try {
      final response = await _dio.post(
        '${AppConstants.baseUrl}${ApiEndpoints.login}',
        data: {
          'email': email,
          'password': password,
        },
      );

      if (response.statusCode == 200 && response.data['success'] == true) {
        return AuthResponse.fromJson(response.data['data']);
      } else {
        throw Exception(_extractErrorMessage(response.data, 'Login failed'));
      }
    } on DioException catch (e) {
      Logger.error('Login Dio error', e);
      throw Exception(_handleDioError(e));
    } catch (e) {
      Logger.error('Login error', e);
      throw Exception('An unexpected error occurred. Please try again.');
    }
  }

  Future<AuthResponse> register({
    required String fullName,
    required String email,
    required String phone,
    required String password,
  }) async {
    try {
      final response = await _dio.post(
        '${AppConstants.baseUrl}${ApiEndpoints.register}',
        data: {
          'fullName': fullName,
          'email': email,
          'phone': phone,
          'password': password,
        },
      );

      if (response.statusCode == 201 && response.data['success'] == true) {
        return AuthResponse.fromJson(response.data['data']);
      } else {
        throw Exception(_extractErrorMessage(response.data, 'Registration failed'));
      }
    } on DioException catch (e) {
      Logger.error('Register Dio error', e);
      throw Exception(_handleDioError(e));
    } catch (e) {
      Logger.error('Register error', e);
      throw Exception('An unexpected error occurred. Please try again.');
    }
  }

  Future<User> getCurrentUser() async {
    try {
      final token = await StorageService.getToken();
      if (token == null) {
        throw Exception('No authentication token found');
      }

      final response = await _dio.get(
        '${AppConstants.baseUrl}${ApiEndpoints.profile}',
        options: Options(
          headers: {
            'Authorization': 'Bearer $token',
          },
        ),
      );

      if (response.statusCode == 200 && response.data['success'] == true) {
        return User.fromJson(response.data['data']);
      } else {
        throw Exception(_extractErrorMessage(response.data, 'Failed to get user data'));
      }
    } on DioException catch (e) {
      Logger.error('Get current user Dio error', e);
      throw Exception(_handleDioError(e));
    } catch (e) {
      Logger.error('Get current user error', e);
      throw Exception('Failed to get user information');
    }
  }

  Future<void> logout() async {
    try {
      final token = await StorageService.getToken();
      if (token == null) return;

      await _dio.post(
        '${AppConstants.baseUrl}${ApiEndpoints.logout}',
        options: Options(
          headers: {
            'Authorization': 'Bearer $token',
          },
        ),
      );

      Logger.info('Logout successful');
    } on DioException catch (e) {
      Logger.error('Logout Dio error', e);
      // Don't throw error for logout - we want to clear local data anyway
    } catch (e) {
      Logger.error('Logout error', e);
      // Don't throw error for logout - we want to clear local data anyway
    }
  }

  Future<({String token, String refreshToken})> refreshToken(String refreshToken) async {
    try {
      final response = await _dio.post(
        '${AppConstants.baseUrl}${ApiEndpoints.refreshToken}',
        data: {
          'refreshToken': refreshToken,
        },
      );

      if (response.statusCode == 200 && response.data['success'] == true) {
        final data = response.data['data'] as Map<String, dynamic>;
        return (
          token: data['token'] as String,
          refreshToken: data['refreshToken'] as String,
        );
      } else {
        throw Exception(response.data['message'] ?? 'Token refresh failed');
      }
    } on DioException catch (e) {
      Logger.error('Refresh token Dio error', e);
      throw Exception(_handleDioError(e));
    } catch (e) {
      Logger.error('Refresh token error', e);
      throw Exception('Failed to refresh token');
    }
  }

  Future<void> changePassword({
    required String currentPassword,
    required String newPassword,
  }) async {
    try {
      final token = await StorageService.getToken();
      if (token == null) {
        throw Exception('No authentication token found');
      }

      final response = await _dio.put(
        '${AppConstants.baseUrl}${ApiEndpoints.changePassword}',
        data: {
          'currentPassword': currentPassword,
          'newPassword': newPassword,
        },
        options: Options(
          headers: {
            'Authorization': 'Bearer $token',
          },
        ),
      );

      if (response.statusCode == 200 && response.data['success'] == true) {
        Logger.info('Password changed successfully');
      } else {
        throw Exception(response.data['message'] ?? 'Password change failed');
      }
    } on DioException catch (e) {
      Logger.error('Change password Dio error', e);
      throw Exception(_handleDioError(e));
    } catch (e) {
      Logger.error('Change password error', e);
      throw Exception('Failed to change password');
    }
  }

  String _extractErrorMessage(dynamic data, String fallback) {
    if (data is Map<String, dynamic>) {
      final err = data['error'];
      if (err is Map) return err['message']?.toString() ?? fallback;
      return data['message']?.toString() ?? err?.toString() ?? fallback;
    }
    return fallback;
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

// Provider for AuthRepository
final authRepositoryProvider = Provider<AuthRepository>((ref) {
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

  return AuthRepository(dio);
});
