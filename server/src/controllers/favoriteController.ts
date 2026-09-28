import type { Request, Response } from 'express';
import { query } from '../db/index.js';
import { favoriteCreateSchema } from '../validators/schemas.js';

export async function getFavorites(req: Request, res: Response): Promise<void> {
  if (!req.user) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  try {
    const medFavs = await query(
      `SELECT f.id AS favorite_id, f.created_at, m.*,
        (SELECT MIN(pi.price) FROM pharmacy_inventory pi WHERE pi.medicine_id = m.id) AS lowest_price,
        (SELECT MAX(pi.price) FROM pharmacy_inventory pi WHERE pi.medicine_id = m.id) AS highest_price
       FROM favorites f
       JOIN medicines m ON f.medicine_id = m.id
       WHERE f.user_id = $1 AND m.is_active = TRUE
       ORDER BY f.created_at DESC`,
      [req.user.id]
    );

    const pharmFavs = await query(
      `SELECT f.id AS favorite_id, f.created_at, p.*
       FROM favorites f
       JOIN pharmacies p ON f.pharmacy_id = p.id
       WHERE f.user_id = $1 AND p.is_active = TRUE
       ORDER BY f.created_at DESC`,
      [req.user.id]
    );

    res.json({
      medicines: medFavs.rows,
      pharmacies: pharmFavs.rows,
      total: medFavs.rows.length + pharmFavs.rows.length,
    });
  } catch (err: any) {
    console.error('getFavorites error:', err);
    res.status(500).json({ error: 'Server Error', message: 'Failed to retrieve favorites.' });
  }
}

export async function addFavorite(req: Request, res: Response): Promise<void> {
  if (!req.user) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  try {
    const validated = favoriteCreateSchema.parse(req.body);

    // Check if already favorited
    let checkSql = 'SELECT id FROM favorites WHERE user_id = $1';
    const params: any[] = [req.user.id];

    if (validated.medicineId) {
      params.push(validated.medicineId);
      checkSql += ` AND medicine_id = $${params.length}`;
    }
    if (validated.pharmacyId) {
      params.push(validated.pharmacyId);
      checkSql += ` AND pharmacy_id = $${params.length}`;
    }

    const existing = await query(checkSql, params);
    if (existing.rows.length > 0) {
      res.json({ message: 'Item already favorited', favoriteId: existing.rows[0].id });
      return;
    }

    const insertRes = await query<{ id: string }>(
      'INSERT INTO favorites (user_id, medicine_id, pharmacy_id) VALUES ($1, $2, $3) RETURNING id',
      [req.user.id, validated.medicineId || null, validated.pharmacyId || null]
    );

    res.status(201).json({
      message: 'Added to favorites',
      favoriteId: insertRes.rows[0].id,
    });
  } catch (err: any) {
    if (err.name === 'ZodError') {
      res.status(400).json({ error: 'Validation Error', details: err.errors });
      return;
    }
    console.error('addFavorite error:', err);
    res.status(500).json({ error: 'Server Error', message: 'Failed to save favorite.' });
  }
}

export async function removeFavorite(req: Request, res: Response): Promise<void> {
  if (!req.user) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  try {
    const { id } = req.params;

    // We allow removing either by favorite ID or by medicineId / pharmacyId
    const deleteRes = await query(
      `DELETE FROM favorites 
       WHERE user_id = $1 
         AND (id = $2 OR medicine_id = $2 OR pharmacy_id = $2)
       RETURNING id`,
      [req.user.id, id]
    );

    if (deleteRes.rows.length === 0) {
      res.status(404).json({ error: 'Not Found', message: 'Favorite not found or not owned by user.' });
      return;
    }

    res.json({ message: 'Removed from favorites' });
  } catch (err: any) {
    console.error('removeFavorite error:', err);
    res.status(500).json({ error: 'Server Error', message: 'Failed to delete favorite.' });
  }
}
