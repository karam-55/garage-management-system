import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../core/design_system.dart';
import '../../models/customer.dart';
import '../../state/customer_provider.dart';
import '../../widgets/app_button.dart';
import '../../widgets/app_modal.dart';
import '../../widgets/app_table.dart';
import '../../widgets/shimmer_loading.dart';

class CustomersScreenNew extends ConsumerStatefulWidget {
  const CustomersScreenNew({super.key});

  @override
  ConsumerState<CustomersScreenNew> createState() => _CustomersScreenNewState();
}

class _CustomersScreenNewState extends ConsumerState<CustomersScreenNew> {
  String _searchQuery = '';
  String _sortBy = 'name';
  bool _sortAscending = true;

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
              data: (customers) => _buildCustomerTable(customers),
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
                Text('العملاء', style: AppTypography.displaySmall.copyWith(fontSize: 28)),
                const SizedBox(height: 4),
                Text('إدارة قائمة العملاء وتفاصيلهم', style: AppTypography.bodyLarge),
              ],
            ),
          ),
          AppButton(
            label: 'عميل جديد',
            icon: Icons.add,
            variant: ButtonVariant.primary,
            onPressed: () => _showAddCustomerDialog(),
          ),
        ],
      ),
    );
  }

  Widget _buildFilters() {
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
                  Icon(Icons.search, size: 20, color: AppColors.textTertiary),
                  const SizedBox(width: 12),
                  Expanded(
                    child: TextField(
                      style: AppTypography.bodyMedium,
                      decoration: InputDecoration(
                        hintText: 'بحث باسم العميل، الهاتف، أو البريد...',
                        hintStyle: AppTypography.bodyMedium.copyWith(color: AppColors.textTertiary),
                        border: InputBorder.none,
                        contentPadding: const EdgeInsets.symmetric(vertical: 14),
                      ),
                      onChanged: (value) => setState(() => _searchQuery = value),
                    ),
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(width: 12),
          _buildSortDropdown(),
        ],
      ),
    );
  }

  Widget _buildSortDropdown() {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12),
      decoration: BoxDecoration(
        color: AppColors.bgSecondary,
        borderRadius: AppBorders.radiusLg,
        border: Border.all(color: AppColors.border.withOpacity(0.3)),
      ),
      child: DropdownButtonHideUnderline(
        child: DropdownButton<String>(
          value: _sortBy,
          icon: Icon(Icons.sort, size: 18, color: AppColors.textSecondary),
          dropdownColor: AppColors.bgSecondary,
          style: AppTypography.bodyMedium,
          items: [
            DropdownMenuItem(value: 'name', child: Text('الاسم', style: AppTypography.bodyMedium)),
            DropdownMenuItem(value: 'date', child: Text('تاريخ التسجيل', style: AppTypography.bodyMedium)),
            DropdownMenuItem(value: 'vehicles', child: Text('عدد السيارات', style: AppTypography.bodyMedium)),
          ],
          onChanged: (value) {
            if (value != null) setState(() => _sortBy = value);
          },
        ),
      ),
    );
  }

  Widget _buildCustomerTable(List<Customer> customers) {
    final filtered = customers.where((c) {
      if (_searchQuery.isEmpty) return true;
      final q = _searchQuery.toLowerCase();
      return c.name.toLowerCase().contains(q) ||
          c.phone.toLowerCase().contains(q);
    }).toList();

    // Sort
    filtered.sort((a, b) {
      int result;
      switch (_sortBy) {
        case 'date':
          result = a.createdAt.compareTo(b.createdAt);
          break;
        default:
          result = a.name.compareTo(b.name);
      }
      return _sortAscending ? result : -result;
    });

    return Padding(
      padding: const EdgeInsets.all(32),
      child: AppTable(
        title: 'قائمة العملاء',
        subtitle: '${filtered.length} عميل',
        columns: const ['العميل', 'الهاتف', 'البريد', 'السيارات', 'الحالة', ''],
        columnWidths: const [2.5, 1.5, 2, 1, 1, 0.5],
        headerActions: Row(
          children: [
            AppIconButton(
              icon: Icons.filter_list,
              onPressed: () {},
            ),
            AppIconButton(
              icon: Icons.more_vert,
              onPressed: () {},
            ),
          ],
        ),
        rows: filtered.map((customer) => [
          Row(
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
                    customer.name.isNotEmpty ? customer.name[0] : '?',
                    style: const TextStyle(
                      color: Colors.white,
                      fontWeight: FontWeight.bold,
                      fontSize: 16,
                    ),
                  ),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(customer.name, style: AppTypography.labelMedium),
                    const SizedBox(height: 2),
                    Text(
                      'منذ ${_formatDate(customer.createdAt)}',
                      style: AppTypography.bodySmall,
                    ),
                  ],
                ),
              ),
            ],
          ),
          Text(customer.phone, style: AppTypography.bodyMedium),
          Text(customer.secondaryPhone ?? '-', style: AppTypography.bodyMedium),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
            decoration: BoxDecoration(
              color: AppColors.primary.withOpacity(0.1),
              borderRadius: AppBorders.radiusFull,
            ),
            child: Text(
              '0',
              style: AppTypography.labelSmall.copyWith(color: AppColors.primary),
            ),
          ),
          const StatusBadge(label: 'نشط', color: AppColors.success),
          Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              AppIconButton(
                icon: Icons.edit_outlined,
                color: AppColors.textSecondary,
                onPressed: () {},
              ),
              AppIconButton(
                icon: Icons.delete_outline,
                color: AppColors.error,
                onPressed: () {},
              ),
            ],
          ),
        ]).toList(),
      ),
    );
  }

  Widget _buildLoadingState() {
    return Padding(
      padding: const EdgeInsets.all(32),
      child: ShimmerLoading(
        child: Container(
          height: 400,
          decoration: BoxDecoration(
            color: AppColors.surface,
            borderRadius: AppBorders.radiusLg,
          ),
        ),
      ),
    );
  }

  Widget _buildErrorState() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(Icons.error_outline, size: 48, color: AppColors.error.withOpacity(0.5)),
          const SizedBox(height: 16),
          Text('حدث خطأ في تحميل البيانات', style: AppTypography.bodyLarge),
          const SizedBox(height: 16),
          AppButton(
            label: 'إعادة المحاولة',
            variant: ButtonVariant.outline,
            onPressed: () => ref.invalidate(customersProvider),
          ),
        ],
      ),
    );
  }

  String _formatDate(DateTime date) {
    final now = DateTime.now();
    final diff = now.difference(date);
    if (diff.inDays > 365) return '${(diff.inDays / 365).floor()} سنة';
    if (diff.inDays > 30) return '${(diff.inDays / 30).floor()} شهر';
    if (diff.inDays > 0) return '${diff.inDays} يوم';
    if (diff.inHours > 0) return '${diff.inHours} ساعة';
    return 'الآن';
  }

  void _showAddCustomerDialog() {
    AppModal.show(
      context: context,
      title: 'عميل جديد',
      content: Column(
        children: [
          _buildTextField('الاسم', Icons.person_outline),
          const SizedBox(height: 16),
          _buildTextField('الهاتف', Icons.phone_outlined),
          const SizedBox(height: 16),
          _buildTextField('البريد الإلكتروني', Icons.email_outlined),
          const SizedBox(height: 16),
          _buildTextField('العنوان', Icons.location_on_outlined),
        ],
      ),
      footer: Row(
        mainAxisAlignment: MainAxisAlignment.end,
        children: [
          AppButton(
            label: 'إلغاء',
            variant: ButtonVariant.ghost,
            onPressed: () => Navigator.pop(context),
          ),
          const SizedBox(width: 8),
          AppButton(
            label: 'حفظ',
            variant: ButtonVariant.primary,
            onPressed: () => Navigator.pop(context),
          ),
        ],
      ),
    );
  }

  Widget _buildTextField(String label, IconData icon) {
    return TextField(
      style: AppTypography.bodyMedium,
      decoration: InputDecoration(
        labelText: label,
        labelStyle: AppTypography.bodyMedium.copyWith(color: AppColors.textTertiary),
        prefixIcon: Icon(icon, size: 20, color: AppColors.textTertiary),
        filled: true,
        fillColor: AppColors.bgPrimary,
        border: OutlineInputBorder(
          borderRadius: AppBorders.radiusMd,
          borderSide: BorderSide(color: AppColors.border.withOpacity(0.5)),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: AppBorders.radiusMd,
          borderSide: BorderSide(color: AppColors.border.withOpacity(0.3)),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: AppBorders.radiusMd,
          borderSide: const BorderSide(color: AppColors.primary, width: 2),
        ),
      ),
    );
  }
}

class AppIconButton extends StatelessWidget {
  final IconData icon;
  final VoidCallback? onPressed;
  final Color? color;
  final double size;

  const AppIconButton({
    super.key,
    required this.icon,
    this.onPressed,
    this.color,
    this.size = 20,
  });

  @override
  Widget build(BuildContext context) {
    return IconButton(
      icon: Icon(icon, size: size, color: color ?? AppColors.textSecondary),
      onPressed: onPressed,
      splashRadius: 20,
    );
  }
}
