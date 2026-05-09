import 'package:equatable/equatable.dart';

import 'package:garage_go_mobile/features/garages/data/models/garage_model.dart';
import 'package:garage_go_mobile/features/vehicles/data/models/vehicle_model.dart';

class Booking extends Equatable {
  final String id;
  final String userId;
  final String garageId;
  final String vehicleId;
  final String serviceId;
  final DateTime scheduledAt;
  final String status;
  final double? price;
  final String? notes;
  final String? mechanicId;
  final DateTime createdAt;
  final DateTime updatedAt;

  const Booking({
    required this.id,
    required this.userId,
    required this.garageId,
    required this.vehicleId,
    required this.serviceId,
    required this.scheduledAt,
    required this.status,
    this.price,
    this.notes,
    this.mechanicId,
    required this.createdAt,
    required this.updatedAt,
  });

  factory Booking.fromJson(Map<String, dynamic> json) {
    return Booking(
      id: json['id'] as String,
      userId: json['userId'] as String,
      garageId: json['garageId'] as String,
      vehicleId: json['vehicleId'] as String,
      serviceId: json['serviceId'] as String,
      scheduledAt: DateTime.parse(json['scheduledAt'] as String),
      status: json['status'] as String,
      price: json['totalPrice'] != null ? (json['totalPrice'] as num).toDouble() : (json['price'] as num?)?.toDouble(),
      notes: json['notes'] as String?,
      mechanicId: json['mechanicId'] as String?,
      createdAt: DateTime.parse((json['createdAt'] ?? DateTime.now().toIso8601String()) as String),
      updatedAt: json['updatedAt'] != null ? DateTime.parse(json['updatedAt'] as String) : DateTime.now(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'userId': userId,
      'garageId': garageId,
      'vehicleId': vehicleId,
      'serviceId': serviceId,
      'scheduledAt': scheduledAt.toIso8601String(),
      'status': status,
      'totalPrice': price,
      'notes': notes,
      'mechanicId': mechanicId,
      'createdAt': createdAt.toIso8601String(),
      'updatedAt': updatedAt.toIso8601String(),
    };
  }

  Booking copyWith({
    String? id,
    String? userId,
    String? garageId,
    String? vehicleId,
    String? serviceId,
    DateTime? scheduledAt,
    String? status,
    double? price,
    String? notes,
    String? mechanicId,
    DateTime? createdAt,
    DateTime? updatedAt,
  }) {
    return Booking(
      id: id ?? this.id,
      userId: userId ?? this.userId,
      garageId: garageId ?? this.garageId,
      vehicleId: vehicleId ?? this.vehicleId,
      serviceId: serviceId ?? this.serviceId,
      scheduledAt: scheduledAt ?? this.scheduledAt,
      status: status ?? this.status,
      price: price ?? this.price,
      notes: notes ?? this.notes,
      mechanicId: mechanicId ?? this.mechanicId,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
    );
  }

  @override
  List<Object?> get props => [
        id,
        userId,
        garageId,
        vehicleId,
        serviceId,
        scheduledAt,
        status,
        price,
        notes,
        mechanicId,
        createdAt,
        updatedAt,
      ];

  @override
  String toString() {
    return 'Booking(id: $id, status: $status, scheduledAt: $scheduledAt)';
  }

  // Helper getters
  String get priceText => price != null ? '\$${price!.toStringAsFixed(2)}' : 'N/A';
  String get statusText => status.replaceAll('_', ' ').toUpperCase();
  bool get isPending => status == 'PENDING';
  bool get isConfirmed => status == 'CONFIRMED';
  bool get isInProgress => status == 'IN_PROGRESS';
  bool get isCompleted => status == 'COMPLETED';
  bool get isCancelled => status == 'CANCELLED';
}

class BookingWithDetails extends Equatable {
  final Booking booking;
  final Garage? garage;
  final Service? service;
  final Vehicle? vehicle;

  const BookingWithDetails({
    required this.booking,
    this.garage,
    this.service,
    this.vehicle,
  });

  factory BookingWithDetails.fromJson(Map<String, dynamic> json) {
    final bookingData = json['booking'] is Map ? json['booking'] as Map<String, dynamic> : json;
    return BookingWithDetails(
      booking: Booking.fromJson(bookingData),
      garage: json['garage'] != null
          ? Garage.fromJson(json['garage'] as Map<String, dynamic>)
          : null,
      service: json['service'] != null
          ? Service.fromJson(json['service'] as Map<String, dynamic>)
          : null,
      vehicle: json['vehicle'] != null
          ? Vehicle.fromJson(json['vehicle'] as Map<String, dynamic>)
          : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'booking': booking.toJson(),
      'garage': garage?.toJson(),
      'service': service?.toJson(),
      'vehicle': vehicle?.toJson(),
    };
  }

  @override
  List<Object?> get props => [booking, garage, service, vehicle];

  BookingWithDetails copyWith({
    Booking? booking,
    Garage? garage,
    Service? service,
    Vehicle? vehicle,
  }) {
    return BookingWithDetails(
      booking: booking ?? this.booking,
      garage: garage ?? this.garage,
      service: service ?? this.service,
      vehicle: vehicle ?? this.vehicle,
    );
  }
}

class CreateBookingRequest extends Equatable {
  final String garageId;
  final String vehicleId;
  final String serviceId;
  final DateTime scheduledAt;
  final String? notes;

  const CreateBookingRequest({
    required this.garageId,
    required this.vehicleId,
    required this.serviceId,
    required this.scheduledAt,
    this.notes,
  });

  Map<String, dynamic> toJson() {
    return {
      'garageId': garageId,
      'vehicleId': vehicleId,
      'serviceId': serviceId,
      'scheduledAt': scheduledAt.toIso8601String(),
      'notes': notes,
    };
  }

  @override
  List<Object?> get props => [garageId, vehicleId, serviceId, scheduledAt, notes];
}

class UpdateBookingRequest extends Equatable {
  final String? status;
  final DateTime? scheduledAt;
  final String? notes;
  final String? mechanicId;

  const UpdateBookingRequest({
    this.status,
    this.scheduledAt,
    this.notes,
    this.mechanicId,
  });

  Map<String, dynamic> toJson() {
    final data = <String, dynamic>{};
    if (status != null) data['status'] = status;
    if (scheduledAt != null) data['scheduledAt'] = scheduledAt!.toIso8601String();
    if (notes != null) data['notes'] = notes;
    if (mechanicId != null) data['mechanicId'] = mechanicId;
    return data;
  }

  @override
  List<Object?> get props => [status, scheduledAt, notes, mechanicId];
}

