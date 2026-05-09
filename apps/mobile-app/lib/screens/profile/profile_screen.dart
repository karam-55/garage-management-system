import 'package:flutter/material.dart';
import '../../widgets/custom_card.dart';
import '../../widgets/custom_button.dart';

class ProfileScreen extends StatefulWidget {
  const ProfileScreen({Key? key}) : super(key: key);

  @override
  State<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends State<ProfileScreen> {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('الملف الشخصي'),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Profile Header
            CustomCard(
              child: Column(
                children: [
                  Stack(
                    children: [
                      CircleAvatar(
                        radius: 50,
                        backgroundColor: Colors.blue.withOpacity(0.1),
                        child: const Icon(Icons.person, color: Colors.blue, size: 50),
                      ),
                      Positioned(
                        bottom: 0,
                        right: 0,
                        child: Container(
                          padding: const EdgeInsets.all(8),
                          decoration: BoxDecoration(
                            color: Colors.blue,
                            shape: BoxShape.circle,
                          ),
                          child: const Icon(Icons.camera_alt, color: Colors.white, size: 16),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 16),
                  const Text(
                    'أحمد محمد',
                    style: TextStyle(
                      fontSize: 24,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: 8),
                  const Text(
                    'ميكانيكي',
                    style: TextStyle(color: Colors.grey),
                  ),
                  const SizedBox(height: 16),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      _buildStatItem('الحجوزات', '156'),
                      const SizedBox(width: 32),
                      _buildStatItem('التقييم', '4.8'),
                      const SizedBox(width: 32),
                      _buildStatItem('الخبرة', '5 سنوات'),
                    ],
                  ),
                ],
              ),
            ),
            const SizedBox(height: 16),
            // Personal Info
            CustomCard(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'المعلومات الشخصية',
                    style: TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: 16),
                  _buildInfoRow('الاسم الكامل', 'أحمد محمد'),
                  _buildInfoRow('البريد الإلكتروني', 'أحمد@example.com'),
                  _buildInfoRow('رقم الهاتف', '0501234567'),
                  _buildInfoRow('العنوان', 'أبو ظبي، الإمارات'),
                ],
              ),
            ),
            const SizedBox(height: 16),
            // Menu Items
            CustomCard(
              child: Column(
                children: [
                  _buildMenuItem(Icons.edit, 'تعديل الملف الشخصي', () {
                    // TODO: Implement edit profile
                  }),
                  _buildMenuItem(Icons.security, 'تغيير كلمة المرور', () {
                    // TODO: Implement change password
                  }),
                  _buildMenuItem(Icons.language, 'اللغة', () {
                    // TODO: Implement language
                  }),
                  _buildMenuItem(Icons.notifications, 'الإشعارات', () {
                    Navigator.pushNamed(context, '/notifications');
                  }),
                  _buildMenuItem(Icons.settings, 'الإعدادات', () {
                    Navigator.pushNamed(context, '/settings');
                  }),
                  _buildMenuItem(Icons.help, 'المساعدة', () {
                    // TODO: Implement help
                  }),
                  _buildMenuItem(Icons.info, 'عن التطبيق', () {
                    // TODO: Implement about
                  }),
                ],
              ),
            ),
            const SizedBox(height: 16),
            // Logout Button
            CustomButton(
              text: 'تسجيل الخروج',
              onPressed: () {
                _showLogoutDialog();
              },
              backgroundColor: Colors.red,
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildStatItem(String label, String value) {
    return Column(
      children: [
        Text(
          value,
          style: const TextStyle(
            fontSize: 20,
            fontWeight: FontWeight.bold,
          ),
        ),
        const SizedBox(height: 4),
        Text(
          label,
          style: const TextStyle(fontSize: 12, color: Colors.grey),
        ),
      ],
    );
  }

  Widget _buildInfoRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(
            label,
            style: const TextStyle(color: Colors.grey),
          ),
          Text(
            value,
            style: const TextStyle(fontWeight: FontWeight.w500),
          ),
        ],
      ),
    );
  }

  Widget _buildMenuItem(IconData icon, String title, VoidCallback onTap) {
    return InkWell(
      onTap: onTap,
      child: Padding(
        padding: const EdgeInsets.symmetric(vertical: 12),
        child: Row(
          children: [
            Icon(icon, color: Colors.grey[600]),
            const SizedBox(width: 16),
            Expanded(
              child: Text(
                title,
                style: const TextStyle(fontSize: 16),
              ),
            ),
            const Icon(Icons.arrow_forward_ios, size: 16, color: Colors.grey),
          ],
        ),
      ),
    );
  }

  void _showLogoutDialog() {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('تسجيل الخروج'),
        content: const Text('هل أنت متأكد من تسجيل الخروج؟'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('إلغاء'),
          ),
          TextButton(
            onPressed: () {
              Navigator.pop(context);
              // TODO: Implement logout
              Navigator.pushReplacementNamed(context, '/login');
            },
            child: const Text('تسجيل الخروج', style: TextStyle(color: Colors.red)),
          ),
        ],
      ),
    );
  }
}
