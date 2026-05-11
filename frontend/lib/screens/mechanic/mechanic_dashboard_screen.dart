import 'package:flutter/material.dart';
import 'available_vehicles_screen.dart';
import 'my_vehicles_screen.dart';

class MechanicDashboardScreen extends StatefulWidget {
  const MechanicDashboardScreen({super.key});

  @override
  State<MechanicDashboardScreen> createState() => _MechanicDashboardScreenState();
}

class _MechanicDashboardScreenState extends State<MechanicDashboardScreen> {
  int _currentIndex = 0;

  final List<Widget> _screens = [
    const AvailableVehiclesScreen(),
    const MyVehiclesScreen(),
  ];

  final List<String> _titles = [
    'السيارات المتاحة',
    'سياراتي',
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: _screens[_currentIndex],
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: _currentIndex,
        onTap: (index) {
          setState(() {
            _currentIndex = index;
          });
        },
        selectedItemColor: Colors.orange,
        unselectedItemColor: Colors.grey,
        type: BottomNavigationBarType.fixed,
        items: const [
          BottomNavigationBarItem(
            icon: Icon(Icons.car_rental),
            label: 'متاحة',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.handyman),
            label: 'سياراتي',
          ),
        ],
      ),
    );
  }
}
