import 'package:flutter/material.dart';
import '../../widgets/custom_card.dart';
import '../../widgets/status_badge.dart';
import '../../widgets/custom_input.dart';

class InventoryScreen extends StatefulWidget {
  const InventoryScreen({Key? key}) : super(key: key);

  @override
  State<InventoryScreen> createState() => _InventoryScreenState();
}

class _InventoryScreenState extends State<InventoryScreen> {
  final _searchController = TextEditingController();
  String _searchQuery = '';

  final List<Map<String, dynamic>> _inventoryItems = [
    {
      'id': '1',
      'name': 'زيت محرك 5W-30',
      'sku': 'OIL-001',
      'quantity': 15,
      'reorderPoint': 10,
      'price': 150,
    },
    {
      'id': '2',
      'name': 'فلتر زيت',
      'sku': 'FLT-001',
      'quantity': 5,
      'reorderPoint': 10,
      'price': 45,
    },
    {
      'id': '3',
      'name': 'فرامل أمامية',
      'sku': 'BRK-001',
      'quantity': 8,
      'reorderPoint': 10,
      'price': 200,
    },
    {
      'id': '4',
      'name': 'إطار 205/55R16',
      'sku': 'TIR-001',
      'quantity': 20,
      'reorderPoint': 15,
      'price': 350,
    },
    {
      'id': '5',
      'name': 'فلتر هواء',
      'sku': 'FLT-002',
      'quantity': 3,
      'reorderPoint': 10,
      'price': 35,
    },
  ];

  List<Map<String, dynamic>> get _filteredItems {
    if (_searchQuery.isEmpty) return _inventoryItems;
    return _inventoryItems
        .where((item) =>
            item['name'].toString().toLowerCase().contains(_searchQuery.toLowerCase()) ||
            item['sku'].toString().toLowerCase().contains(_searchQuery.toLowerCase()))
        .toList();
  }

  String _getStockStatus(int quantity, int reorderPoint) {
    if (quantity <= reorderPoint / 2) return 'critical';
    if (quantity <= reorderPoint) return 'low';
    return 'normal';
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('المخزون'),
      ),
      body: Column(
        children: [
          // Search Bar
          Padding(
            padding: const EdgeInsets.all(16),
            child: CustomInput(
              label: 'بحث',
              hint: 'ابحث عن منتج...',
              controller: _searchController,
              prefixIcon: const Icon(Icons.search),
              onChanged: (value) {
                setState(() => _searchQuery = value);
              },
            ),
          ),
          // Low Stock Alert
          if (_inventoryItems.any((item) =>
              _getStockStatus(item['quantity'], item['reorderPoint']) == 'critical'))
            CustomCard(
              margin: const EdgeInsets.symmetric(horizontal: 16),
              padding: const EdgeInsets.all(12),
              backgroundColor: Colors.red.withOpacity(0.1),
              child: Row(
                children: [
                  const Icon(Icons.warning, color: Colors.red),
                  const SizedBox(width: 12),
                  const Expanded(
                    child: Text(
                      'تنبيه: هناك منتجات بمخزون منخفض جداً',
                      style: TextStyle(color: Colors.red),
                    ),
                  ),
                ],
              ),
            ),
          const SizedBox(height: 8),
          // Inventory List
          Expanded(
            child: ListView.builder(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              itemCount: _filteredItems.length,
              itemBuilder: (context, index) {
                final item = _filteredItems[index];
                final status = _getStockStatus(item['quantity'], item['reorderPoint']);
                return CustomCard(
                  child: Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.all(12),
                        decoration: BoxDecoration(
                          color: status == 'critical'
                              ? Colors.red.withOpacity(0.1)
                              : status == 'low'
                                  ? Colors.orange.withOpacity(0.1)
                                  : Colors.green.withOpacity(0.1),
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: Icon(
                          Icons.inventory_2,
                          color: status == 'critical'
                              ? Colors.red
                              : status == 'low'
                                  ? Colors.orange
                                  : Colors.green,
                        ),
                      ),
                      const SizedBox(width: 16),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              item['name'],
                              style: const TextStyle(
                                fontSize: 16,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                            const SizedBox(height: 4),
                            Text(
                              item['sku'],
                              style: const TextStyle(
                                fontSize: 12,
                                color: Colors.grey,
                              ),
                            ),
                            const SizedBox(height: 4),
                            Text(
                              '${item['price']} ر.س',
                              style: const TextStyle(fontSize: 12),
                            ),
                          ],
                        ),
                      ),
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.end,
                        children: [
                          Text(
                            '${item['quantity']}',
                            style: TextStyle(
                              fontSize: 24,
                              fontWeight: FontWeight.bold,
                              color: status == 'critical'
                                  ? Colors.red
                                  : status == 'low'
                                      ? Colors.orange
                                      : Colors.green,
                            ),
                          ),
                          const SizedBox(height: 4),
                          StatusBadge(status: status),
                        ],
                      ),
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
}
