class Notification {
  final String id;
  final String title;
  final String message;
  final String type; // info, warning, success, error
  final bool read;
  final DateTime createdAt;
  final Map<String, dynamic>? metadata;

  Notification({
    required this.id,
    required this.title,
    required this.message,
    required this.type,
    required this.read,
    required this.createdAt,
    this.metadata,
  });

  factory Notification.fromJson(Map<String, dynamic> json) {
    return Notification(
      id: json['id'] as String,
      title: json['title'] as String,
      message: json['message'] as String,
      type: json['type'] as String,
      read: json['read'] as bool,
      createdAt: DateTime.parse(json['createdAt'] as String),
      metadata: json['metadata'] as Map<String, dynamic>?,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'title': title,
      'message': message,
      'type': type,
      'read': read,
      'createdAt': createdAt.toIso8601String(),
      'metadata': metadata,
    };
  }
}
