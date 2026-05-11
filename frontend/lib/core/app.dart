import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:garage_management/widgets/app_shell_new.dart';
import 'package:garage_management/screens/dashboard/dashboard_screen_v2.dart';
import 'package:garage_management/screens/customers/customers_screen_v2.dart';
import 'package:garage_management/screens/vehicles/vehicles_screen_v2.dart';
import 'package:garage_management/screens/technicians/technicians_screen_v2.dart';
import 'package:garage_management/screens/bookings/bookings_screen_v2.dart';
import 'package:garage_management/screens/invoices/invoices_screen_v2.dart';
import 'package:garage_management/screens/inventory/inventory_screen_v2.dart';
import 'package:garage_management/screens/tracking/tracking_screen.dart';
import 'package:garage_management/screens/mechanic/mechanic_dashboard_screen.dart';
import 'package:garage_management/models/employee.dart';

// All pages with their role access
const _allPages = [
  _PageConfig(
    page: AppPage(
      title: 'لوحة التحكم',
      icon: Icons.dashboard_outlined,
      activeIcon: Icons.dashboard,
      page: DashboardScreenV2(),
    ),
    allowedRoles: ['OWNER', 'MANAGER', 'RECEPTIONIST', 'CASHIER', 'MECHANIC'],
  ),
  _PageConfig(
    page: AppPage(
      title: 'العملاء',
      icon: Icons.people_outline,
      activeIcon: Icons.people,
      page: CustomersScreenV2(),
    ),
    allowedRoles: ['OWNER', 'MANAGER', 'RECEPTIONIST'],
  ),
  _PageConfig(
    page: AppPage(
      title: 'السيارات',
      icon: Icons.directions_car_outlined,
      activeIcon: Icons.directions_car,
      page: VehiclesScreenV2(),
    ),
    allowedRoles: ['OWNER', 'MANAGER', 'RECEPTIONIST'],
  ),
  _PageConfig(
    page: AppPage(
      title: 'الفنيين',
      icon: Icons.engineering_outlined,
      activeIcon: Icons.engineering,
      page: TechniciansScreenV2(),
    ),
    allowedRoles: ['OWNER', 'MANAGER'],
  ),
  _PageConfig(
    page: AppPage(
      title: 'الحجوزات',
      icon: Icons.calendar_today_outlined,
      activeIcon: Icons.calendar_today,
      page: BookingsScreenV2(),
    ),
    allowedRoles: ['OWNER', 'MANAGER', 'RECEPTIONIST', 'MECHANIC'],
  ),
  _PageConfig(
    page: AppPage(
      title: 'الفواتير',
      icon: Icons.receipt_outlined,
      activeIcon: Icons.receipt,
      page: InvoicesScreenV2(),
    ),
    allowedRoles: ['OWNER', 'MANAGER', 'CASHIER'],
  ),
  _PageConfig(
    page: AppPage(
      title: 'المخزون',
      icon: Icons.inventory_2_outlined,
      activeIcon: Icons.inventory_2,
      page: InventoryScreenV2(),
    ),
    allowedRoles: ['OWNER', 'MANAGER'],
  ),
];

class _PageConfig {
  final AppPage page;
  final List<String> allowedRoles;
  const _PageConfig({required this.page, required this.allowedRoles});
}

class MyApp extends ConsumerWidget {
  final Employee? employee;
  const MyApp({super.key, this.employee});

  List<AppPage> _getPagesForRole(String role) {
    return _allPages
        .where((p) => p.allowedRoles.contains(role))
        .map((p) => p.page)
        .toList();
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final role = employee?.role.apiValue ?? 'RECEPTIONIST';

    // Mechanic → redirect to mechanic app
    if (role == 'MECHANIC') {
      return MaterialApp(
        title: 'AUTO RENEW',
        debugShowCheckedModeBanner: false,
        home: const MechanicDashboardScreen(),
      );
    }

    final pages = _getPagesForRole(role);

    return MaterialApp(
      title: 'AUTO RENEW',
      debugShowCheckedModeBanner: false,
      onGenerateRoute: (settings) => _onGenerateRoute(settings, pages),
      onGenerateInitialRoutes: (initialRoute) {
        final settings = RouteSettings(name: initialRoute);
        return [_onGenerateRoute(settings, pages)!];
      },
    );
  }

  Route<dynamic>? _onGenerateRoute(RouteSettings settings, List<AppPage> pages) {
    final uri = Uri.parse(settings.name ?? '/');

    // Handle /track/:vehicleId (public - no auth needed) - MUST BE FIRST
    if (uri.pathSegments.length == 2 && uri.pathSegments[0] == 'track') {
      final vehicleId = uri.pathSegments[1];
      final token = uri.queryParameters['token'];
      return MaterialPageRoute(
        builder: (_) => TrackingScreen(vehicleId: vehicleId, token: token),
      );
    }

    // If employee is null and not a public route, should not happen but handle gracefully
    if (employee == null) {
      return MaterialPageRoute(
        builder: (_) => TrackingScreen(vehicleId: '', token: null),
      );
    }

    // Default route - authenticated app
    return MaterialPageRoute(
      builder: (_) => AppShellNew(pages: pages, employee: employee),
    );
  }
}
