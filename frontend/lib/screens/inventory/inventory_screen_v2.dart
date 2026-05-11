import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../core/app_theme.dart';
import '../../models/inventory_item.dart';
import '../../state/inventory_provider.dart';
import '../../services/notification_service.dart';

class InventoryScreenV2 extends ConsumerStatefulWidget {
  const InventoryScreenV2({super.key});

  @override
  ConsumerState<InventoryScreenV2> createState() => _InventoryScreenV2State();
}

class _InventoryScreenV2State extends ConsumerState<InventoryScreenV2> {
  String _searchQuery = '';
  String _filter = 'ALL';

  @override
  Widget build(BuildContext context) {
    final inventoryAsync = ref.watch(inventoryProvider);

    return Container(
      color: AppColors.bgPrimary,
      child: Column(
        children: [
          _buildHeader(),
          _buildFilters(),
          Expanded(
            child: inventoryAsync.when(
              data: (items) => _buildContent(items),
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
                Text('المخزون', style: AppTypography.displaySmall.copyWith(fontSize: 28)),
                const SizedBox(height: 4),
                Text('إدارة قطع الغيار والمخزون', style: AppTypography.bodyLarge),
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
                  Text('قطعة جديدة', style: AppTypography.labelLarge.copyWith(
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
      {'label': 'كمية منخفضة', 'value': 'LOW'},
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
                        hintText: 'بحث باسم القطعة...',
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

  Widget _buildContent(List<InventoryItem> items) {
    final filtered = items.where((item) {
      final isLow = item.quantity < 5;
      if (_filter == 'LOW' && !isLow) return false;
      if (_searchQuery.isEmpty) return true;
      final q = _searchQuery.toLowerCase();
      return item.name.toLowerCase().contains(q);
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
                  Text('قائمة المخزون', style: AppTypography.headingSmall.copyWith(fontSize: 15)),
                  const Spacer(),
                  Text('${filtered.length} عنصر', style: AppTypography.bodySmall),
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
                  Expanded(flex: 3, child: Text('القطعة', style: AppTypography.labelSmall)),
                  Expanded(flex: 2, child: Text('الكمية', style: AppTypography.labelSmall)),
                  Expanded(flex: 2, child: Text('سعر الوحدة', style: AppTypography.labelSmall)),
                  Expanded(flex: 2, child: Text('إجمالي', style: AppTypography.labelSmall)),
                  SizedBox(width: 80, child: Text('إجراءات', style: AppTypography.labelSmall)),
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
                        return _InventoryRow(
                          item: filtered[index],
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
          onTap: () => ref.invalidate(inventoryProvider),
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
          child: Icon(Icons.inventory_2_outlined,
              size: 40, color: AppColors.primary.withOpacity(0.5)),
        ),
        const SizedBox(height: 20),
        Text('لا توجد عناصر', style: AppTypography.headingSmall),
        const SizedBox(height: 8),
        Text('أضف عنصر جديد للبدء', style: AppTypography.bodyLarge),
      ],
    ),
  );

  void _showAddDialog() {
    final nameController = TextEditingController();
    final qtyController = TextEditingController();
    final priceController = TextEditingController();

    _showItemDialog(
      title: 'قطعة جديدة',
      nameController: nameController,
      qtyController: qtyController,
      priceController: priceController,
      onSave: () async {
        final newItem = InventoryItem(
          id: '',
          name: nameController.text,
          quantity: int.tryParse(qtyController.text) ?? 0,
          unitPrice: double.tryParse(priceController.text) ?? 0,
          createdAt: DateTime.now(),
          updatedAt: DateTime.now(),
        );
        try {
          await ref.read(inventoryServiceProvider).createItem(newItem);
          ref.invalidate(inventoryProvider);
          showSuccessToast(context, 'تم إضافة القطعة بنجاح!');
        } catch (e) {
          showErrorToast(context, 'خطأ: \$e');
          rethrow;
        }
      },
    );
  }

  void _showEditDialog(InventoryItem item) {
    final nameController = TextEditingController(text: item.name);
    final qtyController = TextEditingController(text: item.quantity.toString());
    final priceController = TextEditingController(text: item.unitPrice.toString());

    _showItemDialog(
      title: 'تعديل القطعة',
      nameController: nameController,
      qtyController: qtyController,
      priceController: priceController,
      onSave: () async {
        final updated = InventoryItem(
          id: item.id,
          name: nameController.text,
          quantity: int.tryParse(qtyController.text) ?? item.quantity,
          unitPrice: double.tryParse(priceController.text) ?? item.unitPrice,
          createdAt: item.createdAt,
          updatedAt: DateTime.now(),
        );
        try {
          await ref.read(inventoryServiceProvider).updateItem(item.id, updated);
          ref.invalidate(inventoryProvider);
          showSuccessToast(context, 'تم تحديث القطعة بنجاح!');
        } catch (e) {
          showErrorToast(context, 'خطأ: \$e');
          rethrow;
        }
      },
    );
  }

  void _showDeleteDialog(InventoryItem item) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        backgroundColor: AppColors.bgSecondary,
        shape: RoundedRectangleBorder(
          borderRadius: AppBorders.radiusXl,
          side: BorderSide(color: AppColors.border.withOpacity(0.3)),
        ),
        title: Text('حذف القطعة', style: AppTypography.headingSmall),
        content: Text('هل أنت متأكد من حذف ${item.name}؟', style: AppTypography.bodyMedium),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: Text('إلغاء', style: AppTypography.labelMedium.copyWith(
                color: AppColors.textTertiary)),
          ),
          GestureDetector(
            onTap: () async {
              try {
                await ref.read(inventoryServiceProvider).deleteItem(item.id);
                ref.invalidate(inventoryProvider);
                Navigator.pop(context);
                showSuccessToast(context, 'تم حذف القطعة بنجاح!');
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

  void _showItemDialog({
    required String title,
    required TextEditingController nameController,
    required TextEditingController qtyController,
    required TextEditingController priceController,
    required Future<void> Function() onSave,
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
                _dialogHeader(context, title),
                Flexible(
                  child: SingleChildScrollView(
                    padding: const EdgeInsets.all(24),
                    child: Column(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        _buildField('الاسم *', Icons.label_outline, nameController),
                        const SizedBox(height: 16),
                        _buildField('الكمية *', Icons.numbers_outlined, qtyController,
                            keyboardType: TextInputType.number),
                        const SizedBox(height: 16),
                        _buildField('سعر الوحدة *', Icons.attach_money_outlined, priceController,
                            keyboardType: TextInputType.number),
                      ],
                    ),
                  ),
                ),
                _dialogFooter(context, () async {
                  try {
                    await onSave();
                    if (mounted) Navigator.pop(context);
                  } catch (_) {
                    // Error already shown, dialog stays open
                  }
                }),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _dialogHeader(BuildContext context, String title) {
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

  Widget _dialogFooter(BuildContext context, VoidCallback onSave) {
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

class _InventoryRow extends StatefulWidget {
  final InventoryItem item;
  final int index;
  final VoidCallback onEdit;
  final VoidCallback onDelete;

  const _InventoryRow({
    required this.item,
    required this.index,
    required this.onEdit,
    required this.onDelete,
  });

  @override
  State<_InventoryRow> createState() => _InventoryRowState();
}

class _InventoryRowState extends State<_InventoryRow>
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
    final item = widget.item;
    final isLow = item.quantity < 5;
    final totalValue = item.quantity * item.unitPrice;
    final iconColor = isLow ? AppColors.error : AppColors.accentCyan;

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
            border: isLow ? Border.all(color: AppColors.error.withOpacity(0.15)) : null,
          ),
          child: Row(
            children: [
              Expanded(
                flex: 3,
                child: Row(
                  children: [
                    Container(
                      width: 40, height: 40,
                      decoration: BoxDecoration(
                        color: iconColor.withOpacity(0.12),
                        borderRadius: AppBorders.radiusMd,
                      ),
                      child: Icon(
                        isLow ? Icons.warning_amber : Icons.inventory_2,
                        size: 20, color: iconColor),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(item.name, style: AppTypography.labelMedium),
                          if (isLow)
                            Text('كمية منخفضة!',
                                style: AppTypography.bodySmall.copyWith(
                                  color: AppColors.error, fontSize: 10)),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
              Expanded(
                flex: 2,
                child: Text('${item.quantity}',
                    style: AppTypography.bodyMedium.copyWith(
                      color: isLow ? AppColors.error : AppColors.textSecondary,
                      fontWeight: isLow ? FontWeight.w600 : FontWeight.w400)),
              ),
              Expanded(
                flex: 2,
                child: Text('\$${item.unitPrice.toStringAsFixed(2)}',
                    style: AppTypography.bodyMedium),
              ),
              Expanded(
                flex: 2,
                child: Text('\$${totalValue.toStringAsFixed(2)}',
                    style: AppTypography.labelMedium.copyWith(
                      color: AppColors.textPrimary, fontWeight: FontWeight.w600)),
              ),
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
                        child: Icon(Icons.edit_outlined, size: 16, color: AppColors.accentBlue),
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
