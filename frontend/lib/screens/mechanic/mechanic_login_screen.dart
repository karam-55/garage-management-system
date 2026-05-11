import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../core/app_theme.dart';
import '../../models/technician.dart';
import '../../services/technician_service.dart';
import '../../state/mechanic_provider.dart';
import 'mechanic_dashboard_screen.dart';

class MechanicLoginScreen extends ConsumerStatefulWidget {
  const MechanicLoginScreen({super.key});

  @override
  ConsumerState<MechanicLoginScreen> createState() => _MechanicLoginScreenState();
}

class _MechanicLoginScreenState extends ConsumerState<MechanicLoginScreen> {
  final _service = TechnicianService();
  List<Technician> _technicians = [];
  bool _loading = true;
  String? _error;

  @override
  void initState() {
    super.initState();
    _loadTechnicians();
  }

  Future<void> _loadTechnicians() async {
    try {
      final techs = await _service.getTechnicians();
      setState(() {
        _technicians = techs;
        _loading = false;
      });
    } catch (e) {
      setState(() {
        _error = 'فشل تحميل الفنيين: $e';
        _loading = false;
      });
    }
  }

  void _selectTechnician(Technician tech) {
    ref.read(currentMechanicProvider.notifier).state = tech;
    Navigator.pushReplacement(
      context,
      MaterialPageRoute(builder: (_) => const MechanicDashboardScreen()),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.bgPrimary,
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              const SizedBox(height: 60),
              Container(
                padding: const EdgeInsets.all(20),
                decoration: BoxDecoration(
                  gradient: const LinearGradient(colors: AppColors.gradientPrimary),
                  shape: BoxShape.circle,
                  boxShadow: [AppShadows.lg],
                ),
                child: const Icon(Icons.build, size: 48, color: Colors.white),
              ),
              const SizedBox(height: 24),
              Text('تسجيل دخول الميكانيكي', style: AppTypography.headingMedium),
              const SizedBox(height: 8),
              Text('اختر اسمك من القائمة', style: AppTypography.bodyMedium.copyWith(
                color: AppColors.textMuted)),
              const SizedBox(height: 40),
              if (_loading)
                const CircularProgressIndicator()
              else if (_error != null)
                Text(_error!, style: AppTypography.bodyMedium.copyWith(
                  color: AppColors.error))
              else
                Expanded(
                  child: ListView.builder(
                    itemCount: _technicians.length,
                    itemBuilder: (context, index) {
                      final tech = _technicians[index];
                      return GestureDetector(
                        onTap: () => _selectTechnician(tech),
                        child: Container(
                          margin: const EdgeInsets.only(bottom: 12),
                          padding: const EdgeInsets.all(16),
                          decoration: BoxDecoration(
                            color: AppColors.bgCard,
                            borderRadius: AppBorders.radiusLg,
                            border: Border.all(color: AppColors.border.withOpacity(0.2)),
                            boxShadow: [AppShadows.sm],
                          ),
                          child: Row(
                            children: [
                              Container(
                                width: 48,
                                height: 48,
                                decoration: BoxDecoration(
                                  gradient: const LinearGradient(colors: AppColors.gradientPrimary),
                                  shape: BoxShape.circle,
                                ),
                                child: Center(
                                  child: Text(
                                    tech.name.substring(0, 1),
                                    style: AppTypography.headingSmall.copyWith(
                                      color: Colors.white, fontSize: 20),
                                  ),
                                ),
                              ),
                              const SizedBox(width: 16),
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(tech.name, style: AppTypography.bodyLarge.copyWith(
                                      fontWeight: FontWeight.w600)),
                                    const SizedBox(height: 4),
                                    Text(tech.specialization ?? 'فني عام',  
                                      style: AppTypography.bodySmall.copyWith(
                                        color: AppColors.textMuted)),
                                  ],
                                ),
                              ),
                              Icon(Icons.arrow_forward_ios, size: 16,
                                color: AppColors.textTertiary),
                            ],
                          ),
                        ),
                      );
                    },
                  ),
                ),
            ],
          ),
        ),
      ),
    );
  }
}
