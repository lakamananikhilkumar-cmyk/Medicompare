import { Router, type Request, type Response } from 'express';
import { lookupPincode, getPopularCities, MAJOR_INDIAN_CITIES } from '../services/locationService.js';
import { apiLimiter } from '../middleware/rateLimiter.js';

const router = Router();

router.use(apiLimiter);

// Lookup any 6-digit Indian PIN code via India Post API
router.get('/pincode/:pincode', async (req: Request, res: Response) => {
  const pincodeParam = req.params.pincode;
  const pincode = Array.isArray(pincodeParam) ? pincodeParam[0] : pincodeParam;
  const cleanPin = (pincode || '').trim().replace(/\D/g, '');

  if (cleanPin.length !== 6) {
    res.status(400).json({
      error: 'Invalid PIN Code',
      message: 'Indian postal PIN codes must be exactly 6 digits.',
    });
    return;
  }

  try {
    const location = await lookupPincode(cleanPin);
    if (!location) {
      res.status(404).json({
        error: 'Not Found',
        message: `Could not resolve location for PIN code ${cleanPin}.`,
      });
      return;
    }

    res.json(location);
  } catch (err: any) {
    console.error(`Error resolving PIN ${cleanPin}:`, err);
    res.status(500).json({
      error: 'Service Error',
      message: 'Failed to query Indian Postal directory.',
    });
  }
});

// List prominent Indian cities across all zones
router.get('/cities', (_req: Request, res: Response) => {
  const cities = getPopularCities();
  res.json({
    total: cities.length,
    cities,
  });
});

export default router;
