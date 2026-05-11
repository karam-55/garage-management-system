import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:dio/dio.dart';
import '../../models/vehicle.dart';
import '../../utils/api_config.dart';

class VehicleDetailScreen extends ConsumerStatefulWidget {
  final Vehicle vehicle;

  const VehicleDetailScreen({super.key, required this.vehicle});

  @override
  ConsumerState<VehicleDetailScreen> createState() => _VehicleDetailScreenState();
}

class _VehicleDetailScreenState extends ConsumerState<VehicleDetailScreen> {
  bool _isReceived = false;
  bool _isUpdating = false;
  String? _status;

  @override
  void initState() {
    super.initState();
    _status = 'PENDING';
  }

  Future<void> _receiveVehicle() async {
    setState(() {
      _isUpdating = true;
    });

    try {
      final dio = Dio(BaseOptions(baseUrl: ApiConfig.baseUrl));
      
      // Update booking status to IN_PROGRESS
      // This would need the booking ID - for now we'll show a dialog
      await Future.delayed(const Duration(seconds: 1)); // Simulate API call
      
      setState(() {
        _isReceived = true;
        _status = 'IN_PROGRESS';
        _isUpdating = false;
      });

      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('تم استلام السيارة بنجاح!'),
          backgroundColor: Colors.green,
        ),
      );
    } catch (e) {
      setState(() {
        _isUpdating = false;
      });
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('خطأ: $e'),
          backgroundColor: Colors.red,
        ),
      );
    }
  }

  Future<void> _updateStatus(String newStatus) async {
    setState(() {
      _isUpdating = true;
    });

    try {
      final dio = Dio(BaseOptions(baseUrl: ApiConfig.baseUrl));
      
      // Update vehicle tracking status
      await dio.patch('/vehicle-tracking/${widget.vehicle.id}', data: {
        'status': newStatus,
      });

      setState(() {
        _status = newStatus;
        _isUpdating = false;
      });

      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('تم تحديث الحالة إلى ${_getStatusText(newStatus)}'),
          backgroundColor: Colors.green,
        ),
      );
    } catch (e) {
      setState(() {
        _isUpdating = false;
      });
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('خطأ: $e'),
          backgroundColor: Colors.red,
        ),
      );
    }
  }

  String _getStatusText(String? status) {
    switch (status) {
      case 'PENDING':
        return 'قيد الانتظار';
      case 'IN_PROGRESS':
        return 'جاري العمل';
      case 'COMPLETED':
        return 'مكتمل';
      case 'CANCELLED':
        return 'ملغي';
      default:
        return 'غير معروف';
    }
  }

  Color _getStatusColor(String? status) {
    switch (status) {
      case 'PENDING':
        return Colors.orange;
      case 'IN_PROGRESS':
        return Colors.blue;
      case 'COMPLETED':
        return Colors.green;
      case 'CANCELLED':
        return Colors.red;
      default:
        return Colors.grey;
    }
  }

  @override
  Widget build(BuildContext context) {
    final vehicle = widget.vehicle;

    return Scaffold(
      appBar: AppBar(
        title: const Text('تفاصيل السيارة'),
        backgroundColor: Colors.orange,
      ),
      body: _isUpdating
          ? const Center(child: CircularProgressIndicator())
          : SingleChildScrollView(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Vehicle Info Card
                  _buildInfoCard(vehicle),
                  const SizedBox(height: 16),

                  // Status Card
                  _buildStatusCard(),
                  const SizedBox(height: 16),

                  // Action Buttons
                  if (!_isReceived)
                    _buildReceiveButton()
                  else
                    _buildStatusButtons(),

                  const SizedBox(height: 16),

                  // Services Section
                  _buildServicesSection(),
                ],
              ),
            ),
    );
  }

  Widget _buildInfoCard(Vehicle vehicle) {
    return Card(
      elevation: 4,
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                const Icon(Icons.directions_car, color: Colors.orange, size: 30),
                const SizedBox(width: 8),
                Text(
                  vehicle.model,
                  style: const TextStyle(
                    fontSize: 20,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ],
            ),
            const Divider(height: 24),
            _buildInfoRow('رقم اللوحة:', vehicle.plateNumber),
            _buildInfoRow('السنة:', vehicle.year.toString()),
            _buildInfoRow('اللون:', vehicle.color),
            _buildInfoRow('نوع الوقود:', vehicle.fuelType),
            if (vehicle.notes != null)
              _buildInfoRow('ملاحظات:', vehicle.notes!),
          ],
        ),
      ),
    );
  }

  Widget _buildStatusCard() {
    return Card(
      elevation: 4,
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          children: [
            const Text(
              'الحالة الحالية',
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 12),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
              decoration: BoxDecoration(
                color: _getStatusColor(_status).withOpacity(0.1),
                borderRadius: BorderRadius.circular(24),
                border: Border.all(color: _getStatusColor(_status), width: 2),
              ),
              child: Text(
                _getStatusText(_status),
                style: TextStyle(
                  fontSize: 20,
                  fontWeight: FontWeight.bold,
                  color: _getStatusColor(_status),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildReceiveButton() {
    return SizedBox(
      width: double.infinity,
      child: ElevatedButton.icon(
        onPressed: _receiveVehicle,
        icon: const Icon(Icons.car_rental, size: 28),
        label: const Text(
          'استلام السيارة',
          style: TextStyle(fontSize: 18),
        ),
        style: ElevatedButton.styleFrom(
          backgroundColor: Colors.orange,
          foregroundColor: Colors.white,
          padding: const EdgeInsets.symmetric(vertical: 16),
        ),
      ),
    );
  }

  Widget _buildStatusButtons() {
    return Column(
      children: [
        if (_status != 'IN_PROGRESS')
          _buildStatusButton(
            'بدء العمل',
            Icons.play_circle,
            Colors.blue,
            () => _updateStatus('IN_PROGRESS'),
          ),
        if (_status == 'IN_PROGRESS')
          _buildStatusButton(
            'إكمال الصيانة',
            Icons.check_circle,
            Colors.green,
            () => _updateStatus('COMPLETED'),
          ),
        _buildStatusButton(
          'إلغاء',
          Icons.cancel,
          Colors.red,
          () => _updateStatus('CANCELLED'),
        ),
      ],
    );
  }

  Widget _buildStatusButton(
    String label,
    IconData icon,
    Color color,
    VoidCallback onPressed,
  ) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: SizedBox(
        width: double.infinity,
        child: ElevatedButton.icon(
          onPressed: onPressed,
          icon: Icon(icon),
          label: Text(label),
          style: ElevatedButton.styleFrom(
            backgroundColor: color,
            foregroundColor: Colors.white,
            padding: const EdgeInsets.symmetric(vertical: 12),
          ),
        ),
      ),
    );
  }

  Widget _buildServicesSection() {
    return Card(
      elevation: 4,
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text(
                  'الخدمات المطلوبة',
                  style: TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                ElevatedButton.icon(
                  onPressed: () {
                    _showAddServiceDialog();
                  },
                  icon: const Icon(Icons.add),
                  label: const Text('إضافة'),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.orange,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 12),
            const ListTile(
              leading: Icon(Icons.build, color: Colors.orange),
              title: Text('تغيير زيت'),
              subtitle: Text('زيت محرك + فلتر'),
            ),
            const ListTile(
              leading: Icon(Icons.tire_repair, color: Colors.orange),
              title: Text('فحص كاوتش'),
              subtitle: Text('تدوير إطارات'),
            ),
          ],
        ),
      ),
    );
  }

  void _showAddServiceDialog() {
    final serviceController = TextEditingController();
    final descriptionController = TextEditingController();

    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('إضافة خدمة جديدة'),
        content: SingleChildScrollView(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              TextField(
                controller: serviceController,
                decoration: const InputDecoration(labelText: 'اسم الخدمة'),
              ),
              TextField(
                controller: descriptionController,
                decoration: const InputDecoration(labelText: 'الوصف'),
                maxLines: 2,
              ),
            ],
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('إلغاء'),
          ),
          ElevatedButton(
            onPressed: () {
              // Add service logic here
              Navigator.pop(context);
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('تم إضافة الخدمة!')),
              );
            },
            child: const Text('إضافة'),
          ),
        ],
      ),
    );
  }

  Widget _buildInfoRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        children: [
          Text(
            label,
            style: const TextStyle(
              fontSize: 14,
              fontWeight: FontWeight.w500,
              color: Colors.grey,
            ),
          ),
          const SizedBox(width: 8),
          Expanded(
            child: Text(
              value,
              style: const TextStyle(
                fontSize: 14,
                fontWeight: FontWeight.bold,
              ),
            ),
          ),
        ],
      ),
    );
  }
}
