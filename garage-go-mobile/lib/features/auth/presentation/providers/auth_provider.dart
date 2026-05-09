import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../core/services/storage_service.dart';
import '../../../../core/utils/logger.dart';
import '../../data/repositories/auth_repository.dart';
import '../../data/models/user_model.dart';

// Auth State
class AuthState {
  final User? user;
  final bool isLoading;
  final String? error;

  const AuthState({
    this.user,
    this.isLoading = false,
    this.error,
  });

  AuthState copyWith({
    User? user,
    bool? isLoading,
    String? error,
  }) {
    return AuthState(
      user: user ?? this.user,
      isLoading: isLoading ?? this.isLoading,
      error: error ?? this.error,
    );
  }

  @override
  bool operator ==(Object other) {
    if (identical(this, other)) return true;
    return other is AuthState &&
        other.user == user &&
        other.isLoading == isLoading &&
        other.error == error;
  }

  @override
  int get hashCode => user.hashCode ^ isLoading.hashCode ^ error.hashCode;
}

// Auth Provider
final authProvider = StateNotifierProvider<AuthNotifier, AuthState>((ref) {
  return AuthNotifier(ref.read(authRepositoryProvider));
});

class AuthNotifier extends StateNotifier<AuthState> {
  final AuthRepository _authRepository;

  AuthNotifier(this._authRepository) : super(const AuthState());

  Future<void> login({
    required String email,
    required String password,
    bool rememberMe = false,
  }) async {
    state = state.copyWith(isLoading: true, error: null);

    try {
      final response = await _authRepository.login(
        email: email,
        password: password,
      );

      // Save tokens
      await StorageService.setToken(response.token);
      await StorageService.setRefreshToken(response.refreshToken);
      await StorageService.setUser(response.user.toJson());

      state = state.copyWith(
        user: response.user,
        isLoading: false,
      );

      Logger.auth('Login successful for user: ${response.user.email}');
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        error: e.toString(),
      );
      Logger.error('Login failed', e);
      rethrow;
    }
  }

  Future<void> register({
    required String fullName,
    required String email,
    required String phone,
    required String password,
  }) async {
    state = state.copyWith(isLoading: true, error: null);

    try {
      final response = await _authRepository.register(
        fullName: fullName,
        email: email,
        phone: phone,
        password: password,
      );

      state = state.copyWith(isLoading: false);

      Logger.auth('Registration successful for user: ${response.user.email}');
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        error: e.toString(),
      );
      Logger.error('Registration failed', e);
      rethrow;
    }
  }

  Future<void> logout() async {
    state = state.copyWith(isLoading: true);

    try {
      await _authRepository.logout();
      
      // Clear local storage
      await StorageService.remove('auth_token');
      await StorageService.remove('refresh_token');
      await StorageService.remove('user_data');

      state = const AuthState();

      Logger.auth('Logout successful');
    } catch (e) {
      // Even if logout fails on server, clear local data
      await StorageService.remove('auth_token');
      await StorageService.remove('refresh_token');
      await StorageService.remove('user_data');

      state = const AuthState();
      Logger.error('Logout failed', e);
    }
  }

  Future<void> refreshUser() async {
    if (state.user == null) return;

    state = state.copyWith(isLoading: true);

    try {
      final user = await _authRepository.getCurrentUser();
      await StorageService.setUser(user.toJson());

      state = state.copyWith(
        user: user,
        isLoading: false,
      );

      Logger.auth('User data refreshed');
    } catch (e) {
      state = state.copyWith(isLoading: false);
      Logger.error('Failed to refresh user data', e);
    }
  }

  Future<void> refreshToken() async {
    try {
      final refreshToken = await StorageService.getRefreshToken();
      if (refreshToken == null) {
        throw Exception('No refresh token found');
      }

      final response = await _authRepository.refreshToken(refreshToken);

      await StorageService.setToken(response.token);
      await StorageService.setRefreshToken(response.refreshToken);

      Logger.auth('Token refreshed successfully');
    } catch (e) {
      Logger.error('Token refresh failed', e);
      // If refresh fails, logout user
      await logout();
    }
  }

  Future<void> checkAuthStatus() async {
    final token = await StorageService.getToken();
    if (token == null) {
      state = const AuthState();
      return;
    }

    state = state.copyWith(isLoading: true);

    try {
      final user = await _authRepository.getCurrentUser();
      state = state.copyWith(
        user: user,
        isLoading: false,
      );
      Logger.auth('User authenticated: ${user.email}');
    } catch (e) {
      // Token might be expired, try to refresh
      try {
        await refreshToken();
        final user = await _authRepository.getCurrentUser();
        state = state.copyWith(
          user: user,
          isLoading: false,
        );
      } catch (refreshError) {
        // Refresh also failed, logout
        await logout();
      }
    }
  }

  Future<void> changePassword({
    required String currentPassword,
    required String newPassword,
  }) async {
    state = state.copyWith(isLoading: true, error: null);

    try {
      await _authRepository.changePassword(
        currentPassword: currentPassword,
        newPassword: newPassword,
      );

      state = state.copyWith(isLoading: false);

      Logger.auth('Password changed successfully');
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        error: e.toString(),
      );
      Logger.error('Password change failed', e);
      rethrow;
    }
  }

  void clearError() {
    state = state.copyWith(error: null);
  }
}

// User Provider (for easy access to current user)
final currentUserProvider = Provider<User?>((ref) {
  return ref.watch(authProvider).user;
});

// Is Authenticated Provider
final isAuthenticatedProvider = Provider<bool>((ref) {
  return ref.watch(authProvider).user != null;
});

// Is Loading Provider
final authLoadingProvider = Provider<bool>((ref) {
  return ref.watch(authProvider).isLoading;
});

// Auth Error Provider
final authErrorProvider = Provider<String?>((ref) {
  return ref.watch(authProvider).error;
});
