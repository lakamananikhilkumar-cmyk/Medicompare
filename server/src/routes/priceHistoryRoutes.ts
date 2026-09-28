import { Router } from 'express';
import { getPriceHistory } from '../controllers/priceHistoryController.js';

const router = Router();

router.get('/:medicineId', getPriceHistory);

export default router;
