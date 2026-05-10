import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:qr_flutter/qr_flutter.dart';
import '../../models/vehicle.dart';
import '../../state/vehicle_provider.dart';
import '../../utils/api_config.dart';

class VehiclesScreen extends ConsumerStatefulWidget {
  const VehiclesScreen({super.key});

  @override
  ConsumerState<VehiclesScreen> createState() => _VehiclesScreenState();
}

class _VehiclesScreenState extends ConsumerState<VehiclesScreen> {
  @override
  Widget build(BuildContext context) {
    final vehiclesAsync = ref.watch(vehiclesProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('السيارات'),
        backgroundColor: Theme.of(context).colorScheme.inversePrimary,
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: () {
              ref.invalidate(vehiclesProvider);
            },
          ),
        ],
      ),
      body: vehiclesAsync.when(
        data: (vehicles) {
          if (vehicles.isEmpty) {
            return const Center(
              child: Text('لا توجد سيارات'),
            );
          }
          return ListView.builder(
            itemCount: vehicles.length,
            itemBuilder: (context, index) {
              final vehicle = vehicles[index];
              return Card(
                margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                child: ExpansionTile(
                  title: Text('${vehicle.model} - ${vehicle.plateNumber}'),
                  subtitle: Text('${vehicle.year} - ${vehicle.color}'),
                  children: [
                    Padding(
                      padding: const EdgeInsets.all(16),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text('نوع الوقود: ${vehicle.fuelType}'),
                          if (vehicle.notes != null) Text('ملاحظات: ${vehicle.notes}'),
                          const SizedBox(height: 16),
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                            children: [
                              ElevatedButton.icon(
                                onPressed: () {
                                  _showQRDialog(context, vehicle);
                                },
                                icon: const Icon(Icons.qr_code),
                                label: const Text('QR تتبع'),
                                style: ElevatedButton.styleFrom(
                                  backgroundColor: Colors.green,
                                ),
                              ),
                              ElevatedButton.icon(
                                onPressed: () {
                                  _showEditDialog(context, vehicle);
                                },
                                icon: const Icon(Icons.edit),
                                label: const Text('تعديل'),
                              ),
                              ElevatedButton.icon(
                                onPressed: () {
                                  _showDeleteDialog(context, vehicle);
                                },
                                icon: const Icon(Icons.delete),
                                label: const Text('حذف'),
                                style: ElevatedButton.styleFrom(
                                  backgroundColor: Colors.red,
                                ),
                              ),
                            ],
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              );
            },
          );
        },
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (error, stack) => Center(
          child: Text('Error: $error'),
        ),
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () {
          _showAddDialog(context);
        },
        child: const Icon(Icons.add),
      ),
    );
  }

  void _showAddDialog(BuildContext context) {
    final plateController = TextEditingController();
    final modelController = TextEditingController();
    final yearController = TextEditingController();
    final colorController = TextEditingController();
    final fuelController = TextEditingController();
    final notesController = TextEditingController();

    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('إضافة سيارة جديدة'),
        content: SingleChildScrollView(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              TextField(
                controller: plateController,
                decoration: const InputDecoration(labelText: 'رقم اللوحة'),
              ),
              TextField(
                controller: modelController,
                decoration: const InputDecoration(labelText: 'الموديل'),
              ),
              TextField(
                controller: yearController,
                decoration: const InputDecoration(labelText: 'السنة'),
                keyboardType: TextInputType.number,
              ),
              TextField(
                controller: colorController,
                decoration: const InputDecoration(labelText: 'اللون'),
              ),
              TextField(
                controller: fuelController,
                decoration: const InputDecoration(labelText: 'نوع الوقود'),
              ),
              TextField(
                controller: notesController,
                decoration: const InputDecoration(labelText: 'ملاحظات'),
              ),
            ],
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('إلغاء'),
          ),
          TextButton(
            onPressed: () async {
              if (plateController.text.isEmpty || modelController.text.isEmpty) {
                return;
              }
              final newVehicle = Vehicle(
                id: '',
                customerId: '',
                plateNumber: plateController.text,
                model: modelController.text,
                year: int.tryParse(yearController.text) ?? 2024,
                color: colorController.text,
                fuelType: fuelController.text,
                notes: notesController.text,
                createdAt: DateTime.now(),
                updatedAt: DateTime.now(),
              );
              try {
                await ref.read(vehicleServiceProvider).createVehicle(newVehicle);
                ref.invalidate(vehiclesProvider);
                Navigator.pop(context);
              } catch (e) {
                ScaffoldMessenger.of(context).showSnackBar(
                  SnackBar(content: Text('Error: $e')),
                );
              }
            },
            child: const Text('حفظ'),
          ),
        ],
      ),
    );
  }

  void _showEditDialog(BuildContext context, Vehicle vehicle) {
    final plateController = TextEditingController(text: vehicle.plateNumber);
    final modelController = TextEditingController(text: vehicle.model);
    final yearController = TextEditingController(text: vehicle.year.toString());
    final colorController = TextEditingController(text: vehicle.color);
    final fuelController = TextEditingController(text: vehicle.fuelType);
    final notesController = TextEditingController(text: vehicle.notes ?? '');

    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('تعديل السيارة'),
        content: SingleChildScrollView(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              TextField(
                controller: plateController,
                decoration: const InputDecoration(labelText: 'رقم اللوحة'),
              ),
              TextField(
                controller: modelController,
                decoration: const InputDecoration(labelText: 'الموديل'),
              ),
              TextField(
                controller: yearController,
                decoration: const InputDecoration(labelText: 'السنة'),
                keyboardType: TextInputType.number,
              ),
              TextField(
                controller: colorController,
                decoration: const InputDecoration(labelText: 'اللون'),
              ),
              TextField(
                controller: fuelController,
                decoration: const InputDecoration(labelText: 'نوع الوقود'),
              ),
              TextField(
                controller: notesController,
                decoration: const InputDecoration(labelText: 'ملاحظات'),
              ),
            ],
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('إلغاء'),
          ),
          TextButton(
            onPressed: () async {
              final updatedVehicle = Vehicle(
                id: vehicle.id,
                customerId: vehicle.customerId,
                plateNumber: plateController.text,
                model: modelController.text,
                year: int.tryParse(yearController.text) ?? vehicle.year,
                color: colorController.text,
                fuelType: fuelController.text,
                notes: notesController.text,
                createdAt: vehicle.createdAt,
                updatedAt: DateTime.now(),
              );
              try {
                await ref.read(vehicleServiceProvider).updateVehicle(vehicle.id, updatedVehicle);
                ref.invalidate(vehiclesProvider);
                Navigator.pop(context);
              } catch (e) {
                ScaffoldMessenger.of(context).showSnackBar(
                  SnackBar(content: Text('Error: $e')),
                );
              }
            },
            child: const Text('حفظ'),
          ),
        ],
      ),
    );
  }

  void _showQRDialog(BuildContext context, Vehicle vehicle) {
    final trackingUrl = 'https://garage-management.pages.dev/track/${vehicle.id}';
    
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('QR Code - تتبع السيارة'),
        content: SingleChildScrollView(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Text(
                '${vehicle.model} - ${vehicle.plateNumber}',
                style: const TextStyle(fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 16),
              QrImageView(
                data: trackingUrl,
                version: QrVersions.auto,
                size: 250.0,
              ),
              const SizedBox(height: 16),
              SelectableText(
                trackingUrl,
                style: const TextStyle(fontSize: 12, color: Colors.grey),
              ),
            ],
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('إغلاق'),
          ),
          ElevatedButton.icon(
            onPressed: () {
              Clipboard.setData(ClipboardData(text: trackingUrl));
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('تم نسخ الرابط!')),
              );
            },
            icon: const Icon(Icons.copy),
            label: const Text('نسخ الرابط'),
          ),
        ],
      ),
    );
  }

  void _showDeleteDialog(BuildContext context, Vehicle vehicle) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('حذف السيارة'),
        content: Text('هل أنت متأكد من حذف ${vehicle.model}؟'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('إلغاء'),
          ),
          TextButton(
            onPressed: () async {
              try {
                await ref.read(vehicleServiceProvider).deleteVehicle(vehicle.id);
                ref.invalidate(vehiclesProvider);
                Navigator.pop(context);
              } catch (e) {
                ScaffoldMessenger.of(context).showSnackBar(
                  SnackBar(content: Text('Error: $e')),
                );
              }
            },
            child: const Text('حذف'),
          ),
        ],
      ),
    );
  }
}
