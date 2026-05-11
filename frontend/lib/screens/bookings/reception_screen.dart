// ignore: avoid_web_libraries_in_flutter
import 'dart:html' as html;
import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:qr_flutter/qr_flutter.dart';
import '../../core/app_theme.dart';
import '../../models/customer.dart';
import '../../models/vehicle.dart';
import '../../services/api_service.dart';
import '../../services/customer_service.dart';
import '../../services/vehicle_service.dart';
import '../../services/notification_service.dart';

// ── predefined services ────────────────────────────────────────────────────
const _kServices = [
  'تغيير زيت المحرك',
  'فحص عام شامل',
  'فحص وإصلاح الفرامل',
  'تغيير إطارات',
  'فحص وإصلاح التكييف',
  'فحص الكهرباء والبطارية',
  'غسيل السيارة',
  'تغيير فلتر الهواء',
  'إصلاح التوجيه',
  'كمبيوتر وتشخيص الأعطال',
  'تغيير الشمعات',
  'فحص ناقل الحركة',
];

class ReceptionScreen extends ConsumerStatefulWidget {
  const ReceptionScreen({super.key});

  @override
  ConsumerState<ReceptionScreen> createState() => _ReceptionScreenState();
}

class _ReceptionScreenState extends ConsumerState<ReceptionScreen> {
  int _step = 0;
  bool _saving = false;

  // ── Step 1: Customer ──────────────────────────────────────────────────────
  Customer? _selectedCustomer;
  final _nameCtrl = TextEditingController();
  final _phoneCtrl = TextEditingController();
  final _phone2Ctrl = TextEditingController();
  bool _newCustomer = true;

  // ── Step 2: Vehicle ───────────────────────────────────────────────────────
  Vehicle? _selectedVehicle;
  final _plateCtrl = TextEditingController();
  final _modelCtrl = TextEditingController();
  final _yearCtrl = TextEditingController();
  final _colorCtrl = TextEditingController();
  final _fuelCtrl = TextEditingController();
  final _chassisCtrl = TextEditingController();
  bool _newVehicle = true;

  // ── Step 3: Services ──────────────────────────────────────────────────────
  final Set<String> _selectedServices = {};
  final _customServiceCtrl = TextEditingController();
  final List<String> _customServices = [];
  final _notesCtrl = TextEditingController();

  // ── Result ────────────────────────────────────────────────────────────────
  Map<String, dynamic>? _createdBooking;

  @override
  void dispose() {
    _nameCtrl.dispose();
    _phoneCtrl.dispose();
    _phone2Ctrl.dispose();
    _plateCtrl.dispose();
    _modelCtrl.dispose();
    _yearCtrl.dispose();
    _colorCtrl.dispose();
    _fuelCtrl.dispose();
    _chassisCtrl.dispose();
    _customServiceCtrl.dispose();
    _notesCtrl.dispose();
    super.dispose();
  }

  // ── Helpers ───────────────────────────────────────────────────────────────
  List<String> get _allServices =>
      [..._selectedServices.where(_kServices.contains), ..._customServices];

  Future<void> _searchCustomer() async {
    final phone = _phoneCtrl.text.trim();
    if (phone.isEmpty) return;
    try {
      final customers = await CustomerService().getAllCustomers();
      final match = customers.where((c) => c.phone == phone).toList();
      if (match.isNotEmpty && mounted) {
        setState(() {
          _selectedCustomer = match.first;
          _newCustomer = false;
          _nameCtrl.text = match.first.name;
          _phone2Ctrl.text = match.first.secondaryPhone ?? '';
        });
        showSuccessToast(context, 'تم العثور على العميل: ${match.first.name}');
      }
    } catch (_) {}
  }

  Future<void> _searchVehicle() async {
    final plate = _plateCtrl.text.trim();
    if (plate.isEmpty) return;
    try {
      final vehicles = await VehicleService().getAllVehicles();
      final match =
          vehicles.where((v) => v.plateNumber.toLowerCase() == plate.toLowerCase()).toList();
      if (match.isNotEmpty && mounted) {
        setState(() {
          _selectedVehicle = match.first;
          _newVehicle = false;
          _modelCtrl.text = match.first.model;
          _yearCtrl.text = match.first.year.toString();
          _colorCtrl.text = match.first.color;
          _fuelCtrl.text = match.first.fuelType;
        });
        showSuccessToast(context, 'تم العثور على السيارة: ${match.first.model}');
      }
    } catch (_) {}
  }

  Future<void> _save() async {
    setState(() => _saving = true);
    try {
      final api = ApiService();
      String customerId;
      String vehicleId;

      // 1. Create or use customer
      if (_newCustomer) {
        final res = await api.post('/customers', {
          'name': _nameCtrl.text.trim(),
          'phone': _phoneCtrl.text.trim(),
          if (_phone2Ctrl.text.trim().isNotEmpty)
            'secondaryPhone': _phone2Ctrl.text.trim(),
        });
        customerId = res.data['id'];
      } else {
        customerId = _selectedCustomer!.id;
      }

      // 2. Create or use vehicle
      if (_newVehicle) {
        final res = await api.post('/vehicles', {
          'customerId': customerId,
          'plateNumber': _plateCtrl.text.trim(),
          'model': _modelCtrl.text.trim(),
          'year': int.tryParse(_yearCtrl.text.trim()) ?? DateTime.now().year,
          'color': _colorCtrl.text.trim(),
          'fuelType': _fuelCtrl.text.trim().isEmpty ? 'بنزين' : _fuelCtrl.text.trim(),
          if (_chassisCtrl.text.trim().isNotEmpty)
            'chassisNumber': _chassisCtrl.text.trim(),
        });
        vehicleId = res.data['id'];
      } else {
        vehicleId = _selectedVehicle!.id;
      }

      // 3. Build services list
      final allSvcs = _allServices;
      final serviceType = allSvcs.isNotEmpty ? allSvcs.join('، ') : 'صيانة عامة';
      final servicesJson = allSvcs.map((s) => {'name': s, 'price': 0}).toList();

      // 4. Create booking
      final bookingRes = await api.post('/bookings', {
        'customerId': customerId,
        'vehicleId': vehicleId,
        'serviceType': serviceType,
        'services': servicesJson,
        'scheduledAt': DateTime.now().toIso8601String(),
        'status': 'RECEIVED',
        if (_notesCtrl.text.trim().isNotEmpty) 'notes': _notesCtrl.text.trim(),
      });

      setState(() {
        _createdBooking = bookingRes.data;
        _step = 3;
      });
    } catch (e) {
      String msg = e.toString();
      try {
        // Extract server error message from DioException
        final dynamic de = e;
        final serverMsg = de.response?.data;
        if (serverMsg is Map) {
          msg = serverMsg['message']?.toString() ??
              serverMsg['error']?.toString() ??
              msg;
        } else if (serverMsg is String) {
          msg = serverMsg;
        }
      } catch (_) {}
      if (mounted) showErrorToast(context, msg);
    } finally {
      setState(() => _saving = false);
    }
  }

  // ── Build ─────────────────────────────────────────────────────────────────
  @override
  Widget build(BuildContext context) {
    return Directionality(
      textDirection: TextDirection.rtl,
      child: Scaffold(
        backgroundColor: AppColors.bgPrimary,
        appBar: AppBar(
          backgroundColor: AppColors.bgSecondary,
          elevation: 0,
          title: Text(
            _step == 3 ? 'تم الاستقبال ✓' : 'استقبال عميل جديد',
            style: AppTypography.headingSmall.copyWith(fontSize: 17),
          ),
          leading: _step < 3
              ? IconButton(
                  icon: const Icon(Icons.close),
                  onPressed: () => Navigator.pop(context),
                )
              : null,
        ),
        body: Column(
          children: [
            if (_step < 3) _buildStepper(),
            Expanded(
              child: SingleChildScrollView(
                padding: const EdgeInsets.all(20),
                child: _buildStepContent(),
              ),
            ),
            if (_step < 3) _buildBottomBar(),
          ],
        ),
      ),
    );
  }

  Widget _buildStepper() {
    final steps = ['العميل', 'السيارة', 'الخدمات'];
    return Container(
      color: AppColors.bgSecondary,
      padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
      child: Row(
        children: List.generate(steps.length, (i) {
          final done = i < _step;
          final active = i == _step;
          return Expanded(
            child: Row(
              children: [
                Container(
                  width: 28,
                  height: 28,
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    color: done
                        ? AppColors.success
                        : active
                            ? AppColors.primary
                            : AppColors.bgTertiary,
                  ),
                  child: Center(
                    child: done
                        ? const Icon(Icons.check, size: 14, color: Colors.white)
                        : Text('${i + 1}',
                            style: TextStyle(
                                color: active ? Colors.white : AppColors.textMuted,
                                fontSize: 12,
                                fontWeight: FontWeight.bold)),
                  ),
                ),
                const SizedBox(width: 6),
                Text(steps[i],
                    style: AppTypography.labelSmall.copyWith(
                        color: active ? AppColors.primary : AppColors.textMuted)),
                if (i < steps.length - 1) ...[
                  const Spacer(),
                  Container(height: 1, width: 24, color: AppColors.border),
                  const Spacer(),
                ],
              ],
            ),
          );
        }),
      ),
    );
  }

  Widget _buildStepContent() {
    switch (_step) {
      case 0:
        return _buildCustomerStep();
      case 1:
        return _buildVehicleStep();
      case 2:
        return _buildServicesStep();
      case 3:
        return _buildReceiptStep();
      default:
        return const SizedBox();
    }
  }

  // ── Step 0: Customer ──────────────────────────────────────────────────────
  Widget _buildCustomerStep() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        _sectionTitle('بيانات العميل', Icons.person_outline),
        const SizedBox(height: 16),
        Row(
          children: [
            Expanded(
              child: _field('رقم الهاتف *', Icons.phone_outlined, _phoneCtrl,
                  keyboardType: TextInputType.phone),
            ),
            const SizedBox(width: 12),
            ElevatedButton.icon(
              onPressed: _searchCustomer,
              icon: const Icon(Icons.search, size: 18),
              label: const Text('بحث'),
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.primary,
                foregroundColor: Colors.white,
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
                shape: RoundedRectangleBorder(
                    borderRadius: AppBorders.radiusMd),
              ),
            ),
          ],
        ),
        const SizedBox(height: 14),
        _field('اسم العميل *', Icons.badge_outlined, _nameCtrl),
        const SizedBox(height: 14),
        _field('هاتف ثانوي', Icons.phone_outlined, _phone2Ctrl,
            keyboardType: TextInputType.phone),
        if (!_newCustomer) ...[
          const SizedBox(height: 12),
          _infoChip('عميل موجود — سيتم استخدام بياناته', AppColors.success),
        ],
      ],
    );
  }

  // ── Step 1: Vehicle ───────────────────────────────────────────────────────
  Widget _buildVehicleStep() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        _sectionTitle('بيانات السيارة', Icons.directions_car_outlined),
        const SizedBox(height: 16),
        Row(
          children: [
            Expanded(child: _field('رقم اللوحة *', Icons.pin_outlined, _plateCtrl)),
            const SizedBox(width: 12),
            ElevatedButton.icon(
              onPressed: _searchVehicle,
              icon: const Icon(Icons.search, size: 18),
              label: const Text('بحث'),
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.primary,
                foregroundColor: Colors.white,
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
                shape: RoundedRectangleBorder(
                    borderRadius: AppBorders.radiusMd),
              ),
            ),
          ],
        ),
        const SizedBox(height: 14),
        Row(
          children: [
            Expanded(child: _field('الموديل *', Icons.directions_car_outlined, _modelCtrl)),
            const SizedBox(width: 12),
            Expanded(
                child: _field('السنة *', Icons.calendar_today_outlined, _yearCtrl,
                    keyboardType: TextInputType.number)),
          ],
        ),
        const SizedBox(height: 14),
        Row(
          children: [
            Expanded(child: _field('اللون *', Icons.color_lens_outlined, _colorCtrl)),
            const SizedBox(width: 12),
            Expanded(child: _field('نوع الوقود', Icons.local_gas_station_outlined, _fuelCtrl)),
          ],
        ),
        const SizedBox(height: 14),
        _field('رقم الشاسيه (اختياري)', Icons.tag_outlined, _chassisCtrl),
        if (!_newVehicle) ...[
          const SizedBox(height: 12),
          _infoChip('سيارة موجودة — سيتم استخدامها', AppColors.success),
        ],
      ],
    );
  }

  // ── Step 2: Services ──────────────────────────────────────────────────────
  Widget _buildServicesStep() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        _sectionTitle('الخدمات المطلوبة', Icons.build_outlined),
        const SizedBox(height: 16),
        Wrap(
          spacing: 8,
          runSpacing: 8,
          children: _kServices.map((s) {
            final selected = _selectedServices.contains(s);
            return GestureDetector(
              onTap: () => setState(() {
                selected ? _selectedServices.remove(s) : _selectedServices.add(s);
              }),
              child: AnimatedContainer(
                duration: AppAnimations.fast,
                padding:
                    const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                decoration: BoxDecoration(
                  color: selected
                      ? AppColors.primary.withOpacity(0.15)
                      : AppColors.bgSecondary,
                  borderRadius: AppBorders.radiusFull,
                  border: Border.all(
                      color: selected
                          ? AppColors.primary.withOpacity(0.5)
                          : AppColors.border.withOpacity(0.3)),
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    if (selected)
                      Padding(
                        padding: const EdgeInsets.only(left: 6),
                        child: Icon(Icons.check_circle,
                            size: 15, color: AppColors.primary),
                      ),
                    Text(s,
                        style: AppTypography.labelSmall.copyWith(
                            color: selected
                                ? AppColors.primary
                                : AppColors.textSecondary)),
                  ],
                ),
              ),
            );
          }).toList(),
        ),
        const SizedBox(height: 20),
        _sectionTitle('خدمة مخصصة', Icons.add_circle_outline),
        const SizedBox(height: 10),
        Row(
          children: [
            Expanded(
                child: _field('أضف خدمة غير موجودة...', Icons.add, _customServiceCtrl)),
            const SizedBox(width: 10),
            ElevatedButton(
              onPressed: () {
                final v = _customServiceCtrl.text.trim();
                if (v.isNotEmpty) {
                  setState(() {
                    _customServices.add(v);
                    _customServiceCtrl.clear();
                  });
                }
              },
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.primary,
                foregroundColor: Colors.white,
                padding:
                    const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
                shape: RoundedRectangleBorder(
                    borderRadius: AppBorders.radiusMd),
              ),
              child: const Text('إضافة'),
            ),
          ],
        ),
        if (_customServices.isNotEmpty) ...[
          const SizedBox(height: 12),
          ..._customServices.map((s) => Container(
                margin: const EdgeInsets.only(bottom: 6),
                padding:
                    const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                decoration: BoxDecoration(
                  color: AppColors.accentBlue.withOpacity(0.1),
                  borderRadius: AppBorders.radiusMd,
                  border: Border.all(
                      color: AppColors.accentBlue.withOpacity(0.3)),
                ),
                child: Row(
                  children: [
                    Icon(Icons.check, size: 16, color: AppColors.accentBlue),
                    const SizedBox(width: 8),
                    Expanded(
                        child: Text(s,
                            style: AppTypography.labelSmall
                                .copyWith(color: AppColors.accentBlue))),
                    GestureDetector(
                      onTap: () =>
                          setState(() => _customServices.remove(s)),
                      child: Icon(Icons.close,
                          size: 16, color: AppColors.textMuted),
                    ),
                  ],
                ),
              )),
        ],
        const SizedBox(height: 20),
        _field('ملاحظات إضافية', Icons.notes_outlined, _notesCtrl,
            maxLines: 3),
      ],
    );
  }

  // ── Step 3: Receipt ───────────────────────────────────────────────────────
  Widget _buildReceiptStep() {
    if (_createdBooking == null) return const SizedBox();
    final b = _createdBooking!;
    final vehicle = b['vehicle'] as Map<String, dynamic>?;
    final customer = b['customer'] as Map<String, dynamic>?;
    final services = (b['services'] as List<dynamic>?)
            ?.map((s) => s['name'] as String)
            .toList() ??
        [];
    final qrToken = b['qrToken'] as String?;
    final vehicleId = b['vehicleId'] as String? ?? vehicle?['id'] as String?;
    final qrUrl = qrToken != null && vehicleId != null
        ? '${Uri.base.origin}/track/$vehicleId?token=$qrToken'
        : null;
    final bookingId = (b['id'] as String? ?? '').substring(0, 8).toUpperCase();
    final now = DateTime.now();

    return Column(
      children: [
        // success banner
        Container(
          width: double.infinity,
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: AppColors.success.withOpacity(0.12),
            borderRadius: AppBorders.radiusLg,
            border: Border.all(color: AppColors.success.withOpacity(0.3)),
          ),
          child: Row(
            children: [
              Icon(Icons.check_circle, color: AppColors.success, size: 28),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('تم الاستقبال بنجاح!',
                        style: AppTypography.headingSmall
                            .copyWith(color: AppColors.success, fontSize: 15)),
                    Text('رقم الحجز: $bookingId',
                        style: AppTypography.bodySmall),
                  ],
                ),
              ),
            ],
          ),
        ),
        const SizedBox(height: 20),
        // receipt card
        Container(
          width: double.infinity,
          padding: const EdgeInsets.all(20),
          decoration: BoxDecoration(
            color: AppColors.bgCard,
            borderRadius: AppBorders.radiusXl,
            border: Border.all(color: AppColors.border.withOpacity(0.3)),
            boxShadow: [AppShadows.lg],
          ),
          child: Column(
            children: [
              // header
              Text('AUTO RENEW',
                  style: AppTypography.headingMedium
                      .copyWith(letterSpacing: 3, fontSize: 20)),
              Text('نظام إدارة الكراج المتكامل',
                  style: AppTypography.bodySmall
                      .copyWith(color: AppColors.textMuted)),
              const Divider(height: 28),

              // QR
              if (qrUrl != null) ...[
                Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: AppBorders.radiusLg,
                  ),
                  child: QrImageView(
                    data: qrUrl,
                    version: QrVersions.auto,
                    size: 160,
                  ),
                ),
                const SizedBox(height: 8),
                Text('امسح لمتابعة سيارتك',
                    style: AppTypography.bodySmall
                        .copyWith(color: AppColors.textMuted)),
                const SizedBox(height: 16),
              ],

              // details
              _receiptRow('رقم الحجز', '#$bookingId'),
              _receiptRow('التاريخ',
                  '${now.year}/${now.month}/${now.day}  ${now.hour}:${now.minute.toString().padLeft(2, '0')}'),
              const Divider(height: 20),
              if (customer != null) ...[
                _receiptRow('العميل', customer['name'] ?? '-'),
                _receiptRow('الهاتف', customer['phone'] ?? '-'),
              ],
              if (vehicle != null) ...[
                _receiptRow('السيارة', '${vehicle['model']} ${vehicle['year']}'),
                _receiptRow('اللوحة', vehicle['plateNumber'] ?? '-'),
                _receiptRow('اللون', vehicle['color'] ?? '-'),
              ],
              const Divider(height: 20),
              if (services.isNotEmpty) ...[
                Align(
                    alignment: Alignment.centerRight,
                    child: Text('الخدمات المطلوبة:',
                        style: AppTypography.labelSmall
                            .copyWith(color: AppColors.textMuted))),
                const SizedBox(height: 8),
                ...services.map((s) => Padding(
                      padding: const EdgeInsets.symmetric(vertical: 2),
                      child: Row(
                        children: [
                          Icon(Icons.check_circle_outline,
                              size: 14, color: AppColors.success),
                          const SizedBox(width: 8),
                          Text(s, style: AppTypography.bodySmall),
                        ],
                      ),
                    )),
                const SizedBox(height: 8),
              ],
              const Divider(height: 20),
              Text('الحالة: استلام',
                  style: AppTypography.labelSmall
                      .copyWith(color: AppColors.accentBlue)),
            ],
          ),
        ),
        const SizedBox(height: 20),
        // buttons
        Row(
          children: [
            Expanded(
              child: OutlinedButton.icon(
                onPressed: () => _printReceipt(
                    qrUrl, customer, vehicle, services, bookingId, now),
                icon: const Icon(Icons.print_outlined),
                label: const Text('طباعة الفاتورة'),
                style: OutlinedButton.styleFrom(
                  foregroundColor: AppColors.primary,
                  side: BorderSide(color: AppColors.primary),
                  padding: const EdgeInsets.symmetric(vertical: 14),
                  shape: RoundedRectangleBorder(
                      borderRadius: AppBorders.radiusMd),
                ),
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: ElevatedButton.icon(
                onPressed: () => Navigator.pop(context, true),
                icon: const Icon(Icons.check),
                label: const Text('إنهاء'),
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.primary,
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(vertical: 14),
                  shape: RoundedRectangleBorder(
                      borderRadius: AppBorders.radiusMd),
                ),
              ),
            ),
          ],
        ),
      ],
    );
  }

  void _printReceipt(
    String? qrUrl,
    Map<String, dynamic>? customer,
    Map<String, dynamic>? vehicle,
    List<String> services,
    String bookingId,
    DateTime now,
  ) {
    final qrSection = qrUrl != null
        ? '<div style="text-align:center;margin:12px 0"><img src="https://api.qrserver.com/v1/create-qr-code/?data=${Uri.encodeComponent(qrUrl)}&size=150x150" width="150" height="150"/><br/><small style="font-size:9px">امسح QR لمتابعة سيارتك</small></div>'
        : '';
    final servicesList =
        services.map((s) => '<li>$s</li>').join('');
    final htmlContent = '''<!DOCTYPE html>
<html dir="rtl"><head><meta charset="UTF-8">
<style>
  body{font-family:Arial,sans-serif;font-size:12px;width:80mm;margin:0 auto;padding:8px}
  h2{text-align:center;font-size:15px;margin:4px 0;letter-spacing:2px}
  .sub{text-align:center;color:#666;font-size:10px;margin-bottom:8px}
  .divider{border-top:1px dashed #999;margin:8px 0}
  .row{display:flex;justify-content:space-between;margin:3px 0;font-size:11px}
  .label{color:#666}ul{margin:4px 0;padding-right:16px}
  li{font-size:11px;margin:2px 0}
  .status{text-align:center;background:#e8f5e9;border:1px solid #81c784;padding:4px 8px;border-radius:4px;font-size:11px;color:#2e7d32}
  @media print{body{width:80mm}}
</style></head><body>
<h2>AUTO RENEW</h2>
<div class="sub">نظام إدارة الكراج المتكامل</div>
$qrSection
<div class="divider"></div>
<div class="row"><span class="label">رقم الحجز:</span><span>#$bookingId</span></div>
<div class="row"><span class="label">التاريخ:</span><span>${now.year}/${now.month}/${now.day} ${now.hour}:${now.minute.toString().padLeft(2, '0')}</span></div>
<div class="divider"></div>
${customer != null ? '<div class="row"><span class="label">العميل:</span><span>${customer['name']}</span></div><div class="row"><span class="label">الهاتف:</span><span>${customer['phone']}</span></div>' : ''}
${vehicle != null ? '<div class="row"><span class="label">السيارة:</span><span>${vehicle['model']} ${vehicle['year']}</span></div><div class="row"><span class="label">اللوحة:</span><span>${vehicle['plateNumber']}</span></div>' : ''}
<div class="divider"></div>
<div class="label" style="margin-bottom:4px">الخدمات المطلوبة:</div>
<ul>$servicesList</ul>
<div class="divider"></div>
<div class="status">الحالة: استلام</div>
<div class="sub" style="margin-top:8px">شكراً لزيارتكم</div>
<script>window.onload=function(){window.print();}</script>
</body></html>''';

    try {
      // Use a hidden iframe for reliable cross-browser printing
      final iframe = html.IFrameElement()
        ..style.width = '0'
        ..style.height = '0'
        ..style.border = 'none'
        ..style.position = 'absolute'
        ..style.left = '-9999px'
        ..srcdoc = htmlContent;

      html.document.body!.append(iframe);

      // Wait for iframe to load then print and cleanup
      Future.delayed(const Duration(milliseconds: 600), () {
        try {
          final cw = iframe.contentWindow as html.Window?;
          if (cw != null) {
            cw.print();
          } else {
            // Fallback to new tab if iframe print fails
            final encoded = base64Encode(utf8.encode(htmlContent));
            html.window.open('data:text/html;base64,$encoded', '_blank');
          }
        } catch (_) {
          final encoded = base64Encode(utf8.encode(htmlContent));
          html.window.open('data:text/html;base64,$encoded', '_blank');
        }
        // Cleanup iframe after printing
        Future.delayed(const Duration(seconds: 2), () => iframe.remove());
      });
    } catch (e) {
      debugPrint('Print error: $e');
    }
  }

  // ── Bottom Bar ────────────────────────────────────────────────────────────
  Widget _buildBottomBar() {
    return Container(
      padding: const EdgeInsets.fromLTRB(20, 12, 20, 20),
      decoration: BoxDecoration(
        color: AppColors.bgSecondary,
        border: Border(top: BorderSide(color: AppColors.border.withOpacity(0.3))),
      ),
      child: Row(
        children: [
          if (_step > 0)
            TextButton.icon(
              onPressed: () => setState(() => _step--),
              icon: const Icon(Icons.arrow_forward),
              label: const Text('السابق'),
              style: TextButton.styleFrom(foregroundColor: AppColors.textSecondary),
            ),
          const Spacer(),
          if (_step < 2)
            ElevatedButton.icon(
              onPressed: _canProceed() ? () => setState(() => _step++) : null,
              icon: const Icon(Icons.arrow_back),
              label: const Text('التالي'),
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.primary,
                foregroundColor: Colors.white,
                padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 14),
                shape: RoundedRectangleBorder(
                    borderRadius: AppBorders.radiusMd),
              ),
            )
          else
            ElevatedButton.icon(
              onPressed: _saving ? null : _save,
              icon: _saving
                  ? const SizedBox(
                      width: 18,
                      height: 18,
                      child: CircularProgressIndicator(
                          strokeWidth: 2, color: Colors.white))
                  : const Icon(Icons.save_outlined),
              label: Text(_saving ? 'جاري الحفظ...' : 'حفظ وإصدار QR'),
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.success,
                foregroundColor: Colors.white,
                padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 14),
                shape: RoundedRectangleBorder(
                    borderRadius: AppBorders.radiusMd),
              ),
            ),
        ],
      ),
    );
  }

  bool _canProceed() {
    if (_step == 0) return _phoneCtrl.text.trim().isNotEmpty && _nameCtrl.text.trim().isNotEmpty;
    if (_step == 1) {
      return _plateCtrl.text.trim().isNotEmpty &&
          (_newVehicle
              ? _modelCtrl.text.trim().isNotEmpty && _yearCtrl.text.trim().isNotEmpty
              : true);
    }
    return true;
  }

  // ── Widgets ───────────────────────────────────────────────────────────────
  Widget _sectionTitle(String title, IconData icon) => Row(
        children: [
          Icon(icon, size: 20, color: AppColors.primary),
          const SizedBox(width: 8),
          Text(title, style: AppTypography.headingSmall.copyWith(fontSize: 16)),
        ],
      );

  Widget _field(String label, IconData icon, TextEditingController ctrl,
      {TextInputType? keyboardType, int maxLines = 1}) =>
      TextField(
        controller: ctrl,
        style: AppTypography.bodyMedium,
        keyboardType: keyboardType,
        maxLines: maxLines,
        decoration: InputDecoration(
          labelText: label,
          labelStyle:
              AppTypography.labelSmall.copyWith(color: AppColors.textTertiary),
          prefixIcon: Icon(icon, size: 20, color: AppColors.textMuted),
          filled: true,
          fillColor: AppColors.bgSecondary,
          border: OutlineInputBorder(
            borderRadius: AppBorders.radiusMd,
            borderSide: BorderSide(color: AppColors.border.withOpacity(0.4)),
          ),
          enabledBorder: OutlineInputBorder(
            borderRadius: AppBorders.radiusMd,
            borderSide:
                BorderSide(color: AppColors.border.withOpacity(0.3)),
          ),
          focusedBorder: OutlineInputBorder(
            borderRadius: AppBorders.radiusMd,
            borderSide:
                const BorderSide(color: AppColors.primary, width: 2),
          ),
          contentPadding:
              const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
        ),
      );

  Widget _infoChip(String text, Color color) => Container(
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
        decoration: BoxDecoration(
          color: color.withOpacity(0.1),
          borderRadius: AppBorders.radiusFull,
          border: Border.all(color: color.withOpacity(0.3)),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(Icons.check_circle, size: 15, color: color),
            const SizedBox(width: 6),
            Text(text,
                style: AppTypography.labelSmall.copyWith(color: color)),
          ],
        ),
      );

  Widget _receiptRow(String label, String value) => Padding(
        padding: const EdgeInsets.symmetric(vertical: 3),
        child: Row(
          children: [
            Text('$label: ',
                style: AppTypography.bodySmall
                    .copyWith(color: AppColors.textMuted)),
            Expanded(
                child: Text(value,
                    style: AppTypography.labelSmall,
                    textAlign: TextAlign.left)),
          ],
        ),
      );
}

