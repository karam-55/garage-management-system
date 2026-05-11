class Invoice {
  final String id;
  final String customerId;
  final String vehicleId;
  final String? bookingId;
  final String invoiceNumber;
  final DateTime date;
  final double totalAmount;
  final double discount;
  final double netAmount;
  final String paymentMethod;
  final String? notes;
  final bool isPaid;
  final DateTime createdAt;
  final DateTime updatedAt;

  Invoice({
    required this.id,
    this.customerId = '',
    this.vehicleId = '',
    this.bookingId,
    this.invoiceNumber = '',
    required this.date,
    double? totalAmount,
    this.discount = 0,
    double? netAmount,
    this.paymentMethod = 'نقدي',
    this.notes,
    this.isPaid = false,
    required this.createdAt,
    required this.updatedAt,
    double? amount,
  }) : totalAmount = amount ?? totalAmount ?? 0,
       netAmount = netAmount ?? (amount ?? totalAmount ?? 0);

  factory Invoice.fromAmount({
    required String id,
    required String bookingId,
    required double amount,
    required bool isPaid,
    required DateTime createdAt,
    required DateTime updatedAt,
  }) {
    return Invoice(
      id: id,
      customerId: '',
      vehicleId: '',
      bookingId: bookingId,
      invoiceNumber: '',
      date: createdAt,
      totalAmount: amount,
      netAmount: amount,
      isPaid: isPaid,
      createdAt: createdAt,
      updatedAt: updatedAt,
    );
  }

  factory Invoice.fromJson(Map<String, dynamic> json) {
    return Invoice(
      id: json['id'] ?? '',
      customerId: json['customerId'] ?? '',
      vehicleId: json['vehicleId'] ?? '',
      bookingId: json['bookingId'],
      invoiceNumber: json['invoiceNumber'] ?? '',
      date: json['date'] != null
          ? DateTime.parse(json['date'])
          : DateTime.now(),
      totalAmount: (json['totalAmount'] as num?)?.toDouble() ?? 0,
      discount: (json['discount'] as num?)?.toDouble() ?? 0,
      netAmount: (json['netAmount'] as num?)?.toDouble() ?? 0,
      paymentMethod: json['paymentMethod'] ?? 'نقدي',
      notes: json['notes'],
      isPaid: json['isPaid'] ?? false,
      createdAt: json['createdAt'] != null
          ? DateTime.parse(json['createdAt'])
          : DateTime.now(),
      updatedAt: json['updatedAt'] != null
          ? DateTime.parse(json['updatedAt'])
          : DateTime.now(),
    );
  }

  /// Backward compatibility alias for totalAmount
  double get amount => totalAmount;

  Map<String, dynamic> toJson() {
    return {
      if (id.isNotEmpty) 'id': id,
      'customerId': customerId,
      'vehicleId': vehicleId,
      if (bookingId != null) 'bookingId': bookingId,
      'invoiceNumber': invoiceNumber,
      'totalAmount': totalAmount,
      'discount': discount,
      'netAmount': netAmount,
      'paymentMethod': paymentMethod,
      if (notes != null) 'notes': notes,
      'isPaid': isPaid,
    };
  }
}
