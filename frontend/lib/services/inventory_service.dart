import '../models/inventory_item.dart';
import 'api_service.dart';

class InventoryService {
  final ApiService _api = ApiService();

  Future<List<InventoryItem>> getInventory() async {
    final response = await _api.get('/inventory');
    return (response.data as List).map((json) => InventoryItem.fromJson(json)).toList();
  }

  Future<InventoryItem> createItem(InventoryItem item) async {
    final response = await _api.post('/inventory', item.toJson());
    return InventoryItem.fromJson(response.data);
  }

  Future<InventoryItem> updateItem(String id, InventoryItem item) async {
    final response = await _api.put('/inventory/$id', item.toJson());
    return InventoryItem.fromJson(response.data);
  }

  Future<void> deleteItem(String id) async {
    await _api.delete('/inventory/$id');
  }
}
