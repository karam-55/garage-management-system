import 'package:dio/dio.dart';
import '../utils/api_config.dart';
import '../utils/token_storage.dart';

class ApiService {
  // ─── Singleton ────────────────────────────────────────────────
  static final ApiService _instance = ApiService._internal();
  factory ApiService() => _instance;

  // Called by AuthNotifier to redirect to login on 401
  static void Function()? _onUnauthorized;
  static void setUnauthorizedCallback(void Function() cb) {
    _onUnauthorized = cb;
  }

  // ─── Dio setup ────────────────────────────────────────────────
  final Dio _dio;

  ApiService._internal()
      : _dio = Dio(BaseOptions(
          baseUrl: ApiConfig.baseUrl,
          // 30 s gives Render free-tier time to wake up
          connectTimeout: const Duration(seconds: 30),
          receiveTimeout: const Duration(seconds: 30),
          headers: {'Content-Type': 'application/json'},
        )) {
    _dio.interceptors.add(InterceptorsWrapper(
      onRequest: (options, handler) {
        // Skip Authorization header for public tracking routes
        final path = options.path;
        if (path.contains('/track')) {
          return handler.next(options);
        }

        final token = TokenStorage.getToken();
        if (token != null) {
          options.headers['Authorization'] = 'Bearer $token';
        }
        return handler.next(options);
      },
      onError: (DioException error, handler) async {
        // Skip auto-logout for public tracking routes
        if (error.requestOptions.path.contains('/track')) {
          return handler.next(error);
        }

        if (error.response?.statusCode == 401) {
          // Token is invalid / expired – clear it and notify auth layer
          await TokenStorage.clearToken();
          _onUnauthorized?.call();
        }
        return handler.next(error);
      },
    ));
  }

  // ─── HTTP helpers ─────────────────────────────────────────────
  Future<Response> get(String path) => _dio.get(path);

  Future<Response> post(String path, dynamic data) =>
      _dio.post(path, data: data);

  Future<Response> put(String path, dynamic data) =>
      _dio.put(path, data: data);

  Future<Response> patch(String path, dynamic data) =>
      _dio.patch(path, data: data);

  Future<Response> delete(String path) => _dio.delete(path);
}
