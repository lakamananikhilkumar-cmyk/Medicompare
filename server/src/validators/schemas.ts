import { z } from 'zod';

// =================== AUTHENTICATION ===================
export const signupSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(100, 'Name must be at most 100 characters'),
  email: z.string().trim().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters').max(128, 'Password must be at most 128 characters'),
  confirmPassword: z.string().min(8, 'Confirm password must be at least 8 characters').max(128),
  phone: z.string().trim().optional().nullable(),
  city: z.string().trim().optional().nullable(),
  pincode: z.string().trim().regex(/^\d{6}$/, 'Pincode must be 6 digits').optional().nullable(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

export const loginSchema = z.object({
  email: z.string().trim().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const profileUpdateSchema = z.object({
  name: z.string().trim().min(2).max(100).optional(),
  phone: z.string().trim().optional().nullable(),
  city: z.string().trim().optional().nullable(),
  pincode: z.string().trim().regex(/^\d{6}$/, 'Pincode must be 6 digits').optional().nullable(),
});

// =================== MEDICINES & SEARCH ===================
export const medicineSearchSchema = z.object({
  q: z.string().trim().min(1, 'Search query is required').max(100, 'Query too long'),
  limit: z.coerce.number().int().min(1).max(50).default(10),
});

export const compareQuerySchema = z.object({
  lat: z.coerce.number().min(-90).max(90).optional(),
  lng: z.coerce.number().min(-180).max(180).optional(),
  city: z.string().trim().optional(),
  pincode: z.string().trim().regex(/^\d{6}$/, 'Pincode must be 6 digits').optional(),
  radius: z.coerce.number().positive().max(100).default(25), // in km
  minPrice: z.coerce.number().nonnegative().optional(),
  maxPrice: z.coerce.number().nonnegative().optional(),
  availability: z.enum(['in_stock', 'limited_stock', 'out_of_stock', 'all']).optional(),
  sort: z.enum(['price_asc', 'price_desc', 'distance_asc', 'availability_desc', 'savings_desc', 'rating_desc']).default('price_asc'),
  delivery: z.enum(['true', 'false']).transform((v) => v === 'true').optional(),
  pickup: z.enum(['true', 'false']).transform((v) => v === 'true').optional(),
  openNow: z.enum(['true', 'false']).transform((v) => v === 'true').optional(),
});

// =================== FAVORITES & HISTORY ===================
export const favoriteCreateSchema = z.object({
  medicineId: z.string().uuid().optional().nullable(),
  pharmacyId: z.string().uuid().optional().nullable(),
}).refine((data) => data.medicineId || data.pharmacyId, {
  message: 'Either medicineId or pharmacyId must be provided',
});

export const searchHistoryCreateSchema = z.object({
  query: z.string().trim().min(1).max(100),
  medicineId: z.string().uuid().optional().nullable(),
});

// =================== ADMIN MANAGEMENT ===================
export const adminMedicineSchema = z.object({
  name: z.string().trim().min(2, 'Name is required').max(200),
  brandName: z.string().trim().max(200).optional().nullable(),
  genericName: z.string().trim().max(200).optional().nullable(),
  composition: z.string().trim().max(500).optional().nullable(),
  strength: z.string().trim().min(1, 'Strength is required').max(100),
  dosageForm: z.string().trim().min(1, 'Dosage form is required').max(100),
  packSize: z.string().trim().min(1, 'Pack size is required').max(100),
  prescriptionRequired: z.boolean().default(false),
  isActive: z.boolean().default(true),
});

export const adminPharmacySchema = z.object({
  name: z.string().trim().min(2, 'Name is required').max(200),
  address: z.string().trim().min(5, 'Address is required').max(500),
  city: z.string().trim().min(2, 'City is required').max(100),
  pincode: z.string().trim().regex(/^\d{6}$/, 'Pincode must be 6 digits').optional().nullable(),
  latitude: z.coerce.number().min(-90).max(90).optional().nullable(),
  longitude: z.coerce.number().min(-180).max(180).optional().nullable(),
  phone: z.string().trim().min(5, 'Phone is required').max(50).optional().nullable(),
  openingTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)(:[0-5]\d)?$/, 'Invalid opening time (HH:MM or HH:MM:SS)').optional().nullable(),
  closingTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)(:[0-5]\d)?$/, 'Invalid closing time (HH:MM or HH:MM:SS)').optional().nullable(),
  rating: z.coerce.number().min(0).max(5).optional().nullable(),
  deliveryAvailable: z.boolean().default(false),
  pickupAvailable: z.boolean().default(true),
  isActive: z.boolean().default(true),
});

export const adminInventorySchema = z.object({
  pharmacyId: z.string().uuid('Invalid pharmacy ID'),
  medicineId: z.string().uuid('Invalid medicine ID'),
  price: z.coerce.number().nonnegative('Price must be greater than or equal to 0'),
  mrp: z.coerce.number().nonnegative('MRP must be greater than or equal to 0').optional().nullable(),
  stockQuantity: z.coerce.number().int().nonnegative('Stock quantity must be a non-negative integer'),
  availability: z.enum(['in_stock', 'limited_stock', 'out_of_stock']),
  deliveryAvailable: z.boolean().default(false),
  pickupAvailable: z.boolean().default(true),
}).refine((data) => data.mrp == null || data.price <= data.mrp, {
  message: 'Price cannot exceed MRP',
  path: ['price'],
});

// =================== AI SCHEMAS ===================
export const aiMedicineInfoRequestSchema = z.object({
  medicineName: z.string().trim().min(2).max(100),
  strength: z.string().trim().max(50).optional(),
  dosageForm: z.string().trim().max(50).optional(),
  userQuestion: z.string().trim().max(500).optional(),
});

export const aiMedicineInfoResponseSchema = z.object({
  medicineName: z.string(),
  summary: z.string(),
  activeIngredient: z.string(),
  commonUses: z.array(z.string()),
  precautionCategories: z.array(z.string()),
  commonSideEffectCategories: z.array(z.string()),
  prescriptionRequired: z.boolean().nullable(),
  safetyNotice: z.string(),
});

export const aiCompareExplanationRequestSchema = z.object({
  medicine: z.string().min(2),
  prices: z.array(
    z.object({
      pharmacy: z.string(),
      price: z.number().nonnegative(),
    })
  ).min(2, 'At least two pharmacy prices are needed to compare'),
});

export const aiCompareExplanationResponseSchema = z.object({
  lowestPrice: z.number(),
  highestPrice: z.number(),
  absoluteDifference: z.number(),
  percentageDifference: z.number(),
  explanation: z.string(),
});

export const aiSafetyClassificationSchema = z.object({
  category: z.enum([
    'general_information',
    'personalized_medical_advice',
    'emergency',
    'medication_change',
    'diagnosis',
    'unrelated',
  ]),
  allowed: z.boolean(),
  reason: z.string(),
});
