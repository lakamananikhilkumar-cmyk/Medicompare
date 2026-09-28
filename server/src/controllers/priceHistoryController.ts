import type { Request, Response } from 'express';
import { query } from '../db/index.js';

export async function getPriceHistory(req: Request, res: Response): Promise<void> {
  try {
    const { medicineId } = req.params;
    const days = req.query.days ? parseInt(req.query.days as string, 10) : 30;
    const validDays = [7, 30, 90].includes(days) ? days : 30;

    const historyRes = await query<{
      id: string;
      pharmacy_id: string;
      pharmacy_name: string;
      price: string;
      recorded_at: string;
    }>(
      `SELECT ph.id, ph.pharmacy_id, p.name AS pharmacy_name, ph.price, ph.recorded_at
       FROM price_history ph
       JOIN pharmacies p ON ph.pharmacy_id = p.id
       WHERE ph.medicine_id = $1 
         AND ph.recorded_at >= NOW() - ($2 || ' days')::INTERVAL
       ORDER BY ph.recorded_at ASC`,
      [medicineId, validDays.toString()]
    );

    // If no explicit historical rows found for this medicine, synthesize realistic illustrative demo trend
    // from currently listed prices to enable chart visualization, with clear demo labeling.
    let records = historyRes.rows.map((r) => ({
      id: r.id,
      pharmacyId: r.pharmacy_id,
      pharmacyName: r.pharmacy_name,
      price: parseFloat(r.price),
      recordedAt: r.recorded_at,
    }));

    if (records.length === 0) {
      const currentPrices = await query<{
        pharmacy_id: string;
        pharmacy_name: string;
        price: string;
      }>(
        `SELECT pi.pharmacy_id, p.name AS pharmacy_name, pi.price
         FROM pharmacy_inventory pi
         JOIN pharmacies p ON pi.pharmacy_id = p.id
         WHERE pi.medicine_id = $1
         LIMIT 4`,
        [medicineId]
      );

      const now = new Date();
      const intervals = validDays === 7 ? [7, 4, 2, 0] : validDays === 30 ? [30, 20, 10, 0] : [90, 60, 30, 0];

      currentPrices.rows.forEach((p) => {
        const basePrice = parseFloat(p.price);
        intervals.forEach((daysAgo, idx) => {
          const date = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
          // slight fluctuation
          const variance = (idx % 2 === 0 ? 0.5 : -0.5) * (idx > 0 ? 1 : 0);
          records.push({
            id: `demo-${p.pharmacy_id}-${daysAgo}`,
            pharmacyId: p.pharmacy_id,
            pharmacyName: p.pharmacy_name,
            price: Number(Math.max(1, basePrice + variance).toFixed(2)),
            recordedAt: date.toISOString(),
          });
        });
      });
    }

    res.json({
      medicineId,
      days: validDays,
      isSimulatedDemoData: true,
      demoNotice: 'Simulated demo history — illustrated for comparative visualization. Not verified real-world records.',
      count: records.length,
      history: records,
    });
  } catch (err: any) {
    console.error('getPriceHistory error:', err);
    res.status(500).json({ error: 'Server Error', message: 'Failed to retrieve price history.' });
  }
}
