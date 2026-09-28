import { Router } from 'express';
import {
  getPharmacies,
  getNearbyPharmacies,
  getPharmacyById,
  getPharmacyInventory,
} from '../controllers/pharmacyController.js';

const router = Router();

router.get('/', getPharmacies);
router.get('/nearby', getNearbyPharmacies);
router.get('/:id', getPharmacyById);
router.get('/:id/inventory', getPharmacyInventory);

export default router;
