import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../models/invoice.dart';
import '../../state/invoice_provider.dart';
import '../../services/notification_service.dart';

class InvoicesScreen extends ConsumerStatefulWidget {
  const InvoicesScreen({super.key});

  @override
  ConsumerState<InvoicesScreen> createState() => _InvoicesScreenState();
}

class _InvoicesScreenState extends ConsumerState<InvoicesScreen> {
  @override
  Widget build(BuildContext context) {
    final invoicesAsync = ref.watch(invoicesProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('الفواتير'),
        backgroundColor: Colors.red,
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: () => ref.invalidate(invoicesProvider),
          ),
        ],
      ),
      body: invoicesAsync.when(
        data: (invoices) => ListView.builder(
          padding: const EdgeInsets.all(8),
          itemCount: invoices.length,
          itemBuilder: (context, index) {
            final inv = invoices[index];
            return Card(
              margin: const EdgeInsets.symmetric(vertical: 4, horizontal: 8),
              child: ListTile(
                leading: Container(
                  width: 50,
                  height: 50,
                  decoration: BoxDecoration(
                    color: inv.isPaid ? Colors.green.withOpacity(0.2) : Colors.orange.withOpacity(0.2),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Icon(
                    inv.isPaid ? Icons.check_circle : Icons.pending,
                    color: inv.isPaid ? Colors.green : Colors.orange,
                  ),
                ),
                title: Text('فاتورة #${inv.id.substring(0, 8)}', style: const TextStyle(fontWeight: FontWeight.bold)),
                subtitle: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('المبلغ: \$${inv.amount.toStringAsFixed(2)}'),
                    Container(
                      margin: const EdgeInsets.only(top: 4),
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                      decoration: BoxDecoration(
                        color: inv.isPaid ? Colors.green.withOpacity(0.2) : Colors.orange.withOpacity(0.2),
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: Text(
                        inv.isPaid ? 'مدفوع' : 'معلق',
                        style: TextStyle(
                          color: inv.isPaid ? Colors.green : Colors.orange,
                          fontSize: 12,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ),
                  ],
                ),
                trailing: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    if (!inv.isPaid)
                      IconButton(
                        icon: const Icon(Icons.payment, color: Colors.green),
                        onPressed: () => _markAsPaid(inv),
                      ),
                    IconButton(
                      icon: const Icon(Icons.delete, color: Colors.red),
                      onPressed: () => _showDeleteDialog(inv),
                    ),
                  ],
                ),
              ),
            );
          },
        ),
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (error, stack) => Center(child: Text('خطأ: $error')),
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: _showAddDialog,
        backgroundColor: Colors.red,
        child: const Icon(Icons.add),
      ),
    );
  }

  void _showAddDialog() {
    final bookingIdController = TextEditingController();
    final amountController = TextEditingController();

    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('فاتورة جديدة'),
        content: SingleChildScrollView(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              TextField(controller: bookingIdController, decoration: const InputDecoration(labelText: 'رقم الحجز')),
              TextField(controller: amountController, decoration: const InputDecoration(labelText: 'المبلغ'), keyboardType: TextInputType.number),
            ],
          ),
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context), child: const Text('إلغاء')),
          ElevatedButton(
            onPressed: () async {
              try {
                await ref.read(invoiceServiceProvider).createInvoice(
                  Invoice(
                    id: '',
                    bookingId: bookingIdController.text,
                    amount: double.tryParse(amountController.text) ?? 0,
                    createdAt: DateTime.now(),
                    updatedAt: DateTime.now(),
                  ),
                );
                ref.invalidate(invoicesProvider);
                Navigator.pop(context);
                showSuccessToast(context, 'تم إنشاء الفاتورة بنجاح!');
              } catch (e) {
                showErrorToast(context, 'خطأ: $e');
              }
            },
            child: const Text('حفظ'),
          ),
        ],
      ),
    );
  }

  Future<void> _markAsPaid(Invoice inv) async {
    try {
      await ref.read(invoiceServiceProvider).updateInvoice(
        inv.id,
        Invoice(
          id: inv.id,
          bookingId: inv.bookingId,
          amount: inv.amount,
          isPaid: true,
          createdAt: inv.createdAt,
          updatedAt: DateTime.now(),
        ),
      );
      ref.invalidate(invoicesProvider);
      showSuccessToast(context, 'تم تسجيل الدفع بنجاح!');
    } catch (e) {
      showErrorToast(context, 'خطأ: $e');
    }
  }

  void _showDeleteDialog(Invoice inv) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('حذف الفاتورة'),
        content: Text('هل أنت متأكد من حذف الفاتورة #${inv.id.substring(0, 8)}؟'),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context), child: const Text('إلغاء')),
          ElevatedButton(
            style: ElevatedButton.styleFrom(backgroundColor: Colors.red),
            onPressed: () async {
              try {
                await ref.read(invoiceServiceProvider).deleteInvoice(inv.id);
                ref.invalidate(invoicesProvider);
                Navigator.pop(context);
                showSuccessToast(context, 'تم حذف الفاتورة بنجاح!');
              } catch (e) {
                showErrorToast(context, 'خطأ: $e');
              }
            },
            child: const Text('حذف'),
          ),
        ],
      ),
    );
  }
}
