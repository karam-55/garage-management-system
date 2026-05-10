import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../models/vehicle.dart';
import '../services/vehicle_service.dart';

final vehicleServiceProvider = Provider<VehicleService>((ref) {
  return VehicleService();
});

final vehiclesProvider = FutureProvider.autoDispose<List<Vehicle>>((ref) async {
  final service = ref.watch(vehicleServiceProvider);
  return await service.getAllVehicles();
});

final vehicleProvider = FutureProvider.family<Vehicle, String>((ref, id) async {
  final service = ref.watch(vehicleServiceProvider);
  return await service.getVehicle(id);
});
