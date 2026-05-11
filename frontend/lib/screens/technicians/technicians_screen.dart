import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../models/technician.dart';
import '../../state/technician_provider.dart';
import '../../services/notification_service.dart';

class TechniciansScreen extends ConsumerStatefulWidget {
  const TechniciansScreen({super.key});

  @override
  ConsumerState<TechniciansScreen> createState() => _TechniciansScreenState();
}

class _TechniciansScreenState extends ConsumerState<TechniciansScreen> {
  @override
  Widget build(BuildContext context) {
    final techniciansAsync = ref.watch(techniciansProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('الفنيين'),
        backgroundColor: Colors.orange,
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: () => ref.invalidate(techniciansProvider),
          ),
        ],
      ),
      body: techniciansAsync.when(
        data: (technicians) => ListView.builder(
          padding: const EdgeInsets.all(8),
          itemCount: technicians.length,
          itemBuilder: (context, index) {
            final tech = technicians[index];
            return Card(
              margin: const EdgeInsets.symmetric(vertical: 4, horizontal: 8),
              child: ListTile(
                leading: CircleAvatar(
                  backgroundColor: tech.isAvailable ? Colors.green : Colors.red,
                  child: Icon(Icons.person, color: Colors.white),
                ),
                title: Text(tech.name, style: const TextStyle(fontWeight: FontWeight.bold)),
                subtitle: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('التخصص: ${tech.specialization}'),
                    Text('الهاتف: ${tech.phone}'),
                    Container(
                      margin: const EdgeInsets.only(top: 4),
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                      decoration: BoxDecoration(
                        color: tech.isAvailable ? Colors.green.withOpacity(0.2) : Colors.red.withOpacity(0.2),
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: Text(
                        tech.isAvailable ? 'متاح' : 'مشغول',
                        style: TextStyle(
                          color: tech.isAvailable ? Colors.green : Colors.red,
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
                      onPressed: () => _showEditDialog(tech),
                    ),
                    IconButton(
                      icon: const Icon(Icons.delete, color: Colors.red),
                      onPressed: () => _showDeleteDialog(tech),
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
        backgroundColor: Colors.orange,
        child: const Icon(Icons.add),
      ),
    );
  }

  void _showAddDialog() {
    final nameController = TextEditingController();
    final specController = TextEditingController();
    final phoneController = TextEditingController();

    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('إضافة فني جديد'),
        content: SingleChildScrollView(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              TextField(controller: nameController, decoration: const InputDecoration(labelText: 'الاسم')),
              TextField(controller: specController, decoration: const InputDecoration(labelText: 'التخصص')),
              TextField(controller: phoneController, decoration: const InputDecoration(labelText: 'الهاتف')),
            ],
          ),
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context), child: const Text('إلغاء')),
          ElevatedButton(
            onPressed: () async {
              try {
                await ref.read(technicianServiceProvider).createTechnician(
                  Technician(
                    id: '',
                    name: nameController.text,
                    specialization: specController.text,
                    phone: phoneController.text,
                    createdAt: DateTime.now(),
                    updatedAt: DateTime.now(),
                  ),
                );
                ref.invalidate(techniciansProvider);
                Navigator.pop(context);
                showSuccessToast(context, 'تم إضافة الفني بنجاح!');
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

  void _showEditDialog(Technician tech) {
    final nameController = TextEditingController(text: tech.name);
    final specController = TextEditingController(text: tech.specialization);
    final phoneController = TextEditingController(text: tech.phone);

    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('تعديل الفني'),
        content: SingleChildScrollView(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              TextField(controller: nameController, decoration: const InputDecoration(labelText: 'الاسم')),
              TextField(controller: specController, decoration: const InputDecoration(labelText: 'التخصص')),
              TextField(controller: phoneController, decoration: const InputDecoration(labelText: 'الهاتف')),
            ],
          ),
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context), child: const Text('إلغاء')),
          ElevatedButton(
            onPressed: () async {
              try {
                await ref.read(technicianServiceProvider).updateTechnician(
                  tech.id,
                  Technician(
                    id: tech.id,
                    name: nameController.text,
                    specialization: specController.text,
                    phone: phoneController.text,
                    isAvailable: tech.isAvailable,
                    createdAt: tech.createdAt,
                    updatedAt: DateTime.now(),
                  ),
                );
                ref.invalidate(techniciansProvider);
                Navigator.pop(context);
                showSuccessToast(context, 'تم تحديث الفني بنجاح!');
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

  void _showDeleteDialog(Technician tech) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('حذف الفني'),
        content: Text('هل أنت متأكد من حذف ${tech.name}؟'),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context), child: const Text('إلغاء')),
          ElevatedButton(
            style: ElevatedButton.styleFrom(backgroundColor: Colors.red),
            onPressed: () async {
              try {
                await ref.read(technicianServiceProvider).deleteTechnician(tech.id);
                ref.invalidate(techniciansProvider);
                Navigator.pop(context);
                showSuccessToast(context, 'تم حذف الفني بنجاح!');
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
