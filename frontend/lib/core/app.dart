import 'package:flutter/material.dart';
import 'package:garage_management/screens/dashboard/dashboard_screen.dart';
import 'package:garage_management/screens/tracking/tracking_screen.dart';

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Garage Management System',
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(seedColor: Colors.blue),
        useMaterial3: true,
      ),
      initialRoute: '/',
      onGenerateRoute: (settings) {
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
          builder: (_) => const DashboardScreen(),
        );
      },
    );
  }
}
