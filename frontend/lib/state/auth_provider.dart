import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../models/employee.dart';
import '../services/auth_service.dart';
import '../services/api_service.dart';
import '../utils/token_storage.dart';

class AuthState {
  final Employee? employee;
  final bool isLoading;
  final bool isLoggedIn;

  const AuthState({
    this.employee,
    this.isLoading = false,
    this.isLoggedIn = false,
  });

  AuthState copyWith({
    Employee? employee,
    bool? isLoading,
    bool? isLoggedIn,
    bool clearEmployee = false,
  }) {
    return AuthState(
      employee: clearEmployee ? null : (employee ?? this.employee),
      isLoading: isLoading ?? this.isLoading,
      isLoggedIn: isLoggedIn ?? this.isLoggedIn,
    );
  }
}

class AuthNotifier extends StateNotifier<AuthState> {
  final AuthService _authService = AuthService();

  AuthNotifier() : super(const AuthState(isLoading: true)) {
    // Register 401 callback: auto-logout when any API call returns 401
    ApiService.setUnauthorizedCallback(() {
      if (mounted && state.isLoggedIn) {
        state = const AuthState(isLoggedIn: false);
      }
    });
    _init();
  }

  Future<void> _init() async {
    print('[AuthProvider] _init started');
    // Token was already pre-loaded in main() — this is just a safeguard
    final token = await TokenStorage.loadToken();
    print('[AuthProvider] Token loaded: ${token != null ? "EXISTS" : "NULL"}');

    if (token == null) {
      print('[AuthProvider] No token found, setting isLoggedIn=false');
      state = const AuthState(isLoading: false, isLoggedIn: false);
      return;
    }

    try {
      print('[AuthProvider] Calling getProfile...');
      final profile = await _authService.getProfile();
      print('[AuthProvider] getProfile returned: ${profile != null ? "SUCCESS" : "NULL"}');
      if (profile != null) {
        state = AuthState(employee: profile, isLoading: false, isLoggedIn: true);
        print('[AuthProvider] Login successful');
        return;
      }
      // getProfile() returned null → 401 was received, token already cleared
      print('[AuthProvider] Profile is null, setting isLoggedIn=false');
      state = const AuthState(isLoading: false, isLoggedIn: false);
    } on DioException catch (e) {
      // Network error / timeout:
      // Keep the token intact — next launch will retry.
      // Show login so user can proceed manually.
      print('[AuthProvider] DioException: ${e.message}');
      state = const AuthState(isLoading: false, isLoggedIn: false);
    } catch (e) {
      print('[AuthProvider] Exception: $e');
      state = const AuthState(isLoading: false, isLoggedIn: false);
    }
    print('[AuthProvider] _init completed');
  }

  Future<void> login(String phone, String password) async {
    print('[AuthProvider] login started');
    state = state.copyWith(isLoading: true);
    try {
      final result = await _authService.login(phone, password);
      state = AuthState(employee: result.employee, isLoading: false, isLoggedIn: true);
      print('[AuthProvider] login successful');
    } catch (e) {
      state = state.copyWith(isLoading: false);
      print('[AuthProvider] login failed: $e');
      rethrow;
    }
  }

  Future<void> logout() async {
    await _authService.logout();
    state = const AuthState(isLoggedIn: false);
  }
}

final authProvider = StateNotifierProvider<AuthNotifier, AuthState>((ref) {
  return AuthNotifier();
});
