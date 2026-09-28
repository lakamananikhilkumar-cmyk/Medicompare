import { Router } from 'express';
import { handleMedicineInfo, handleCompareExplanation } from '../controllers/aiController.js';
import { aiLimiter } from '../middleware/rateLimiter.js';

const router = Router();

router.use(aiLimiter);

router.post('/medicine-info', handleMedicineInfo);
router.post('/compare-explanation', handleCompareExplanation);

export default router;
