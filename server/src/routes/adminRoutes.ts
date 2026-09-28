import { Router } from 'express';
import {
  createMedicine,
  updateMedicine,
  deleteMedicine,
  createPharmacy,
  updatePharmacy,
  deletePharmacy,
  getAdminInventory,
  createOrUpdateInventory,
  updateInventory,
  deleteInventory,
  getUsers,
  getAnalytics,
} from '../controllers/adminController.js';
import { requireAdmin } from '../middleware/auth.js';

const router = Router();

// Enforce admin privileges on all admin endpoints
router.use(requireAdmin);

// Medicines
router.post('/medicines', createMedicine);
router.put('/medicines/:id', updateMedicine);
router.delete('/medicines/:id', deleteMedicine);

// Pharmacies
router.post('/pharmacies', createPharmacy);
router.put('/pharmacies/:id', updatePharmacy);
router.delete('/pharmacies/:id', deletePharmacy);

// Inventory
router.get('/inventory', getAdminInventory);
router.post('/inventory', createOrUpdateInventory);
router.put('/inventory/:id', updateInventory);
router.delete('/inventory/:id', deleteInventory);

// Users
router.get('/users', getUsers);

// Analytics
router.get('/analytics', getAnalytics);

export default router;
