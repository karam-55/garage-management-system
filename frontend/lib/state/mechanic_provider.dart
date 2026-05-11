import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../models/technician.dart';

final currentMechanicProvider = StateProvider<Technician?>((ref) => null);
