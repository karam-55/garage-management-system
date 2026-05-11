import 'package:dio/dio.dart';
import '../models/employee.dart';
import '../utils/api_config.dart';
import '../utils/token_storage.dart';
import 'api_service.dart';

class AuthService {
  // Login uses its own Dio (no auth needed, no circular dependency)
  final Dio _loginDio = Dio(BaseOptions(
    baseUrl: ApiConfig.baseUrl,
    connectTimeout: const Duration(seconds: 30),
    receiveTimeout: const Duration(seconds: 30),
  ));

  // Profile uses the shared singleton (has auth interceptor)
  final ApiService _api = ApiService();

  Future<({String token, Employee employee})> login(
      String phone, String password) async {
    final response = await _loginDio.post('/auth/login', data: {
      'phone': phone,
      'password': password,
    });

    // Backend returns both 'token' and 'access_token'
    final token = (response.data['token'] ??
        response.data['access_token']) as String;
    final employee = Employee.fromJson(response.data['employee']);

    // Persist token immediately so all future requests carry it
    await TokenStorage.setToken(token);
    return (token: token, employee: employee);
  }

  /// Returns the employee profile from /auth/me.
  /// Returns null only on 401 (invalid/expired token).
  /// Throws DioException for network errors (caller decides what to do).
  Future<Employee?> getProfile() async {
    final token = TokenStorage.getToken();
    if (token == null) return null;
    try {
      final response = await _api.get('/auth/me');
      return Employee.fromJson(response.data);
    } on DioException catch (e) {
      if (e.response?.statusCode == 401) {
        // Definitive: token rejected by server
        await TokenStorage.clearToken();
        return null;
      }
      // Network / timeout — rethrow so caller can decide
      rethrow;
    }
  }

  Future<void> logout() async {
    await TokenStorage.clearToken();
  }
}
