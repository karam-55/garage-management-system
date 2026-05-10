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
    final tracking = vehicle['vehicleTracking'];
    final bookings = vehicle['bookings'] as List? ?? [];
    final latestBooking = bookings.isNotEmpty ? bookings.first : null;

    return Directionality(
      textDirection: TextDirection.rtl,
      child: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Header
            _buildHeader(),
            const SizedBox(height: 24),

            // Vehicle Info Card
            _buildVehicleInfoCard(vehicle, customer),
            const SizedBox(height: 16),

            // Current Status Card
            _buildStatusCard(tracking, latestBooking),
            const SizedBox(height: 16),

            // Services/Booking Details
            if (latestBooking != null)
              _buildBookingCard(latestBooking),

            const SizedBox(height: 24),

            // Contact Info
            _buildContactCard(customer),
          ],
        ),
      ),
    );
  }

  Widget _buildHeader() {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          colors: [Color(0xFF1976D2), Color(0xFF0D47A1)],
          begin: Alignment.topRight,
          end: Alignment.bottomLeft,
        ),
        borderRadius: BorderRadius.circular(16),
      ),
      child: Column(
        children: [
          const Icon(
            Icons.local_car_wash,
            size: 48,
            color: Colors.white,
          ),
          const SizedBox(height: 12),
          const Text(
            'نظام تتبع السيارات',
            style: TextStyle(
              fontSize: 24,
              fontWeight: FontWeight.bold,
              color: Colors.white,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            'تتبع حالة سيارتك في الورشة',
            style: TextStyle(
              fontSize: 14,
              color: Colors.white.withOpacity(0.8),
            ),
          ),
        ],
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
    final status = tracking?['status'] ?? booking?['status'] ?? 'PENDING';
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
            _buildInfoRow('الوصف:', booking['serviceDescription'] ?? '-'),
            _buildInfoRow('التاريخ:', _formatDate(booking['scheduledDate'])),
            _buildInfoRow('الحالة:', _getStatusText(booking['status'])),
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
            if (customer['email'] != null)
              _buildInfoRow('البريد:', customer['email']),
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
