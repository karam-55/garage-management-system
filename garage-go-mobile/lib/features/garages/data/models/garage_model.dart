import 'package:equatable/equatable.dart';

class Garage extends Equatable {
  final String id;
  final String name;
  final String? description;
  final String? address;
  final String? phone;
  final String? email;
  final String? avatar;
  final double? latitude;
  final double? longitude;
  final double rating;
  final int reviewCount;
  final bool isActive;
  final String? ownerId;
  final DateTime createdAt;
  final DateTime? updatedAt;

  Garage({
    required this.id,
    required this.name,
    this.description,
    this.address,
    this.phone,
    this.email,
    this.avatar,
    this.latitude,
    this.longitude,
    this.rating = 0.0,
    this.reviewCount = 0,
    this.isActive = true,
    this.ownerId,
    DateTime? createdAt,
    this.updatedAt,
  }) : createdAt = createdAt ?? DateTime.now();

  factory Garage.fromJson(Map<String, dynamic> json) {
    return Garage(
      id: json['id'] as String,
      name: json['name'] as String,
      description: json['description'] as String?,
      address: json['address'] as String?,
      phone: json['phone'] as String?,
      email: json['email'] as String?,
      avatar: json['avatar'] ?? json['logo'] as String?,
      latitude: (json['latitude'] as num?)?.toDouble(),
      longitude: (json['longitude'] as num?)?.toDouble(),
      rating: (json['rating'] as num?)?.toDouble() ?? 0.0,
      reviewCount: json['reviewCount'] as int? ?? 0,
      isActive: json['isActive'] as bool? ?? true,
      ownerId: json['ownerId'] as String?,
      createdAt: json['createdAt'] != null ? DateTime.parse(json['createdAt'] as String) : null,
      updatedAt: json['updatedAt'] != null ? DateTime.parse(json['updatedAt'] as String) : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'description': description,
      'address': address,
      'phone': phone,
      'email': email,
      'avatar': avatar,
      'latitude': latitude,
      'longitude': longitude,
      'rating': rating,
      'reviewCount': reviewCount,
      'isActive': isActive,
      'ownerId': ownerId,
      'createdAt': createdAt.toIso8601String(),
      'updatedAt': updatedAt?.toIso8601String(),
    };
  }

  Garage copyWith({
    String? id,
    String? name,
    String? description,
    String? address,
    String? phone,
    String? email,
    String? avatar,
    double? latitude,
    double? longitude,
    double? rating,
    int? reviewCount,
    bool? isActive,
    String? ownerId,
    DateTime? createdAt,
    DateTime? updatedAt,
  }) {
    return Garage(
      id: id ?? this.id,
      name: name ?? this.name,
      description: description ?? this.description,
      address: address ?? this.address,
      phone: phone ?? this.phone,
      email: email ?? this.email,
      avatar: avatar ?? this.avatar,
      latitude: latitude ?? this.latitude,
      longitude: longitude ?? this.longitude,
      rating: rating ?? this.rating,
      reviewCount: reviewCount ?? this.reviewCount,
      isActive: isActive ?? this.isActive,
      ownerId: ownerId ?? this.ownerId,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
    );
  }

  @override
  List<Object?> get props => [
        id,
        name,
        description,
        address,
        phone,
        email,
        avatar,
        latitude,
        longitude,
        rating,
        reviewCount,
        isActive,
        ownerId,
        createdAt,
        updatedAt,
      ];

  @override
  String toString() {
    return 'Garage(id: $id, name: $name, rating: $rating)';
  }

  // Helper getters
  bool get hasLocation => latitude != null && longitude != null;
  String get ratingText => rating.toStringAsFixed(1);
  bool get isOpen => isActive; // In real app, this would check opening hours
}

class Service extends Equatable {
  final String id;
  final String? garageId;
  final String title;
  final String? description;
  final double price;
  final int? duration; // in minutes
  final String? category;
  final bool isActive;
  final DateTime? createdAt;
  final DateTime? updatedAt;

  const Service({
    required this.id,
    this.garageId,
    required this.title,
    this.description,
    required this.price,
    this.duration,
    this.category,
    this.isActive = true,
    this.createdAt,
    this.updatedAt,
  });

  factory Service.fromJson(Map<String, dynamic> json) {
    return Service(
      id: json['id'] as String,
      garageId: json['garageId'] as String?,
      title: json['title'] as String,
      description: json['description'] as String?,
      price: (json['price'] as num).toDouble(),
      duration: json['duration'] as int?,
      category: json['category'] as String?,
      isActive: json['isActive'] as bool? ?? true,
      createdAt: json['createdAt'] != null ? DateTime.parse(json['createdAt'] as String) : null,
      updatedAt: json['updatedAt'] != null ? DateTime.parse(json['updatedAt'] as String) : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'garageId': garageId,
      'title': title,
      'description': description,
      'price': price,
      'duration': duration,
      'category': category,
      'isActive': isActive,
      'createdAt': createdAt?.toIso8601String(),
      'updatedAt': updatedAt?.toIso8601String(),
    };
  }

  @override
  List<Object?> get props => [
        id,
        garageId,
        title,
        description,
        price,
        duration,
        category,
        isActive,
        createdAt,
        updatedAt,
      ];

  // Helper getters
  String get priceText => '\$${price.toStringAsFixed(2)}';
  String get durationText {
    if (duration == null) return 'N/A';
    if (duration! < 60) {
      return '${duration}min';
    } else {
      final hours = duration! ~/ 60;
      final minutes = duration! % 60;
      if (minutes == 0) {
        return '${hours}h';
      } else {
        return '${hours}h ${minutes}min';
      }
    }
  }
}

class GarageWithServices extends Equatable {
  final Garage garage;
  final List<Service> services;

  const GarageWithServices({
    required this.garage,
    required this.services,
  });

  factory GarageWithServices.fromJson(Map<String, dynamic> json) {
    // API may return garage flat (direct object) or nested under 'garage' key
    final garageData = json['garage'] is Map ? json['garage'] as Map<String, dynamic> : json;
    final servicesList = json['services'] as List<dynamic>? ?? [];
    return GarageWithServices(
      garage: Garage.fromJson(garageData),
      services: servicesList
          .map((service) => Service.fromJson(service as Map<String, dynamic>))
          .toList(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'garage': garage.toJson(),
      'services': services.map((service) => service.toJson()).toList(),
    };
  }

  @override
  List<Object?> get props => [garage, services];

  GarageWithServices copyWith({
    Garage? garage,
    List<Service>? services,
  }) {
    return GarageWithServices(
      garage: garage ?? this.garage,
      services: services ?? this.services,
    );
  }
}
