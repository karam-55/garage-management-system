import 'package:dio/dio.dart';
import '../models/invoice.dart';
import '../utils/api_config.dart';

class InvoiceService {
  final Dio _dio = Dio(BaseOptions(baseUrl: ApiConfig.baseUrl));

  Future<List<Invoice>> getInvoices() async {
    final response = await _dio.get('/invoices');
    return (response.data as List).map((json) => Invoice.fromJson(json)).toList();
  }

  Future<Invoice> createInvoice(Invoice invoice) async {
    final response = await _dio.post('/invoices', data: invoice.toJson());
    return Invoice.fromJson(response.data);
  }

  Future<Invoice> updateInvoice(String id, Invoice invoice) async {
    final response = await _dio.put('/invoices/$id', data: invoice.toJson());
    return Invoice.fromJson(response.data);
  }

  Future<void> deleteInvoice(String id) async {
    await _dio.delete('/invoices/$id');
  }
}
