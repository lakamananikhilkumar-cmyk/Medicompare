import type { Request, Response } from 'express';
import { query } from '../db/index.js';

export async function getPharmacies(req: Request, res: Response): Promise<void> {
  try {
    const { city, pincode, search, delivery, openNow, limit = 20, offset = 0 } = req.query;

    let sql = `
      SELECT p.*,
        (SELECT COUNT(*) FROM pharmacy_inventory pi WHERE pi.pharmacy_id = p.id AND pi.stock_quantity > 0) AS active_medicines_count
      FROM pharmacies p
      WHERE p.is_active = TRUE
    `;
    const params: any[] = [];

    if (city && typeof city === 'string') {
      params.push(city);
      sql += ` AND LOWER(p.city) = LOWER($${params.length})`;
    }

    if (pincode && typeof pincode === 'string') {
      params.push(pincode);
      sql += ` AND p.pincode = $${params.length}`;
    }

    if (search && typeof search === 'string') {
      params.push(`%${search}%`);
      sql += ` AND (p.name ILIKE $${params.length} OR p.address ILIKE $${params.length})`;
    }

    if (delivery === 'true') {
      sql += ' AND p.delivery_available = TRUE';
    }

    sql += ` ORDER BY p.rating DESC NULLS LAST, p.name ASC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(Number(limit), Number(offset));

    const result = await query(sql, params);
    const countRes = await query('SELECT COUNT(*) as total FROM pharmacies WHERE is_active = TRUE');

    res.json({
      pharmacies: result.rows,
      total: Number(countRes.rows[0]?.total || 0),
      limit: Number(limit),
      offset: Number(offset),
    });
  } catch (err: any) {
    console.error('getPharmacies error:', err);
    res.status(500).json({ error: 'Server Error', message: 'Failed to retrieve pharmacies.' });
  }
}

export async function getNearbyPharmacies(req: Request, res: Response): Promise<void> {
  try {
    const lat = req.query.lat ? parseFloat(req.query.lat as string) : 12.9716;
    const lng = req.query.lng ? parseFloat(req.query.lng as string) : 77.5946;
    const radius = req.query.radius ? parseFloat(req.query.radius as string) : 15;

    const result = await query(`
      SELECT p.*,
        (SELECT COUNT(*) FROM pharmacy_inventory pi WHERE pi.pharmacy_id = p.id AND pi.stock_quantity > 0) AS active_medicines_count
      FROM pharmacies p
      WHERE p.is_active = TRUE
    `);

    const pharmaciesWithDistance = result.rows
      .map((p) => {
        let distance: number | null = null;
        if (p.latitude != null && p.longitude != null) {
          const R = 6371;
          const dLat = ((p.latitude - lat) * Math.PI) / 180;
          const dLon = ((p.longitude - lng) * Math.PI) / 180;
          const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos((lat * Math.PI) / 180) * Math.cos((p.latitude * Math.PI) / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
          const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
          distance = Number((R * c).toFixed(1));
        }
        return {
          ...p,
          distance,
        };
      })
      .filter((p) => p.distance == null || p.distance <= radius)
      .sort((a, b) => (a.distance ?? 9999) - (b.distance ?? 9999));

    res.json({
      latitude: lat,
      longitude: lng,
      radiusKm: radius,
      count: pharmaciesWithDistance.length,
      pharmacies: pharmaciesWithDistance,
    });
  } catch (err: any) {
    console.error('getNearbyPharmacies error:', err);
    res.status(500).json({ error: 'Server Error', message: 'Failed to retrieve nearby pharmacies.' });
  }
}

export async function getPharmacyById(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;

    const pharmRes = await query(
      `SELECT p.*,
        (SELECT COUNT(*) FROM pharmacy_inventory pi WHERE pi.pharmacy_id = p.id AND pi.stock_quantity > 0) AS active_medicines_count
       FROM pharmacies p
       WHERE p.id = $1`,
      [id]
    );

    if (pharmRes.rows.length === 0) {
      res.status(404).json({ error: 'Not Found', message: 'Pharmacy not found.' });
      return;
    }

    res.json({
      pharmacy: pharmRes.rows[0],
    });
  } catch (err: any) {
    console.error('getPharmacyById error:', err);
    res.status(500).json({ error: 'Server Error', message: 'Failed to retrieve pharmacy details.' });
  }
}

export async function getPharmacyInventory(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;

    const inventoryRes = await query(
      `SELECT 
        pi.id AS inventory_id,
        pi.price,
        pi.mrp,
        pi.availability,
        pi.stock_quantity,
        pi.delivery_available,
        pi.pickup_available,
        pi.updated_at AS last_updated,
        m.id AS medicine_id,
        m.name AS medicine_name,
        m.brand_name,
        m.generic_name,
        m.strength,
        m.dosage_form,
        m.pack_size,
        m.prescription_required
      FROM pharmacy_inventory pi
      JOIN medicines m ON pi.medicine_id = m.id
      WHERE pi.pharmacy_id = $1 AND m.is_active = TRUE
      ORDER BY m.name ASC`,
      [id]
    );

    res.json({
      pharmacyId: id,
      count: inventoryRes.rows.length,
      inventory: inventoryRes.rows,
    });
  } catch (err: any) {
    console.error('getPharmacyInventory error:', err);
    res.status(500).json({ error: 'Server Error', message: 'Failed to retrieve pharmacy inventory.' });
  }
}
