enum EmployeeRole {
  owner,
  manager,
  receptionist,
  mechanic,
  cashier;

  String get label {
    switch (this) {
      case EmployeeRole.owner: return 'مالك';
      case EmployeeRole.manager: return 'مدير';
      case EmployeeRole.receptionist: return 'موظف استقبال';
      case EmployeeRole.mechanic: return 'ميكانيكي';
      case EmployeeRole.cashier: return 'كاشير';
    }
  }

  static EmployeeRole fromString(String value) {
    switch (value.toUpperCase()) {
      case 'OWNER': return EmployeeRole.owner;
      case 'MANAGER': return EmployeeRole.manager;
      case 'RECEPTIONIST': return EmployeeRole.receptionist;
      case 'MECHANIC': return EmployeeRole.mechanic;
      case 'CASHIER': return EmployeeRole.cashier;
      default: return EmployeeRole.receptionist;
    }
  }

  String get apiValue {
    switch (this) {
      case EmployeeRole.owner: return 'OWNER';
      case EmployeeRole.manager: return 'MANAGER';
      case EmployeeRole.receptionist: return 'RECEPTIONIST';
      case EmployeeRole.mechanic: return 'MECHANIC';
      case EmployeeRole.cashier: return 'CASHIER';
    }
  }
}

class Employee {
  final String id;
  final String name;
  final String phone;
  final EmployeeRole role;
  final bool isActive;
  final String? notes;
  final DateTime createdAt;

  const Employee({
    required this.id,
    required this.name,
    required this.phone,
    required this.role,
    this.isActive = true,
    this.notes,
    required this.createdAt,
  });

  factory Employee.fromJson(Map<String, dynamic> json) {
    return Employee(
      id: json['id'] ?? '',
      name: json['name'] ?? '',
      phone: json['phone'] ?? '',
      role: EmployeeRole.fromString(json['role'] ?? 'RECEPTIONIST'),
      isActive: json['isActive'] ?? true,
      notes: json['notes'],
      createdAt: json['createdAt'] != null
          ? DateTime.parse(json['createdAt'])
          : DateTime.now(),
    );
  }

  Map<String, dynamic> toJson() => {
    'id': id,
    'name': name,
    'phone': phone,
    'role': role.apiValue,
    'isActive': isActive,
    'notes': notes,
    'createdAt': createdAt.toIso8601String(),
  };
}
