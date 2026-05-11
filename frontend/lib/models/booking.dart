class Booking {
  final String id;
  final String vehicleId;
  final String? customerId;
  final String? technicianId;
  final String serviceDescription; // maps to serviceType in backend
  final String status;
  final DateTime scheduledDate;
  final DateTime createdAt;
  final DateTime updatedAt;

  Booking({
    required this.id,
    required this.vehicleId,
    this.customerId,
    this.technicianId,
    required this.serviceDescription,
    this.status = 'RECEIVED',
    required this.scheduledDate,
    required this.createdAt,
    required this.updatedAt,
  });

  factory Booking.fromJson(Map<String, dynamic> json) {
    return Booking(
      id: json['id'] ?? '',
      vehicleId: json['vehicleId'] ?? '',
      customerId: json['customerId'],
      technicianId: json['technicianId'],
      // Backend uses 'serviceType', fallback to 'serviceDescription'
      serviceDescription: json['serviceType'] ?? json['serviceDescription'] ?? '',
      status: json['status'] ?? 'RECEIVED',
      // Backend uses 'scheduledAt', fallback to 'scheduledDate'
      scheduledDate: DateTime.parse(
        json['scheduledAt'] ?? json['scheduledDate'] ?? DateTime.now().toIso8601String()),
      createdAt: DateTime.parse(json['createdAt'] ?? DateTime.now().toIso8601String()),
      updatedAt: DateTime.parse(json['updatedAt'] ?? DateTime.now().toIso8601String()),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'vehicleId': vehicleId,
      if (customerId != null) 'customerId': customerId,
      if (technicianId != null) 'technicianId': technicianId,
      'serviceType': serviceDescription,
      'status': status,
      'scheduledAt': scheduledDate.toIso8601String(),
    };
  }
}
