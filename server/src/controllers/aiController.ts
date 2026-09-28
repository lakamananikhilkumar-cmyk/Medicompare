import type { Request, Response } from 'express';
import { getMedicineInformation, getPriceComparisonExplanation } from '../services/aiService.js';
import { aiMedicineInfoRequestSchema, aiCompareExplanationRequestSchema } from '../validators/schemas.js';

export async function handleMedicineInfo(req: Request, res: Response): Promise<void> {
  try {
    const validated = aiMedicineInfoRequestSchema.parse(req.body);
    const result = await getMedicineInformation(validated);
    res.json(result);
  } catch (err: any) {
    if (err.name === 'ZodError') {
      res.status(400).json({ error: 'Validation Error', details: err.errors });
      return;
    }
    console.error('handleMedicineInfo error:', err);
    res.status(500).json({ error: 'Server Error', message: 'Failed to retrieve medicine information.' });
  }
}

export async function handleCompareExplanation(req: Request, res: Response): Promise<void> {
  try {
    const validated = aiCompareExplanationRequestSchema.parse(req.body);
    const result = await getPriceComparisonExplanation(validated);
    res.json(result);
  } catch (err: any) {
    if (err.name === 'ZodError') {
      res.status(400).json({ error: 'Validation Error', details: err.errors });
      return;
    }
    console.error('handleCompareExplanation error:', err);
    res.status(500).json({ error: 'Server Error', message: 'Failed to explain price comparison.' });
  }
}
