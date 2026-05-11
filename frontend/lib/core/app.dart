import 'package:flutter/material.dart';
import 'package:garage_management/widgets/app_shell_new.dart';
import 'package:garage_management/screens/dashboard/dashboard_screen_v2.dart';
import 'package:garage_management/screens/customers/customers_screen_v2.dart';
import 'package:garage_management/screens/vehicles/vehicles_screen_v2.dart';
import 'package:garage_management/screens/technicians/technicians_screen.dart';
import 'package:garage_management/screens/bookings/bookings_screen.dart';
import 'package:garage_management/screens/invoices/invoices_screen.dart';
import 'package:garage_management/screens/inventory/inventory_screen.dart';
import 'package:garage_management/screens/tracking/tracking_screen.dart';

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  final List<AppPage> _pages = const [
    AppPage(
      title: 'لوحة التحكم',
      icon: Icons.dashboard_outlined,
      activeIcon: Icons.dashboard,
      page: DashboardScreenV2(),
    ),
    AppPage(
      title: 'العملاء',
      icon: Icons.people_outline,
      activeIcon: Icons.people,
      page: CustomersScreenV2(),
    ),
    AppPage(
      title: 'السيارات',
      icon: Icons.directions_car_outlined,
      activeIcon: Icons.directions_car,
      page: VehiclesScreenV2(),
    ),
    AppPage(
      title: 'الفنيين',
      icon: Icons.build_outlined,
      activeIcon: Icons.build,
      page: TechniciansScreen(),
    ),
    AppPage(
      title: 'الحجوزات',
      icon: Icons.calendar_today_outlined,
      activeIcon: Icons.calendar_today,
      page: BookingsScreen(),
    ),
    AppPage(
      title: 'الفواتير',
      icon: Icons.receipt_outlined,
      activeIcon: Icons.receipt,
      page: InvoicesScreen(),
    ),
    AppPage(
      title: 'المخزون',
      icon: Icons.inventory_2_outlined,
      activeIcon: Icons.inventory_2,
      page: InventoryScreen(),
    ),
  ];

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'AUTO RENEW',
      debugShowCheckedModeBanner: false,
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
      builder: (_) => AppShellNew(pages: _pages),
    );
  }
}
