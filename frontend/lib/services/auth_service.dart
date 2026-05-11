import 'package:dio/dio.dart';
import '../models/employee.dart';
import '../utils/api_config.dart';
import '../utils/token_storage.dart';

class AuthService {
  final Dio _dio = Dio(BaseOptions(
    baseUrl: ApiConfig.baseUrl,
    connectTimeout: const Duration(seconds: 10),
    receiveTimeout: const Duration(seconds: 10),
  ));

  Future<({String token, Employee employee})> login(String phone, String password) async {
    final response = await _dio.post('/auth/login', data: {
      'phone': phone,
      'password': password,
    });

    final token = response.data['token'] as String;
    final employee = Employee.fromJson(response.data['employee']);

    TokenStorage.setToken(token);
    return (token: token, employee: employee);
  }

  Future<Employee?> getProfile() async {
    final token = TokenStorage.getToken();
    if (token == null) return null;
    try {
      final response = await _dio.get('/auth/me', options: Options(
        headers: {'Authorization': 'Bearer $token'},
      ));
      return Employee.fromJson(response.data);
    } catch (_) {
      return null;
    }
  }

  Future<void> logout() async {
    await TokenStorage.clearToken();
  }
}
