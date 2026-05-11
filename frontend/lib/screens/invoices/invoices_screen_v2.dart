import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../core/app_theme.dart';
import '../../models/invoice.dart';
import '../../state/invoice_provider.dart';
import '../../services/notification_service.dart';

class InvoicesScreenV2 extends ConsumerStatefulWidget {
  const InvoicesScreenV2({super.key});

  @override
  ConsumerState<InvoicesScreenV2> createState() => _InvoicesScreenV2State();
}

class _InvoicesScreenV2State extends ConsumerState<InvoicesScreenV2> {
  String _searchQuery = '';
  String _filter = 'ALL';

  @override
  Widget build(BuildContext context) {
    final invoicesAsync = ref.watch(invoicesProvider);

    return Container(
      color: AppColors.bgPrimary,
      child: Column(
        children: [
          _buildHeader(),
          _buildFilters(),
          Expanded(
            child: invoicesAsync.when(
              data: (invoices) => _buildContent(invoices),
              loading: () => _buildLoadingState(),
              error: (_, __) => _buildErrorState(),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildHeader() {
    return Padding(
      padding: const EdgeInsets.all(32),
      child: Row(
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('الفواتير', style: AppTypography.displaySmall.copyWith(fontSize: 28)),
                const SizedBox(height: 4),
                Text('إدارة الفواتير والمدفوعات', style: AppTypography.bodyLarge),
              ],
            ),
          ),
          GestureDetector(
            onTap: () => _showAddDialog(),
            child: AnimatedContainer(
              duration: AppAnimations.normal,
              padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
              decoration: BoxDecoration(
                gradient: const LinearGradient(
                  colors: AppColors.gradientPrimary,
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
                borderRadius: AppBorders.radiusMd,
                boxShadow: [AppShadows.glow(AppColors.primary)],
              ),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  const Icon(Icons.add, color: Colors.white, size: 20),
                  const SizedBox(width: 8),
                  Text('فاتورة جديدة', style: AppTypography.labelLarge.copyWith(
                    color: Colors.white, fontSize: 13)),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildFilters() {
    final filters = [
      {'label': 'الكل', 'value': 'ALL'},
      {'label': 'مدفوعة', 'value': 'PAID'},
      {'label': 'معلقة', 'value': 'UNPAID'},
    ];

    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 32),
      child: Row(
        children: [
          Expanded(
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              decoration: BoxDecoration(
                color: AppColors.bgSecondary,
                borderRadius: AppBorders.radiusLg,
                border: Border.all(color: AppColors.border.withOpacity(0.3)),
              ),
              child: Row(
                children: [
                  Icon(Icons.search, size: 20, color: AppColors.textMuted),
                  const SizedBox(width: 12),
                  Expanded(
                    child: TextField(
                      style: AppTypography.bodyMedium,
                      decoration: InputDecoration(
                        hintText: 'بحث برقم الفاتورة أو الحجز...',
                        hintStyle: AppTypography.bodyMedium.copyWith(
                          color: AppColors.textMuted),
                        border: InputBorder.none,
                        contentPadding: const EdgeInsets.symmetric(vertical: 14),
                      ),
                      onChanged: (v) => setState(() => _searchQuery = v),
                    ),
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(width: 16),
          ...filters.map((f) {
            final isActive = _filter == f['value'];
            return Padding(
              padding: const EdgeInsets.only(left: 8),
              child: GestureDetector(
                onTap: () => setState(() => _filter = f['value']!),
                child: AnimatedContainer(
                  duration: AppAnimations.fast,
                  padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                  decoration: BoxDecoration(
                    color: isActive ? AppColors.primary.withOpacity(0.15) : AppColors.bgSecondary,
                    borderRadius: AppBorders.radiusFull,
                    border: isActive ? Border.all(color: AppColors.primary.withOpacity(0.3)) : null,
                  ),
                  child: Text(
                    f['label']!,
                    style: AppTypography.labelSmall.copyWith(
                      color: isActive ? AppColors.primary : AppColors.textSecondary,
                      fontWeight: isActive ? FontWeight.w600 : FontWeight.w400,
                    ),
                  ),
                ),
              ),
            );
          }).toList(),
        ],
      ),
    );
  }

  Widget _buildContent(List<Invoice> invoices) {
    final filtered = invoices.where((inv) {
      if (_filter == 'PAID' && !inv.isPaid) return false;
      if (_filter == 'UNPAID' && inv.isPaid) return false;
      if (_searchQuery.isEmpty) return true;
      final q = _searchQuery.toLowerCase();
      return inv.id.toLowerCase().contains(q) || inv.bookingId.toLowerCase().contains(q);
    }).toList();

    return Padding(
      padding: const EdgeInsets.all(32),
      child: Container(
        decoration: BoxDecoration(
          color: AppColors.bgCard,
          borderRadius: AppBorders.radiusXl,
          border: Border.all(color: AppColors.border.withOpacity(0.3)),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
              decoration: BoxDecoration(
                color: AppColors.bgSecondary,
                borderRadius: const BorderRadius.vertical(top: Radius.circular(20)),
              ),
              child: Row(
                children: [
                  Text('قائمة الفواتير', style: AppTypography.headingSmall.copyWith(fontSize: 15)),
                  const Spacer(),
                  Text('${filtered.length} فاتورة', style: AppTypography.bodySmall),
                ],
              ),
            ),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
              decoration: BoxDecoration(
                color: AppColors.bgSecondary.withOpacity(0.5),
                border: Border(
                  bottom: BorderSide(color: AppColors.border.withOpacity(0.3)),
                ),
              ),
              child: Row(
                children: [
                  Expanded(flex: 2, child: Text('رقم الفاتورة', style: AppTypography.labelSmall)),
                  Expanded(flex: 2, child: Text('الحجز', style: AppTypography.labelSmall)),
                  Expanded(flex: 2, child: Text('المبلغ', style: AppTypography.labelSmall)),
                  Expanded(flex: 1, child: Text('الحالة', style: AppTypography.labelSmall)),
                  SizedBox(width: 120, child: Text('إجراءات', style: AppTypography.labelSmall)),
                ],
              ),
            ),
            Expanded(
              child: filtered.isEmpty
                  ? _buildEmptyState()
                  : ListView.builder(
                      padding: const EdgeInsets.symmetric(vertical: 8),
                      itemCount: filtered.length,
                      itemBuilder: (context, index) {
                        return _InvoiceRow(
                          invoice: filtered[index],
                          index: index,
                          onMarkPaid: () => _markAsPaid(filtered[index]),
                          onDelete: () => _showDeleteDialog(filtered[index]),
                        );
                      },
                    ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildLoadingState() => Center(
    child: Column(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        SizedBox(
          width: 48, height: 48,
          child: CircularProgressIndicator(
            strokeWidth: 3,
            valueColor: AlwaysStoppedAnimation<Color>(AppColors.primary),
          ),
        ),
        const SizedBox(height: 20),
        Text('جاري التحميل...', style: AppTypography.bodyLarge),
      ],
    ),
  );

  Widget _buildErrorState() => Center(
    child: Column(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        Container(
          padding: const EdgeInsets.all(24),
          decoration: BoxDecoration(
            color: AppColors.error.withOpacity(0.1), shape: BoxShape.circle),
          child: Icon(Icons.error_outline, size: 40, color: AppColors.error),
        ),
        const SizedBox(height: 20),
        Text('حدث خطأ في تحميل البيانات',
            style: AppTypography.bodyLarge.copyWith(color: AppColors.error)),
        const SizedBox(height: 16),
        GestureDetector(
          onTap: () => ref.invalidate(invoicesProvider),
          child: Container(
            padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
            decoration: BoxDecoration(
              color: AppColors.primary.withOpacity(0.15),
              borderRadius: AppBorders.radiusMd,
              border: Border.all(color: AppColors.primary.withOpacity(0.3)),
            ),
            child: Text('إعادة المحاولة',
                style: AppTypography.labelMedium.copyWith(color: AppColors.primary)),
          ),
        ),
      ],
    ),
  );

  Widget _buildEmptyState() => Center(
    child: Column(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        Container(
          padding: const EdgeInsets.all(24),
          decoration: BoxDecoration(
            color: AppColors.primary.withOpacity(0.1), shape: BoxShape.circle),
          child: Icon(Icons.receipt_outlined,
              size: 40, color: AppColors.primary.withOpacity(0.5)),
        ),
        const SizedBox(height: 20),
        Text('لا توجد فواتير', style: AppTypography.headingSmall),
        const SizedBox(height: 8),
        Text('أضف فاتورة جديدة للبدء', style: AppTypography.bodyLarge),
      ],
    ),
  );

  void _showAddDialog() {
    final bookingIdController = TextEditingController();
    final amountController = TextEditingController();

    _showInvoiceDialog(
      title: 'فاتورة جديدة',
      bookingIdController: bookingIdController,
      amountController: amountController,
      onSave: () async {
        final newInvoice = Invoice(
          id: '',
          bookingId: bookingIdController.text,
          amount: double.tryParse(amountController.text) ?? 0,
          isPaid: false,
          createdAt: DateTime.now(),
          updatedAt: DateTime.now(),
        );
        try {
          await ref.read(invoiceServiceProvider).createInvoice(newInvoice);
          ref.invalidate(invoicesProvider);
          Navigator.pop(context);
          showSuccessToast(context, 'تم إضافة الفاتورة بنجاح!');
        } catch (e) {
          showErrorToast(context, 'خطأ: \$e');
        }
      },
    );
  }

  void _markAsPaid(Invoice invoice) async {
    final updated = Invoice(
      id: invoice.id,
      bookingId: invoice.bookingId,
      amount: invoice.amount,
      isPaid: true,
      createdAt: invoice.createdAt,
      updatedAt: DateTime.now(),
    );
    try {
      await ref.read(invoiceServiceProvider).updateInvoice(invoice.id, updated);
      ref.invalidate(invoicesProvider);
      showSuccessToast(context, 'تم تسجيل الدفع بنجاح!');
    } catch (e) {
      showErrorToast(context, 'خطأ: \$e');
    }
  }

  void _showDeleteDialog(Invoice invoice) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        backgroundColor: AppColors.bgSecondary,
        shape: RoundedRectangleBorder(
          borderRadius: AppBorders.radiusXl,
          side: BorderSide(color: AppColors.border.withOpacity(0.3)),
        ),
        title: Text('حذف الفاتورة', style: AppTypography.headingSmall),
        content: Text('هل أنت متأكد من حذف هذه الفاتورة؟', style: AppTypography.bodyMedium),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: Text('إلغاء', style: AppTypography.labelMedium.copyWith(
                color: AppColors.textTertiary)),
          ),
          GestureDetector(
            onTap: () async {
              try {
                await ref.read(invoiceServiceProvider).deleteInvoice(invoice.id);
                ref.invalidate(invoicesProvider);
                Navigator.pop(context);
                showSuccessToast(context, 'تم حذف الفاتورة بنجاح!');
              } catch (e) {
                showErrorToast(context, 'خطأ: \$e');
              }
            },
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
              decoration: BoxDecoration(
                color: AppColors.error.withOpacity(0.15),
                borderRadius: AppBorders.radiusMd,
              ),
              child: Text('حذف', style: AppTypography.labelMedium.copyWith(
                  color: AppColors.error)),
            ),
          ),
        ],
      ),
    );
  }

  void _showInvoiceDialog({
    required String title,
    required TextEditingController bookingIdController,
    required TextEditingController amountController,
    required VoidCallback onSave,
  }) {
    showDialog(
      context: context,
      builder: (context) => Dialog(
        backgroundColor: Colors.transparent,
        child: Container(
          constraints: const BoxConstraints(maxWidth: 480),
          decoration: BoxDecoration(
            color: AppColors.bgSecondary,
            borderRadius: AppBorders.radiusXl,
            border: Border.all(color: AppColors.border.withOpacity(0.4)),
            boxShadow: [AppShadows.xl],
          ),
          child: ClipRRect(
            borderRadius: AppBorders.radiusXl,
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                _dialogHeader(title),
                Flexible(
                  child: SingleChildScrollView(
                    padding: const EdgeInsets.all(24),
                    child: Column(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        _buildField('رقم الحجز *', Icons.confirmation_number_outlined, bookingIdController),
                        const SizedBox(height: 16),
                        _buildField('المبلغ *', Icons.attach_money_outlined, amountController,
                            keyboardType: TextInputType.number),
                      ],
                    ),
                  ),
                ),
                _dialogFooter(onSave),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _dialogHeader(String title) {
    return Container(
      padding: const EdgeInsets.fromLTRB(24, 20, 16, 12),
      decoration: BoxDecoration(
        color: AppColors.bgTertiary.withOpacity(0.5),
        border: Border(
          bottom: BorderSide(color: AppColors.border.withOpacity(0.3)),
        ),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(title, style: AppTypography.headingSmall.copyWith(fontSize: 16)),
          GestureDetector(
            onTap: () => Navigator.pop(context),
            child: Container(
              padding: const EdgeInsets.all(6),
              decoration: BoxDecoration(
                color: AppColors.bgTertiary,
                borderRadius: AppBorders.radiusMd,
              ),
              child: Icon(Icons.close, size: 18, color: AppColors.textTertiary),
            ),
          ),
        ],
      ),
    );
  }

  Widget _dialogFooter(VoidCallback onSave) {
    return Container(
      padding: const EdgeInsets.fromLTRB(24, 0, 24, 20),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.end,
        children: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: Text('إلغاء', style: AppTypography.labelMedium.copyWith(
                color: AppColors.textTertiary)),
          ),
          const SizedBox(width: 8),
          GestureDetector(
            onTap: onSave,
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
              decoration: BoxDecoration(
                gradient: const LinearGradient(colors: AppColors.gradientPrimary),
                borderRadius: AppBorders.radiusMd,
                boxShadow: [AppShadows.glow(AppColors.primary)],
              ),
              child: Text('حفظ', style: AppTypography.labelLarge.copyWith(
                color: Colors.white, fontSize: 13)),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildField(String label, IconData icon, TextEditingController controller,
      {TextInputType? keyboardType}) {
    return TextField(
      controller: controller,
      style: AppTypography.bodyMedium,
      keyboardType: keyboardType,
      decoration: InputDecoration(
        labelText: label,
        labelStyle: AppTypography.labelSmall.copyWith(color: AppColors.textTertiary),
        prefixIcon: Icon(icon, size: 20, color: AppColors.textMuted),
        filled: true,
        fillColor: AppColors.bgPrimary,
        border: OutlineInputBorder(
          borderRadius: AppBorders.radiusMd,
          borderSide: BorderSide(color: AppColors.border.withOpacity(0.4)),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: AppBorders.radiusMd,
          borderSide: BorderSide(color: AppColors.border.withOpacity(0.3)),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: AppBorders.radiusMd,
          borderSide: const BorderSide(color: AppColors.primary, width: 2),
        ),
        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
      ),
    );
  }
}

class _InvoiceRow extends StatefulWidget {
  final Invoice invoice;
  final int index;
  final VoidCallback onMarkPaid;
  final VoidCallback onDelete;

  const _InvoiceRow({
    required this.invoice,
    required this.index,
    required this.onMarkPaid,
    required this.onDelete,
  });

  @override
  State<_InvoiceRow> createState() => _InvoiceRowState();
}

class _InvoiceRowState extends State<_InvoiceRow>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  late Animation<double> _fadeAnim;
  bool _hovered = false;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this, duration: const Duration(milliseconds: 400));
    _fadeAnim = Tween<double>(begin: 0, end: 1).animate(
      CurvedAnimation(parent: _controller, curve: AppAnimations.easeOut));
    Future.delayed(Duration(milliseconds: widget.index * 50), () {
      if (mounted) _controller.forward();
    });
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final inv = widget.invoice;
    final statusColor = inv.isPaid ? AppColors.success : AppColors.warning;
    final statusText = inv.isPaid ? 'مدفوع' : 'معلق';

    return FadeTransition(
      opacity: _fadeAnim,
      child: MouseRegion(
        onEnter: (_) => setState(() => _hovered = true),
        onExit: (_) => setState(() => _hovered = false),
        child: AnimatedContainer(
          duration: AppAnimations.fast,
          margin: const EdgeInsets.symmetric(horizontal: 12, vertical: 2),
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
          decoration: BoxDecoration(
            color: _hovered ? AppColors.surfaceHover.withOpacity(0.5) : Colors.transparent,
            borderRadius: AppBorders.radiusMd,
          ),
          child: Row(
            children: [
              Expanded(
                flex: 2,
                child: Row(
                  children: [
                    Container(
                      width: 40, height: 40,
                      decoration: BoxDecoration(
                        color: statusColor.withOpacity(0.12),
                        borderRadius: AppBorders.radiusMd,
                      ),
                      child: Icon(
                        inv.isPaid ? Icons.check_circle : Icons.pending_outlined,
                        size: 20, color: statusColor),
                    ),
                    const SizedBox(width: 12),
                    Text('#${inv.id.substring(0, 8)}', style: AppTypography.labelMedium),
                  ],
                ),
              ),
              Expanded(
                flex: 2,
                child: Text('#${inv.bookingId.substring(0, 8)}',
                    style: AppTypography.bodyMedium.copyWith(fontFamily: 'monospace')),
              ),
              Expanded(
                flex: 2,
                child: Text('\$${inv.amount.toStringAsFixed(2)}',
                    style: AppTypography.labelMedium.copyWith(
                      color: AppColors.textPrimary, fontWeight: FontWeight.w600)),
              ),
              Expanded(
                flex: 1,
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                  decoration: BoxDecoration(
                    color: statusColor.withOpacity(0.12),
                    borderRadius: AppBorders.radiusFull,
                    border: Border.all(color: statusColor.withOpacity(0.25)),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Container(
                        width: 6, height: 6,
                        decoration: BoxDecoration(
                          color: statusColor, shape: BoxShape.circle),
                      ),
                      const SizedBox(width: 6),
                      Text(statusText,
                          style: AppTypography.labelSmall.copyWith(
                            color: statusColor, fontWeight: FontWeight.w600)),
                    ],
                  ),
                ),
              ),
              SizedBox(
                width: 120,
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    if (!inv.isPaid)
                      GestureDetector(
                        onTap: widget.onMarkPaid,
                        child: Container(
                          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                          decoration: BoxDecoration(
                            color: AppColors.success.withOpacity(0.12),
                            borderRadius: AppBorders.radiusSm,
                            border: Border.all(color: AppColors.success.withOpacity(0.3)),
                          ),
                          child: Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              Icon(Icons.payment, size: 14, color: AppColors.success),
                              const SizedBox(width: 4),
                              Text('دفع', style: AppTypography.labelSmall.copyWith(
                                color: AppColors.success, fontWeight: FontWeight.w600)),
                            ],
                          ),
                        ),
                      ),
                    if (!inv.isPaid) const SizedBox(width: 6),
                    GestureDetector(
                      onTap: widget.onDelete,
                      child: Container(
                        padding: const EdgeInsets.all(6),
                        decoration: BoxDecoration(
                          color: AppColors.error.withOpacity(0.1),
                          borderRadius: AppBorders.radiusSm,
                        ),
                        child: Icon(Icons.delete_outline, size: 16, color: AppColors.error),
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
