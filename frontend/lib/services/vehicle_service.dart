import 'package:dio/dio.dart';
import 'api_service.dart';
import '../models/vehicle.dart';

class VehicleService {
  final ApiService _apiService = ApiService();

  Future<List<Vehicle>> getAllVehicles() async {
    try {
      final response = await _apiService.get('/vehicles');
      return (response.data as List).map((e) => Vehicle.fromJson(e)).toList();
    } catch (e) {
      throw Exception('Failed to load vehicles: $e');
    }
  }

  Future<Vehicle> getVehicle(String id) async {
    try {
      final response = await _apiService.get('/vehicles/$id');
      return Vehicle.fromJson(response.data);
    } catch (e) {
      throw Exception('Failed to load vehicle: $e');
    }
  }

  Future<Vehicle> createVehicle(Vehicle vehicle) async {
    try {
      final response = await _apiService.post('/vehicles', vehicle.toJson());
      return Vehicle.fromJson(response.data);
    } catch (e) {
      throw Exception('Failed to create vehicle: $e');
    }
  }

  Future<Vehicle> updateVehicle(String id, Vehicle vehicle) async {
    try {
      final response = await _apiService.put('/vehicles/$id', vehicle.toJson());
      return Vehicle.fromJson(response.data);
    } catch (e) {
      throw Exception('Failed to update vehicle: $e');
    }
  }

  Future<void> deleteVehicle(String id) async {
    try {
      await _apiService.delete('/vehicles/$id');
    } catch (e) {
      throw Exception('Failed to delete vehicle: $e');
    }
  }
}
