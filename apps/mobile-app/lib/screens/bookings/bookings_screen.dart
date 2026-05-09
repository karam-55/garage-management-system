import 'package:flutter/material.dart';
import '../../widgets/custom_card.dart';
import '../../widgets/status_badge.dart';

class BookingsScreen extends StatefulWidget {
  const BookingsScreen({Key? key}) : super(key: key);

  @override
  State<BookingsScreen> createState() => _BookingsScreenState();
}

class _BookingsScreenState extends State<BookingsScreen> {
  String _selectedFilter = 'all';
  final List<Map<String, dynamic>> _bookings = [
    {
      'id': '1',
      'vehicle': 'تويوتا كامري',
      'customer': 'أحمد محمد',
      'service': 'تغيير زيت',
      'status': 'IN_PROGRESS',
      'date': '2024-05-09',
    },
    {
      'id': '2',
      'vehicle': 'هوندا أكورد',
      'customer': 'خالد علي',
      'service': 'فحص عام',
      'status': 'COMPLETED',
      'date': '2024-05-08',
    },
    {
      'id': '3',
      'vehicle': 'نيسان صني',
      'customer': 'محمد أحمد',
      'service': 'تبديل فرامل',
      'status': 'PENDING',
      'date': '2024-05-10',
    },
    {
      'id': '4',
      'vehicle': 'بي ام دبليو X5',
      'customer': 'عمر خالد',
      'service': 'تغيير إطارات',
      'status': 'IN_PROGRESS',
      'date': '2024-05-09',
    },
  ];

  List<Map<String, dynamic>> get _filteredBookings {
    if (_selectedFilter == 'all') return _bookings;
    return _bookings.where((b) => b['status'] == _selectedFilter).toList();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('الحجوزات'),
      ),
      body: Column(
        children: [
          // Filter Chips
          SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            padding: const EdgeInsets.all(16),
            child: Row(
              children: [
                _buildFilterChip('الكل', 'all'),
                const SizedBox(width: 8),
                _buildFilterChip('قيد الانتظار', 'PENDING'),
                const SizedBox(width: 8),
                _buildFilterChip('قيد التنفيذ', 'IN_PROGRESS'),
                const SizedBox(width: 8),
                _buildFilterChip('مكتمل', 'COMPLETED'),
              ],
            ),
          ),
          // Bookings List
          Expanded(
            child: ListView.builder(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              itemCount: _filteredBookings.length,
              itemBuilder: (context, index) {
                final booking = _filteredBookings[index];
                return CustomCard(
                  onTap: () {
                    Navigator.pushNamed(
                      context,
                      '/bookings/${booking['id']}',
                    );
                  },
                  child: Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.all(12),
                        decoration: BoxDecoration(
                          color: Colors.blue.withOpacity(0.1),
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: const Icon(Icons.directions_car, color: Colors.blue),
                      ),
                      const SizedBox(width: 16),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              booking['vehicle'],
                              style: const TextStyle(
                                fontSize: 16,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                            const SizedBox(height: 4),
                            Text(
                              booking['customer'],
                              style: const TextStyle(
                                fontSize: 14,
                                color: Colors.grey,
                              ),
                            ),
                            const SizedBox(height: 4),
                            Text(
                              booking['service'],
                              style: const TextStyle(fontSize: 12),
                            ),
                          ],
                        ),
                      ),
                      StatusBadge(status: booking['status']),
                    ],
                  ),
                );
              },
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildFilterChip(String label, String value) {
    final isSelected = _selectedFilter == value;
    return FilterChip(
      label: Text(label),
      selected: isSelected,
      onSelected: (selected) {
        setState(() => _selectedFilter = value);
      },
      backgroundColor: Colors.grey[200],
      selectedColor: Theme.of(context).primaryColor.withOpacity(0.2),
      checkmarkColor: Theme.of(context).primaryColor,
      labelStyle: TextStyle(
        color: isSelected ? Theme.of(context).primaryColor : Colors.black87,
      ),
    );
  }
}
