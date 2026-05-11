import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../models/invoice.dart';
import '../services/invoice_service.dart';

final invoiceServiceProvider = Provider((ref) => InvoiceService());

final invoicesProvider = FutureProvider<List<Invoice>>((ref) async {
  return ref.read(invoiceServiceProvider).getInvoices();
});
