import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../models/technician.dart';
import '../services/technician_service.dart';

final technicianServiceProvider = Provider((ref) => TechnicianService());

final techniciansProvider = FutureProvider<List<Technician>>((ref) async {
  return ref.read(technicianServiceProvider).getTechnicians();
});
