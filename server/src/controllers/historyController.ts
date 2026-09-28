import type { Request, Response } from 'express';
import { query } from '../db/index.js';
import { searchHistoryCreateSchema } from '../validators/schemas.js';

export async function getSearchHistory(req: Request, res: Response): Promise<void> {
  if (!req.user) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  try {
    const historyRes = await query(
      `SELECT s.id, s.query, s.searched_at, s.medicine_id,
        m.name AS medicine_name, m.generic_name, m.strength, m.dosage_form
       FROM searches s
       LEFT JOIN medicines m ON s.medicine_id = m.id
       WHERE s.user_id = $1
       ORDER BY s.searched_at DESC
       LIMIT 30`,
      [req.user.id]
    );

    res.json({
      history: historyRes.rows,
      count: historyRes.rows.length,
    });
  } catch (err: any) {
    console.error('getSearchHistory error:', err);
    res.status(500).json({ error: 'Server Error', message: 'Failed to retrieve search history.' });
  }
}

export async function addSearchHistory(req: Request, res: Response): Promise<void> {
  try {
    const validated = searchHistoryCreateSchema.parse(req.body);
    const userId = req.user?.id || null;

    const insertRes = await query<{ id: string }>(
      'INSERT INTO searches (user_id, query, medicine_id) VALUES ($1, $2, $3) RETURNING id',
      [userId, validated.query, validated.medicineId || null]
    );

    res.status(201).json({
      message: 'Recorded search history',
      id: insertRes.rows[0].id,
    });
  } catch (err: any) {
    if (err.name === 'ZodError') {
      res.status(400).json({ error: 'Validation Error', details: err.errors });
      return;
    }
    console.error('addSearchHistory error:', err);
    res.status(500).json({ error: 'Server Error', message: 'Failed to record search history.' });
  }
}

export async function deleteSearchHistoryItem(req: Request, res: Response): Promise<void> {
  if (!req.user) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  try {
    const { id } = req.params;
    await query('DELETE FROM searches WHERE id = $1 AND user_id = $2', [id, req.user.id]);
    res.json({ message: 'History item removed' });
  } catch (err: any) {
    console.error('deleteSearchHistoryItem error:', err);
    res.status(500).json({ error: 'Server Error', message: 'Failed to delete history item.' });
  }
}

export async function clearAllSearchHistory(req: Request, res: Response): Promise<void> {
  if (!req.user) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  try {
    await query('DELETE FROM searches WHERE user_id = $1', [req.user.id]);
    res.json({ message: 'Search history cleared' });
  } catch (err: any) {
    console.error('clearAllSearchHistory error:', err);
    res.status(500).json({ error: 'Server Error', message: 'Failed to clear search history.' });
  }
}
