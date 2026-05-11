import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../core/app_theme.dart';
import '../../models/technician.dart';
import '../../state/technician_provider.dart';
import '../../services/notification_service.dart';

class TechniciansScreenV2 extends ConsumerStatefulWidget {
  const TechniciansScreenV2({super.key});

  @override
  ConsumerState<TechniciansScreenV2> createState() => _TechniciansScreenV2State();
}

class _TechniciansScreenV2State extends ConsumerState<TechniciansScreenV2> {
  String _searchQuery = '';
  String _filterAvailability = 'ALL';

  @override
  Widget build(BuildContext context) {
    final techniciansAsync = ref.watch(techniciansProvider);

    return Container(
      color: AppColors.bgPrimary,
      child: Column(
        children: [
          _buildHeader(),
          _buildFilters(),
          Expanded(
            child: techniciansAsync.when(
              data: (techs) => _buildContent(techs),
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
                Text('الفنيين', style: AppTypography.displaySmall.copyWith(fontSize: 28)),
                const SizedBox(height: 4),
                Text('إدارة فريق الفنيين والتخصصات', style: AppTypography.bodyLarge),
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
                  Text('فني جديد', style: AppTypography.labelLarge.copyWith(
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
      {'label': 'متاح', 'value': 'AVAILABLE'},
      {'label': 'مشغول', 'value': 'BUSY'},
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
                        hintText: 'بحث باسم الفني أو التخصص...',
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
            final isActive = _filterAvailability == f['value'];
            return Padding(
              padding: const EdgeInsets.only(left: 8),
              child: GestureDetector(
                onTap: () => setState(() => _filterAvailability = f['value']!),
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

  Widget _buildContent(List<Technician> techs) {
    final filtered = techs.where((t) {
      if (_filterAvailability == 'AVAILABLE' && !t.isAvailable) return false;
      if (_filterAvailability == 'BUSY' && t.isAvailable) return false;
      if (_searchQuery.isEmpty) return true;
      final q = _searchQuery.toLowerCase();
      return t.name.toLowerCase().contains(q) ||
          (t.specialization?.toLowerCase().contains(q) ?? false);
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
                  Text('قائمة الفنيين', style: AppTypography.headingSmall.copyWith(fontSize: 15)),
                  const Spacer(),
                  Text('${filtered.length} فني', style: AppTypography.bodySmall),
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
                  Expanded(flex: 3, child: Text('الفني', style: AppTypography.labelSmall)),
                  Expanded(flex: 2, child: Text('التخصص', style: AppTypography.labelSmall)),
                  Expanded(flex: 2, child: Text('الهاتف', style: AppTypography.labelSmall)),
                  Expanded(flex: 1, child: Text('الحالة', style: AppTypography.labelSmall)),
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
                        return _TechnicianRow(
                          technician: filtered[index],
                          index: index,
                          onToggleAvailability: () => _toggleAvailability(filtered[index]),
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
          onTap: () => ref.invalidate(techniciansProvider),
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
          child: Icon(Icons.build_outlined,
              size: 40, color: AppColors.primary.withOpacity(0.5)),
        ),
        const SizedBox(height: 20),
        Text('لا يوجد فنيين', style: AppTypography.headingSmall),
        const SizedBox(height: 8),
        Text('أضف فني جديد للبدء', style: AppTypography.bodyLarge),
      ],
    ),
  );

  void _showAddDialog() {
    final nameController = TextEditingController();
    final specController = TextEditingController();
    final phoneController = TextEditingController();

    _showTechnicianDialog(
      title: 'فني جديد',
      nameController: nameController,
      specController: specController,
      phoneController: phoneController,
      onSave: () async {
        final newTech = Technician(
          id: '',
          name: nameController.text,
          specialization: specController.text,
          phone: phoneController.text,
          createdAt: DateTime.now(),
          updatedAt: DateTime.now(),
        );
        try {
          await ref.read(technicianServiceProvider).createTechnician(newTech);
          ref.invalidate(techniciansProvider);
          showSuccessToast(context, 'تم إضافة الفني بنجاح!');
        } catch (e) {
          showErrorToast(context, 'خطأ: \$e');
          rethrow;
        }
      },
    );
  }

  void _showEditDialog(Technician tech) {
    final nameController = TextEditingController(text: tech.name);
    final specController = TextEditingController(text: tech.specialization ?? '');
    final phoneController = TextEditingController(text: tech.phone);

    _showTechnicianDialog(
      title: 'تعديل الفني',
      nameController: nameController,
      specController: specController,
      phoneController: phoneController,
      onSave: () async {
        final updated = Technician(
          id: tech.id,
          name: nameController.text,
          specialization: specController.text,
          phone: phoneController.text,
          isAvailable: tech.isAvailable,
          createdAt: tech.createdAt,
          updatedAt: DateTime.now(),
        );
        try {
          await ref.read(technicianServiceProvider).updateTechnician(tech.id, updated);
          ref.invalidate(techniciansProvider);
          showSuccessToast(context, 'تم تحديث الفني بنجاح!');
        } catch (e) {
          showErrorToast(context, 'خطأ: \$e');
          rethrow;
        }
      },
    );
  }

  void _toggleAvailability(Technician tech) async {
    final updated = Technician(
      id: tech.id,
      name: tech.name,
      specialization: tech.specialization,
      phone: tech.phone,
      isAvailable: !tech.isAvailable,
      createdAt: tech.createdAt,
      updatedAt: DateTime.now(),
    );

    try {
      await ref.read(technicianServiceProvider).updateTechnician(tech.id, updated);
      ref.invalidate(techniciansProvider);
      showSuccessToast(context,
          tech.isAvailable ? 'الفني الآن مشغول' : 'الفني الآن متاح');
    } catch (e) {
      showErrorToast(context, 'خطأ: \$e');
    }
  }

  void _showDeleteDialog(Technician tech) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        backgroundColor: AppColors.bgSecondary,
        shape: RoundedRectangleBorder(
          borderRadius: AppBorders.radiusXl,
          side: BorderSide(color: AppColors.border.withOpacity(0.3)),
        ),
        title: Text('حذف الفني', style: AppTypography.headingSmall),
        content: Text('هل أنت متأكد من حذف ${tech.name}؟', style: AppTypography.bodyMedium),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: Text('إلغاء', style: AppTypography.labelMedium.copyWith(
                color: AppColors.textTertiary)),
          ),
          GestureDetector(
            onTap: () async {
              try {
                await ref.read(technicianServiceProvider).deleteTechnician(tech.id);
                ref.invalidate(techniciansProvider);
                Navigator.pop(context);
                showSuccessToast(context, 'تم حذف الفني بنجاح!');
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

  void _showTechnicianDialog({
    required String title,
    required TextEditingController nameController,
    required TextEditingController specController,
    required TextEditingController phoneController,
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
                        _buildField('الاسم *', Icons.person_outline, nameController),
                        const SizedBox(height: 16),
                        _buildField('التخصص *', Icons.build_outlined, specController),
                        const SizedBox(height: 16),
                        _buildField('الهاتف *', Icons.phone_outlined, phoneController,
                            keyboardType: TextInputType.phone),
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

class _TechnicianRow extends StatefulWidget {
  final Technician technician;
  final int index;
  final VoidCallback onToggleAvailability;
  final VoidCallback onEdit;
  final VoidCallback onDelete;

  const _TechnicianRow({
    required this.technician,
    required this.index,
    required this.onToggleAvailability,
    required this.onEdit,
    required this.onDelete,
  });

  @override
  State<_TechnicianRow> createState() => _TechnicianRowState();
}

class _TechnicianRowState extends State<_TechnicianRow>
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
    final t = widget.technician;
    final statusColor = t.isAvailable ? AppColors.success : AppColors.error;
    final statusText = t.isAvailable ? 'متاح' : 'مشغول';

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
                flex: 3,
                child: Row(
                  children: [
                    Container(
                      width: 40, height: 40,
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
                          t.name.isNotEmpty ? t.name[0] : '?',
                          style: const TextStyle(
                            color: Colors.white, fontWeight: FontWeight.bold, fontSize: 15),
                        ),
                      ),
                    ),
                    const SizedBox(width: 12),
                    Text(t.name, style: AppTypography.labelMedium),
                  ],
                ),
              ),
              Expanded(
                flex: 2,
                child: Text(t.specialization ?? '—', style: AppTypography.bodyMedium),
              ),
              Expanded(
                flex: 2,
                child: Text(t.phone,
                    style: AppTypography.bodyMedium.copyWith(fontFamily: 'monospace')),
              ),
              Expanded(
                flex: 1,
                child: GestureDetector(
                  onTap: widget.onToggleAvailability,
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
