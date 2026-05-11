import 'package:flutter/material.dart';
import 'package:dio/dio.dart';
import '../../utils/api_config.dart';

class TrackingScreen extends StatefulWidget {
  final String vehicleId;
  
  const TrackingScreen({super.key, required this.vehicleId});

  @override
  State<TrackingScreen> createState() => _TrackingScreenState();
}

class _TrackingScreenState extends State<TrackingScreen> {
  Map<String, dynamic>? vehicleData;
  bool isLoading = true;
  String? error;

  @override
  void initState() {
    super.initState();
    _fetchVehicleData();
  }

  Future<void> _fetchVehicleData() async {
    try {
      final dio = Dio(BaseOptions(baseUrl: ApiConfig.baseUrl));
      final response = await dio.get('/track/${widget.vehicleId}');
      setState(() {
        vehicleData = response.data;
        isLoading = false;
      });
    } on DioException catch (e) {
      setState(() {
        error = e.response?.data?['message'] ?? 'فشل في تحميل بيانات السيارة';
        isLoading = false;
      });
    } catch (e) {
      setState(() {
        error = 'حدث خطأ غير متوقع';
        isLoading = false;
      });
    }
  }

  String _getStatusText(String? status) {
    switch (status) {
      case 'RECEIVED':       return 'تم الاستلام';
      case 'INSPECTION':     return 'قيد الفحص';
      case 'IN_PROGRESS':    return 'جاري العمل';
      case 'WAITING_APPROVAL': return 'بانتظار الموافقة';
      case 'DONE':           return 'مكتمل ✓';
      case 'CANCELED':       return 'ملغي';
      // legacy values
      case 'PENDING':        return 'قيد الانتظار';
      case 'COMPLETED':      return 'مكتمل ✓';
      case 'CANCELLED':      return 'ملغي';
      default:               return status ?? 'غير معروف';
    }
  }

  Color _getStatusColor(String? status) {
    switch (status) {
      case 'RECEIVED':         return const Color(0xFF3B82F6);
      case 'INSPECTION':       return const Color(0xFFA855F7);
      case 'IN_PROGRESS':      return const Color(0xFFF59E0B);
      case 'WAITING_APPROVAL': return const Color(0xFFF97316);
      case 'DONE':             return const Color(0xFF10B981);
      case 'CANCELED':         return const Color(0xFFEF4444);
      case 'PENDING':          return const Color(0xFFF59E0B);
      case 'COMPLETED':        return const Color(0xFF10B981);
      case 'CANCELLED':        return const Color(0xFFEF4444);
      default:                 return Colors.grey;
    }
  }

  IconData _getStatusIcon(String? status) {
    switch (status) {
      case 'RECEIVED':         return Icons.inbox;
      case 'INSPECTION':       return Icons.search;
      case 'IN_PROGRESS':      return Icons.build;
      case 'WAITING_APPROVAL': return Icons.pending_actions;
      case 'DONE':             return Icons.check_circle;
      case 'CANCELED':         return Icons.cancel;
      default:                 return Icons.info;
    }
  }

  int _getStatusStep(String? status) {
    switch (status) {
      case 'RECEIVED':         return 0;
      case 'INSPECTION':       return 1;
      case 'IN_PROGRESS':      return 2;
      case 'WAITING_APPROVAL': return 3;
      case 'DONE':             return 4;
      default:                 return 0;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF5F5F5),
      body: isLoading
          ? const Center(child: CircularProgressIndicator())
          : error != null
              ? _buildErrorWidget()
              : _buildTrackingWidget(),
    );
  }

  Widget _buildErrorWidget() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          const Icon(Icons.error_outline, size: 64, color: Colors.red),
          const SizedBox(height: 16),
          Text(
            error!,
            style: const TextStyle(fontSize: 18, color: Colors.red),
          ),
          const SizedBox(height: 16),
          ElevatedButton(
            onPressed: _fetchVehicleData,
            child: const Text('إعادة المحاولة'),
          ),
        ],
      ),
    );
  }

  Widget _buildTrackingWidget() {
    final vehicle = vehicleData!;
    final customer = vehicle['customer'];
    final bookings = vehicle['bookings'] as List? ?? [];
    final latestBooking = bookings.isNotEmpty ? bookings.first : null;
    final currentStatus = latestBooking?['status'] ?? 'RECEIVED';

    return Directionality(
      textDirection: TextDirection.rtl,
      child: SingleChildScrollView(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            _buildHeader(currentStatus),
            Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  _buildStatusTimeline(currentStatus),
                  const SizedBox(height: 16),
                  _buildVehicleInfoCard(vehicle, customer),
                  const SizedBox(height: 16),
                  if (latestBooking != null) ...[
                    _buildBookingCard(latestBooking),
                    const SizedBox(height: 16),
                  ],
                  _buildContactCard(customer),
                  const SizedBox(height: 24),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildHeader(String status) {
    final color = _getStatusColor(status);
    final icon = _getStatusIcon(status);
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.fromLTRB(20, 52, 20, 24),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [color, color.withOpacity(0.7)],
          begin: Alignment.topRight,
          end: Alignment.bottomLeft,
        ),
      ),
      child: Column(
        children: [
          Icon(icon, size: 56, color: Colors.white),
          const SizedBox(height: 14),
          const Text(
            'AUTO RENEW',
            style: TextStyle(
              fontSize: 13,
              fontWeight: FontWeight.w600,
              color: Colors.white70,
              letterSpacing: 3,
            ),
          ),
          const SizedBox(height: 6),
          Text(
            _getStatusText(status),
            style: const TextStyle(
              fontSize: 26,
              fontWeight: FontWeight.bold,
              color: Colors.white,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            'حالة سيارتك الحالية في الورشة',
            style: TextStyle(
              fontSize: 13,
              color: Colors.white.withOpacity(0.8),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildStatusTimeline(String currentStatus) {
    const steps = ['RECEIVED', 'INSPECTION', 'IN_PROGRESS', 'WAITING_APPROVAL', 'DONE'];
    const labels = ['استلام', 'فحص', 'عمل', 'موافقة', 'إنجاز'];
    final currentStep = _getStatusStep(currentStatus);

    return Card(
      elevation: 3,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Row(
              children: [
                Icon(Icons.timeline, color: Color(0xFF1976D2)),
                SizedBox(width: 8),
                Text('مسار الخدمة', style: TextStyle(
                  fontSize: 16, fontWeight: FontWeight.bold)),
              ],
            ),
            const SizedBox(height: 16),
            Row(
              children: List.generate(steps.length, (i) {
                final done = i <= currentStep;
                final active = i == currentStep;
                return Expanded(
                  child: Column(
                    children: [
                      Container(
                        width: 32, height: 32,
                        decoration: BoxDecoration(
                          color: done
                              ? _getStatusColor(steps[i])
                              : Colors.grey.shade200,
                          shape: BoxShape.circle,
                          border: active ? Border.all(
                            color: _getStatusColor(steps[i]),
                            width: 3) : null,
                        ),
                        child: Icon(
                          done ? Icons.check : Icons.circle,
                          size: done ? 18 : 8,
                          color: done ? Colors.white : Colors.grey.shade400,
                        ),
                      ),
                      const SizedBox(height: 6),
                      Text(labels[i],
                        style: TextStyle(
                          fontSize: 10,
                          fontWeight: active ? FontWeight.bold : FontWeight.normal,
                          color: done ? _getStatusColor(steps[i]) : Colors.grey,
                        ),
                      ),
                    ],
                  ),
                );
              }),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildVehicleInfoCard(Map<String, dynamic> vehicle, Map<String, dynamic>? customer) {
    return Card(
      elevation: 4,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                const Icon(Icons.directions_car, color: Color(0xFF1976D2)),
                const SizedBox(width: 8),
                const Text(
                  'معلومات السيارة',
                  style: TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ],
            ),
            const Divider(height: 24),
            _buildInfoRow('رقم اللوحة:', vehicle['plateNumber'] ?? '-'),
            _buildInfoRow('الموديل:', vehicle['model'] ?? '-'),
            _buildInfoRow('السنة:', vehicle['year']?.toString() ?? '-'),
            _buildInfoRow('اللون:', vehicle['color'] ?? '-'),
            if (customer != null)
              _buildInfoRow('المالك:', customer['name'] ?? '-'),
          ],
        ),
      ),
    );
  }

  Widget _buildStatusCard(Map<String, dynamic>? tracking, Map<String, dynamic>? booking) {
    final status = tracking?['currentStatus'] ?? tracking?['status'] ?? booking?['status'] ?? 'RECEIVED';
    final statusText = _getStatusText(status);
    final statusColor = _getStatusColor(status);

    return Card(
      elevation: 4,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Icon(Icons.update, color: statusColor),
                const SizedBox(width: 8),
                const Text(
                  'حالة الصيانة',
                  style: TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ],
            ),
            const Divider(height: 24),
            Center(
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
                decoration: BoxDecoration(
                  color: statusColor.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(24),
                  border: Border.all(color: statusColor, width: 2),
                ),
                child: Text(
                  statusText,
                  style: TextStyle(
                    fontSize: 20,
                    fontWeight: FontWeight.bold,
                    color: statusColor,
                  ),
                ),
              ),
            ),
            if (tracking?['location'] != null)
              Padding(
                padding: const EdgeInsets.only(top: 12),
                child: _buildInfoRow('الموقع:', tracking!['location']),
              ),
          ],
        ),
      ),
    );
  }

  Widget _buildBookingCard(Map<String, dynamic> booking) {
    return Card(
      elevation: 4,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                const Icon(Icons.build, color: Color(0xFF1976D2)),
                const SizedBox(width: 8),
                const Text(
                  'تفاصيل الخدمة',
                  style: TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ],
            ),
            const Divider(height: 24),
            _buildInfoRow('الخدمة:', booking['serviceType'] ?? booking['serviceDescription'] ?? '-'),
            _buildInfoRow('التاريخ:', _formatDate(booking['scheduledAt'] ?? booking['scheduledDate'])),
            _buildInfoRow('الحالة:', _getStatusText(booking['status'])),
            if (booking['notes'] != null && booking['notes'].toString().isNotEmpty)
              _buildInfoRow('ملاحظات:', booking['notes']),
            if (booking['technician'] != null)
              _buildInfoRow('الفني:', booking['technician']['name'] ?? '-'),
          ],
        ),
      ),
    );
  }

  Widget _buildContactCard(Map<String, dynamic>? customer) {
    if (customer == null) return const SizedBox.shrink();

    return Card(
      elevation: 4,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                const Icon(Icons.contact_phone, color: Color(0xFF1976D2)),
                const SizedBox(width: 8),
                const Text(
                  'معلومات التواصل',
                  style: TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ],
            ),
            const Divider(height: 24),
            _buildInfoRow('الاسم:', customer['name'] ?? '-'),
            _buildInfoRow('الهاتف:', customer['phone'] ?? '-'),
          ],
        ),
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
              textAlign: TextAlign.left,
            ),
          ),
        ],
      ),
    );
  }

  String _formatDate(String? dateStr) {
    if (dateStr == null) return '-';
    try {
      final date = DateTime.parse(dateStr);
      return '${date.day}/${date.month}/${date.year}';
    } catch (e) {
      return dateStr;
    }
  }
}
