import 'package:flutter/material.dart';

class HomeScreen extends StatelessWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('الرئيسية'),
        actions: [
          IconButton(
            icon: const Icon(Icons.notifications),
            onPressed: () {},
          ),
          IconButton(
            icon: const Icon(Icons.logout),
            onPressed: () {},
          ),
        ],
      ),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: GridView.count(
          crossAxisCount: 2,
          crossAxisSpacing: 16,
          mainAxisSpacing: 16,
          children: [
            _buildMenuCard(
              icon: Icons.calendar_today,
              title: 'حجوزاتي',
              color: Colors.blue,
              onTap: () {},
            ),
            _buildMenuCard(
              icon: Icons.directions_car,
              title: 'سياراتي',
              color: Colors.green,
              onTap: () {},
            ),
            _buildMenuCard(
              icon: Icons.receipt,
              title: 'فواتيري',
              color: Colors.orange,
              onTap: () {},
            ),
            _buildMenuCard(
              icon: Icons.history,
              title: 'السجل',
              color: Colors.purple,
              onTap: () {},
            ),
            _buildMenuCard(
              icon: Icons.settings,
              title: 'الإعدادات',
              color: Colors.grey,
              onTap: () {},
            ),
            _buildMenuCard(
              icon: Icons.support_agent,
              title: 'الدعم',
              color: Colors.red,
              onTap: () {},
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildMenuCard({
    required IconData icon,
    required String title,
    required Color color,
    required VoidCallback onTap,
  }) {
    return Card(
      elevation: 4,
      child: InkWell(
        onTap: onTap,
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
                fontSize: 16,
                fontWeight: FontWeight.bold,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
