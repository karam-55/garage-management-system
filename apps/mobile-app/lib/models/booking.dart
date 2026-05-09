class Booking {
  final String id;
  final String customerId;
  final String customerName;
  final String vehicleId;
  final String vehiclePlate;
  final String vehicleBrand;
  final String vehicleModel;
  final String status; // PENDING, IN_PROGRESS, COMPLETED, CANCELLED
  final DateTime date;
  final List<Service> services;
  final List<AdditionalService> additionalServices;
  final double totalAmount;
  final String? notes;
  final DateTime createdAt;
  final DateTime updatedAt;

  Booking({
    required this.id,
    required this.customerId,
    required this.customerName,
    required this.vehicleId,
    required this.vehiclePlate,
    required this.vehicleBrand,
    required this.vehicleModel,
    required this.status,
    required this.date,
    required this.services,
    required this.additionalServices,
    required this.totalAmount,
    this.notes,
    required this.createdAt,
    required this.updatedAt,
  });

  factory Booking.fromJson(Map<String, dynamic> json) {
    return Booking(
      id: json['id'] as String,
      customerId: json['customerId'] as String,
      customerName: json['customerName'] as String,
      vehicleId: json['vehicleId'] as String,
      vehiclePlate: json['vehiclePlate'] as String,
      vehicleBrand: json['vehicleBrand'] as String,
      vehicleModel: json['vehicleModel'] as String,
      status: json['status'] as String,
      date: DateTime.parse(json['date'] as String),
      services: (json['services'] as List)
          .map((e) => Service.fromJson(e as Map<String, dynamic>))
          .toList(),
      additionalServices: (json['additionalServices'] as List)
          .map((e) => AdditionalService.fromJson(e as Map<String, dynamic>))
          .toList(),
      totalAmount: (json['totalAmount'] as num).toDouble(),
      notes: json['notes'] as String?,
      createdAt: DateTime.parse(json['createdAt'] as String),
      updatedAt: DateTime.parse(json['updatedAt'] as String),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'customerId': customerId,
      'customerName': customerName,
      'vehicleId': vehicleId,
      'vehiclePlate': vehiclePlate,
      'vehicleBrand': vehicleBrand,
      'vehicleModel': vehicleModel,
      'status': status,
      'date': date.toIso8601String(),
      'services': services.map((e) => e.toJson()).toList(),
      'additionalServices': additionalServices.map((e) => e.toJson()).toList(),
      'totalAmount': totalAmount,
      'notes': notes,
      'createdAt': createdAt.toIso8601String(),
      'updatedAt': updatedAt.toIso8601String(),
    };
  }
}

class Service {
  final String id;
  final String name;
  final String description;
  final double price;
  final int estimatedDuration;

  Service({
    required this.id,
    required this.name,
    required this.description,
    required this.price,
    required this.estimatedDuration,
  });

  factory Service.fromJson(Map<String, dynamic> json) {
    return Service(
      id: json['id'] as String,
      name: json['name'] as String,
      description: json['description'] as String,
      price: (json['price'] as num).toDouble(),
      estimatedDuration: json['estimatedDuration'] as int,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'description': description,
      'price': price,
      'estimatedDuration': estimatedDuration,
    };
  }
}

class AdditionalService {
  final String id;
  final String name;
  final double price;
  final bool approved;

  AdditionalService({
    required this.id,
    required this.name,
    required this.price,
    required this.approved,
  });

  factory AdditionalService.fromJson(Map<String, dynamic> json) {
    return AdditionalService(
      id: json['id'] as String,
      name: json['name'] as String,
      price: (json['price'] as num).toDouble(),
      approved: json['approved'] as bool,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'price': price,
      'approved': approved,
    };
  }
}
