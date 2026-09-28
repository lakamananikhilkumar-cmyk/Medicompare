import { Router } from 'express';
import {
  getSearchHistory,
  addSearchHistory,
  deleteSearchHistoryItem,
  clearAllSearchHistory,
} from '../controllers/historyController.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.post('/', addSearchHistory); // Can record guest searches without auth if null user
router.get('/', requireAuth, getSearchHistory);
router.delete('/:id', requireAuth, deleteSearchHistoryItem);
router.delete('/', requireAuth, clearAllSearchHistory);

export default router;
