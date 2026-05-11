import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../core/app_theme.dart';
import '../../models/customer.dart';
import '../../state/customer_provider.dart';
import '../../services/notification_service.dart';

class CustomersScreenV2 extends ConsumerStatefulWidget {
  const CustomersScreenV2({super.key});

  @override
  ConsumerState<CustomersScreenV2> createState() => _CustomersScreenV2State();
}

class _CustomersScreenV2State extends ConsumerState<CustomersScreenV2> {
  String _searchQuery = '';
  bool _isAddDialogOpen = false;
  
  @override
  Widget build(BuildContext context) {
    final customersAsync = ref.watch(customersProvider);

    return Container(
      color: AppColors.bgPrimary,
      child: Column(
        children: [
          // Header
          _buildHeader(),
          // Filters
          _buildFilters(),
          // Content
          Expanded(
            child: customersAsync.when(
              data: (customers) => _buildContent(customers),
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
                Text(
                  'العملاء',
                  style: AppTypography.displaySmall.copyWith(fontSize: 28),
                ),
                const SizedBox(height: 4),
                Text(
                  'إدارة قائمة العملاء وتفاصيلهم',
                  style: AppTypography.bodyLarge,
                ),
              ],
            ),
          ),
          MouseRegion(
            cursor: SystemMouseCursors.click,
            child: GestureDetector(
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
                    Text(
                      'عميل جديد',
                      style: AppTypography.labelLarge.copyWith(
                        color: Colors.white,
                        fontSize: 13,
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildFilters() {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 32),
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
                  hintText: 'بحث باسم العميل أو رقم الهاتف...',
                  hintStyle: AppTypography.bodyMedium.copyWith(
                    color: AppColors.textMuted,
                  ),
                  border: InputBorder.none,
                  contentPadding: const EdgeInsets.symmetric(vertical: 14),
                ),
                onChanged: (value) => setState(() => _searchQuery = value),
              ),
            ),
            const SizedBox(width: 12),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
              decoration: BoxDecoration(
                color: AppColors.bgTertiary,
                borderRadius: AppBorders.radiusMd,
              ),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Icon(Icons.sort, size: 18, color: AppColors.textTertiary),
                  const SizedBox(width: 6),
                  Text(
                    'الاسم',
                    style: AppTypography.labelSmall,
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildContent(List<Customer> customers) {
    final filtered = customers.where((c) {
      if (_searchQuery.isEmpty) return true;
      final q = _searchQuery.toLowerCase();
      return c.name.toLowerCase().contains(q) ||
          c.phone.toLowerCase().contains(q);
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
            // Table Header
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
              decoration: BoxDecoration(
                color: AppColors.bgSecondary,
                borderRadius: const BorderRadius.vertical(
                  top: Radius.circular(20),
                ),
              ),
              child: Row(
                children: [
                  Text(
                    'قائمة العملاء',
                    style: AppTypography.headingSmall.copyWith(fontSize: 15),
                  ),
                  const Spacer(),
                  Text(
                    '${filtered.length} عميل',
                    style: AppTypography.bodySmall,
                  ),
                ],
              ),
            ),
            // Column Headers
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
                  Expanded(flex: 3, child: Text('العميل', style: AppTypography.labelSmall)),
                  Expanded(flex: 2, child: Text('الهاتف', style: AppTypography.labelSmall)),
                  Expanded(flex: 2, child: Text('الهاتف الثاني', style: AppTypography.labelSmall)),
                  Expanded(flex: 1, child: Text('الحالة', style: AppTypography.labelSmall)),
                  SizedBox(width: 80, child: Text('إجراءات', style: AppTypography.labelSmall)),
                ],
              ),
            ),
            // Rows
            Expanded(
              child: filtered.isEmpty
                  ? _buildEmptyState()
                  : ListView.builder(
                      padding: const EdgeInsets.symmetric(vertical: 8),
                      itemCount: filtered.length,
                      itemBuilder: (context, index) {
                        return _CustomerRow(
                          customer: filtered[index],
                          index: index,
                          onEdit: () => _showEditDialog(filtered[index]),
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

  Widget _buildLoadingState() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          SizedBox(
            width: 48,
            height: 48,
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
  }

  Widget _buildErrorState() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Container(
            padding: const EdgeInsets.all(24),
            decoration: BoxDecoration(
              color: AppColors.error.withOpacity(0.1),
              shape: BoxShape.circle,
            ),
            child: Icon(Icons.error_outline, size: 40, color: AppColors.error),
          ),
          const SizedBox(height: 20),
          Text(
            'حدث خطأ في تحميل البيانات',
            style: AppTypography.bodyLarge.copyWith(color: AppColors.error),
          ),
          const SizedBox(height: 16),
          GestureDetector(
            onTap: () => ref.invalidate(customersProvider),
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
              decoration: BoxDecoration(
                color: AppColors.primary.withOpacity(0.15),
                borderRadius: AppBorders.radiusMd,
                border: Border.all(color: AppColors.primary.withOpacity(0.3)),
              ),
              child: Text(
                'إعادة المحاولة',
                style: AppTypography.labelMedium.copyWith(color: AppColors.primary),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildEmptyState() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Container(
            padding: const EdgeInsets.all(24),
            decoration: BoxDecoration(
              color: AppColors.primary.withOpacity(0.1),
              shape: BoxShape.circle,
            ),
            child: Icon(Icons.people_outline, size: 40, color: AppColors.primary.withOpacity(0.5)),
          ),
          const SizedBox(height: 20),
          Text('لا يوجد عملاء', style: AppTypography.headingSmall),
          const SizedBox(height: 8),
          Text(
            'أضف عميل جديد للبدء',
            style: AppTypography.bodyLarge,
          ),
        ],
      ),
    );
  }

  // Dialogs
  void _showAddDialog() {
    final nameController = TextEditingController();
    final phoneController = TextEditingController();
    final secondaryPhoneController = TextEditingController();
    final notesController = TextEditingController();

    showDialog(
      context: context,
      builder: (context) => _CustomerDialog(
        title: 'إضافة عميل جديد',
        nameController: nameController,
        phoneController: phoneController,
        secondaryPhoneController: secondaryPhoneController,
        notesController: notesController,
        onSave: () async {
          if (nameController.text.isEmpty || phoneController.text.isEmpty) return;
          
          final newCustomer = Customer(
            id: '',
            name: nameController.text,
            phone: phoneController.text,
            secondaryPhone: secondaryPhoneController.text.isEmpty 
                ? null 
                : secondaryPhoneController.text,
            notes: notesController.text.isEmpty ? null : notesController.text,
            createdAt: DateTime.now(),
            updatedAt: DateTime.now(),
          );
          
          try {
            await ref.read(customerServiceProvider).createCustomer(newCustomer);
            ref.invalidate(customersProvider);
            Navigator.pop(context);
            showSuccessToast(context, 'تم إضافة العميل بنجاح!');
          } catch (e) {
            showErrorToast(context, 'خطأ: $e');
          }
        },
      ),
    );
  }

  void _showEditDialog(Customer customer) {
    final nameController = TextEditingController(text: customer.name);
    final phoneController = TextEditingController(text: customer.phone);
    final secondaryPhoneController = TextEditingController(
        text: customer.secondaryPhone ?? '');
    final notesController = TextEditingController(text: customer.notes ?? '');

    showDialog(
      context: context,
      builder: (context) => _CustomerDialog(
        title: 'تعديل العميل',
        nameController: nameController,
        phoneController: phoneController,
        secondaryPhoneController: secondaryPhoneController,
        notesController: notesController,
        onSave: () async {
          final updated = Customer(
            id: customer.id,
            name: nameController.text,
            phone: phoneController.text,
            secondaryPhone: secondaryPhoneController.text.isEmpty 
                ? null 
                : secondaryPhoneController.text,
            notes: notesController.text.isEmpty ? null : notesController.text,
            createdAt: customer.createdAt,
            updatedAt: DateTime.now(),
          );
          
          try {
            await ref.read(customerServiceProvider).updateCustomer(customer.id, updated);
            ref.invalidate(customersProvider);
            Navigator.pop(context);
            showSuccessToast(context, 'تم تحديث العميل بنجاح!');
          } catch (e) {
            showErrorToast(context, 'خطأ: $e');
          }
        },
      ),
    );
  }

  void _showDeleteDialog(Customer customer) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        backgroundColor: AppColors.bgSecondary,
        shape: RoundedRectangleBorder(
          borderRadius: AppBorders.radiusXl,
          side: BorderSide(color: AppColors.border.withOpacity(0.3)),
        ),
        title: Text('حذف العميل', style: AppTypography.headingSmall),
        content: Text(
          'هل أنت متأكد من حذف ${customer.name}؟',
          style: AppTypography.bodyMedium,
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: Text('إلغاء', style: AppTypography.labelMedium.copyWith(
              color: AppColors.textTertiary,
            )),
          ),
          GestureDetector(
            onTap: () async {
              try {
                await ref.read(customerServiceProvider).deleteCustomer(customer.id);
                ref.invalidate(customersProvider);
                Navigator.pop(context);
                showSuccessToast(context, 'تم حذف العميل بنجاح!');
              } catch (e) {
                showErrorToast(context, 'خطأ: $e');
              }
            },
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
              decoration: BoxDecoration(
                color: AppColors.error.withOpacity(0.15),
                borderRadius: AppBorders.radiusMd,
              ),
              child: Text(
                'حذف',
                style: AppTypography.labelMedium.copyWith(color: AppColors.error),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

// ============================================================
// CUSTOMER ROW
// ============================================================
class _CustomerRow extends StatefulWidget {
  final Customer customer;
  final int index;
  final VoidCallback onEdit;
  final VoidCallback onDelete;

  const _CustomerRow({
    required this.customer,
    required this.index,
    required this.onEdit,
    required this.onDelete,
  });

  @override
  State<_CustomerRow> createState() => _CustomerRowState();
}

class _CustomerRowState extends State<_CustomerRow>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  late Animation<double> _fadeAnimation;
  bool _hovered = false;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 400),
    );
    _fadeAnimation = Tween<double>(begin: 0, end: 1).animate(
      CurvedAnimation(parent: _controller, curve: AppAnimations.easeOut),
    );
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
    return FadeTransition(
      opacity: _fadeAnimation,
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
              // Avatar + Name
              Expanded(
                flex: 3,
                child: Row(
                  children: [
                    Container(
                      width: 40,
                      height: 40,
                      decoration: BoxDecoration(
                        gradient: LinearGradient(
                          colors: [
                            AppColors.primary.withOpacity(0.8),
                            AppColors.accentPurple.withOpacity(0.8),
                          ],
                        ),
                        borderRadius: AppBorders.radiusFull,
                      ),
                      child: Center(
                        child: Text(
                          widget.customer.name.isNotEmpty
                              ? widget.customer.name[0]
                              : '?',
                          style: const TextStyle(
                            color: Colors.white,
                            fontWeight: FontWeight.bold,
                            fontSize: 15,
                          ),
                        ),
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            widget.customer.name,
                            style: AppTypography.labelMedium,
                          ),
                          if (widget.customer.notes != null && 
                              widget.customer.notes!.isNotEmpty)
                            Text(
                              widget.customer.notes!,
                              style: AppTypography.bodySmall,
                              overflow: TextOverflow.ellipsis,
                            ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
              // Phone
              Expanded(
                flex: 2,
                child: Text(
                  widget.customer.phone,
                  style: AppTypography.bodyMedium.copyWith(
                    fontFamily: 'monospace',
                  ),
                ),
              ),
              // Secondary Phone
              Expanded(
                flex: 2,
                child: Text(
                  widget.customer.secondaryPhone ?? '-',
                  style: AppTypography.bodyMedium.copyWith(
                    color: AppColors.textTertiary,
                  ),
                ),
              ),
              // Status
              Expanded(
                flex: 1,
                child: Container(
                  padding: const EdgeInsets.symmetric(
                      horizontal: 10, vertical: 4),
                  decoration: BoxDecoration(
                    color: AppColors.success.withOpacity(0.1),
                    borderRadius: AppBorders.radiusFull,
                    border: Border.all(
                      color: AppColors.success.withOpacity(0.2),
                    ),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Container(
                        width: 6,
                        height: 6,
                        decoration: const BoxDecoration(
                          color: AppColors.success,
                          shape: BoxShape.circle,
                        ),
                      ),
                      const SizedBox(width: 6),
                      Text(
                        'نشط',
                        style: AppTypography.labelSmall.copyWith(
                          color: AppColors.success,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
              // Actions
              SizedBox(
                width: 80,
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    GestureDetector(
                      onTap: widget.onEdit,
                      child: Container(
                        padding: const EdgeInsets.all(6),
                        decoration: BoxDecoration(
                          color: AppColors.accentBlue.withOpacity(0.1),
                          borderRadius: AppBorders.radiusSm,
                        ),
                        child: Icon(
                          Icons.edit_outlined,
                          size: 16,
                          color: AppColors.accentBlue,
                        ),
                      ),
                    ),
                    const SizedBox(width: 6),
                    GestureDetector(
                      onTap: widget.onDelete,
                      child: Container(
                        padding: const EdgeInsets.all(6),
                        decoration: BoxDecoration(
                          color: AppColors.error.withOpacity(0.1),
                          borderRadius: AppBorders.radiusSm,
                        ),
                        child: Icon(
                          Icons.delete_outline,
                          size: 16,
                          color: AppColors.error,
                        ),
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

// ============================================================
// CUSTOMER DIALOG
// ============================================================
class _CustomerDialog extends StatelessWidget {
  final String title;
  final TextEditingController nameController;
  final TextEditingController phoneController;
  final TextEditingController secondaryPhoneController;
  final TextEditingController notesController;
  final VoidCallback onSave;

  const _CustomerDialog({
    required this.title,
    required this.nameController,
    required this.phoneController,
    required this.secondaryPhoneController,
    required this.notesController,
    required this.onSave,
  });

  @override
  Widget build(BuildContext context) {
    return Dialog(
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
              // Header
              Container(
                padding: const EdgeInsets.fromLTRB(24, 20, 16, 12),
                decoration: BoxDecoration(
                  color: AppColors.bgTertiary.withOpacity(0.5),
                  border: Border(
                    bottom: BorderSide(
                      color: AppColors.border.withOpacity(0.3),
                    ),
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
                        child: Icon(
                          Icons.close,
                          size: 18,
                          color: AppColors.textTertiary,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
              // Content
              Flexible(
                child: SingleChildScrollView(
                  padding: const EdgeInsets.all(24),
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      _buildField('الاسم *', Icons.person_outline, nameController),
                      const SizedBox(height: 16),
                      _buildField('الهاتف *', Icons.phone_outlined, phoneController,
                          keyboardType: TextInputType.phone),
                      const SizedBox(height: 16),
                      _buildField('الهاتف الثاني', Icons.phone_outlined,
                          secondaryPhoneController,
                          keyboardType: TextInputType.phone),
                      const SizedBox(height: 16),
                      _buildField('ملاحظات', Icons.note_outlined, notesController,
                          maxLines: 3),
                    ],
                  ),
                ),
              ),
              // Footer
              Container(
                padding: const EdgeInsets.fromLTRB(24, 0, 24, 20),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.end,
                  children: [
                    TextButton(
                      onPressed: () => Navigator.pop(context),
                      child: Text(
                        'إلغاء',
                        style: AppTypography.labelMedium.copyWith(
                          color: AppColors.textTertiary,
                        ),
                      ),
                    ),
                    const SizedBox(width: 8),
                    GestureDetector(
                      onTap: onSave,
                      child: Container(
                        padding: const EdgeInsets.symmetric(
                            horizontal: 20, vertical: 10),
                        decoration: BoxDecoration(
                          gradient: const LinearGradient(
                            colors: AppColors.gradientPrimary,
                          ),
                          borderRadius: AppBorders.radiusMd,
                          boxShadow: [AppShadows.glow(AppColors.primary)],
                        ),
                        child: Text(
                          'حفظ',
                          style: AppTypography.labelLarge.copyWith(
                            color: Colors.white,
                            fontSize: 13,
                          ),
                        ),
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

  Widget _buildField(
    String label,
    IconData icon,
    TextEditingController controller, {
    TextInputType? keyboardType,
    int maxLines = 1,
  }) {
    return TextField(
      controller: controller,
      style: AppTypography.bodyMedium,
      keyboardType: keyboardType,
      maxLines: maxLines,
      decoration: InputDecoration(
        labelText: label,
        labelStyle: AppTypography.labelSmall.copyWith(
          color: AppColors.textTertiary,
        ),
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
        contentPadding: const EdgeInsets.symmetric(
            horizontal: 16, vertical: 14),
      ),
    );
  }
}
