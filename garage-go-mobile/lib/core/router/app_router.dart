import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../features/auth/presentation/pages/login_page.dart';
import '../../features/auth/presentation/pages/register_page.dart';
import '../../features/home/presentation/pages/home_page.dart';
import '../../features/garages/presentation/pages/garages_page.dart';
import '../../features/garages/presentation/pages/garage_details_page.dart';
import '../../features/bookings/presentation/pages/bookings_page.dart';
import '../../features/bookings/presentation/pages/booking_details_page.dart';
import '../../features/bookings/presentation/pages/create_booking_page.dart';
import '../../features/vehicles/presentation/pages/vehicles_page.dart';
import '../../features/vehicles/presentation/pages/vehicle_details_page.dart';
import '../../features/vehicles/presentation/pages/add_vehicle_page.dart';
import '../../features/profile/presentation/pages/profile_page.dart';
import '../../features/notifications/presentation/pages/notifications_page.dart';
import '../../features/splash/presentation/pages/splash_page.dart';
import '../../features/onboarding/presentation/pages/onboarding_page.dart';

import '../services/storage_service.dart';
import '../utils/logger.dart';

final appRouterProvider = Provider<GoRouter>((ref) {
  return GoRouter(
    initialLocation: '/splash',
    debugLogDiagnostics: true,
    redirect: (context, state) {
      Logger.navigation('Redirecting to: ${state.uri}');
      return null; // No redirect for now
    },
    routes: [
      // Splash Screen
      GoRoute(
        path: '/splash',
        name: 'splash',
        builder: (context, state) => const SplashPage(),
      ),
      
      // Onboarding
      GoRoute(
        path: '/onboarding',
        name: 'onboarding',
        builder: (context, state) => const OnboardingPage(),
      ),
      
      // Authentication Routes
      GoRoute(
        path: '/login',
        name: 'login',
        builder: (context, state) => const LoginPage(),
      ),
      
      GoRoute(
        path: '/register',
        name: 'register',
        builder: (context, state) => const RegisterPage(),
      ),
      
      // Main App Routes (with bottom navigation)
      ShellRoute(
        builder: (context, state, child) {
          return MainNavigationShell(child: child);
        },
        routes: [
          // Home
          GoRoute(
            path: '/home',
            name: 'home',
            builder: (context, state) => const HomePage(),
          ),
          
          // Garages
          GoRoute(
            path: '/garages',
            name: 'garages',
            builder: (context, state) => const GaragesPage(),
            routes: [
              GoRoute(
                path: ':id',
                name: 'garage_details',
                builder: (context, state) {
                  final garageId = state.pathParameters['id']!;
                  return GarageDetailsPage(garageId: garageId);
                },
              ),
            ],
          ),
          
          // Bookings
          GoRoute(
            path: '/bookings',
            name: 'bookings',
            builder: (context, state) => const BookingsPage(),
            routes: [
              GoRoute(
                path: 'create',
                name: 'create_booking',
                builder: (context, state) {
                  final garageId = state.uri.queryParameters['garage_id'];
                  final serviceId = state.uri.queryParameters['service_id'];
                  return CreateBookingPage(
                    garageId: garageId,
                    serviceId: serviceId,
                  );
                },
              ),
              GoRoute(
                path: ':id',
                name: 'booking_details',
                builder: (context, state) {
                  final bookingId = state.pathParameters['id']!;
                  return BookingDetailsPage(bookingId: bookingId);
                },
              ),
            ],
          ),
          
          // Vehicles
          GoRoute(
            path: '/vehicles',
            name: 'vehicles',
            builder: (context, state) => const VehiclesPage(),
            routes: [
              GoRoute(
                path: 'add',
                name: 'add_vehicle',
                builder: (context, state) => const AddVehiclePage(),
              ),
              GoRoute(
                path: ':id',
                name: 'vehicle_details',
                builder: (context, state) {
                  final vehicleId = state.pathParameters['id']!;
                  return VehicleDetailsPage(vehicleId: vehicleId);
                },
              ),
            ],
          ),
          
          // Profile
          GoRoute(
            path: '/profile',
            name: 'profile',
            builder: (context, state) => const ProfilePage(),
          ),
        ],
      ),
      
      // Notifications (standalone)
      GoRoute(
        path: '/notifications',
        name: 'notifications',
        builder: (context, state) => const NotificationsPage(),
      ),
    ],
    
    errorBuilder: (context, state) => ErrorPage(error: state.error),
  );
});

class MainNavigationShell extends ConsumerWidget {
  const MainNavigationShell({
    super.key,
    required this.child,
  });

  final Widget child;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final currentIndex = _calculateSelectedIndex(context);
    
    return Scaffold(
      body: child,
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: currentIndex,
        onTap: (index) => _onItemTapped(context, index),
        type: BottomNavigationBarType.fixed,
        selectedItemColor: Theme.of(context).colorScheme.primary,
        unselectedItemColor: Theme.of(context).colorScheme.onSurface.withOpacity(0.6),
        items: const [
          BottomNavigationBarItem(
            icon: Icon(Icons.home_outlined),
            activeIcon: Icon(Icons.home),
            label: 'Home',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.garage_outlined),
            activeIcon: Icon(Icons.garage),
            label: 'Garages',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.calendar_today_outlined),
            activeIcon: Icon(Icons.calendar_today),
            label: 'Bookings',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.directions_car_outlined),
            activeIcon: Icon(Icons.directions_car),
            label: 'Vehicles',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.person_outline),
            activeIcon: Icon(Icons.person),
            label: 'Profile',
          ),
        ],
      ),
    );
  }

  int _calculateSelectedIndex(BuildContext context) {
    final String location = GoRouterState.of(context).uri.toString();
    if (location.startsWith('/home')) return 0;
    if (location.startsWith('/garages')) return 1;
    if (location.startsWith('/bookings')) return 2;
    if (location.startsWith('/vehicles')) return 3;
    if (location.startsWith('/profile')) return 4;
    return 0;
  }

  void _onItemTapped(BuildContext context, int index) {
    switch (index) {
      case 0:
        context.go('/home');
        break;
      case 1:
        context.go('/garages');
        break;
      case 2:
        context.go('/bookings');
        break;
      case 3:
        context.go('/vehicles');
        break;
      case 4:
        context.go('/profile');
        break;
    }
  }
}

class ErrorPage extends StatelessWidget {
  const ErrorPage({
    super.key,
    required this.error,
  });

  final Exception? error;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Error'),
      ),
      body: Center(
        child: Padding(
          padding: const EdgeInsets.all(16.0),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Icon(
                Icons.error_outline,
                size: 64,
                color: Colors.red,
              ),
              const SizedBox(height: 16),
              const Text(
                'Oops! Something went wrong.',
                style: TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                ),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 8),
              Text(
                error?.toString() ?? 'Unknown error occurred',
                style: TextStyle(
                  fontSize: 14,
                  color: Theme.of(context).colorScheme.onSurface.withOpacity(0.7),
                ),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 24),
              ElevatedButton(
                onPressed: () => context.go('/home'),
                child: const Text('Go Home'),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

// Extension methods for easier navigation
extension RouterExtensions on BuildContext {
  void navigateToHome() => go('/home');
  void navigateToGarages() => go('/garages');
  void navigateToGarageDetails(String garageId) => go('/garages/$garageId');
  void navigateToBookings() => go('/bookings');
  void navigateToBookingDetails(String bookingId) => go('/bookings/$bookingId');
  void navigateToCreateBooking({String? garageId, String? serviceId}) {
    final query = <String>[];
    if (garageId != null) query.add('garage_id=$garageId');
    if (serviceId != null) query.add('service_id=$serviceId');
    final queryString = query.isNotEmpty ? '?${query.join('&')}' : '';
    go('/bookings/create$queryString');
  }
  void navigateToVehicles() => go('/vehicles');
  void navigateToVehicleDetails(String vehicleId) => go('/vehicles/$vehicleId');
  void navigateToAddVehicle() => go('/vehicles/add');
  void navigateToProfile() => go('/profile');
  void navigateToNotifications() => go('/notifications');
  void navigateToLogin() => go('/login');
  void navigateToRegister() => go('/register');
  void navigateToSplash() => go('/splash');
  void navigateToOnboarding() => go('/onboarding');
}
