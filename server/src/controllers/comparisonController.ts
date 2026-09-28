import type { Request, Response } from 'express';
import { query } from '../db/index.js';
import { compareQuerySchema } from '../validators/schemas.js';

// Haversine distance in kilometers
function calculateHaversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Number((R * c).toFixed(1));
}

// Determines if pharmacy is currently open based on opening_time and closing_time (HH:MM:SS)
function isPharmacyOpenNow(openingTime?: string | null, closingTime?: string | null): boolean {
  if (!openingTime || !closingTime) return true; // Assume open if unset
  if (openingTime === '00:00:00' && (closingTime === '23:59:59' || closingTime === '24:00:00')) return true; // 24/7

  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  const [openH, openM] = openingTime.split(':').map(Number);
  const [closeH, closeM] = closingTime.split(':').map(Number);
  const openMinutes = openH * 60 + openM;
  const closeMinutes = closeH * 60 + closeM;

  if (closeMinutes > openMinutes) {
    return currentMinutes >= openMinutes && currentMinutes <= closeMinutes;
  } else {
    // Overnight operation (e.g. 20:00 to 04:00)
    return currentMinutes >= openMinutes || currentMinutes <= closeMinutes;
  }
}

// Known coordinates for Indian major cities / pincodes for fallback
const PINCODE_COORDINATES: Record<string, { lat: number; lng: number; city: string }> = {
  '560001': { lat: 12.9756, lng: 77.6097, city: 'Bengaluru' },
  '560038': { lat: 12.9784, lng: 77.6408, city: 'Bengaluru' },
  '560034': { lat: 12.9352, lng: 77.6245, city: 'Bengaluru' },
  '560102': { lat: 12.9121, lng: 77.6446, city: 'Bengaluru' },
  '560011': { lat: 12.9250, lng: 77.5938, city: 'Bengaluru' },
  '560066': { lat: 12.9698, lng: 77.7500, city: 'Bengaluru' },
  '110001': { lat: 28.6315, lng: 77.2167, city: 'New Delhi' },
  '110049': { lat: 28.5714, lng: 77.2215, city: 'New Delhi' },
  '400050': { lat: 19.0596, lng: 72.8295, city: 'Mumbai' },
  '400069': { lat: 19.1136, lng: 72.8697, city: 'Mumbai' },
};

import { lookupPincode, resolveCoordinatesForLocation, MAJOR_INDIAN_CITIES } from '../services/locationService.js';

export async function compareMedicine(req: Request, res: Response): Promise<void> {
  try {
    const { medicineId } = req.params;
    const filter = compareQuerySchema.parse(req.query);

    // 1. Fetch exact medicine record
    const medRes = await query('SELECT * FROM medicines WHERE id = $1 AND is_active = TRUE', [medicineId]);
    if (medRes.rows.length === 0) {
      res.status(404).json({ error: 'Not Found', message: 'Medicine not found.' });
      return;
    }
    const medicine = medRes.rows[0];

    // 2. Determine location coordinates (user provided lat/lng, or India Post PIN lookup, or city centroid)
    let userLat = filter.lat;
    let userLng = filter.lng;
    let locationSource = 'none';
    let resolvedCity = filter.city;

    if (userLat != null && userLng != null) {
      locationSource = 'coordinates';
    } else if (filter.pincode) {
      const pinResult = await lookupPincode(filter.pincode);
      if (pinResult) {
        userLat = pinResult.latitude;
        userLng = pinResult.longitude;
        resolvedCity = pinResult.city;
        locationSource = `india_post_${filter.pincode} (${pinResult.city}, ${pinResult.state})`;
      }
    } else if (filter.city) {
      const cityCoords = resolveCoordinatesForLocation(filter.city, 'India');
      userLat = cityCoords.lat;
      userLng = cityCoords.lng;
      locationSource = `city_${filter.city}`;
    }

    if (userLat == null || userLng == null) {
      // Default location: Central Bengaluru
      userLat = 12.9716;
      userLng = 77.5946;
      locationSource = 'default_bengaluru';
    }

    // 3. Fetch all pharmacy inventory records stocking this exact medicine
    const inventoryRes = await query<{
      inventory_id: string;
      pharmacy_id: string;
      price: string;
      mrp: string | null;
      availability: 'in_stock' | 'limited_stock' | 'out_of_stock';
      stock_quantity: number;
      inventory_delivery: boolean;
      inventory_pickup: boolean;
      last_updated: string;
      pharmacy_name: string;
      address: string;
      city: string;
      pincode: string;
      latitude: number;
      longitude: number;
      phone: string;
      opening_time: string;
      closing_time: string;
      rating: string;
      pharmacy_delivery: boolean;
      pharmacy_pickup: boolean;
    }>(
      `SELECT 
        pi.id AS inventory_id,
        pi.pharmacy_id,
        pi.price,
        pi.mrp,
        pi.availability,
        pi.stock_quantity,
        pi.delivery_available AS inventory_delivery,
        pi.pickup_available AS inventory_pickup,
        pi.updated_at AS last_updated,
        p.name AS pharmacy_name,
        p.address,
        p.city,
        p.pincode,
        p.latitude,
        p.longitude,
        p.phone,
        p.opening_time,
        p.closing_time,
        p.rating,
        p.delivery_available AS pharmacy_delivery,
        p.pickup_available AS pharmacy_pickup
      FROM pharmacy_inventory pi
      JOIN pharmacies p ON pi.pharmacy_id = p.id
      WHERE pi.medicine_id = $1 AND p.is_active = TRUE`,
      [medicineId]
    );

    // Map and enrich each pharmacy comparison record
    let pharmacies = inventoryRes.rows.map((row) => {
      const priceNum = parseFloat(row.price);
      const mrpNum = row.mrp ? parseFloat(row.mrp) : priceNum;
      const isOpen = isPharmacyOpenNow(row.opening_time, row.closing_time);
      const distance =
        userLat != null && userLng != null && row.latitude != null && row.longitude != null
          ? calculateHaversineDistance(userLat, userLng, row.latitude, row.longitude)
          : null;

      const deliveryAvailable = row.inventory_delivery && row.pharmacy_delivery;
      const pickupAvailable = row.inventory_pickup && row.pharmacy_pickup;

      return {
        inventoryId: row.inventory_id,
        pharmacyId: row.pharmacy_id,
        pharmacyName: row.pharmacy_name,
        address: row.address,
        city: row.city,
        pincode: row.pincode,
        phone: row.phone,
        price: priceNum,
        mrp: mrpNum,
        availability: row.availability,
        stockQuantity: row.stock_quantity,
        distance,
        isOpen,
        openingTime: row.opening_time,
        closingTime: row.closing_time,
        rating: row.rating ? parseFloat(row.rating) : null,
        deliveryAvailable,
        pickupAvailable,
        lastUpdated: row.last_updated,
        // Will compute savings difference once min/max are established
        potentialSavingsFromHighest: 0,
        savingsPercentFromHighest: 0,
      };
    });

    // 4. Apply Filters
    if (filter.minPrice != null) {
      pharmacies = pharmacies.filter((p) => p.price >= filter.minPrice!);
    }
    if (filter.maxPrice != null) {
      pharmacies = pharmacies.filter((p) => p.price <= filter.maxPrice!);
    }
    if (filter.availability && filter.availability !== 'all') {
      pharmacies = pharmacies.filter((p) => p.availability === filter.availability);
    }
    if (filter.openNow === true) {
      pharmacies = pharmacies.filter((p) => p.isOpen);
    }
    if (filter.delivery === true) {
      pharmacies = pharmacies.filter((p) => p.deliveryAvailable);
    }
    if (filter.pickup === true) {
      pharmacies = pharmacies.filter((p) => p.pickupAvailable);
    }
    if (filter.radius != null) {
      pharmacies = pharmacies.filter((p) => p.distance == null || p.distance <= filter.radius!);
    }

    // 5. Calculate Metrics
    const prices = pharmacies.map((p) => p.price);
    const lowestPrice = prices.length > 0 ? Math.min(...prices) : 0;
    const highestPrice = prices.length > 0 ? Math.max(...prices) : 0;
    const averagePrice = prices.length > 0 ? Number((prices.reduce((a, b) => a + b, 0) / prices.length).toFixed(2)) : 0;
    const absoluteDifference = Number((highestPrice - lowestPrice).toFixed(2));
    const priceDifferencePercentage = highestPrice > 0 ? Number(((absoluteDifference / highestPrice) * 100).toFixed(1)) : 0;

    // Attach individual savings metrics
    pharmacies.forEach((p) => {
      p.potentialSavingsFromHighest = Number((highestPrice - p.price).toFixed(2));
      p.savingsPercentFromHighest = highestPrice > 0 ? Number(((p.potentialSavingsFromHighest / highestPrice) * 100).toFixed(1)) : 0;
    });

    // 6. Apply Sorting
    pharmacies.sort((a, b) => {
      switch (filter.sort) {
        case 'price_desc':
          return b.price - a.price;
        case 'distance_asc':
          return (a.distance ?? 9999) - (b.distance ?? 9999);
        case 'availability_desc': {
          const score = (status: string) => (status === 'in_stock' ? 3 : status === 'limited_stock' ? 2 : 1);
          return score(b.availability) - score(a.availability);
        }
        case 'savings_desc':
          return b.potentialSavingsFromHighest - a.potentialSavingsFromHighest;
        case 'rating_desc':
          return (b.rating ?? 0) - (a.rating ?? 0);
        case 'price_asc':
        default:
          return a.price - b.price;
      }
    });

    res.json({
      medicine: {
        id: medicine.id,
        name: medicine.name,
        brandName: medicine.brand_name,
        genericName: medicine.generic_name,
        composition: medicine.composition,
        strength: medicine.strength,
        dosageForm: medicine.dosage_form,
        packSize: medicine.pack_size,
        prescriptionRequired: medicine.prescription_required,
      },
      userLocation: {
        latitude: userLat,
        longitude: userLng,
        source: locationSource,
      },
      comparison: {
        lowestPrice,
        highestPrice,
        averagePrice,
        potentialDifference: absoluteDifference,
        priceDifferencePercentage,
        totalPharmacies: pharmacies.length,
        inStockCount: pharmacies.filter((p) => p.availability === 'in_stock').length,
        disclaimer:
          'Demo data — prices and availability are illustrative and may not reflect current pharmacy information. Verify with the pharmacy before purchasing.',
      },
      pharmacies,
    });
  } catch (err: any) {
    if (err.name === 'ZodError') {
      res.status(400).json({ error: 'Validation Error', details: err.errors });
      return;
    }
    console.error('compareMedicine error:', err);
    res.status(500).json({ error: 'Server Error', message: 'Failed to generate price comparison.' });
  }
}
