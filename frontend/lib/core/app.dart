import 'package:flutter/material.dart';
import 'package:garage_management/widgets/app_shell.dart';
import 'package:garage_management/screens/tracking/tracking_screen.dart';

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'AUTO RENEW',
      debugShowCheckedModeBanner: false,
      theme: ThemeData.dark().copyWith(
        scaffoldBackgroundColor: const Color(0xFF0F172A),
        colorScheme: ColorScheme.dark(
          primary: const Color(0xFF6366F1),
          secondary: const Color(0xFF10B981),
          surface: const Color(0xFF1E293B),
          background: const Color(0xFF0F172A),
        ),
        useMaterial3: true,
      ),
      onGenerateRoute: _onGenerateRoute,
      onGenerateInitialRoutes: (initialRoute) {
        final settings = RouteSettings(name: initialRoute);
        return [_onGenerateRoute(settings)!];
      },
    );
  }

  Route<dynamic>? _onGenerateRoute(RouteSettings settings) {
    final uri = Uri.parse(settings.name ?? '/');
    
    // Handle /track/:vehicleId
    if (uri.pathSegments.length == 2 && uri.pathSegments[0] == 'track') {
      final vehicleId = uri.pathSegments[1];
      return MaterialPageRoute(
        builder: (_) => TrackingScreen(vehicleId: vehicleId),
      );
    }
    
    // Default route
    return MaterialPageRoute(
      builder: (_) => const AppShell(),
    );
  }
}
