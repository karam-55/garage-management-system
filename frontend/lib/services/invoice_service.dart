import '../models/invoice.dart';
import 'api_service.dart';

class InvoiceService {
  final ApiService _api = ApiService();

  Future<List<Invoice>> getInvoices() async {
    final response = await _api.get('/invoices');
    return (response.data as List).map((json) => Invoice.fromJson(json)).toList();
  }

  Future<Invoice> createInvoice(Invoice invoice) async {
    final response = await _api.post('/invoices', invoice.toJson());
    return Invoice.fromJson(response.data);
  }

  Future<Invoice> updateInvoice(String id, Invoice invoice) async {
    final response = await _api.put('/invoices/$id', invoice.toJson());
    return Invoice.fromJson(response.data);
  }

  Future<void> deleteInvoice(String id) async {
    await _api.delete('/invoices/$id');
  }
}
