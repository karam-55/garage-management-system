class Booking {
  final String id;
  final String vehicleId;
  final String? technicianId;
  final String serviceDescription;
  final String status; // PENDING, IN_PROGRESS, COMPLETED, CANCELLED
  final DateTime scheduledDate;
  final DateTime createdAt;
  final DateTime updatedAt;

  Booking({
    required this.id,
    required this.vehicleId,
    this.technicianId,
    required this.serviceDescription,
    this.status = 'PENDING',
    required this.scheduledDate,
    required this.createdAt,
    required this.updatedAt,
  });

  factory Booking.fromJson(Map<String, dynamic> json) {
    return Booking(
      id: json['id'],
      vehicleId: json['vehicleId'],
      technicianId: json['technicianId'],
      serviceDescription: json['serviceDescription'],
      status: json['status'] ?? 'PENDING',
      scheduledDate: DateTime.parse(json['scheduledDate']),
      createdAt: DateTime.parse(json['createdAt']),
      updatedAt: DateTime.parse(json['updatedAt']),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'vehicleId': vehicleId,
      'technicianId': technicianId,
      'serviceDescription': serviceDescription,
      'status': status,
      'scheduledDate': scheduledDate.toIso8601String(),
      'createdAt': createdAt.toIso8601String(),
      'updatedAt': updatedAt.toIso8601String(),
    };
  }
}
