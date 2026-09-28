import { Router } from 'express';
import { getMedicines, searchMedicines, getMedicineById } from '../controllers/medicineController.js';

const router = Router();

router.get('/', getMedicines);
router.get('/search', searchMedicines);
router.get('/:id', getMedicineById);

export default router;
