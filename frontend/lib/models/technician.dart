class Technician {
  final String id;
  final String name;
  final String specialization;
  final String phone;
  final bool isAvailable;
  final DateTime createdAt;
  final DateTime updatedAt;

  Technician({
    required this.id,
    required this.name,
    required this.specialization,
    required this.phone,
    this.isAvailable = true,
    required this.createdAt,
    required this.updatedAt,
  });

  factory Technician.fromJson(Map<String, dynamic> json) {
    return Technician(
      id: json['id'],
      name: json['name'],
      specialization: json['specialization'],
      phone: json['phone'],
      isAvailable: json['isAvailable'] ?? true,
      createdAt: DateTime.parse(json['createdAt']),
      updatedAt: DateTime.parse(json['updatedAt']),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'specialization': specialization,
      'phone': phone,
      'isAvailable': isAvailable,
      'createdAt': createdAt.toIso8601String(),
      'updatedAt': updatedAt.toIso8601String(),
    };
  }
}
