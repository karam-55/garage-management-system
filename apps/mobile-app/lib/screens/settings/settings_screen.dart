import 'package:flutter/material.dart';
import '../../widgets/custom_card.dart';

class SettingsScreen extends StatefulWidget {
  const SettingsScreen({Key? key}) : super(key: key);

  @override
  State<SettingsScreen> createState() => _SettingsScreenState();
}

class _SettingsScreenState extends State<SettingsScreen> {
  bool _isDarkMode = false;
  String _selectedLanguage = 'ar';
  String _selectedTheme = 'light';

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('الإعدادات'),
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          // Appearance
          CustomCard(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  'المظهر',
                  style: TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const SizedBox(height: 16),
                _buildSwitchTile(
                  'الوضع الداكن',
                  'تفعيل الوضع الداكن للتطبيق',
                  _isDarkMode,
                  (value) => setState(() => _isDarkMode = value),
                ),
                const SizedBox(height: 8),
                _buildLanguageTile(),
              ],
            ),
          ),
          const SizedBox(height: 16),
          // Notifications
          CustomCard(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  'الإشعارات',
                  style: TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const SizedBox(height: 16),
                _buildSwitchTile(
                  'إشعارات الحجوزات',
                  'استلام إشعارات الحجوزات الجديدة',
                  true,
                  (value) {},
                ),
                const SizedBox(height: 8),
                _buildSwitchTile(
                  'إشعارات المخزون',
                  'استلام إشعارات انخفاض المخزون',
                  true,
                  (value) {},
                ),
                const SizedBox(height: 8),
                _buildSwitchTile(
                  'إشعارات الفواتير',
                  'استلام إشعارات الفواتير',
                  false,
                  (value) {},
                ),
              ],
            ),
          ),
          const SizedBox(height: 16),
          // Privacy
          CustomCard(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  'الخصوصية',
                  style: TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const SizedBox(height: 16),
                _buildMenuItem(Icons.lock, 'تغيير كلمة المرور', () {}),
                _buildMenuItem(Icons.fingerprint, 'إصبع البصمة/الوجه', () {}),
                _buildMenuItem(Icons.security, 'الأمان', () {}),
              ],
            ),
          ),
          const SizedBox(height: 16),
          // About
          CustomCard(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  'عن التطبيق',
                  style: TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const SizedBox(height: 16),
                _buildMenuItem(Icons.info, 'الإصدار', () {}, trailing: '1.0.0'),
                _buildMenuItem(Icons.description, 'الشروط والأحكام', () {}),
                _buildMenuItem(Icons.privacy_tip, 'سياسة الخصوصية', () {}),
                _buildMenuItem(Icons.support_agent, 'دعم فني', () {}),
              ],
            ),
          ),
          const SizedBox(height: 16),
          // Danger Zone
          CustomCard(
            backgroundColor: Colors.red.withOpacity(0.05),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  'منطقة الخطر',
                  style: TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                    color: Colors.red,
                  ),
                ),
                const SizedBox(height: 16),
                _buildMenuItem(
                  Icons.delete,
                  'حذف الحساب',
                  () {},
                  color: Colors.red,
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSwitchTile(String title, String subtitle, bool value, Function(bool) onChanged) {
    return SwitchListTile(
      title: Text(title),
      subtitle: Text(subtitle),
      value: value,
      onChanged: onChanged,
    );
  }

  Widget _buildLanguageTile() {
    return ListTile(
      title: const Text('اللغة'),
      subtitle: Text(_selectedLanguage == 'ar' ? 'العربية' : 'English'),
      trailing: DropdownButton<String>(
        value: _selectedLanguage,
        items: const [
          DropdownMenuItem(value: 'ar', child: Text('العربية')),
          DropdownMenuItem(value: 'en', child: Text('English')),
        ],
        onChanged: (value) {
          setState(() => _selectedLanguage = value ?? 'ar');
        },
      ),
    );
  }

  Widget _buildMenuItem(IconData icon, String title, VoidCallback onTap,
      {String? trailing, Color? color}) {
    return InkWell(
      onTap: onTap,
      child: Padding(
        padding: const EdgeInsets.symmetric(vertical: 8),
        child: Row(
          children: [
            Icon(icon, color: color ?? Colors.grey[600]),
            const SizedBox(width: 16),
            Expanded(
              child: Text(
                title,
                style: TextStyle(
                  fontSize: 16,
                  color: color,
                ),
              ),
            ),
            if (trailing != null)
              Text(
                trailing,
                style: TextStyle(
                  color: Colors.grey[600],
                  fontSize: 14,
                ),
              ),
            const SizedBox(width: 8),
            Icon(Icons.arrow_forward_ios, size: 16, color: Colors.grey),
          ],
        ),
      ),
    );
  }
}
