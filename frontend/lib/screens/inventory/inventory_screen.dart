import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../models/inventory_item.dart';
import '../../state/inventory_provider.dart';
import '../../services/notification_service.dart';

class InventoryScreen extends ConsumerStatefulWidget {
  const InventoryScreen({super.key});

  @override
  ConsumerState<InventoryScreen> createState() => _InventoryScreenState();
}

class _InventoryScreenState extends ConsumerState<InventoryScreen> {
  @override
  Widget build(BuildContext context) {
    final inventoryAsync = ref.watch(inventoryProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('المخزون'),
        backgroundColor: Colors.teal,
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: () => ref.invalidate(inventoryProvider),
          ),
        ],
      ),
      body: inventoryAsync.when(
        data: (items) => ListView.builder(
          padding: const EdgeInsets.all(8),
          itemCount: items.length,
          itemBuilder: (context, index) {
            final item = items[index];
            final isLowStock = item.quantity < 5;
            return Card(
              margin: const EdgeInsets.symmetric(vertical: 4, horizontal: 8),
              child: ListTile(
                leading: Container(
                  width: 50,
                  height: 50,
                  decoration: BoxDecoration(
                    color: isLowStock ? Colors.red.withOpacity(0.2) : Colors.teal.withOpacity(0.2),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Icon(
                    isLowStock ? Icons.warning : Icons.inventory,
                    color: isLowStock ? Colors.red : Colors.teal,
                  ),
                ),
                title: Text(item.name, style: const TextStyle(fontWeight: FontWeight.bold)),
                subtitle: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('الكمية: ${item.quantity}'),
                    Text('السعر: \$${item.unitPrice.toStringAsFixed(2)}'),
                    if (isLowStock)
                      Container(
                        margin: const EdgeInsets.only(top: 4),
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                        decoration: BoxDecoration(
                          color: Colors.red.withOpacity(0.2),
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: const Text(
                          'كمية منخفضة!',
                          style: TextStyle(
                            color: Colors.red,
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
                    IconButton(
                      icon: const Icon(Icons.edit, color: Colors.blue),
                      onPressed: () => _showEditDialog(item),
                    ),
                    IconButton(
                      icon: const Icon(Icons.delete, color: Colors.red),
                      onPressed: () => _showDeleteDialog(item),
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
        backgroundColor: Colors.teal,
        child: const Icon(Icons.add),
      ),
    );
  }

  void _showAddDialog() {
    final nameController = TextEditingController();
    final qtyController = TextEditingController();
    final priceController = TextEditingController();

    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('إضافة قطعة جديدة'),
        content: SingleChildScrollView(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              TextField(controller: nameController, decoration: const InputDecoration(labelText: 'الاسم')),
              TextField(controller: qtyController, decoration: const InputDecoration(labelText: 'الكمية'), keyboardType: TextInputType.number),
              TextField(controller: priceController, decoration: const InputDecoration(labelText: 'سعر الوحدة'), keyboardType: TextInputType.number),
            ],
          ),
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context), child: const Text('إلغاء')),
          ElevatedButton(
            onPressed: () async {
              try {
                await ref.read(inventoryServiceProvider).createItem(
                  InventoryItem(
                    id: '',
                    name: nameController.text,
                    quantity: int.tryParse(qtyController.text) ?? 0,
                    unitPrice: double.tryParse(priceController.text) ?? 0,
                    createdAt: DateTime.now(),
                    updatedAt: DateTime.now(),
                  ),
                );
                ref.invalidate(inventoryProvider);
                Navigator.pop(context);
                showSuccessToast(context, 'تم إضافة القطعة بنجاح!');
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

  void _showEditDialog(InventoryItem item) {
    final nameController = TextEditingController(text: item.name);
    final qtyController = TextEditingController(text: item.quantity.toString());
    final priceController = TextEditingController(text: item.unitPrice.toString());

    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('تعديل قطعة'),
        content: SingleChildScrollView(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              TextField(controller: nameController, decoration: const InputDecoration(labelText: 'الاسم')),
              TextField(controller: qtyController, decoration: const InputDecoration(labelText: 'الكمية'), keyboardType: TextInputType.number),
              TextField(controller: priceController, decoration: const InputDecoration(labelText: 'سعر الوحدة'), keyboardType: TextInputType.number),
            ],
          ),
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context), child: const Text('إلغاء')),
          ElevatedButton(
            onPressed: () async {
              try {
                await ref.read(inventoryServiceProvider).updateItem(
                  item.id,
                  InventoryItem(
                    id: item.id,
                    name: nameController.text,
                    quantity: int.tryParse(qtyController.text) ?? item.quantity,
                    unitPrice: double.tryParse(priceController.text) ?? item.unitPrice,
                    createdAt: item.createdAt,
                    updatedAt: DateTime.now(),
                  ),
                );
                ref.invalidate(inventoryProvider);
                Navigator.pop(context);
                showSuccessToast(context, 'تم تحديث القطعة بنجاح!');
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

  void _showDeleteDialog(InventoryItem item) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('حذف القطعة'),
        content: Text('هل أنت متأكد من حذف ${item.name}؟'),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context), child: const Text('إلغاء')),
          ElevatedButton(
            style: ElevatedButton.styleFrom(backgroundColor: Colors.red),
            onPressed: () async {
              try {
                await ref.read(inventoryServiceProvider).deleteItem(item.id);
                ref.invalidate(inventoryProvider);
                Navigator.pop(context);
                showSuccessToast(context, 'تم حذف القطعة بنجاح!');
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
