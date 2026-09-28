import type {
  User,
  Medicine,
  Pharmacy,
  ComparisonResponse,
  PriceHistoryResponse,
  AIMedicineInfo,
  AICompareExplanation,
  SearchHistoryItem,
} from '../types';

const BASE_URL = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL.replace(/\/$/, '')}/api`
  : '/api';

export class ApiError extends Error {
  status: number;
  details?: any;

  constructor(message: string, status: number, details?: any) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.details = details;
  }
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('medicompare_token');

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new ApiError(data.message || data.error || 'Network request failed', response.status, data.details);
  }

  return data as T;
}

export const api = {
  auth: {
    login: (credentials: { email: string; password: string }) =>
      request<{ token: string; user: User }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
      }),
    register: (userData: any) =>
      request<{ token: string; user: User }>('/auth/register', {
        method: 'POST',
        body: JSON.stringify(userData),
      }),
    getMe: () => request<{ user: User }>('/auth/me'),
    updateProfile: (profileData: any) =>
      request<{ user: User }>('/auth/profile', {
        method: 'PUT',
        body: JSON.stringify(profileData),
      }),
  },

  medicines: {
    list: (params?: { prescription?: boolean; dosageForm?: string; limit?: number; offset?: number }) => {
      const query = new URLSearchParams();
      if (params?.prescription != null) query.set('prescription', String(params.prescription));
      if (params?.dosageForm) query.set('dosageForm', params.dosageForm);
      if (params?.limit) query.set('limit', String(params.limit));
      if (params?.offset) query.set('offset', String(params.offset));
      return request<{ medicines: Medicine[]; total: number }>(`/medicines?${query.toString()}`);
    },
    search: (q: string, limit = 10) =>
      request<{ query: string; count: number; results: Medicine[] }>(
        `/medicines/search?q=${encodeURIComponent(q)}&limit=${limit}`
      ),
    getById: (id: string) => request<{ medicine: Medicine; alternatives: Medicine[] }>(`/medicines/${id}`),
  },

  compare: {
    getComparison: (medicineId: string, params: Record<string, any> = {}) => {
      const query = new URLSearchParams();
      Object.entries(params).forEach(([key, val]) => {
        if (val !== undefined && val !== null && val !== '') {
          query.set(key, String(val));
        }
      });
      return request<ComparisonResponse>(`/compare/${medicineId}?${query.toString()}`);
    },
  },

  pharmacies: {
    list: (params?: { city?: string; pincode?: string; search?: string; delivery?: boolean; limit?: number }) => {
      const query = new URLSearchParams();
      if (params?.city) query.set('city', params.city);
      if (params?.pincode) query.set('pincode', params.pincode);
      if (params?.search) query.set('search', params.search);
      if (params?.delivery) query.set('delivery', 'true');
      if (params?.limit) query.set('limit', String(params.limit));
      return request<{ pharmacies: Pharmacy[]; total: number }>(`/pharmacies?${query.toString()}`);
    },
    getNearby: (lat: number, lng: number, radius = 15) =>
      request<{ count: number; pharmacies: Pharmacy[] }>(`/pharmacies/nearby?lat=${lat}&lng=${lng}&radius=${radius}`),
    getById: (id: string) => request<{ pharmacy: Pharmacy }>(`/pharmacies/${id}`),
    getInventory: (id: string) => request<{ pharmacyId: string; count: number; inventory: any[] }>(`/pharmacies/${id}/inventory`),
  },

  favorites: {
    list: () => request<{ medicines: Medicine[]; pharmacies: Pharmacy[]; total: number }>('/favorites'),
    add: (payload: { medicineId?: string; pharmacyId?: string }) =>
      request<{ message: string; favoriteId: string }>('/favorites', {
        method: 'POST',
        body: JSON.stringify(payload),
      }),
    remove: (idOrTarget: string) =>
      request<{ message: string }>(`/favorites/${idOrTarget}`, {
        method: 'DELETE',
      }),
  },

  history: {
    list: () => request<{ history: SearchHistoryItem[]; count: number }>('/history'),
    record: (query: string, medicineId?: string | null) =>
      request<{ id: string }>('/history', {
        method: 'POST',
        body: JSON.stringify({ query, medicineId }),
      }),
    deleteItem: (id: string) =>
      request<{ message: string }>(`/history/${id}`, {
        method: 'DELETE',
      }),
    clearAll: () =>
      request<{ message: string }>('/history', {
        method: 'DELETE',
      }),
  },

  priceHistory: {
    get: (medicineId: string, days = 30) =>
      request<PriceHistoryResponse>(`/price-history/${medicineId}?days=${days}`),
  },

  ai: {
    getMedicineInfo: (payload: { medicineName: string; strength?: string; dosageForm?: string; userQuestion?: string }) =>
      request<AIMedicineInfo>('/ai/medicine-info', {
        method: 'POST',
        body: JSON.stringify(payload),
      }),
    getCompareExplanation: (payload: { medicine: string; prices: Array<{ pharmacy: string; price: number }> }) =>
      request<AICompareExplanation>('/ai/compare-explanation', {
        method: 'POST',
        body: JSON.stringify(payload),
      }),
  },

  admin: {
    // Medicines
    createMedicine: (data: any) =>
      request<{ message: string; medicine: Medicine }>('/admin/medicines', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    updateMedicine: (id: string, data: any) =>
      request<{ message: string; medicine: Medicine }>(`/admin/medicines/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    deleteMedicine: (id: string) =>
      request<{ message: string }>(`/admin/medicines/${id}`, {
        method: 'DELETE',
      }),

    // Pharmacies
    createPharmacy: (data: any) =>
      request<{ message: string; pharmacy: Pharmacy }>('/admin/pharmacies', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    updatePharmacy: (id: string, data: any) =>
      request<{ message: string; pharmacy: Pharmacy }>(`/admin/pharmacies/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    deletePharmacy: (id: string) =>
      request<{ message: string }>(`/admin/pharmacies/${id}`, {
        method: 'DELETE',
      }),

    // Inventory
    getInventory: (params?: { pharmacyId?: string; medicineId?: string }) => {
      const q = new URLSearchParams();
      if (params?.pharmacyId) q.set('pharmacyId', params.pharmacyId);
      if (params?.medicineId) q.set('medicineId', params.medicineId);
      return request<{ inventory: any[]; total: number }>(`/admin/inventory?${q.toString()}`);
    },
    saveInventory: (data: any) =>
      request<{ message: string; inventory: any }>('/admin/inventory', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    updateInventory: (id: string, data: any) =>
      request<{ message: string; inventory: any }>(`/admin/inventory/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    deleteInventory: (id: string) =>
      request<{ message: string }>(`/admin/inventory/${id}`, {
        method: 'DELETE',
      }),

    // Users & Analytics
    getUsers: () => request<{ count: number; users: any[] }>('/admin/users'),
    getAnalytics: () =>
      request<{
        totals: {
          medicines: number;
          pharmacies: number;
          inventoryRecords: number;
          users: number;
          searches: number;
          favorites: number;
        };
        topSearches: Array<{ query: string; search_count: number }>;
        priceVariances: Array<{
          name: string;
          strength: string;
          dosage_form: string;
          min_price: number;
          max_price: number;
          difference: number;
          stocking_pharmacies: number;
        }>;
      }>('/admin/analytics'),
  },

  upload: {
    prescription: async (file: File) => {
      const token = localStorage.getItem('medicompare_token');
      const formData = new FormData();
      formData.append('prescription', file);

      const headers: Record<string, string> = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${BASE_URL}/upload/prescription`, {
        method: 'POST',
        headers,
        body: formData,
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new ApiError(data.message || data.error || 'Prescription upload failed', response.status, data.details);
      }
      return data;
    },
  },
};
