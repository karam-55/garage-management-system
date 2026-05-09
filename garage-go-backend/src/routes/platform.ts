import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { platformController } from '@/controllers/platformController';
import { authenticateToken } from '@/middleware/auth';
import { validateRequest } from '@/middleware/validation';
import { body, query } from 'express-validator';

const prisma = new PrismaClient();

const router = Router();

// === المصادقة والمنصات ===

// تسجيل الدخول حسب المنصة
router.post('/login',
  [
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required'),
    body('platform').isIn(['web', 'mobile', 'desktop']).withMessage('Valid platform is required'),
    body('deviceInfo').optional().isObject(),
  ],
  validateRequest,
  platformController.platformLogin
);

// الحصول على معلومات المنصة
router.get('/info',
  authenticateToken,
  platformController.getPlatformInfo
);

// === إعدادات المنصة ===

// تحديث إعدادات المنصة
router.put('/settings',
  authenticateToken,
  [
    body('settings').isObject().withMessage('Settings object is required'),
  ],
  validateRequest,
  platformController.updatePlatformSettings
);

// === المزامنة ===

// مزامنة البيانات للمنصات المحمولة
router.get('/sync',
  authenticateToken,
  [
    query('lastSyncTime').optional().isISO8601().withMessage('Valid date format required'),
    query('platform').optional().isIn(['web', 'mobile', 'desktop']).withMessage('Valid platform required'),
  ],
  validateRequest,
  platformController.syncData
);

// === الإشعارات ===

// إرسال إشعارات للمنصات
router.post('/notifications',
  authenticateToken,
  [
    body('userIds').isArray({ min: 1 }).withMessage('User IDs array is required'),
    body('title').notEmpty().withMessage('Title is required'),
    body('message').notEmpty().withMessage('Message is required'),
    body('type').optional().isString(),
    body('data').optional().isObject(),
    body('platforms').optional().isArray(),
  ],
  validateRequest,
  platformController.sendPlatformNotification
);

// === الإحصائيات ===

// الحصول على إحصائيات المنصة
router.get('/stats',
  authenticateToken,
  [
    query('dateFrom').optional().isISO8601().withMessage('Valid date format required'),
    query('dateTo').optional().isISO8601().withMessage('Valid date format required'),
  ],
  validateRequest,
  platformController.getPlatformStats
);

// === تسجيل الأجهزة ===

// تسجيل جهاز جديد
router.post('/devices/register',
  authenticateToken,
  [
    body('platform').isIn(['web', 'mobile', 'desktop']).withMessage('Valid platform is required'),
    body('deviceToken').notEmpty().withMessage('Device token is required'),
    body('deviceInfo').optional().isObject(),
  ],
  validateRequest,
  async (req, res) => {
    try {
      const { platform, deviceToken, deviceInfo } = req.body;
      const userId = req.user!.id;

      // تسجيل الجهاز في قاعدة البيانات
      const userPlatform = await prisma.userPlatform.upsert({
        where: {
          userId_deviceToken: {
            userId,
            deviceToken,
          },
        },
        update: {
          platform,
          deviceInfo,
          isActive: true,
          lastSeenAt: new Date(),
        },
        create: {
          userId,
          platform,
          deviceToken,
          deviceInfo,
          isActive: true,
          lastSeenAt: new Date(),
        },
      });

      res.json({
        success: true,
        data: userPlatform,
        message: 'Device registered successfully',
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to register device',
      });
    }
  }
);

// إلغاء تسجيل الجهاز
router.delete('/devices/:deviceToken',
  authenticateToken,
  async (req, res) => {
    try {
      const { deviceToken } = req.params;
      const userId = req.user!.id;

      await prisma.userPlatform.updateMany({
        where: {
          userId,
          deviceToken,
        },
        data: {
          isActive: false,
        },
      });

      res.json({
        success: true,
        message: 'Device unregistered successfully',
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to unregister device',
      });
    }
  }
);

export default router;
