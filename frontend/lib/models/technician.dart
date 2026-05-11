class Technician {
  final String id;
  final String name;
  final String? specialization; // backend field: specialty
  final String phone;
  final bool isAvailable;
  final String? notes;
  final DateTime createdAt;
  final DateTime updatedAt;

  Technician({
    required this.id,
    required this.name,
    this.specialization,
    required this.phone,
    this.isAvailable = true,
    this.notes,
    required this.createdAt,
    required this.updatedAt,
  });

  factory Technician.fromJson(Map<String, dynamic> json) {
    return Technician(
      id: json['id'] ?? '',
      name: json['name'] ?? '',
      // Backend uses 'specialty', support both
      specialization: json['specialty'] ?? json['specialization'],
      phone: json['phone'] ?? '',
      notes: json['notes'],
      createdAt: DateTime.parse(json['createdAt'] ?? DateTime.now().toIso8601String()),
      updatedAt: DateTime.parse(json['updatedAt'] ?? DateTime.now().toIso8601String()),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'name': name,
      'phone': phone,
      if (specialization != null) 'specialty': specialization,
      if (notes != null) 'notes': notes,
    };
  }
}
