import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../screens/auth/login_screen.dart';
import '../screens/auth/register_screen.dart';
import '../screens/dashboard/dashboard_screen.dart';
import '../screens/bookings/bookings_screen.dart';
import '../screens/bookings/booking_details_screen.dart';
import '../screens/vehicles/vehicle_details_screen.dart';
import '../screens/customers/customer_details_screen.dart';
import '../screens/inventory/inventory_screen.dart';
import '../screens/handover/handover_screen.dart';
import '../screens/notifications/notifications_screen.dart';
import '../screens/profile/profile_screen.dart';
import '../screens/settings/settings_screen.dart';

class AppRouter {
  static const String login = '/login';
  static const String register = '/register';
  static const String dashboard = '/dashboard';
  static const String bookings = '/bookings';
  static const String bookingDetails = '/bookings/:id';
  static const String vehicleDetails = '/vehicles/:id';
  static const String customerDetails = '/customers/:id';
  static const String inventory = '/inventory';
  static const String handover = '/handover';
  static const String notifications = '/notifications';
  static const String profile = '/profile';
  static const String settings = '/settings';

  static GoRouter router = GoRouter(
    initialLocation: login,
    routes: [
      GoRoute(
        path: login,
        builder: (context, state) => const LoginScreen(),
      ),
      GoRoute(
        path: register,
        builder: (context, state) => const RegisterScreen(),
      ),
      GoRoute(
        path: dashboard,
        builder: (context, state) => const DashboardScreen(),
      ),
      GoRoute(
        path: bookings,
        builder: (context, state) => const BookingsScreen(),
        routes: [
          GoRoute(
            path: ':id',
            builder: (context, state) {
              final id = state.pathParameters['id']!;
              return BookingDetailsScreen(bookingId: id);
            },
          ),
        ],
      ),
      GoRoute(
        path: '/vehicles/:id',
        builder: (context, state) {
          final id = state.pathParameters['id']!;
          return VehicleDetailsScreen(vehicleId: id);
        },
      ),
      GoRoute(
        path: '/customers/:id',
        builder: (context, state) {
          final id = state.pathParameters['id']!;
          return CustomerDetailsScreen(customerId: id);
        },
      ),
      GoRoute(
        path: inventory,
        builder: (context, state) => const InventoryScreen(),
      ),
      GoRoute(
        path: handover,
        builder: (context, state) => const HandoverScreen(),
      ),
      GoRoute(
        path: notifications,
        builder: (context, state) => const NotificationsScreen(),
      ),
      GoRoute(
        path: profile,
        builder: (context, state) => const ProfileScreen(),
      ),
      GoRoute(
        path: settings,
        builder: (context, state) => const SettingsScreen(),
      ),
    ],
  );
}
