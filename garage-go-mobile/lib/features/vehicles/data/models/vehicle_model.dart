import 'package:equatable/equatable.dart';

class Vehicle extends Equatable {
  final String id;
  final String? userId;
  final String make;
  final String model;
  final int year;
  final String plateNumber;
  final String? color;
  final String? vin;
  final int? mileage;
  final String? fuelType;
  final String? transmission;
  final String? engineType;
  final String? imageUrl;
  final bool isActive;
  final DateTime createdAt;
  final DateTime? updatedAt;

  Vehicle({
    required this.id,
    this.userId,
    required this.make,
    required this.model,
    this.year = 0,
    required this.plateNumber,
    this.color,
    this.vin,
    this.mileage,
    this.fuelType,
    this.transmission,
    this.engineType,
    this.imageUrl,
    this.isActive = true,
    DateTime? createdAt,
    this.updatedAt,
  }) : createdAt = createdAt ?? DateTime.now();

  factory Vehicle.fromJson(Map<String, dynamic> json) {
    return Vehicle(
      id: json['id'] as String,
      userId: json['userId'] as String?,
      make: json['make'] as String,
      model: json['model'] as String,
      year: json['year'] as int? ?? 0,
      plateNumber: (json['plateNumber'] ?? json['plate'] ?? '') as String,
      color: json['color'] as String?,
      vin: json['vin'] as String?,
      mileage: json['mileage'] as int?,
      fuelType: json['fuelType'] as String?,
      transmission: json['transmission'] as String?,
      engineType: json['engineType'] as String?,
      imageUrl: json['imageUrl'] as String?,
      isActive: json['isActive'] as bool? ?? true,
      createdAt: json['createdAt'] != null ? DateTime.parse(json['createdAt'] as String) : DateTime.now(),
      updatedAt: json['updatedAt'] != null ? DateTime.parse(json['updatedAt'] as String) : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'userId': userId,
      'make': make,
      'model': model,
      'year': year,
      'plate': plateNumber,
      'color': color,
      'vin': vin,
      'mileage': mileage,
      'isActive': isActive,
      'createdAt': createdAt.toIso8601String(),
      'updatedAt': updatedAt?.toIso8601String(),
    };
  }

  Vehicle copyWith({
    String? id,
    String? userId,
    String? make,
    String? model,
    int? year,
    String? plateNumber,
    String? color,
    String? vin,
    int? mileage,
    String? fuelType,
    String? transmission,
    String? engineType,
    String? imageUrl,
    bool? isActive,
    DateTime? createdAt,
    DateTime? updatedAt,
  }) {
    return Vehicle(
      id: id ?? this.id,
      userId: userId ?? this.userId,
      make: make ?? this.make,
      model: model ?? this.model,
      year: year ?? this.year,
      plateNumber: plateNumber ?? this.plateNumber,
      color: color ?? this.color,
      vin: vin ?? this.vin,
      mileage: mileage ?? this.mileage,
      fuelType: fuelType ?? this.fuelType,
      transmission: transmission ?? this.transmission,
      engineType: engineType ?? this.engineType,
      imageUrl: imageUrl ?? this.imageUrl,
      isActive: isActive ?? this.isActive,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
    );
  }

  @override
  List<Object?> get props => [
        id,
        userId,
        make,
        model,
        year,
        plateNumber,
        color,
        vin,
        mileage,
        fuelType,
        transmission,
        engineType,
        imageUrl,
        isActive,
        createdAt,
        updatedAt,
      ];

  @override
  String toString() {
    return 'Vehicle(id: $id, make: $make, model: $model, year: $year)';
  }

  // Helper getters
  String get displayName => '$year $make $model';
  String get shortName => '$make $model';
  String get initials => '${make[0]}${model[0]}'.toUpperCase();
  String get mileageText => mileage != null ? '$mileage km' : 'N/A';
  String get fuelTypeText => fuelType ?? 'N/A';
  String get transmissionText => transmission ?? 'N/A';
  String get engineTypeText => engineType ?? 'N/A';
}

class CreateVehicleRequest extends Equatable {
  final String make;
  final String model;
  final int year;
  final String plateNumber;
  final String? color;
  final String? vin;
  final int? mileage;
  final String? fuelType;
  final String? transmission;
  final String? engineType;
  final String? imageUrl;

  const CreateVehicleRequest({
    required this.make,
    required this.model,
    required this.year,
    required this.plateNumber,
    this.color,
    this.vin,
    this.mileage,
    this.fuelType,
    this.transmission,
    this.engineType,
    this.imageUrl,
  });

  Map<String, dynamic> toJson() {
    return {
      'make': make,
      'model': model,
      'year': year,
      'plate': plateNumber,
      'color': color,
      'vin': vin,
      'mileage': mileage,
    };
  }

  @override
  List<Object?> get props => [
        make,
        model,
        year,
        plateNumber,
        color,
        vin,
        mileage,
        fuelType,
        transmission,
        engineType,
        imageUrl,
      ];
}

class UpdateVehicleRequest extends Equatable {
  final String? make;
  final String? model;
  final int? year;
  final String? plateNumber;
  final String? color;
  final String? vin;
  final int? mileage;
  final String? fuelType;
  final String? transmission;
  final String? engineType;
  final String? imageUrl;
  final bool? isActive;

  const UpdateVehicleRequest({
    this.make,
    this.model,
    this.year,
    this.plateNumber,
    this.color,
    this.vin,
    this.mileage,
    this.fuelType,
    this.transmission,
    this.engineType,
    this.imageUrl,
    this.isActive,
  });

  Map<String, dynamic> toJson() {
    final data = <String, dynamic>{};
    if (make != null) data['make'] = make;
    if (model != null) data['model'] = model;
    if (year != null) data['year'] = year;
    if (plateNumber != null) data['plate'] = plateNumber;
    if (color != null) data['color'] = color;
    if (vin != null) data['vin'] = vin;
    if (mileage != null) data['mileage'] = mileage;
    return data;
  }

  @override
  List<Object?> get props => [
        make,
        model,
        year,
        plateNumber,
        color,
        vin,
        mileage,
        fuelType,
        transmission,
        engineType,
        imageUrl,
        isActive,
      ];
}

// Vehicle statistics
class VehicleStats extends Equatable {
  final int totalVehicles;
  final int activeVehicles;
  final int inactiveVehicles;
  final List<VehicleMakeCount> makeCounts;
  final List<VehicleYearCount> yearCounts;

  const VehicleStats({
    required this.totalVehicles,
    required this.activeVehicles,
    required this.inactiveVehicles,
    required this.makeCounts,
    required this.yearCounts,
  });

  factory VehicleStats.fromJson(Map<String, dynamic> json) {
    return VehicleStats(
      totalVehicles: json['totalVehicles'] as int,
      activeVehicles: json['activeVehicles'] as int,
      inactiveVehicles: json['inactiveVehicles'] as int,
      makeCounts: (json['makeCounts'] as List<dynamic>)
          .map((item) => VehicleMakeCount.fromJson(item as Map<String, dynamic>))
          .toList(),
      yearCounts: (json['yearCounts'] as List<dynamic>)
          .map((item) => VehicleYearCount.fromJson(item as Map<String, dynamic>))
          .toList(),
    );
  }

  @override
  List<Object?> get props => [
        totalVehicles,
        activeVehicles,
        inactiveVehicles,
        makeCounts,
        yearCounts,
      ];
}

class VehicleMakeCount extends Equatable {
  final String make;
  final int count;

  const VehicleMakeCount({
    required this.make,
    required this.count,
  });

  factory VehicleMakeCount.fromJson(Map<String, dynamic> json) {
    return VehicleMakeCount(
      make: json['make'] as String,
      count: json['count'] as int,
    );
  }

  @override
  List<Object?> get props => [make, count];
}

class VehicleYearCount extends Equatable {
  final int year;
  final int count;

  const VehicleYearCount({
    required this.year,
    required this.count,
  });

  factory VehicleYearCount.fromJson(Map<String, dynamic> json) {
    return VehicleYearCount(
      year: json['year'] as int,
      count: json['count'] as int,
    );
  }

  @override
  List<Object?> get props => [year, count];
}

// Vehicle service history
class VehicleServiceHistory extends Equatable {
  final String id;
  final String vehicleId;
  final String garageId;
  final String serviceType;
  final String description;
  final double cost;
  final DateTime serviceDate;
  final int? mileageAtService;
  final String? notes;
  final DateTime createdAt;

  const VehicleServiceHistory({
    required this.id,
    required this.vehicleId,
    required this.garageId,
    required this.serviceType,
    required this.description,
    required this.cost,
    required this.serviceDate,
    this.mileageAtService,
    this.notes,
    required this.createdAt,
  });

  factory VehicleServiceHistory.fromJson(Map<String, dynamic> json) {
    return VehicleServiceHistory(
      id: json['id'] as String,
      vehicleId: json['vehicleId'] as String,
      garageId: json['garageId'] as String,
      serviceType: json['serviceType'] as String,
      description: json['description'] as String,
      cost: (json['cost'] as num).toDouble(),
      serviceDate: DateTime.parse(json['serviceDate'] as String),
      mileageAtService: json['mileageAtService'] as int?,
      notes: json['notes'] as String?,
      createdAt: DateTime.parse(json['createdAt'] as String),
    );
  }

  @override
  List<Object?> get props => [
        id,
        vehicleId,
        garageId,
        serviceType,
        description,
        cost,
        serviceDate,
        mileageAtService,
        notes,
        createdAt,
      ];

  // Helper getters
  String get costText => '\$${cost.toStringAsFixed(2)}';
  String get serviceDateText => '${serviceDate.day}/${serviceDate.month}/${serviceDate.year}';
  String get mileageText => mileageAtService != null ? '${mileageAtService!.toStringAsFixed(0)} km' : 'N/A';
}
