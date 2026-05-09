import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:form_builder_validators/form_builder_validators.dart';
import 'package:go_router/go_router.dart';

import '../../../../core/constants/app_constants.dart';
import '../../../../core/router/app_router.dart';
import '../../../../core/theme/app_theme.dart';
import '../../../../core/utils/logger.dart';
import '../providers/auth_provider.dart';
import '../widgets/auth_text_field.dart';
import '../widgets/loading_button.dart';

class RegisterPage extends ConsumerStatefulWidget {
  const RegisterPage({super.key});

  @override
  ConsumerState<RegisterPage> createState() => _RegisterPageState();
}

class _RegisterPageState extends ConsumerState<RegisterPage> {
  final _formKey = GlobalKey<FormState>();
  final _fullNameController = TextEditingController();
  final _emailController = TextEditingController();
  final _phoneController = TextEditingController();
  final _passwordController = TextEditingController();
  final _confirmPasswordController = TextEditingController();
  
  bool _obscurePassword = true;
  bool _obscureConfirmPassword = true;
  bool _agreeToTerms = false;

  @override
  void dispose() {
    _fullNameController.dispose();
    _emailController.dispose();
    _phoneController.dispose();
    _passwordController.dispose();
    _confirmPasswordController.dispose();
    super.dispose();
  }

  Future<void> _register() async {
    if (!_formKey.currentState!.validate()) {
      return;
    }

    if (!_agreeToTerms) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('يرجى الموافقة على الشروط والأحكام'),
          backgroundColor: AppTheme.errorColor,
        ),
      );
      return;
    }

    final fullName = _fullNameController.text.trim();
    final email = _emailController.text.trim();
    final phone = _phoneController.text.trim();
    final password = _passwordController.text;

    Logger.auth('Attempting registration for: $email');

    try {
      await ref.read(authProvider.notifier).register(
        fullName: fullName,
        email: email,
        phone: phone,
        password: password,
      );

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('تم إنشاء الحساب بنجاح. يرجى تسجيل الدخول.'),
            backgroundColor: AppTheme.successColor,
          ),
        );
        context.navigateToLogin();
      }
    } catch (e) {
      Logger.error('Registration failed', e);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('فشل إنشاء الحساب: ${e.toString()}'),
            backgroundColor: AppTheme.errorColor,
          ),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final authState = ref.watch(authProvider);
    final isLoading = authState.isLoading;

    return Scaffold(
      backgroundColor: Theme.of(context).colorScheme.background,
      body: SafeArea(
        child: SingleChildScrollView(
          padding: EdgeInsets.all(24.w),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              SizedBox(height: 20.h),
              
              // Logo and Title
              Center(
                child: Column(
                  children: [
                    Container(
                      width: 80.w,
                      height: 80.h,
                      decoration: BoxDecoration(
                        color: AppTheme.primaryColor.withOpacity(0.1),
                        borderRadius: BorderRadius.circular(20.r),
                      ),
                      child: Icon(
                        Icons.person_add,
                        size: 40.sp,
                        color: AppTheme.primaryColor,
                      ),
                    ),
                    SizedBox(height: 16.h),
                    Text(
                      'إنشاء حساب جديد',
                      style: TextStyle(
                        fontSize: 28.sp,
                        fontWeight: FontWeight.bold,
                        color: Theme.of(context).colorScheme.onBackground,
                      ),
                    ),
                    SizedBox(height: 8.h),
                    Text(
                      'انضم إلى Garage Go لإدارة سياراتك وحجوزات الصيانة',
                      style: TextStyle(
                        fontSize: 14.sp,
                        color: Theme.of(context).colorScheme.onBackground.withOpacity(0.7),
                      ),
                    ),
                  ],
                ),
              ),
              
              SizedBox(height: 32.h),
              
              // Registration Form
              Form(
                key: _formKey,
                child: Column(
                  children: [
                    // Full Name Field
                    AuthTextField(
                      controller: _fullNameController,
                      label: 'الاسم الكامل',
                      hintText: 'أدخل اسمك الكامل',
                      keyboardType: TextInputType.name,
                      prefixIcon: Icons.person_outline,
                      validator: FormBuilderValidators.compose([
                        FormBuilderValidators.required(errorText: 'الاسم الكامل مطلوب'),
                        FormBuilderValidators.minLength(3, errorText: 'الاسم يجب أن يكون 3 أحرف على الأقل'),
                        FormBuilderValidators.maxLength(50, errorText: 'الاسم يجب ألا يتجاوز 50 حرفاً'),
                      ]),
                    ),
                    
                    SizedBox(height: 16.h),
                    
                    // Email Field
                    AuthTextField(
                      controller: _emailController,
                      label: 'البريد الإلكتروني',
                      hintText: 'أدخل بريدك الإلكتروني',
                      keyboardType: TextInputType.emailAddress,
                      prefixIcon: Icons.email_outlined,
                      validator: FormBuilderValidators.compose([
                        FormBuilderValidators.required(errorText: 'البريد الإلكتروني مطلوب'),
                        FormBuilderValidators.email(errorText: 'يرجى إدخال بريد إلكتروني صحيح'),
                      ]),
                    ),
                    
                    SizedBox(height: 16.h),
                    
                    // Phone Field
                    AuthTextField(
                      controller: _phoneController,
                      label: 'رقم الهاتف',
                      hintText: 'أدخل رقم الهاتف',
                      keyboardType: TextInputType.phone,
                      prefixIcon: Icons.phone_outlined,
                      validator: FormBuilderValidators.compose([
                        FormBuilderValidators.required(errorText: 'رقم الهاتف مطلوب'),
                        FormBuilderValidators.minLength(9, errorText: 'يرجى إدخال رقم هاتف صحيح'),
                        FormBuilderValidators.maxLength(15, errorText: 'يرجى إدخال رقم هاتف صحيح'),
                      ]),
                    ),
                    
                    SizedBox(height: 16.h),
                    
                    // Password Field
                    AuthTextField(
                      controller: _passwordController,
                      label: 'كلمة المرور',
                      hintText: 'أنشئ كلمة مرور',
                      obscureText: _obscurePassword,
                      prefixIcon: Icons.lock_outline,
                      suffixIcon: IconButton(
                        icon: Icon(
                          _obscurePassword ? Icons.visibility_off : Icons.visibility,
                          color: Colors.grey,
                        ),
                        onPressed: () {
                          setState(() {
                            _obscurePassword = !_obscurePassword;
                          });
                        },
                      ),
                      validator: FormBuilderValidators.compose([
                        FormBuilderValidators.required(errorText: 'كلمة المرور مطلوبة'),
                        FormBuilderValidators.minLength(
                          AppConstants.minPasswordLength,
                          errorText: 'كلمة المرور يجب أن تكون ${AppConstants.minPasswordLength} أحرف على الأقل',
                        ),
                        FormBuilderValidators.maxLength(
                          AppConstants.maxPasswordLength,
                          errorText: 'كلمة المرور يجب ألا تتجاوز ${AppConstants.maxPasswordLength} حرفاً',
                        ),
                      ]),
                    ),
                    
                    SizedBox(height: 16.h),
                    
                    // Confirm Password Field
                    AuthTextField(
                      controller: _confirmPasswordController,
                      label: 'تأكيد كلمة المرور',
                      hintText: 'أعد إدخال كلمة المرور',
                      obscureText: _obscureConfirmPassword,
                      prefixIcon: Icons.lock_outline,
                      suffixIcon: IconButton(
                        icon: Icon(
                          _obscureConfirmPassword ? Icons.visibility_off : Icons.visibility,
                          color: Colors.grey,
                        ),
                        onPressed: () {
                          setState(() {
                            _obscureConfirmPassword = !_obscureConfirmPassword;
                          });
                        },
                      ),
                      validator: FormBuilderValidators.compose([
                        FormBuilderValidators.required(errorText: 'يرجى تأكيد كلمة المرور'),
                        (val) {
                          if (val != _passwordController.text) {
                            return 'كلمتا المرور غير متطابقتين';
                          }
                          return null;
                        },
                      ]),
                    ),
                    
                    SizedBox(height: 24.h),
                    
                    // Terms and Conditions
                    Row(
                      children: [
                        Checkbox(
                          value: _agreeToTerms,
                          onChanged: (value) {
                            setState(() {
                              _agreeToTerms = value ?? false;
                            });
                          },
                          activeColor: AppTheme.primaryColor,
                        ),
                        Expanded(
                          child: Text.rich(
                            TextSpan(
                              text: 'أوافق على ',
                              style: TextStyle(
                                fontSize: 14.sp,
                                color: Theme.of(context).colorScheme.onBackground,
                              ),
                              children: [
                                TextSpan(
                                  text: 'الشروط والأحكام',
                                  style: TextStyle(
                                    fontSize: 14.sp,
                                    color: AppTheme.primaryColor,
                                    fontWeight: FontWeight.w600,
                                  ),
                                ),
                                const TextSpan(text: ' و '),
                                TextSpan(
                                  text: 'سياسة الخصوصية',
                                  style: TextStyle(
                                    fontSize: 14.sp,
                                    color: AppTheme.primaryColor,
                                    fontWeight: FontWeight.w600,
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ),
                      ],
                    ),
                    
                    SizedBox(height: 32.h),
                    
                    // Register Button
                    LoadingButton(
                      onPressed: _register,
                      isLoading: isLoading,
                      text: 'إنشاء الحساب',
                    ),
                    
                    SizedBox(height: 24.h),
                    
                    // Sign In Link
                    Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Text(
                          'لديك حساب مسبقاً؟ ',
                          style: TextStyle(
                            fontSize: 14.sp,
                            color: Theme.of(context).colorScheme.onBackground,
                          ),
                        ),
                        TextButton(
                          onPressed: () {
                            context.navigateToLogin();
                          },
                          child: Text(
                            'تسجيل الدخول',
                            style: TextStyle(
                              fontSize: 14.sp,
                              color: AppTheme.primaryColor,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                        ),
                      ],
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
