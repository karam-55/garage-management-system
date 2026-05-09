import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export enum Role {
  ADMIN = 'ADMIN',
  GARAGE_OWNER = 'GARAGE_OWNER',
  GARAGE_MANAGER = 'GARAGE_MANAGER',
  MECHANIC = 'MECHANIC',
  CUSTOMER = 'CUSTOMER',
  RECEPTIONIST = 'RECEPTIONIST',
  CASHIER = 'CASHIER',
  INVENTORY_MANAGER = 'INVENTORY_MANAGER',
}

export enum Permission {
  // المستخدمين
  USER_READ = 'USER_READ',
  USER_CREATE = 'USER_CREATE',
  USER_UPDATE = 'USER_UPDATE',
  USER_DELETE = 'USER_DELETE',
  
  // الورشات
  GARAGE_READ = 'GARAGE_READ',
  GARAGE_UPDATE = 'GARAGE_UPDATE',
  GARAGE_SETTINGS = 'GARAGE_SETTINGS',
  
  // الحجوز
  BOOKING_READ = 'BOOKING_READ',
  BOOKING_CREATE = 'BOOKING_CREATE',
  BOOKING_UPDATE = 'BOOKING_UPDATE',
  BOOKING_DELETE = 'BOOKING_DELETE',
  BOOKING_CONFIRM = 'BOOKING_CONFIRM',
  
  // بطاقات العمل
  JOB_CARD_READ = 'JOB_CARD_READ',
  JOB_CARD_CREATE = 'JOB_CARD_CREATE',
  JOB_CARD_UPDATE = 'JOB_CARD_UPDATE',
  JOB_CARD_DELETE = 'JOB_CARD_DELETE',
  JOB_CARD_ASSIGN = 'JOB_CARD_ASSIGN',
  JOB_CARD_TIME_TRACK = 'JOB_CARD_TIME_TRACK',
  
  // المخزون
  INVENTORY_READ = 'INVENTORY_READ',
  INVENTORY_CREATE = 'INVENTORY_CREATE',
  INVENTORY_UPDATE = 'INVENTORY_UPDATE',
  INVENTORY_DELETE = 'INVENTORY_DELETE',
  INVENTORY_ADJUST = 'INVENTORY_ADJUST',
  PURCHASE_ORDER_CREATE = 'PURCHASE_ORDER_CREATE',
  PURCHASE_ORDER_APPROVE = 'PURCHASE_ORDER_APPROVE',
  
  // الفواتير
  INVOICE_READ = 'INVOICE_READ',
  INVOICE_CREATE = 'INVOICE_CREATE',
  INVOICE_UPDATE = 'INVOICE_UPDATE',
  INVOICE_DELETE = 'INVOICE_DELETE',
  INVOICE_SEND = 'INVOICE_SEND',
  PAYMENT_PROCESS = 'PAYMENT_PROCESS',
  PAYMENT_REFUND = 'PAYMENT_REFUND',
  
  // التقارير
  REPORT_READ = 'REPORT_READ',
  REPORT_FINANCIAL = 'REPORT_FINANCIAL',
  REPORT_INVENTORY = 'REPORT_INVENTORY',
  REPORT_PERFORMANCE = 'REPORT_PERFORMANCE',
  
  // الإعدادات
  SETTINGS_READ = 'SETTINGS_READ',
  SETTINGS_UPDATE = 'SETTINGS_UPDATE',
  SYSTEM_CONFIG = 'SYSTEM_CONFIG',
  
  // التواصل
  NOTIFICATION_SEND = 'NOTIFICATION_SEND',
  COMMUNICATION_ACCESS = 'COMMUNICATION_ACCESS',
}

export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  [Role.ADMIN]: [
    // كل الصلاحيات
    ...Object.values(Permission),
  ],
  
  [Role.GARAGE_OWNER]: [
    // صلاحيات المالك الكاملة ما عدا إعدادات النظام
    Permission.USER_READ, Permission.USER_CREATE, Permission.USER_UPDATE, Permission.USER_DELETE,
    Permission.GARAGE_READ, Permission.GARAGE_UPDATE, Permission.GARAGE_SETTINGS,
    Permission.BOOKING_READ, Permission.BOOKING_CREATE, Permission.BOOKING_UPDATE, Permission.BOOKING_DELETE, Permission.BOOKING_CONFIRM,
    Permission.JOB_CARD_READ, Permission.JOB_CARD_CREATE, Permission.JOB_CARD_UPDATE, Permission.JOB_CARD_DELETE, Permission.JOB_CARD_ASSIGN,
    Permission.INVENTORY_READ, Permission.INVENTORY_CREATE, Permission.INVENTORY_UPDATE, Permission.INVENTORY_DELETE, Permission.INVENTORY_ADJUST,
    Permission.PURCHASE_ORDER_CREATE, Permission.PURCHASE_ORDER_APPROVE,
    Permission.INVOICE_READ, Permission.INVOICE_CREATE, Permission.INVOICE_UPDATE, Permission.INVOICE_DELETE, Permission.INVOICE_SEND,
    Permission.PAYMENT_PROCESS, Permission.PAYMENT_REFUND,
    Permission.REPORT_READ, Permission.REPORT_FINANCIAL, Permission.REPORT_INVENTORY, Permission.REPORT_PERFORMANCE,
    Permission.SETTINGS_READ, Permission.SETTINGS_UPDATE,
    Permission.NOTIFICATION_SEND, Permission.COMMUNICATION_ACCESS,
  ],

  [Role.GARAGE_MANAGER]: [
    // صلاحيات مدير الكراج
    Permission.USER_READ, Permission.USER_CREATE, Permission.USER_UPDATE,
    Permission.GARAGE_READ, Permission.GARAGE_UPDATE, Permission.GARAGE_SETTINGS,
    Permission.BOOKING_READ, Permission.BOOKING_CREATE, Permission.BOOKING_UPDATE, Permission.BOOKING_DELETE, Permission.BOOKING_CONFIRM,
    Permission.JOB_CARD_READ, Permission.JOB_CARD_CREATE, Permission.JOB_CARD_UPDATE, Permission.JOB_CARD_DELETE, Permission.JOB_CARD_ASSIGN,
    Permission.INVENTORY_READ, Permission.INVENTORY_CREATE, Permission.INVENTORY_UPDATE, Permission.INVENTORY_ADJUST,
    Permission.PURCHASE_ORDER_CREATE, Permission.PURCHASE_ORDER_APPROVE,
    Permission.INVOICE_READ, Permission.INVOICE_CREATE, Permission.INVOICE_UPDATE, Permission.INVOICE_SEND,
    Permission.PAYMENT_PROCESS,
    Permission.REPORT_READ, Permission.REPORT_FINANCIAL, Permission.REPORT_PERFORMANCE,
    Permission.SETTINGS_READ, Permission.SETTINGS_UPDATE,
    Permission.NOTIFICATION_SEND, Permission.COMMUNICATION_ACCESS,
  ],

  [Role.CASHIER]: [
    // صلاحيات أمين الصندوق
    Permission.USER_READ,
    Permission.GARAGE_READ,
    Permission.BOOKING_READ,
    Permission.JOB_CARD_READ, Permission.JOB_CARD_UPDATE,
    Permission.INVENTORY_READ,
    Permission.INVOICE_READ, Permission.INVOICE_CREATE, Permission.INVOICE_UPDATE, Permission.INVOICE_SEND,
    Permission.PAYMENT_PROCESS, Permission.PAYMENT_REFUND,
    Permission.REPORT_READ, Permission.REPORT_FINANCIAL,
    Permission.SETTINGS_READ,
  ],
  
  [Role.MECHANIC]: [
    // صلاحيات الميكانيكي
    Permission.USER_READ,
    Permission.GARAGE_READ,
    Permission.BOOKING_READ,
    Permission.JOB_CARD_READ, Permission.JOB_CARD_UPDATE, Permission.JOB_CARD_TIME_TRACK,
    Permission.INVENTORY_READ,
    Permission.INVOICE_READ,
    Permission.REPORT_READ, Permission.REPORT_PERFORMANCE,
    Permission.COMMUNICATION_ACCESS,
  ],
  
  [Role.CUSTOMER]: [
    // صلاحيات العميل
    Permission.USER_READ, Permission.USER_UPDATE,
    Permission.GARAGE_READ,
    Permission.BOOKING_READ, Permission.BOOKING_CREATE, Permission.BOOKING_UPDATE,
    Permission.JOB_CARD_READ,
    Permission.INVOICE_READ,
    Permission.PAYMENT_PROCESS,
    Permission.COMMUNICATION_ACCESS,
  ],
  
  [Role.RECEPTIONIST]: [
    // صلاحيات الموظف الاستقبال
    Permission.USER_READ, Permission.USER_CREATE, Permission.USER_UPDATE,
    Permission.GARAGE_READ,
    Permission.BOOKING_READ, Permission.BOOKING_CREATE, Permission.BOOKING_UPDATE, Permission.BOOKING_CONFIRM,
    Permission.JOB_CARD_READ, Permission.JOB_CARD_CREATE, Permission.JOB_CARD_UPDATE, Permission.JOB_CARD_ASSIGN,
    Permission.INVENTORY_READ,
    Permission.INVOICE_READ, Permission.INVOICE_CREATE, Permission.INVOICE_SEND,
    Permission.PAYMENT_PROCESS,
    Permission.REPORT_READ,
    Permission.NOTIFICATION_SEND, Permission.COMMUNICATION_ACCESS,
  ],
  
  
  [Role.INVENTORY_MANAGER]: [
    // صلاحيات مدير المخزون
    Permission.USER_READ,
    Permission.GARAGE_READ,
    Permission.BOOKING_READ,
    Permission.JOB_CARD_READ,
    Permission.INVENTORY_READ, Permission.INVENTORY_CREATE, Permission.INVENTORY_UPDATE, Permission.INVENTORY_DELETE, Permission.INVENTORY_ADJUST,
    Permission.PURCHASE_ORDER_CREATE, Permission.PURCHASE_ORDER_APPROVE,
    Permission.INVOICE_READ,
    Permission.REPORT_READ, Permission.REPORT_INVENTORY,
    Permission.NOTIFICATION_SEND,
  ],
};

export class PermissionService {
  // التحقق من صلاحية المستخدم
  static hasPermission(userRole: Role, permission: Permission): boolean {
    const permissions = ROLE_PERMISSIONS[userRole] || [];
    return permissions.includes(permission);
  }

  // التحقق من صلاحيات متعددة
  static hasAnyPermission(userRole: Role, permissions: Permission[]): boolean {
    return permissions.some(permission => this.hasPermission(userRole, permission));
  }

  // التحقق من كل الصلاحيات
  static hasAllPermissions(userRole: Role, permissions: Permission[]): boolean {
    return permissions.every(permission => this.hasPermission(userRole, permission));
  }

  // الحصول على صلاحيات الدور
  static getRolePermissions(role: Role): Permission[] {
    return ROLE_PERMISSIONS[role] || [];
  }

  // التحقق من الوصول للمورد
  static canAccessResource(
    userRole: Role, 
    resourceType: string, 
    action: string,
    resourceOwnerId?: string,
    userId?: string
  ): boolean {
    // التحقق من الصلاحية الأساسية
    const permission = `${resourceType}_${action}` as Permission;
    if (!this.hasPermission(userRole, permission)) {
      return false;
    }

    // للعملاء: يمكنهم الوصول لمواردهم فقط
    if (userRole === Role.CUSTOMER && resourceOwnerId && userId) {
      return resourceOwnerId === userId;
    }

    // للميكانيكيين: يمكنهم الوصول لبطاقات العمل المكلفة لهم
    if (userRole === Role.MECHANIC && resourceType === 'JOB_CARD' && resourceOwnerId && userId) {
      return resourceOwnerId === userId;
    }

    return true;
  }

  // تصفية البيانات حسب الصلاحيات
  static filterDataByPermissions<T>(
    data: T[], 
    userRole: Role, 
    resourceType: string,
    userId?: string
  ): T[] {
    return data.filter(item => {
      // @ts-ignore - Dynamic property access
      const ownerId = item.userId || item.customerId || item.technicianId || item.createdBy;
      return this.canAccessResource(userRole, resourceType, 'READ', ownerId, userId);
    });
  }

  // الحصول على الصلاحيات حسب المنصة
  static getPlatformPermissions(userRole: Role, platform: 'web' | 'mobile' | 'desktop'): Permission[] {
    const basePermissions = this.getRolePermissions(userRole);
    
    // تصفية الصلاحيات حسب المنصة
    switch (platform) {
      case 'mobile':
        // تطبيق الموبايل: صلاحيات محدودة
        return basePermissions.filter(p => 
          !p.includes('SYSTEM') && 
          !p.includes('CONFIG') &&
          !p.includes('DELETE')
        );
      
      case 'desktop':
        // تطبيق ويندوز: كل الصلاحيات
        return basePermissions;
      
      case 'web':
        // الموقع الإلكتروني: صلاحيات العميل والزوار
        return basePermissions.filter(p => 
          p.includes('BOOKING') || 
          p.includes('JOB_CARD_READ') ||
          p.includes('INVOICE_READ') ||
          p.includes('PAYMENT') ||
          p.includes('USER')
        );
      
      default:
        return basePermissions;
    }
  }
}

// Middleware للتحقق من الصلاحيات
export const requirePermission = (permission: Permission) => {
  return (req: any, res: any, next: any) => {
    const user = req.user;
    
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!PermissionService.hasPermission(user.role as Role, permission)) {
      return res.status(403).json({ error: 'Forbidden: Insufficient permissions' });
    }

    next();
  };
};

// Middleware للتحقق من صلاحيات متعددة
export const requireAnyPermission = (permissions: Permission[]) => {
  return (req: any, res: any, next: any) => {
    const user = req.user;
    
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!PermissionService.hasAnyPermission(user.role as Role, permissions)) {
      return res.status(403).json({ error: 'Forbidden: Insufficient permissions' });
    }

    next();
  };
};

// Middleware للتحقق من الوصول للمورد
export const requireResourceAccess = (resourceType: string, action: string) => {
  return (req: any, res: any, next: any) => {
    const user = req.user;
    
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const resourceId = req.params.id;
    const resourceOwnerId = req.body.userId || req.body.customerId || req.body.technicianId;
    
    if (!PermissionService.canAccessResource(
      user.role as Role, 
      resourceType, 
      action, 
      resourceOwnerId, 
      user.id
    )) {
      return res.status(403).json({ error: 'Forbidden: Cannot access this resource' });
    }

    next();
  };
};
