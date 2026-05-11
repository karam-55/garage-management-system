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

class AppWrapper extends ConsumerStatefulWidget {
  const AppWrapper({super.key});

  @override
  ConsumerState<AppWrapper> createState() => _AppWrapperState();
}

class _AppWrapperState extends ConsumerState<AppWrapper>
    with SingleTickerProviderStateMixin {
  bool _showSplash = true;
  late AnimationController _controller;
  late Animation<double> _fadeAnimation;
  late Animation<double> _scaleAnimation;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1500),
    );
    _fadeAnimation = Tween<double>(begin: 0, end: 1).animate(
      CurvedAnimation(parent: _controller, curve: AppAnimations.easeOut),
    );
    _scaleAnimation = Tween<double>(begin: 0.8, end: 1).animate(
      CurvedAnimation(parent: _controller, curve: AppAnimations.spring),
    );
    _controller.forward();

    Future.delayed(const Duration(seconds: 2, milliseconds: 500), () {
      if (mounted) setState(() => _showSplash = false);
    });
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final authState = ref.watch(authProvider);

    return MaterialApp(
      title: 'AUTO RENEW',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.darkTheme,
      onGenerateRoute: (settings) => _onGenerateRoute(settings, authState),
    );
  }

  Route<dynamic>? _onGenerateRoute(RouteSettings settings, authState) {
    final uri = Uri.parse(settings.name ?? '/');
    print('[Main] Route: ${uri.path}, isLoading: ${authState.isLoading}, isLoggedIn: ${authState.isLoggedIn}, _showSplash: $_showSplash');

    // Handle /track/:vehicleId (public - no auth needed) - MUST BE FIRST
    if (uri.pathSegments.length == 2 && uri.pathSegments[0] == 'track') {
      final vehicleId = uri.pathSegments[1];
      final token = uri.queryParameters['token'];
      print('[Main] Public tracking route: $vehicleId');
      return MaterialPageRoute(
        builder: (_) => TrackingScreen(vehicleId: vehicleId, token: token),
      );
    }

    // Check auth for all other routes
    if (_showSplash || authState.isLoading) {
      print('[Main] Showing splash screen');
      return MaterialPageRoute(
        builder: (_) => _SplashScreen(
          fadeAnimation: _fadeAnimation,
          scaleAnimation: _scaleAnimation,
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

class _SplashScreen extends StatelessWidget {
  final Animation<double> fadeAnimation;
  final Animation<double> scaleAnimation;

  const _SplashScreen({
    super.key,
    required this.fadeAnimation,
    required this.scaleAnimation,
  });

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.bgPrimary,
      body: Center(
        child: FadeTransition(
          opacity: fadeAnimation,
          child: ScaleTransition(
            scale: scaleAnimation,
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Container(
                  width: 130,
                  height: 130,
                  decoration: BoxDecoration(
                    gradient: const LinearGradient(
                      colors: AppColors.gradientPrimary,
                      begin: Alignment.topLeft,
                      end: Alignment.bottomRight,
                    ),
                    borderRadius: BorderRadius.circular(32),
                    boxShadow: [
                      AppShadows.glowStrong(AppColors.primary),
                    ],
                  ),
                  child: const Icon(
                    Icons.directions_car,
                    size: 64,
                    color: Colors.white,
                  ),
                ),
                const SizedBox(height: 36),
                const Text(
                  'AUTO RENEW',
                  style: TextStyle(
                    color: AppColors.textPrimary,
                    fontSize: 32,
                    fontWeight: FontWeight.w700,
                    letterSpacing: 4,
                  ),
                ),
                const SizedBox(height: 10),
                Text(
                  'نظام إدارة الكراج المتكامل',
                  style: TextStyle(
                    color: AppColors.textTertiary,
                    fontSize: 15,
                    letterSpacing: 1.5,
                  ),
                ),
                const SizedBox(height: 56),
                SizedBox(
                  width: 200,
                  child: ClipRRect(
                    borderRadius: BorderRadius.circular(10),
                    child: LinearProgressIndicator(
                      backgroundColor: AppColors.border.withOpacity(0.3),
                      valueColor: const AlwaysStoppedAnimation<Color>(AppColors.primary),
                      minHeight: 4,
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
