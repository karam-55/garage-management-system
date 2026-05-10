import 'package:dio/dio.dart';
import 'api_service.dart';
import '../models/customer.dart';

class CustomerService {
  final ApiService _apiService = ApiService();

  Future<List<Customer>> getAllCustomers() async {
    try {
      final response = await _apiService.get('/customers');
      return (response.data as List).map((e) => Customer.fromJson(e)).toList();
    } catch (e) {
      throw Exception('Failed to load customers: $e');
    }
  }

  Future<Customer> getCustomer(String id) async {
    try {
      final response = await _apiService.get('/customers/$id');
      return Customer.fromJson(response.data);
    } catch (e) {
      throw Exception('Failed to load customer: $e');
    }
  }

  Future<Customer> createCustomer(Customer customer) async {
    try {
      final response = await _apiService.post('/customers', customer.toJson());
      return Customer.fromJson(response.data);
    } catch (e) {
      throw Exception('Failed to create customer: $e');
    }
  }

  Future<Customer> updateCustomer(String id, Customer customer) async {
    try {
      final response = await _apiService.put('/customers/$id', customer.toJson());
      return Customer.fromJson(response.data);
    } catch (e) {
      throw Exception('Failed to update customer: $e');
    }
  }

  Future<void> deleteCustomer(String id) async {
    try {
      await _apiService.delete('/customers/$id');
    } catch (e) {
      throw Exception('Failed to delete customer: $e');
    }
  }
}
