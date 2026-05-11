import 'package:dio/dio.dart';
import '../models/inventory_item.dart';
import '../utils/api_config.dart';

class InventoryService {
  final Dio _dio = Dio(BaseOptions(baseUrl: ApiConfig.baseUrl));

  Future<List<InventoryItem>> getInventory() async {
    final response = await _dio.get('/inventory');
    return (response.data as List).map((json) => InventoryItem.fromJson(json)).toList();
  }

  Future<InventoryItem> createItem(InventoryItem item) async {
    final response = await _dio.post('/inventory', data: item.toJson());
    return InventoryItem.fromJson(response.data);
  }

  Future<InventoryItem> updateItem(String id, InventoryItem item) async {
    final response = await _dio.put('/inventory/$id', data: item.toJson());
    return InventoryItem.fromJson(response.data);
  }

  Future<void> deleteItem(String id) async {
    await _dio.delete('/inventory/$id');
  }
}
