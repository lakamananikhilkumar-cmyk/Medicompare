import type { Request, Response } from 'express';
import { query } from '../db/index.js';
import { adminMedicineSchema, adminPharmacySchema, adminInventorySchema } from '../validators/schemas.js';

// ===================== MEDICINES CRUD =====================
export async function createMedicine(req: Request, res: Response): Promise<void> {
  try {
    const validated = adminMedicineSchema.parse(req.body);

    const result = await query(
      `INSERT INTO medicines (name, brand_name, generic_name, composition, strength, dosage_form, pack_size, prescription_required, is_active)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [
        validated.name,
        validated.brandName || null,
        validated.genericName || null,
        validated.composition || null,
        validated.strength,
        validated.dosageForm,
        validated.packSize,
        validated.prescriptionRequired,
        validated.isActive,
      ]
    );

    res.status(201).json({ message: 'Medicine created successfully', medicine: result.rows[0] });
  } catch (err: any) {
    if (err.name === 'ZodError') {
      res.status(400).json({ error: 'Validation Error', details: err.errors });
      return;
    }
    console.error('createMedicine error:', err);
    res.status(500).json({ error: 'Server Error', message: 'Failed to create medicine.' });
  }
}

export async function updateMedicine(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const validated = adminMedicineSchema.parse(req.body);

    const result = await query(
      `UPDATE medicines
       SET name = $1, brand_name = $2, generic_name = $3, composition = $4,
           strength = $5, dosage_form = $6, pack_size = $7, prescription_required = $8,
           is_active = $9, updated_at = NOW()
       WHERE id = $10
       RETURNING *`,
      [
        validated.name,
        validated.brandName || null,
        validated.genericName || null,
        validated.composition || null,
        validated.strength,
        validated.dosageForm,
        validated.packSize,
        validated.prescriptionRequired,
        validated.isActive,
        id,
      ]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Not Found', message: 'Medicine not found.' });
      return;
    }

    res.json({ message: 'Medicine updated successfully', medicine: result.rows[0] });
  } catch (err: any) {
    if (err.name === 'ZodError') {
      res.status(400).json({ error: 'Validation Error', details: err.errors });
      return;
    }
    console.error('updateMedicine error:', err);
    res.status(500).json({ error: 'Server Error', message: 'Failed to update medicine.' });
  }
}

export async function deleteMedicine(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    // Soft delete/archive
    const result = await query('UPDATE medicines SET is_active = FALSE, updated_at = NOW() WHERE id = $1 RETURNING id', [id]);
    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Not Found', message: 'Medicine not found.' });
      return;
    }
    res.json({ message: 'Medicine archived successfully' });
  } catch (err: any) {
    console.error('deleteMedicine error:', err);
    res.status(500).json({ error: 'Server Error', message: 'Failed to archive medicine.' });
  }
}

// ===================== PHARMACIES CRUD =====================
export async function createPharmacy(req: Request, res: Response): Promise<void> {
  try {
    const validated = adminPharmacySchema.parse(req.body);

    const result = await query(
      `INSERT INTO pharmacies (name, address, city, pincode, latitude, longitude, phone, opening_time, closing_time, rating, delivery_available, pickup_available, is_active)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
       RETURNING *`,
      [
        validated.name,
        validated.address,
        validated.city,
        validated.pincode || null,
        validated.latitude ?? null,
        validated.longitude ?? null,
        validated.phone || null,
        validated.openingTime || null,
        validated.closingTime || null,
        validated.rating ?? null,
        validated.deliveryAvailable,
        validated.pickupAvailable,
        validated.isActive,
      ]
    );

    res.status(201).json({ message: 'Pharmacy created successfully', pharmacy: result.rows[0] });
  } catch (err: any) {
    if (err.name === 'ZodError') {
      res.status(400).json({ error: 'Validation Error', details: err.errors });
      return;
    }
    console.error('createPharmacy error:', err);
    res.status(500).json({ error: 'Server Error', message: 'Failed to create pharmacy.' });
  }
}

export async function updatePharmacy(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const validated = adminPharmacySchema.parse(req.body);

    const result = await query(
      `UPDATE pharmacies
       SET name = $1, address = $2, city = $3, pincode = $4, latitude = $5, longitude = $6,
           phone = $7, opening_time = $8, closing_time = $9, rating = $10,
           delivery_available = $11, pickup_available = $12, is_active = $13, updated_at = NOW()
       WHERE id = $14
       RETURNING *`,
      [
        validated.name,
        validated.address,
        validated.city,
        validated.pincode || null,
        validated.latitude ?? null,
        validated.longitude ?? null,
        validated.phone || null,
        validated.openingTime || null,
        validated.closingTime || null,
        validated.rating ?? null,
        validated.deliveryAvailable,
        validated.pickupAvailable,
        validated.isActive,
        id,
      ]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Not Found', message: 'Pharmacy not found.' });
      return;
    }

    res.json({ message: 'Pharmacy updated successfully', pharmacy: result.rows[0] });
  } catch (err: any) {
    if (err.name === 'ZodError') {
      res.status(400).json({ error: 'Validation Error', details: err.errors });
      return;
    }
    console.error('updatePharmacy error:', err);
    res.status(500).json({ error: 'Server Error', message: 'Failed to update pharmacy.' });
  }
}

export async function deletePharmacy(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const result = await query('UPDATE pharmacies SET is_active = FALSE, updated_at = NOW() WHERE id = $1 RETURNING id', [id]);
    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Not Found', message: 'Pharmacy not found.' });
      return;
    }
    res.json({ message: 'Pharmacy archived successfully' });
  } catch (err: any) {
    console.error('deletePharmacy error:', err);
    res.status(500).json({ error: 'Server Error', message: 'Failed to archive pharmacy.' });
  }
}

// ===================== INVENTORY CRUD =====================
export async function getAdminInventory(req: Request, res: Response): Promise<void> {
  try {
    const { pharmacyId, medicineId, limit = 50, offset = 0 } = req.query;

    let sql = `
      SELECT 
        pi.*,
        p.name AS pharmacy_name,
        m.name AS medicine_name,
        m.strength,
        m.dosage_form,
        m.pack_size
      FROM pharmacy_inventory pi
      JOIN pharmacies p ON pi.pharmacy_id = p.id
      JOIN medicines m ON pi.medicine_id = m.id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (pharmacyId && typeof pharmacyId === 'string') {
      params.push(pharmacyId);
      sql += ` AND pi.pharmacy_id = $${params.length}`;
    }
    if (medicineId && typeof medicineId === 'string') {
      params.push(medicineId);
      sql += ` AND pi.medicine_id = $${params.length}`;
    }

    sql += ` ORDER BY pi.updated_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(Number(limit), Number(offset));

    const result = await query(sql, params);
    const countRes = await query('SELECT COUNT(*) as total FROM pharmacy_inventory');

    res.json({
      inventory: result.rows,
      total: Number(countRes.rows[0]?.total || 0),
    });
  } catch (err: any) {
    console.error('getAdminInventory error:', err);
    res.status(500).json({ error: 'Server Error', message: 'Failed to retrieve inventory.' });
  }
}

export async function createOrUpdateInventory(req: Request, res: Response): Promise<void> {
  try {
    const validated = adminInventorySchema.parse(req.body);

    const result = await query(
      `INSERT INTO pharmacy_inventory (pharmacy_id, medicine_id, price, mrp, stock_quantity, availability, delivery_available, pickup_available, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
       ON CONFLICT (pharmacy_id, medicine_id)
       DO UPDATE SET
         price = EXCLUDED.price,
         mrp = EXCLUDED.mrp,
         stock_quantity = EXCLUDED.stock_quantity,
         availability = EXCLUDED.availability,
         delivery_available = EXCLUDED.delivery_available,
         pickup_available = EXCLUDED.pickup_available,
         updated_at = NOW()
       RETURNING *`,
      [
        validated.pharmacyId,
        validated.medicineId,
        validated.price,
        validated.mrp ?? null,
        validated.stockQuantity,
        validated.availability,
        validated.deliveryAvailable,
        validated.pickupAvailable,
      ]
    );

    // Also record to price_history
    query(
      'INSERT INTO price_history (pharmacy_id, medicine_id, price) VALUES ($1, $2, $3)',
      [validated.pharmacyId, validated.medicineId, validated.price]
    ).catch(() => {});

    res.status(201).json({ message: 'Inventory record saved successfully', inventory: result.rows[0] });
  } catch (err: any) {
    if (err.name === 'ZodError') {
      res.status(400).json({ error: 'Validation Error', details: err.errors });
      return;
    }
    console.error('createOrUpdateInventory error:', err);
    res.status(500).json({ error: 'Server Error', message: 'Failed to save inventory.' });
  }
}

export async function updateInventory(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const validated = adminInventorySchema.parse(req.body);

    const result = await query(
      `UPDATE pharmacy_inventory
       SET price = $1, mrp = $2, stock_quantity = $3, availability = $4,
           delivery_available = $5, pickup_available = $6, updated_at = NOW()
       WHERE id = $7
       RETURNING *`,
      [
        validated.price,
        validated.mrp ?? null,
        validated.stockQuantity,
        validated.availability,
        validated.deliveryAvailable,
        validated.pickupAvailable,
        id,
      ]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Not Found', message: 'Inventory record not found.' });
      return;
    }

    // Record price change to price_history
    query(
      'INSERT INTO price_history (pharmacy_id, medicine_id, price) VALUES ($1, $2, $3)',
      [validated.pharmacyId, validated.medicineId, validated.price]
    ).catch(() => {});

    res.json({ message: 'Inventory updated successfully', inventory: result.rows[0] });
  } catch (err: any) {
    if (err.name === 'ZodError') {
      res.status(400).json({ error: 'Validation Error', details: err.errors });
      return;
    }
    console.error('updateInventory error:', err);
    res.status(500).json({ error: 'Server Error', message: 'Failed to update inventory.' });
  }
}

export async function deleteInventory(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const result = await query('DELETE FROM pharmacy_inventory WHERE id = $1 RETURNING id', [id]);
    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Not Found', message: 'Inventory record not found.' });
      return;
    }
    res.json({ message: 'Inventory item removed successfully' });
  } catch (err: any) {
    console.error('deleteInventory error:', err);
    res.status(500).json({ error: 'Server Error', message: 'Failed to remove inventory item.' });
  }
}

// ===================== USERS OVERSIGHT =====================
export async function getUsers(_req: Request, res: Response): Promise<void> {
  try {
    const result = await query(
      `SELECT id, name, email, role, phone, city, pincode, created_at, updated_at,
        (SELECT COUNT(*) FROM favorites f WHERE f.user_id = profiles.id) AS favorites_count,
        (SELECT COUNT(*) FROM searches s WHERE s.user_id = profiles.id) AS searches_count
       FROM profiles
       ORDER BY created_at DESC`
    );

    res.json({
      count: result.rows.length,
      users: result.rows,
    });
  } catch (err: any) {
    console.error('getUsers error:', err);
    res.status(500).json({ error: 'Server Error', message: 'Failed to retrieve users.' });
  }
}

// ===================== ANALYTICS =====================
export async function getAnalytics(_req: Request, res: Response): Promise<void> {
  try {
    const [medCount, pharmCount, invCount, userCount, searchCount, favCount] = await Promise.all([
      query('SELECT COUNT(*) as count FROM medicines WHERE is_active = TRUE'),
      query('SELECT COUNT(*) as count FROM pharmacies WHERE is_active = TRUE'),
      query('SELECT COUNT(*) as count FROM pharmacy_inventory'),
      query('SELECT COUNT(*) as count FROM profiles'),
      query('SELECT COUNT(*) as count FROM searches'),
      query('SELECT COUNT(*) as count FROM favorites'),
    ]);

    // Top searched medicines
    const topSearches = await query(
      `SELECT query, COUNT(*) as search_count
       FROM searches
       GROUP BY query
       ORDER BY search_count DESC
       LIMIT 5`
    );

    // Medicines with largest price variances
    const priceVariance = await query(
      `SELECT 
        m.name,
        m.strength,
        m.dosage_form,
        MIN(pi.price) AS min_price,
        MAX(pi.price) AS max_price,
        (MAX(pi.price) - MIN(pi.price)) AS difference,
        COUNT(pi.pharmacy_id) AS stocking_pharmacies
       FROM pharmacy_inventory pi
       JOIN medicines m ON pi.medicine_id = m.id
       GROUP BY m.id, m.name, m.strength, m.dosage_form
       HAVING COUNT(pi.pharmacy_id) >= 2
       ORDER BY difference DESC
       LIMIT 6`
    );

    res.json({
      totals: {
        medicines: Number(medCount.rows[0]?.count || 0),
        pharmacies: Number(pharmCount.rows[0]?.count || 0),
        inventoryRecords: Number(invCount.rows[0]?.count || 0),
        users: Number(userCount.rows[0]?.count || 0),
        searches: Number(searchCount.rows[0]?.count || 0),
        favorites: Number(favCount.rows[0]?.count || 0),
      },
      topSearches: topSearches.rows,
      priceVariances: priceVariance.rows,
    });
  } catch (err: any) {
    console.error('getAnalytics error:', err);
    res.status(500).json({ error: 'Server Error', message: 'Failed to retrieve analytics.' });
  }
}
