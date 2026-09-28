import type { Request, Response } from 'express';
import {
  isSupabaseConfigured,
  ensureStorageBucket,
  uploadPrescriptionToSupabase,
} from '../services/supabaseService.js';
import { extractPrescriptionMedicines } from '../services/aiService.js';
import { query } from '../db/index.js';

export async function handlePrescriptionUpload(req: Request, res: Response): Promise<void> {
  try {
    const file = req.file;
    if (!file) {
      res.status(400).json({
        error: 'Bad Request',
        message: 'No prescription file provided. Please attach an image or PDF.',
      });
      return;
    }

    const userId = req.user?.id || 'guest';
    let storageResult: { url: string; path: string } | null = null;
    let storageError: string | null = null;

    // 1. Upload to Supabase Storage if configured
    if (isSupabaseConfigured()) {
      try {
        await ensureStorageBucket();
        storageResult = await uploadPrescriptionToSupabase({
          buffer: file.buffer,
          originalName: file.originalname,
          mimeType: file.mimetype,
          userId,
        });
      } catch (err: any) {
        console.warn('[Upload Controller] Supabase storage upload notice:', err.message);
        storageError = err.message;
      }
    }

    // Fallback URL if storage bucket is not configured or in local mode
    if (!storageResult) {
      const base64Preview = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
      storageResult = {
        url: base64Preview,
        path: `local/${Date.now()}_${file.originalname}`,
      };
    }

    // 2. Perform Gemini AI analysis if file is an image
    let aiExtraction: {
      medicines: Array<{ name: string; strength?: string; dosageForm?: string; frequency?: string }>;
      doctorNotes?: string;
      disclaimer: string;
    } = {
      medicines: [],
      disclaimer: 'Prescriptions must be validated by a licensed pharmacist before dispensing.',
    };

    if (file.mimetype.startsWith('image/')) {
      try {
        aiExtraction = await extractPrescriptionMedicines(file.buffer, file.mimetype);
      } catch (err: any) {
        console.warn('[Upload Controller] AI extraction notice:', err.message);
      }
    }

    // 3. Match extracted medicine names against our catalog
    const matchedMedicines: any[] = [];
    if (aiExtraction.medicines && aiExtraction.medicines.length > 0) {
      for (const med of aiExtraction.medicines) {
        const searchTerm = med.name.trim();
        if (searchTerm.length >= 3) {
          const matchRes = await query(
            `SELECT m.id, m.name, m.brand_name, m.generic_name, m.strength, m.dosage_form,
                    MIN(i.price) as lowest_price, MAX(i.price) as highest_price
             FROM medicines m
             LEFT JOIN pharmacy_inventory i ON m.id = i.medicine_id
             WHERE m.is_active = TRUE
               AND (
                 m.name ILIKE $1 OR
                 m.brand_name ILIKE $1 OR
                 m.generic_name ILIKE $1
               )
             GROUP BY m.id, m.name, m.brand_name, m.generic_name, m.strength, m.dosage_form
             LIMIT 3`,
            [`%${searchTerm}%`]
          );
          for (const row of matchRes.rows) {
            if (!matchedMedicines.some((existing) => existing.id === row.id)) {
              matchedMedicines.push(row);
            }
          }
        }
      }
    }

    res.json({
      message: 'Prescription processed successfully',
      file: {
        url: storageResult.url,
        path: storageResult.path,
        originalName: file.originalname,
        size: file.size,
        mimeType: file.mimetype,
        storageError: storageError || undefined,
      },
      extracted: aiExtraction,
      matchedMedicines,
    });
  } catch (err: any) {
    console.error('Prescription upload error:', err);
    res.status(500).json({
      error: 'Upload Failed',
      message: err.message || 'An unexpected error occurred while processing the prescription.',
    });
  }
}
