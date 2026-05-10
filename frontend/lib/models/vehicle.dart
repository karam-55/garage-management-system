class Vehicle {
  final String id;
  final String customerId;
  final String plateNumber;
  final String model;
  final int year;
  final String color;
  final String fuelType;
  final String? notes;
  final DateTime createdAt;
  final DateTime updatedAt;
  final Customer? customer;

  Vehicle({
    required this.id,
    required this.customerId,
    required this.plateNumber,
    required this.model,
    required this.year,
    required this.color,
    required this.fuelType,
    this.notes,
    required this.createdAt,
    required this.updatedAt,
    this.customer,
  });

  factory Vehicle.fromJson(Map<String, dynamic> json) {
    return Vehicle(
      id: json['id'],
      customerId: json['customerId'],
      plateNumber: json['plateNumber'],
      model: json['model'],
      year: json['year'],
      color: json['color'],
      fuelType: json['fuelType'],
      notes: json['notes'],
      createdAt: DateTime.parse(json['createdAt']),
      updatedAt: DateTime.parse(json['updatedAt']),
      customer: json['customer'] != null ? Customer.fromJson(json['customer']) : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'customerId': customerId,
      'plateNumber': plateNumber,
      'model': model,
      'year': year,
      'color': color,
      'fuelType': fuelType,
      'notes': notes,
      'createdAt': createdAt.toIso8601String(),
      'updatedAt': updatedAt.toIso8601String(),
    };
  }
}
