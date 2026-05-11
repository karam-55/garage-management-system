import '../models/technician.dart';
import 'api_service.dart';

class TechnicianService {
  final ApiService _dio = ApiService();

  Future<List<Technician>> getTechnicians() async {
    final response = await _dio.get('/technicians');
    return (response.data as List).map((json) => Technician.fromJson(json)).toList();
  }

  Future<Technician> createTechnician(Technician technician) async {
    final response = await _dio.post('/technicians', technician.toJson());
    return Technician.fromJson(response.data);
  }

  Future<Technician> updateTechnician(String id, Technician technician) async {
    final response = await _dio.put('/technicians/$id', technician.toJson());
    return Technician.fromJson(response.data);
  }

  Future<void> deleteTechnician(String id) async {
    await _dio.delete('/technicians/$id');
  }
}
