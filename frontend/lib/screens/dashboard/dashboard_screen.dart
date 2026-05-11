import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../customers/customers_screen.dart';
import '../vehicles/vehicles_screen.dart';
import '../mechanic/mechanic_dashboard_screen.dart';

class DashboardScreen extends ConsumerWidget {
  const DashboardScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Garage Management System'),
        backgroundColor: Theme.of(context).colorScheme.inversePrimary,
      ),
      body: GridView.count(
        crossAxisCount: 2,
        padding: const EdgeInsets.all(16),
        mainAxisSpacing: 16,
        crossAxisSpacing: 16,
        children: [
          _buildMenuCard(
            context,
            icon: Icons.people,
            title: 'العملاء',
            color: Colors.blue,
            onTap: () {
              Navigator.push(
                context,
                MaterialPageRoute(builder: (context) => const CustomersScreen()),
              );
            },
          ),
          _buildMenuCard(
            context,
            icon: Icons.directions_car,
            title: 'السيارات',
            color: Colors.green,
            onTap: () {
              Navigator.push(
                context,
                MaterialPageRoute(builder: (context) => const VehiclesScreen()),
              );
            },
          ),
          _buildMenuCard(
            context,
            icon: Icons.build,
            title: 'الفنيين',
            color: Colors.orange,
            onTap: () {
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('قريباً')),
              );
            },
          ),
          _buildMenuCard(
            context,
            icon: Icons.calendar_today,
            title: 'الحجوزات',
            color: Colors.purple,
            onTap: () {
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('قريباً')),
              );
            },
          ),
          _buildMenuCard(
            context,
            icon: Icons.receipt,
            title: 'الفواتير',
            color: Colors.red,
            onTap: () {
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('قريباً')),
              );
            },
          ),
          _buildMenuCard(
            context,
            icon: Icons.inventory,
            title: 'المخزون',
            color: Colors.teal,
            onTap: () {
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('قريباً')),
              );
            },
          ),
          _buildMenuCard(
            context,
            icon: Icons.notifications,
            title: 'الإشعارات',
            color: Colors.amber,
            onTap: () {
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('قريباً')),
              );
            },
          ),
          _buildMenuCard(
            context,
            icon: Icons.handyman,
            title: 'الميكانيكي',
            color: Colors.deepOrange,
            onTap: () {
              Navigator.push(
                context,
                MaterialPageRoute(builder: (context) => const MechanicDashboardScreen()),
              );
            },
          ),
          _buildMenuCard(
            context,
            icon: Icons.qr_code_scanner,
            title: 'تتبع السيارة',
            color: Colors.indigo,
            onTap: () {
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('قريباً')),
              );
            },
          ),
        ],
      ),
    );
  }

  Widget _buildMenuCard(
    BuildContext context, {
    required IconData icon,
    required String title,
    required Color color,
    required VoidCallback onTap,
  }) {
    return Card(
      elevation: 4,
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(12),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              icon,
              size: 48,
              color: color,
            ),
            const SizedBox(height: 16),
            Text(
              title,
              style: const TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.bold,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
