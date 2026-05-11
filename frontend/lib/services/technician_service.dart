import 'package:dio/dio.dart';
import '../models/technician.dart';
import '../utils/api_config.dart';

class TechnicianService {
  final Dio _dio = Dio(BaseOptions(baseUrl: ApiConfig.baseUrl));

  Future<List<Technician>> getTechnicians() async {
    final response = await _dio.get('/technicians');
    return (response.data as List).map((json) => Technician.fromJson(json)).toList();
  }

  Future<Technician> createTechnician(Technician technician) async {
    final response = await _dio.post('/technicians', data: technician.toJson());
    return Technician.fromJson(response.data);
  }

  Future<Technician> updateTechnician(String id, Technician technician) async {
    final response = await _dio.put('/technicians/$id', data: technician.toJson());
    return Technician.fromJson(response.data);
  }

  Future<void> deleteTechnician(String id) async {
    await _dio.delete('/technicians/$id');
  }
}
