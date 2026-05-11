import 'package:flutter/material.dart';
import 'package:flutter/foundation.dart';
import 'package:dio/dio.dart';
import 'package:qr_flutter/qr_flutter.dart';
import '../../utils/api_config.dart';

class TrackingScreen extends StatefulWidget {
  final String vehicleId;
  final String? token;

  const TrackingScreen({super.key, required this.vehicleId, this.token});

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

  final Map<String, bool> _approvalLoading = {};

  Future<void> _fetchVehicleData() async {
    try {
      final dio = Dio(BaseOptions(baseUrl: ApiConfig.baseUrl));
      final token = widget.token;
      final url = token != null
          ? '/track/${widget.vehicleId}?token=$token'
          : '/track/${widget.vehicleId}';
      debugPrint('[TrackingScreen] Fetching: ${ApiConfig.baseUrl}$url');
      final response = await dio.get(url);
      debugPrint('[TrackingScreen] Response: ${response.statusCode}');
      setState(() {
        vehicleData = response.data;
        isLoading = false;
      });
    } on DioException catch (e) {
      debugPrint('[TrackingScreen] DioError: ${e.response?.statusCode} - ${e.message}');
      setState(() {
        error = e.response?.data?['message'] ??
            e.response?.data?['error'] ??
            'فشل في تحميل بيانات السيارة (${e.response?.statusCode ?? 'network'})';
        isLoading = false;
      });
    } catch (e) {
      debugPrint('[TrackingScreen] Error: $e');
      setState(() {
        error = 'حدث خطأ غير متوقع: $e';
        isLoading = false;
      });
    }
  }

  Future<void> _approveService(String serviceId, bool approve) async {
    setState(() => _approvalLoading[serviceId] = true);
    try {
      final dio = Dio(BaseOptions(baseUrl: ApiConfig.baseUrl));
      final token = widget.token;
      await dio.post(
        '/track/${widget.vehicleId}/approve-service?token=$token',
        data: {'serviceId': serviceId, 'approve': approve},
      );
      await _fetchVehicleData();
    } catch (_) {
      setState(() => _approvalLoading[serviceId] = false);
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
    final services = (latestBooking?['services'] as List?)
            ?.cast<Map<String, dynamic>>() ??
        [];
    final additionalServices =
        (latestBooking?['additionalServices'] as List?)
            ?.cast<Map<String, dynamic>>() ??
        [];
    final invoices =
        (latestBooking?['invoices'] as List?)?.cast<Map<String, dynamic>>() ??
            [];
    final qrToken = latestBooking?['qrToken'] as String?;
    final vehicleId = vehicle['id'] as String?;
    final qrUrl = qrToken != null && vehicleId != null
        ? '${Uri.base.origin}/track/$vehicleId?token=$qrToken'
        : null;

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
                  _buildContactCard(customer),
                  const SizedBox(height: 16),
                  if (services.isNotEmpty) ...[
                    _buildServicesCard(services),
                    const SizedBox(height: 16),
                  ],
                  if (additionalServices.isNotEmpty) ...[
                    _buildAdditionalServicesCard(additionalServices),
                    const SizedBox(height: 16),
                  ],
                  if (invoices.isNotEmpty) ...[
                    _buildInvoiceCard(invoices.first),
                    const SizedBox(height: 16),
                  ],
                  if (latestBooking != null && latestBooking['notes'] != null) ...[
                    _buildNotesCard(latestBooking['notes']),
                    const SizedBox(height: 16),
                  ],
                  if (qrUrl != null) ...[
                    _buildQrCard(qrUrl),
                    const SizedBox(height: 16),
                  ],
                  const SizedBox(height: 8),
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

  Widget _buildServicesCard(List<Map<String, dynamic>> services) {
    return Card(
      elevation: 3,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Row(children: [
              Icon(Icons.build_circle_outlined, color: Color(0xFF1976D2)),
              SizedBox(width: 8),
              Text('الخدمات المطلوبة',
                  style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
            ]),
            const Divider(height: 20),
            ...services.map((s) => Padding(
                  padding: const EdgeInsets.symmetric(vertical: 4),
                  child: Row(
                    children: [
                      const Icon(Icons.check_circle,
                          size: 16, color: Color(0xFF4CAF50)),
                      const SizedBox(width: 8),
                      Expanded(
                          child: Text(s['name'] ?? '-',
                              style: const TextStyle(fontSize: 14))),
                      if ((s['price'] as num?)?.toDouble() != 0.0 &&
                          s['price'] != null)
                        Text('${s['price']} ر.س',
                            style: const TextStyle(
                                fontSize: 13, color: Color(0xFF1976D2))),
                    ],
                  ),
                )),
          ],
        ),
      ),
    );
  }

  Widget _buildAdditionalServicesCard(List<Map<String, dynamic>> services) {
    final hasPending = services.any((s) => s['status'] == 'PENDING');
    return Card(
      elevation: 3,
      color: hasPending
          ? const Color(0xFFFFF8E1)
          : null,
      shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(12),
          side: hasPending
              ? const BorderSide(color: Color(0xFFF9A825), width: 1.5)
              : BorderSide.none),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(children: [
              Icon(Icons.add_circle_outline,
                  color: hasPending
                      ? const Color(0xFFF9A825)
                      : const Color(0xFF1976D2)),
              const SizedBox(width: 8),
              const Expanded(
                  child: Text('خدمات إضافية (تحتاج موافقة)',
                      style: TextStyle(
                          fontSize: 16, fontWeight: FontWeight.bold))),
              if (hasPending)
                Container(
                  padding:
                      const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                  decoration: BoxDecoration(
                    color: const Color(0xFFF9A825).withOpacity(0.2),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: const Text('يحتاج موافقتك',
                      style: TextStyle(
                          fontSize: 11,
                          color: Color(0xFFE65100),
                          fontWeight: FontWeight.w600)),
                ),
            ]),
            const Divider(height: 20),
            ...services.map((s) {
              final status = s['status'] as String? ?? 'PENDING';
              final serviceId = s['id'] as String? ?? '';
              final isPending = status == 'PENDING';
              final isLoading = _approvalLoading[serviceId] == true;
              return Container(
                margin: const EdgeInsets.only(bottom: 10),
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: isPending
                      ? Colors.white
                      : status == 'APPROVED'
                          ? const Color(0xFFE8F5E9)
                          : const Color(0xFFFFEBEE),
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(
                    color: isPending
                        ? const Color(0xFFFFB300)
                        : status == 'APPROVED'
                            ? const Color(0xFF81C784)
                            : const Color(0xFFEF9A9A),
                  ),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Expanded(
                            child: Text(s['name'] ?? '-',
                                style: const TextStyle(
                                    fontSize: 14,
                                    fontWeight: FontWeight.w600))),
                        if (s['estimatedPrice'] != null)
                          Text('~${s['estimatedPrice']} ر.س',
                              style: const TextStyle(
                                  fontSize: 13,
                                  color: Color(0xFF1976D2))),
                      ],
                    ),
                    const SizedBox(height: 8),
                    if (isPending && widget.token != null)
                      Row(
                        children: [
                          Expanded(
                            child: ElevatedButton.icon(
                              onPressed: isLoading
                                  ? null
                                  : () => _approveService(serviceId, true),
                              icon: isLoading
                                  ? const SizedBox(
                                      width: 14,
                                      height: 14,
                                      child: CircularProgressIndicator(
                                          strokeWidth: 2))
                                  : const Icon(Icons.check, size: 16),
                              label: const Text('موافقة',
                                  style: TextStyle(fontSize: 13)),
                              style: ElevatedButton.styleFrom(
                                backgroundColor: const Color(0xFF4CAF50),
                                foregroundColor: Colors.white,
                                padding: const EdgeInsets.symmetric(
                                    vertical: 8),
                                shape: RoundedRectangleBorder(
                                    borderRadius:
                                        BorderRadius.circular(8)),
                              ),
                            ),
                          ),
                          const SizedBox(width: 8),
                          Expanded(
                            child: OutlinedButton.icon(
                              onPressed: isLoading
                                  ? null
                                  : () => _approveService(serviceId, false),
                              icon: const Icon(Icons.close, size: 16),
                              label: const Text('رفض',
                                  style: TextStyle(fontSize: 13)),
                              style: OutlinedButton.styleFrom(
                                foregroundColor: const Color(0xFFEF5350),
                                side: const BorderSide(
                                    color: Color(0xFFEF5350)),
                                padding: const EdgeInsets.symmetric(
                                    vertical: 8),
                                shape: RoundedRectangleBorder(
                                    borderRadius:
                                        BorderRadius.circular(8)),
                              ),
                            ),
                          ),
                        ],
                      )
                    else
                      Row(
                        children: [
                          Icon(
                            status == 'APPROVED'
                                ? Icons.check_circle
                                : Icons.cancel,
                            size: 16,
                            color: status == 'APPROVED'
                                ? const Color(0xFF4CAF50)
                                : const Color(0xFFEF5350),
                          ),
                          const SizedBox(width: 6),
                          Text(
                            status == 'APPROVED' ? 'تمت الموافقة' : 'تم الرفض',
                            style: TextStyle(
                              fontSize: 13,
                              color: status == 'APPROVED'
                                  ? const Color(0xFF4CAF50)
                                  : const Color(0xFFEF5350),
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                        ],
                      ),
                  ],
                ),
              );
            }),
          ],
        ),
      ),
    );
  }

  Widget _buildInvoiceCard(Map<String, dynamic> invoice) {
    return Card(
      elevation: 3,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Row(children: [
              Icon(Icons.receipt_long, color: Color(0xFF1976D2)),
              SizedBox(width: 8),
              Text('الفاتورة',
                  style:
                      TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
            ]),
            const Divider(height: 20),
            if (invoice['invoiceNumber'] != null)
              _buildInfoRow('رقم الفاتورة:', invoice['invoiceNumber']),
            if (invoice['totalAmount'] != null)
              _buildInfoRow(
                  'المبلغ الإجمالي:', '${invoice['totalAmount']} ر.س'),
            if (invoice['status'] != null)
              _buildInfoRow(
                  'حالة الدفع:',
                  invoice['status'] == 'PAID'
                      ? 'مدفوعة ✓'
                      : invoice['status'] == 'PENDING'
                          ? 'غير مدفوعة'
                          : invoice['status']),
            if (invoice['paidAt'] != null)
              _buildInfoRow(
                  'تاريخ الدفع:', _formatDate(invoice['paidAt'])),
          ],
        ),
      ),
    );
  }

  Widget _buildNotesCard(String notes) {
    return Card(
      elevation: 2,
      color: const Color(0xFFF3E5F5),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Icon(Icons.notes, color: Color(0xFF7B1FA2), size: 22),
            const SizedBox(width: 10),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text('ملاحظات',
                      style: TextStyle(
                          fontWeight: FontWeight.bold,
                          color: Color(0xFF7B1FA2))),
                  const SizedBox(height: 4),
                  Text(notes,
                      style: const TextStyle(fontSize: 13)),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildQrCard(String qrUrl) {
    return Card(
      elevation: 3,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          children: [
            const Row(children: [
              Icon(Icons.qr_code_2, color: Color(0xFF1976D2)),
              SizedBox(width: 8),
              Text('رمز QR للتتبع',
                  style:
                      TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
            ]),
            const SizedBox(height: 16),
            Container(
              padding: const EdgeInsets.all(10),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(8),
              ),
              child: QrImageView(
                data: qrUrl,
                version: QrVersions.auto,
                size: 160,
              ),
            ),
            const SizedBox(height: 8),
            const Text('شارك هذا الرمز لمتابعة حالة سيارتك',
                textAlign: TextAlign.center,
                style: TextStyle(fontSize: 11, color: Colors.grey)),
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
