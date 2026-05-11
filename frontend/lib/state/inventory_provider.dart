import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../models/inventory_item.dart';
import '../services/inventory_service.dart';

final inventoryServiceProvider = Provider((ref) => InventoryService());

final inventoryProvider = FutureProvider<List<InventoryItem>>((ref) async {
  return ref.read(inventoryServiceProvider).getInventory();
});
