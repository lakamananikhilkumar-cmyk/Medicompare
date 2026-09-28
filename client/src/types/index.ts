export type Role = 'user' | 'admin';
export type AvailabilityStatus = 'in_stock' | 'limited_stock' | 'out_of_stock';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  phone?: string | null;
  city?: string | null;
  pincode?: string | null;
  createdAt?: string;
}

export interface Medicine {
  id: string;
  name: string;
  brand_name?: string | null;
  generic_name?: string | null;
  composition?: string | null;
  strength: string;
  dosage_form: string;
  pack_size: string;
  prescription_required: boolean;
  is_active?: boolean;
  lowest_price?: number | null;
  highest_price?: number | null;
  average_price?: number | null;
  pharmacies_count?: number;
  in_stock_pharmacies_count?: number;
  created_at?: string;
}

export interface Pharmacy {
  id: string;
  name: string;
  address: string;
  city: string;
  pincode?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  phone?: string | null;
  opening_time?: string | null;
  closing_time?: string | null;
  rating?: number | null;
  delivery_available: boolean;
  pickup_available: boolean;
  is_active?: boolean;
  distance?: number | null;
  isOpen?: boolean;
  active_medicines_count?: number;
}

export interface PharmacyComparisonItem {
  inventoryId: string;
  pharmacyId: string;
  pharmacyName: string;
  address: string;
  city: string;
  pincode?: string;
  phone?: string;
  price: number;
  mrp?: number;
  availability: AvailabilityStatus;
  stockQuantity: number;
  distance: number | null;
  isOpen: boolean;
  openingTime?: string;
  closingTime?: string;
  rating: number | null;
  deliveryAvailable: boolean;
  pickupAvailable: boolean;
  lastUpdated: string;
  potentialSavingsFromHighest: number;
  savingsPercentFromHighest: number;
}

export interface ComparisonResponse {
  medicine: {
    id: string;
    name: string;
    brandName?: string | null;
    genericName?: string | null;
    composition?: string | null;
    strength: string;
    dosageForm: string;
    packSize: string;
    prescriptionRequired: boolean;
  };
  userLocation: {
    latitude: number;
    longitude: number;
    source: string;
  };
  comparison: {
    lowestPrice: number;
    highestPrice: number;
    averagePrice: number;
    potentialDifference: number;
    priceDifferencePercentage: number;
    totalPharmacies: number;
    inStockCount: number;
    disclaimer: string;
  };
  pharmacies: PharmacyComparisonItem[];
}

export interface PriceHistoryRecord {
  id: string;
  pharmacyId: string;
  pharmacyName: string;
  price: number;
  recordedAt: string;
}

export interface PriceHistoryResponse {
  medicineId: string;
  days: number;
  isSimulatedDemoData: boolean;
  demoNotice: string;
  count: number;
  history: PriceHistoryRecord[];
}

export interface AIMedicineInfo {
  medicineName: string;
  summary: string;
  activeIngredient: string;
  commonUses: string[];
  precautionCategories: string[];
  commonSideEffectCategories: string[];
  prescriptionRequired: boolean | null;
  safetyNotice: string;
}

export interface AICompareExplanation {
  lowestPrice: number;
  highestPrice: number;
  absoluteDifference: number;
  percentageDifference: number;
  explanation: string;
}

export interface SearchHistoryItem {
  id: string;
  query: string;
  searched_at: string;
  medicine_id?: string | null;
  medicine_name?: string | null;
  generic_name?: string | null;
  strength?: string | null;
  dosage_form?: string | null;
}
