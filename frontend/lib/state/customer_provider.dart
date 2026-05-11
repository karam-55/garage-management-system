import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../models/customer.dart';
import '../services/customer_service.dart';

final customerServiceProvider = Provider<CustomerService>((ref) {
  return CustomerService();
});

final customersProvider = FutureProvider<List<Customer>>((ref) async {
  final service = ref.watch(customerServiceProvider);
  return await service.getAllCustomers();
});

final customerProvider = FutureProvider.family<Customer, String>((ref, id) async {
  final service = ref.watch(customerServiceProvider);
  return await service.getCustomer(id);
});
