import 'package:flutter/material.dart';

class MyVehiclesScreen extends StatelessWidget {
  const MyVehiclesScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('سياراتي'),
        backgroundColor: Colors.orange,
      ),
      body: const Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.handyman, size: 64, color: Colors.grey),
            SizedBox(height: 16),
            Text(
              'لم تستلم أي سيارة بعد',
              style: TextStyle(fontSize: 18, color: Colors.grey),
            ),
            Text(
              'انتقل إلى "السيارات المتاحة" لاستلام سيارة',
              style: TextStyle(fontSize: 14, color: Colors.grey),
            ),
          ],
        ),
      ),
    );
  }
}
