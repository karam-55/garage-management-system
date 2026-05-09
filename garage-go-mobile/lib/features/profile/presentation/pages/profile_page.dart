import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:go_router/go_router.dart';

import '../../../../core/router/app_router.dart';
import '../../../../core/theme/app_theme.dart';
import '../../../../core/utils/logger.dart';
import '../../../auth/presentation/providers/auth_provider.dart';

class ProfilePage extends ConsumerWidget {
  const ProfilePage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final user = ref.watch(currentUserProvider);
    final authNotifier = ref.read(authProvider.notifier);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Profile'),
        automaticallyImplyLeading: false,
      ),
      body: SingleChildScrollView(
        padding: EdgeInsets.all(16.w),
        child: Column(
          children: [
            // Profile Header
            Card(
              child: Padding(
                padding: EdgeInsets.all(20.w),
                child: Column(
                  children: [
                    // Avatar
                    CircleAvatar(
                      radius: 40.r,
                      backgroundColor: AppTheme.primaryColor.withOpacity(0.1),
                      child: Text(
                        user?.initials ?? 'U',
                        style: TextStyle(
                          fontSize: 24.sp,
                          fontWeight: FontWeight.bold,
                          color: AppTheme.primaryColor,
                        ),
                      ),
                    ),
                    SizedBox(height: 16.h),
                    
                    // User Info
                    Text(
                      user?.fullName ?? 'Guest User',
                      style: TextStyle(
                        fontSize: 20.sp,
                        fontWeight: FontWeight.bold,
                        color: Theme.of(context).colorScheme.onBackground,
                      ),
                    ),
                    SizedBox(height: 4.h),
                    Text(
                      user?.email ?? 'No email',
                      style: TextStyle(
                        fontSize: 14.sp,
                        color: Theme.of(context).colorScheme.onBackground.withOpacity(0.7),
                      ),
                    ),
                    if (user?.phone != null) ...[
                      SizedBox(height: 4.h),
                      Text(
                        user!.phone!,
                        style: TextStyle(
                          fontSize: 14.sp,
                          color: Theme.of(context).colorScheme.onBackground.withOpacity(0.7),
                        ),
                      ),
                    ],
                    SizedBox(height: 8.h),
                    Chip(
                      label: Text(
                        user?.role ?? 'CUSTOMER',
                        style: TextStyle(
                          fontSize: 12.sp,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                      backgroundColor: AppTheme.primaryColor.withOpacity(0.1),
                    ),
                  ],
                ),
              ),
            ),
            
            SizedBox(height: 24.h),
            
            // Menu Items
            Card(
              child: Column(
                children: [
                  _buildMenuItem(
                    context,
                    title: 'Edit Profile',
                    icon: Icons.edit,
                    onTap: () {
                      Logger.info('Edit profile tapped');
                    },
                  ),
                  _buildMenuItem(
                    context,
                    title: 'Change Password',
                    icon: Icons.lock,
                    onTap: () {
                      Logger.info('Change password tapped');
                    },
                  ),
                  _buildMenuItem(
                    context,
                    title: 'Notifications',
                    icon: Icons.notifications,
                    onTap: () {
                      context.navigateToNotifications();
                    },
                  ),
                  _buildMenuItem(
                    context,
                    title: 'Settings',
                    icon: Icons.settings,
                    onTap: () {
                      Logger.info('Settings tapped');
                    },
                  ),
                  _buildMenuItem(
                    context,
                    title: 'Help & Support',
                    icon: Icons.help,
                    onTap: () {
                      Logger.info('Help tapped');
                    },
                  ),
                  _buildMenuItem(
                    context,
                    title: 'About',
                    icon: Icons.info,
                    onTap: () {
                      Logger.info('About tapped');
                    },
                  ),
                ],
              ),
            ),
            
            SizedBox(height: 24.h),
            
            // Logout Button
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: () async {
                  await _showLogoutDialog(context, authNotifier);
                },
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppTheme.errorColor,
                  padding: EdgeInsets.symmetric(vertical: 16.h),
                ),
                child: Text(
                  'Logout',
                  style: TextStyle(
                    fontSize: 16.sp,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ),
            ),
            
            SizedBox(height: 16.h),
            
            // App Version
            Text(
              'Garage Go v1.0.0',
              style: TextStyle(
                fontSize: 12.sp,
                color: Theme.of(context).colorScheme.onBackground.withOpacity(0.5),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildMenuItem(
    BuildContext context, {
    required String title,
    required IconData icon,
    required VoidCallback onTap,
  }) {
    return ListTile(
      leading: Icon(
        icon,
        color: Theme.of(context).colorScheme.primary,
      ),
      title: Text(
        title,
        style: TextStyle(
          fontSize: 16.sp,
          color: Theme.of(context).colorScheme.onBackground,
        ),
      ),
      trailing: Icon(
        Icons.arrow_forward_ios,
        size: 16.sp,
        color: Theme.of(context).colorScheme.onBackground.withOpacity(0.5),
      ),
      onTap: onTap,
    );
  }

  Future<void> _showLogoutDialog(BuildContext context, dynamic authNotifier) async {
    final result = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Logout'),
        content: const Text('Are you sure you want to logout?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(false),
            child: const Text('Cancel'),
          ),
          TextButton(
            onPressed: () => Navigator.of(context).pop(true),
            child: const Text('Logout'),
          ),
        ],
      ),
    );

    if (result == true) {
      await authNotifier.logout();
      if (context.mounted) {
        context.navigateToLogin();
      }
    }
  }
}
