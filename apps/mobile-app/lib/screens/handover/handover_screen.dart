import 'package:flutter/material.dart';
import '../../widgets/custom_card.dart';
import '../../widgets/custom_button.dart';
import '../../widgets/custom_input.dart';

class HandoverScreen extends StatefulWidget {
  const HandoverScreen({Key? key}) : super(key: key);

  @override
  State<HandoverScreen> createState() => _HandoverScreenState();
}

class _HandoverScreenState extends State<HandoverScreen> {
  final _notesController = TextEditingController();
  String _selectedMechanic = '';
  bool _isHandingOver = false;

  final List<String> _mechanics = [
    'أحمد محمد',
    'خالد علي',
    'محمد أحمد',
    'عمر خالد',
  ];

  @override
  void dispose() {
    _notesController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('تسليم السيارة'),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Vehicle Info
            CustomCard(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'معلومات السيارة',
                    style: TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: 16),
                  Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.all(16),
                        decoration: BoxDecoration(
                          color: Colors.blue.withOpacity(0.1),
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: const Icon(Icons.directions_car, color: Colors.blue),
                      ),
                      const SizedBox(width: 16),
                      const Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              'تويوتا كامري',
                              style: TextStyle(
                                fontSize: 18,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                            SizedBox(height: 4),
                            Text(
                              'أبو ظبي | 12345',
                              style: TextStyle(color: Colors.grey),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
            const SizedBox(height: 16),
            // Current Mechanic
            CustomCard(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'الميكانيكي الحالي',
                    style: TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: 16),
                  Row(
                    children: [
                      CircleAvatar(
                        radius: 24,
                        backgroundColor: Colors.blue.withOpacity(0.1),
                        child: const Icon(Icons.person, color: Colors.blue),
                      ),
                      const SizedBox(width: 12),
                      const Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              'أحمد محمد',
                              style: TextStyle(fontWeight: FontWeight.bold),
                            ),
                            SizedBox(height: 4),
                            Text('يعمل على السيارة منذ 2 ساعة'),
                          ],
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
            const SizedBox(height: 16),
            // Handover To
            CustomCard(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'تسليم إلى ميكانيكي آخر',
                    style: TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: 16),
                  DropdownButtonFormField<String>(
                    value: _selectedMechanic.isEmpty ? null : _selectedMechanic,
                    decoration: InputDecoration(
                      filled: true,
                      fillColor: Colors.grey[100],
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(12),
                        borderSide: BorderSide.none,
                      ),
                    ),
                    hint: const Text('اختر الميكانيكي'),
                    items: _mechanics.map((mechanic) {
                      return DropdownMenuItem(
                        value: mechanic,
                        child: Text(mechanic),
                      );
                    }).toList(),
                    onChanged: (value) {
                      setState(() => _selectedMechanic = value ?? '');
                    },
                  ),
                ],
              ),
            ),
            const SizedBox(height: 16),
            // Notes
            CustomCard(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'ملاحظات',
                    style: TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: 16),
                  CustomInput(
                    label: 'أضف ملاحظات (اختياري)',
                    hint: 'اكتب أي ملاحظات هنا...',
                    controller: _notesController,
                    maxLines: 3,
                  ),
                ],
              ),
            ),
            const SizedBox(height: 16),
            // Action Buttons
            CustomButton(
              text: 'تسليم السيارة',
              onPressed: () {
                setState(() => _isHandingOver = true);
                // TODO: Implement handover logic
                Future.delayed(const Duration(seconds: 2), () {
                  setState(() => _isHandingOver = false);
                  Navigator.pop(context);
                });
              },
              isDisabled: _selectedMechanic.isEmpty,
              isLoading: _isHandingOver,
            ),
            const SizedBox(height: 12),
            CustomButton(
              text: 'استلام السيارة',
              onPressed: () {
                setState(() => _isHandingOver = true);
                // TODO: Implement receive logic
                Future.delayed(const Duration(seconds: 2), () {
                  setState(() => _isHandingOver = false);
                  Navigator.pop(context);
                });
              },
              isLoading: _isHandingOver,
              backgroundColor: Colors.green,
            ),
          ],
        ),
      ),
    );
  }
}
