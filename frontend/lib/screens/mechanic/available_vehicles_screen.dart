import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:dio/dio.dart';
import '../../models/vehicle.dart';
import '../../utils/api_config.dart';
import 'vehicle_detail_screen.dart';

final availableVehiclesProvider = FutureProvider<List<Vehicle>>((ref) async {
  final dio = Dio(BaseOptions(baseUrl: ApiConfig.baseUrl));
  final response = await dio.get('/vehicles');
  final List<dynamic> data = response.data;
  return data.map((json) => Vehicle.fromJson(json)).toList();
});

class AvailableVehiclesScreen extends ConsumerWidget {
  const AvailableVehiclesScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final vehiclesAsync = ref.watch(availableVehiclesProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('السيارات المتاحة'),
        backgroundColor: Colors.orange,
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: () {
              ref.invalidate(availableVehiclesProvider);
            },
          ),
        ],
      ),
      body: vehiclesAsync.when(
        data: (vehicles) {
          if (vehicles.isEmpty) {
            return const Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(Icons.car_rental, size: 64, color: Colors.grey),
                  SizedBox(height: 16),
                  Text(
                    'لا توجد سيارات متاحة',
                    style: TextStyle(fontSize: 18, color: Colors.grey),
                  ),
                  Text(
                    'جميع السيارات مستلمة حالياً',
                    style: TextStyle(fontSize: 14, color: Colors.grey),
                  ),
                ],
              ),
            );
          }
          return ListView.builder(
            padding: const EdgeInsets.all(8),
            itemCount: vehicles.length,
            itemBuilder: (context, index) {
              final vehicle = vehicles[index];
              return VehicleCard(
                vehicle: vehicle,
                onTap: () {
                  Navigator.push(
                    context,
                    MaterialPageRoute(
                      builder: (_) => VehicleDetailScreen(vehicle: vehicle),
                    ),
                  );
                },
              );
            },
          );
        },
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (error, stack) => Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Icon(Icons.error, size: 64, color: Colors.red),
              const SizedBox(height: 16),
              Text('خطأ: $error'),
              ElevatedButton(
                onPressed: () {
                  ref.invalidate(availableVehiclesProvider);
                },
                child: const Text('إعادة المحاولة'),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class VehicleCard extends StatelessWidget {
  final Vehicle vehicle;
  final VoidCallback onTap;

  const VehicleCard({
    super.key,
    required this.vehicle,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: const EdgeInsets.symmetric(vertical: 4, horizontal: 8),
      elevation: 2,
      child: ListTile(
        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
        leading: Container(
          width: 50,
          height: 50,
          decoration: BoxDecoration(
            color: Colors.orange.withOpacity(0.2),
            borderRadius: BorderRadius.circular(8),
          ),
          child: const Icon(Icons.directions_car, color: Colors.orange, size: 30),
        ),
        title: Text(
          '${vehicle.model}',
          style: const TextStyle(fontWeight: FontWeight.bold),
        ),
        subtitle: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('رقم اللوحة: ${vehicle.plateNumber}'),
            Text('السنة: ${vehicle.year} - اللون: ${vehicle.color}'),
          ],
        ),
        trailing: const Icon(Icons.arrow_forward_ios, size: 16),
        onTap: onTap,
      ),
    );
  }
}
