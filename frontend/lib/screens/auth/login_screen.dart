import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../core/app_theme.dart';
import '../../state/auth_provider.dart';

class LoginScreen extends ConsumerStatefulWidget {
  const LoginScreen({super.key});

  @override
  ConsumerState<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends ConsumerState<LoginScreen>
    with SingleTickerProviderStateMixin {
  final _phoneCtrl = TextEditingController();
  final _passwordCtrl = TextEditingController();
  bool _obscurePassword = true;
  bool _loading = false;
  String? _error;
  late AnimationController _animCtrl;
  late Animation<double> _fadeAnim;
  late Animation<Offset> _slideAnim;

  @override
  void initState() {
    super.initState();
    _animCtrl = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 700),
    );
    _fadeAnim = CurvedAnimation(parent: _animCtrl, curve: Curves.easeOut);
    _slideAnim = Tween<Offset>(begin: const Offset(0, 0.06), end: Offset.zero)
        .animate(CurvedAnimation(parent: _animCtrl, curve: Curves.easeOut));
    _animCtrl.forward();
  }

  @override
  void dispose() {
    _animCtrl.dispose();
    _phoneCtrl.dispose();
    _passwordCtrl.dispose();
    super.dispose();
  }

  Future<void> _login() async {
    final phone = _phoneCtrl.text.trim();
    final password = _passwordCtrl.text.trim();
    if (phone.isEmpty || password.isEmpty) {
      setState(() => _error = 'يرجى إدخال رقم الهاتف وكلمة السر');
      return;
    }
    setState(() { _loading = true; _error = null; });
    try {
      await ref.read(authProvider.notifier).login(phone, password);
    } catch (e) {
      setState(() {
        _error = 'رقم الهاتف أو كلمة السر غير صحيحة';
        _loading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.bgPrimary,
      body: Center(
        child: FadeTransition(
          opacity: _fadeAnim,
          child: SlideTransition(
            position: _slideAnim,
            child: SingleChildScrollView(
              padding: const EdgeInsets.all(24),
              child: ConstrainedBox(
                constraints: const BoxConstraints(maxWidth: 420),
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    // Logo
                    Container(
                      width: 100,
                      height: 100,
                      decoration: BoxDecoration(
                        gradient: const LinearGradient(
                          colors: AppColors.gradientPrimary,
                          begin: Alignment.topLeft,
                          end: Alignment.bottomRight,
                        ),
                        borderRadius: BorderRadius.circular(28),
                        boxShadow: [AppShadows.glowStrong(AppColors.primary)],
                      ),
                      child: const Icon(Icons.directions_car, size: 52, color: Colors.white),
                    ),
                    const SizedBox(height: 28),
                    Text('AUTO RENEW', style: AppTypography.headingLarge.copyWith(
                      letterSpacing: 3, fontSize: 26)),
                    const SizedBox(height: 6),
                    Text('نظام إدارة الكراج المتكامل', style: AppTypography.bodyMedium.copyWith(
                      color: AppColors.textMuted)),
                    const SizedBox(height: 48),

                    // Card
                    Container(
                      padding: const EdgeInsets.all(28),
                      decoration: BoxDecoration(
                        color: AppColors.bgCard,
                        borderRadius: AppBorders.radiusXl,
                        border: Border.all(color: AppColors.border.withOpacity(0.3)),
                        boxShadow: [AppShadows.lg],
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text('تسجيل الدخول', style: AppTypography.headingMedium.copyWith(fontSize: 20)),
                          const SizedBox(height: 4),
                          Text('أدخل بيانات الموظف للدخول', style: AppTypography.bodySmall.copyWith(
                            color: AppColors.textMuted)),
                          const SizedBox(height: 28),

                          // Phone Field
                          _buildLabel('رقم الهاتف'),
                          const SizedBox(height: 8),
                          _buildTextField(
                            controller: _phoneCtrl,
                            hint: '05XXXXXXXX',
                            icon: Icons.phone_outlined,
                            keyboardType: TextInputType.phone,
                          ),
                          const SizedBox(height: 20),

                          // Password Field
                          _buildLabel('كلمة السر'),
                          const SizedBox(height: 8),
                          _buildTextField(
                            controller: _passwordCtrl,
                            hint: '••••••••',
                            icon: Icons.lock_outline,
                            obscureText: _obscurePassword,
                            suffix: IconButton(
                              icon: Icon(
                                _obscurePassword ? Icons.visibility_outlined : Icons.visibility_off_outlined,
                                size: 20, color: AppColors.textMuted,
                              ),
                              onPressed: () => setState(() => _obscurePassword = !_obscurePassword),
                            ),
                            onSubmitted: (_) => _login(),
                          ),

                          // Error
                          if (_error != null) ...[
                            const SizedBox(height: 14),
                            Container(
                              padding: const EdgeInsets.all(12),
                              decoration: BoxDecoration(
                                color: AppColors.error.withOpacity(0.1),
                                borderRadius: AppBorders.radiusMd,
                                border: Border.all(color: AppColors.error.withOpacity(0.3)),
                              ),
                              child: Row(
                                children: [
                                  Icon(Icons.error_outline, size: 18, color: AppColors.error),
                                  const SizedBox(width: 10),
                                  Expanded(child: Text(_error!, style: AppTypography.bodySmall.copyWith(
                                    color: AppColors.error))),
                                ],
                              ),
                            ),
                          ],
                          const SizedBox(height: 24),

                          // Login Button
                          SizedBox(
                            width: double.infinity,
                            child: GestureDetector(
                              onTap: _loading ? null : _login,
                              child: AnimatedContainer(
                                duration: const Duration(milliseconds: 200),
                                padding: const EdgeInsets.symmetric(vertical: 15),
                                decoration: BoxDecoration(
                                  gradient: LinearGradient(
                                    colors: _loading
                                        ? [AppColors.border, AppColors.border]
                                        : AppColors.gradientPrimary,
                                  ),
                                  borderRadius: AppBorders.radiusLg,
                                  boxShadow: _loading ? [] : [AppShadows.glow(AppColors.primary)],
                                ),
                                child: Center(
                                  child: _loading
                                      ? const SizedBox(width: 22, height: 22,
                                          child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                                      : Text('دخول', style: AppTypography.labelLarge.copyWith(
                                          color: Colors.white, fontSize: 15)),
                                ),
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 24),

                    // Hint
                    Container(
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: AppColors.info.withOpacity(0.08),
                        borderRadius: AppBorders.radiusMd,
                        border: Border.all(color: AppColors.info.withOpacity(0.2)),
                      ),
                      child: Row(
                        children: [
                          Icon(Icons.info_outline, size: 16, color: AppColors.info),
                          const SizedBox(width: 10),
                          Expanded(child: Text(
                            'الدخول الافتراضي: هاتف 0500000000 | كلمة سر admin123',
                            style: AppTypography.bodySmall.copyWith(color: AppColors.info),
                          )),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildLabel(String label) => Text(label, style: AppTypography.labelMedium.copyWith(
    color: AppColors.textSecondary));

  Widget _buildTextField({
    required TextEditingController controller,
    required String hint,
    required IconData icon,
    TextInputType? keyboardType,
    bool obscureText = false,
    Widget? suffix,
    ValueChanged<String>? onSubmitted,
  }) {
    return TextField(
      controller: controller,
      obscureText: obscureText,
      keyboardType: keyboardType,
      style: AppTypography.bodyMedium,
      onSubmitted: onSubmitted,
      textAlign: TextAlign.right,
      decoration: InputDecoration(
        hintText: hint,
        hintStyle: AppTypography.bodyMedium.copyWith(color: AppColors.textMuted),
        prefixIcon: Icon(icon, size: 20, color: AppColors.textMuted),
        suffixIcon: suffix,
        filled: true,
        fillColor: AppColors.bgTertiary,
        border: OutlineInputBorder(
          borderRadius: AppBorders.radiusMd,
          borderSide: BorderSide(color: AppColors.border.withOpacity(0.3)),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: AppBorders.radiusMd,
          borderSide: BorderSide(color: AppColors.border.withOpacity(0.3)),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: AppBorders.radiusMd,
          borderSide: BorderSide(color: AppColors.primary, width: 1.5),
        ),
        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
      ),
    );
  }
}
