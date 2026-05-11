import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../models/employee.dart';
import '../services/auth_service.dart';
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
  }) {
    return AuthState(
      employee: employee ?? this.employee,
      isLoading: isLoading ?? this.isLoading,
      isLoggedIn: isLoggedIn ?? this.isLoggedIn,
    );
  }
}

class AuthNotifier extends StateNotifier<AuthState> {
  final AuthService _authService = AuthService();

  AuthNotifier() : super(const AuthState(isLoading: true)) {
    _init();
  }

  Future<void> _init() async {
    final token = await TokenStorage.loadToken();
    if (token != null) {
      final profile = await _authService.getProfile();
      if (profile != null) {
        state = AuthState(employee: profile, isLoggedIn: true);
        return;
      }
    }
    await TokenStorage.clearToken();
    state = const AuthState(isLoggedIn: false);
  }

  Future<void> login(String phone, String password) async {
    state = state.copyWith(isLoading: true);
    try {
      final result = await _authService.login(phone, password);
      state = AuthState(employee: result.employee, isLoggedIn: true);
    } catch (e) {
      state = state.copyWith(isLoading: false);
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
