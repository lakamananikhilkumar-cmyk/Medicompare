import type { Request, Response } from 'express';
import { query } from '../db/index.js';
import { medicineSearchSchema } from '../validators/schemas.js';

export async function getMedicines(req: Request, res: Response): Promise<void> {
  try {
    const { prescription, dosageForm, limit = 20, offset = 0 } = req.query;

    let sql = `
      SELECT m.*, 
        (SELECT COUNT(DISTINCT pi.pharmacy_id) FROM pharmacy_inventory pi WHERE pi.medicine_id = m.id AND pi.stock_quantity > 0) AS in_stock_pharmacies_count,
        (SELECT MIN(pi.price) FROM pharmacy_inventory pi WHERE pi.medicine_id = m.id) AS lowest_price,
        (SELECT MAX(pi.price) FROM pharmacy_inventory pi WHERE pi.medicine_id = m.id) AS highest_price
      FROM medicines m
      WHERE m.is_active = TRUE
    `;
    const params: any[] = [];

    if (prescription === 'true') {
      params.push(true);
      sql += ` AND m.prescription_required = $${params.length}`;
    } else if (prescription === 'false') {
      params.push(false);
      sql += ` AND m.prescription_required = $${params.length}`;
    }

    if (dosageForm && typeof dosageForm === 'string') {
      params.push(dosageForm);
      sql += ` AND LOWER(m.dosage_form) = LOWER($${params.length})`;
    }

    sql += ` ORDER BY m.name ASC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(Number(limit), Number(offset));

    const result = await query(sql, params);
    const countRes = await query('SELECT COUNT(*) as total FROM medicines WHERE is_active = TRUE');

    res.json({
      medicines: result.rows,
      total: Number(countRes.rows[0]?.total || 0),
      limit: Number(limit),
      offset: Number(offset),
    });
  } catch (err: any) {
    console.error('getMedicines error:', err);
    res.status(500).json({ error: 'Server Error', message: 'Failed to retrieve medicines.' });
  }
}

export async function searchMedicines(req: Request, res: Response): Promise<void> {
  try {
    const validated = medicineSearchSchema.parse(req.query);
    const searchTerm = `%${validated.q}%`;

    const sql = `
      SELECT m.*, 
        (SELECT COUNT(DISTINCT pi.pharmacy_id) FROM pharmacy_inventory pi WHERE pi.medicine_id = m.id) AS pharmacies_count,
        (SELECT MIN(pi.price) FROM pharmacy_inventory pi WHERE pi.medicine_id = m.id) AS lowest_price,
        (SELECT MAX(pi.price) FROM pharmacy_inventory pi WHERE pi.medicine_id = m.id) AS highest_price
      FROM medicines m
      WHERE m.is_active = TRUE
        AND (
          m.name ILIKE $1
          OR m.brand_name ILIKE $1
          OR m.generic_name ILIKE $1
          OR m.composition ILIKE $1
        )
      ORDER BY 
        CASE 
          WHEN LOWER(m.name) LIKE LOWER($2) THEN 1
          WHEN LOWER(m.brand_name) LIKE LOWER($2) THEN 2
          WHEN LOWER(m.generic_name) LIKE LOWER($2) THEN 3
          ELSE 4
        END,
        m.name ASC
      LIMIT $3
    `;

    const result = await query(sql, [searchTerm, `${validated.q}%`, validated.limit]);

    // Track search in background if query is substantial
    if (validated.q.trim().length >= 2) {
      const userId = req.user?.id || null;
      const matchedMedicineId = result.rows[0]?.id || null;
      query(
        'INSERT INTO searches (user_id, query, medicine_id) VALUES ($1, $2, $3)',
        [userId, validated.q.trim(), matchedMedicineId]
      ).catch(() => {});
    }

    res.json({
      query: validated.q,
      count: result.rows.length,
      results: result.rows,
    });
  } catch (err: any) {
    if (err.name === 'ZodError') {
      res.status(400).json({ error: 'Validation Error', details: err.errors });
      return;
    }
    console.error('searchMedicines error:', err);
    res.status(500).json({ error: 'Server Error', message: 'Failed to execute search.' });
  }
}

export async function getMedicineById(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;

    const medRes = await query(
      `SELECT m.*,
        (SELECT COUNT(DISTINCT pi.pharmacy_id) FROM pharmacy_inventory pi WHERE pi.medicine_id = m.id) AS pharmacies_count,
        (SELECT MIN(pi.price) FROM pharmacy_inventory pi WHERE pi.medicine_id = m.id) AS lowest_price,
        (SELECT MAX(pi.price) FROM pharmacy_inventory pi WHERE pi.medicine_id = m.id) AS highest_price,
        (SELECT AVG(pi.price) FROM pharmacy_inventory pi WHERE pi.medicine_id = m.id) AS average_price
      FROM medicines m 
      WHERE m.id = $1`,
      [id]
    );

    if (medRes.rows.length === 0) {
      res.status(404).json({ error: 'Not Found', message: 'Medicine not found.' });
      return;
    }

    // Also get alternate strengths/forms of the same active generic ingredient
    const medicine = medRes.rows[0];
    const relatedRes = await query(
      `SELECT id, name, strength, dosage_form, pack_size, prescription_required
       FROM medicines
       WHERE is_active = TRUE
         AND id != $1
         AND (
           LOWER(generic_name) = LOWER($2)
           OR LOWER(name) LIKE LOWER($3)
         )
       LIMIT 6`,
      [id, medicine.generic_name || '', `${medicine.name.split(' ')[0]}%`]
    );

    res.json({
      medicine,
      alternatives: relatedRes.rows,
    });
  } catch (err: any) {
    console.error('getMedicineById error:', err);
    res.status(500).json({ error: 'Server Error', message: 'Failed to retrieve medicine details.' });
  }
}
