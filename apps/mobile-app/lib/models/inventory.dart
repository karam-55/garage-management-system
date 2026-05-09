class InventoryItem {
  final String id;
  final String name;
  final String sku;
  final int quantity;
  final int reorderPoint;
  final double price;
  final String? description;
  final DateTime createdAt;
  final DateTime updatedAt;

  InventoryItem({
    required this.id,
    required this.name,
    required this.sku,
    required this.quantity,
    required this.reorderPoint,
    required this.price,
    this.description,
    required this.createdAt,
    required this.updatedAt,
  });

  factory InventoryItem.fromJson(Map<String, dynamic> json) {
    return InventoryItem(
      id: json['id'] as String,
      name: json['name'] as String,
      sku: json['sku'] as String,
      quantity: json['quantity'] as int,
      reorderPoint: json['reorderPoint'] as int,
      price: (json['price'] as num).toDouble(),
      description: json['description'] as String?,
      createdAt: DateTime.parse(json['createdAt'] as String),
      updatedAt: DateTime.parse(json['updatedAt'] as String),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'sku': sku,
      'quantity': quantity,
      'reorderPoint': reorderPoint,
      'price': price,
      'description': description,
      'createdAt': createdAt.toIso8601String(),
      'updatedAt': updatedAt.toIso8601String(),
    };
  }

  String getStockStatus() {
    if (quantity <= reorderPoint / 2) return 'critical';
    if (quantity <= reorderPoint) return 'low';
    return 'normal';
  }
}
