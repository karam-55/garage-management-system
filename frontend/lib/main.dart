import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'core/app.dart';
import 'core/app_theme.dart';
import 'state/auth_provider.dart';
import 'screens/auth/login_screen.dart';
import 'screens/tracking/tracking_screen.dart';
import 'utils/token_storage.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  // Pre-load token into memory cache BEFORE runApp so ApiService
  // interceptor has it available from the very first HTTP request.
  await TokenStorage.loadToken();
  runApp(
    const ProviderScope(
      child: AppWrapper(),
    ),
  );
}

class AppWrapper extends ConsumerWidget {
  const AppWrapper({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final authState = ref.watch(authProvider);

    return MaterialApp(
      title: 'AUTO RENEW',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.darkTheme,
      onGenerateRoute: (settings) => _onGenerateRoute(settings, authState),
    );
  }

  Route<dynamic>? _onGenerateRoute(RouteSettings settings, AuthState authState) {
    final uri = Uri.parse(settings.name ?? '/');
    print('[Main] Route: ${uri.path}, isLoading: ${authState.isLoading}, isLoggedIn: ${authState.isLoggedIn}');

    // Handle /track/:vehicleId (public - no auth needed) - MUST BE FIRST
    if (uri.pathSegments.length == 2 && uri.pathSegments[0] == 'track') {
      final vehicleId = uri.pathSegments[1];
      final token = uri.queryParameters['token'];
      print('[Main] Public tracking route: $vehicleId');
      return MaterialPageRoute(
        builder: (_) => TrackingScreen(vehicleId: vehicleId, token: token),
      );
    }

    // NO SPLASH SCREEN - direct routing only
    if (authState.isLoading) {
      print('[Main] Auth loading...');
      return MaterialPageRoute(
        builder: (_) => const Scaffold(
          backgroundColor: Colors.black,
          body: Center(child: CircularProgressIndicator()),
        ),
      );
    }

    if (authState.isLoggedIn) {
      print('[Main] Showing app with employee: ${authState.employee?.name}');
      return MaterialPageRoute(
        builder: (_) => MyApp(employee: authState.employee),
      );
    }

    print('[Main] Showing login screen');
    return MaterialPageRoute(
      builder: (_) => const LoginScreen(),
    );
  }
}
