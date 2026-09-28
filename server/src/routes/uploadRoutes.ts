import { Router } from 'express';
import multer from 'multer';
import { handlePrescriptionUpload } from '../controllers/uploadController.js';
import { authenticate } from '../middleware/auth.js';
import { apiLimiter } from '../middleware/rateLimiter.js';

const router = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith('image/') || file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only image files (JPEG, PNG, WebP) and PDF documents are allowed.'));
    }
  },
});

router.use(apiLimiter);
router.use(authenticate);

router.post('/prescription', upload.single('prescription'), handlePrescriptionUpload);

export default router;
