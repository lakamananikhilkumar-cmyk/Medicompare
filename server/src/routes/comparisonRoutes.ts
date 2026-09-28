import { Router } from 'express';
import { compareMedicine } from '../controllers/comparisonController.js';

const router = Router();

router.get('/:medicineId', compareMedicine);

export default router;
