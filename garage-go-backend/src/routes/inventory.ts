import { Router } from 'express';
import { inventoryController } from '@/controllers/inventoryController';
import { authenticate, authorize } from '@/middleware/auth';
import { validate, validateParams, validateQuery } from '@/middleware/validation';
import { uuidSchema, paginationSchema, createInventorySchema, updateInventorySchema } from '@/middleware/validation';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Static routes - must be before /:id to avoid being treated as id parameter
router.get('/garage/:garageId', validateParams(uuidSchema), inventoryController.getGarageInventory);
router.get('/low-stock/garage/:garageId', validateParams(uuidSchema), inventoryController.getLowStockItems);

// Garage owner and mechanic routes
router.post('/', authorize('OWNER', 'MECHANIC', 'ADMIN'), validate(createInventorySchema), inventoryController.createInventoryItem);
router.get('/', authorize('OWNER', 'MECHANIC', 'ADMIN'), validateQuery(paginationSchema), inventoryController.getAllInventoryItems);
router.get('/:id', authorize('OWNER', 'MECHANIC', 'ADMIN'), validateParams(uuidSchema), inventoryController.getInventoryItemById);
router.put('/:id', authorize('OWNER', 'MECHANIC', 'ADMIN'), validateParams(uuidSchema), validate(updateInventorySchema), inventoryController.updateInventoryItem);
router.delete('/:id', authorize('OWNER', 'MECHANIC', 'ADMIN'), validateParams(uuidSchema), inventoryController.deleteInventoryItem);

// Inventory management routes
router.put('/:id/stock/add', authorize('OWNER', 'MECHANIC', 'ADMIN'), validateParams(uuidSchema), inventoryController.addStock);
router.put('/:id/stock/remove', authorize('OWNER', 'MECHANIC', 'ADMIN'), validateParams(uuidSchema), inventoryController.removeStock);

export { router as inventoryRoutes };
