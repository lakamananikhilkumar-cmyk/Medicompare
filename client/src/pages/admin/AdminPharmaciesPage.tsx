import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Edit2, Trash2, X, Check, Loader2, Store, Search, MapPin } from 'lucide-react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { api } from '../../lib/api';
import type { Pharmacy } from '../../types';

const pharmacyFormSchema = z.object({
  name: z.string().trim().min(2, 'Name is required'),
  address: z.string().trim().min(5, 'Address is required'),
  city: z.string().trim().min(2, 'City is required'),
  pincode: z.string().trim().regex(/^\d{6}$/, 'Pincode must be 6 digits').or(z.literal('')).optional(),
  latitude: z.coerce.number().optional().nullable(),
  longitude: z.coerce.number().optional().nullable(),
  phone: z.string().trim().min(5, 'Phone is required').optional().or(z.literal('')),
  openingTime: z.string().optional(),
  closingTime: z.string().optional(),
  rating: z.coerce.number().min(0).max(5).optional().nullable(),
  deliveryAvailable: z.boolean().default(false),
  pickupAvailable: z.boolean().default(true),
  isActive: z.boolean().default(true),
});

type PharmacyFormData = z.infer<typeof pharmacyFormSchema>;

export const AdminPharmaciesPage: React.FC = () => {
  const [pharmacies, setPharmacies] = useState<Pharmacy[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingPharmacy, setEditingPharmacy] = useState<Pharmacy | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PharmacyFormData>({
    resolver: zodResolver(pharmacyFormSchema),
  });

  const loadPharmacies = async () => {
    setIsLoading(true);
    try {
      const res = await api.pharmacies.list({ limit: 100 });
      setPharmacies(res.pharmacies);
    } catch (err) {
      console.error('Failed to load pharmacies:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPharmacies();
  }, []);

  const openCreateModal = () => {
    setEditingPharmacy(null);
    reset({
      name: '',
      address: '',
      city: 'Bengaluru',
      pincode: '560001',
      latitude: 12.9716,
      longitude: 77.5946,
      phone: '+91 80 0000 0000',
      openingTime: '08:00:00',
      closingTime: '23:00:00',
      rating: 4.5,
      deliveryAvailable: true,
      pickupAvailable: true,
      isActive: true,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (p: Pharmacy) => {
    setEditingPharmacy(p);
    reset({
      name: p.name,
      address: p.address,
      city: p.city,
      pincode: p.pincode || '',
      latitude: p.latitude ?? null,
      longitude: p.longitude ?? null,
      phone: p.phone || '',
      openingTime: p.opening_time || '08:00:00',
      closingTime: p.closing_time || '22:00:00',
      rating: p.rating ? Number(p.rating) : null,
      deliveryAvailable: p.delivery_available,
      pickupAvailable: p.pickup_available,
      isActive: p.is_active ?? true,
    });
    setIsModalOpen(true);
  };

  const onSubmit = async (data: PharmacyFormData) => {
    setIsSubmitting(true);
    try {
      if (editingPharmacy) {
        await api.admin.updatePharmacy(editingPharmacy.id, data);
      } else {
        await api.admin.createPharmacy(data);
      }
      setIsModalOpen(false);
      loadPharmacies();
    } catch (err) {
      console.error('Save pharmacy error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleArchive = async (id: string) => {
    if (!window.confirm('Are you sure you want to archive this pharmacy?')) return;
    try {
      await api.admin.deletePharmacy(id);
      loadPharmacies();
    } catch (err) {
      console.error('Archive pharmacy error:', err);
    }
  };

  const filtered = pharmacies.filter(
    (p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.address.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Registered Pharmacies</h2>
            <p className="text-xs text-slate-500">Manage pharmacy listings, contacts, operating hours, and fulfillment flags.</p>
          </div>

          <button
            onClick={openCreateModal}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-xl shadow-sm transition-colors self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Add Pharmacy</span>
          </button>
        </div>

        {/* Search */}
        <div className="relative max-w-sm">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name, address, city..."
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>

        {/* Table */}
        {isLoading ? (
          <div className="py-20 flex justify-center text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
          </div>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm text-xs">
            <table className="w-full text-left">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 font-semibold border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="py-3 px-4">Pharmacy Name</th>
                  <th className="py-3 px-4">City</th>
                  <th className="py-3 px-4">Phone</th>
                  <th className="py-3 px-4">Hours</th>
                  <th className="py-3 px-4">Delivery</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filtered.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                    <td className="py-3 px-4">
                      <span className="font-bold text-slate-900 dark:text-white block">{p.name}</span>
                      <span className="text-[10px] text-slate-400 truncate max-w-xs block">{p.address}</span>
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-700 dark:text-slate-300">{p.city}</td>
                    <td className="py-3 px-4">{p.phone || '—'}</td>
                    <td className="py-3 px-4">
                      {p.opening_time?.slice(0, 5)} - {p.closing_time?.slice(0, 5)}
                    </td>
                    <td className="py-3 px-4">
                      {p.delivery_available ? (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-cyan-50 text-cyan-700 dark:bg-cyan-950 dark:text-cyan-300">
                          Yes
                        </span>
                      ) : (
                        <span className="text-slate-400">No</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right space-x-1">
                      <button
                        onClick={() => openEditModal(p)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-teal-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                        title="Edit pharmacy"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleArchive(p.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                        title="Archive pharmacy"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <div className="w-full max-w-lg p-6 bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <h3 className="font-bold text-base text-slate-900 dark:text-white">
                  {editingPharmacy ? 'Edit Pharmacy' : 'Register New Pharmacy'}
                </h3>
                <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-3 text-xs">
                <div>
                  <label className="block mb-1 font-semibold text-slate-700 dark:text-slate-300">Pharmacy Name</label>
                  <input
                    type="text"
                    {...register('name')}
                    placeholder="e.g. Apollo Pharmacy - Indiranagar"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                  {errors.name && <p className="text-rose-500 mt-0.5">{errors.name.message}</p>}
                </div>

                <div>
                  <label className="block mb-1 font-semibold text-slate-700 dark:text-slate-300">Address</label>
                  <input
                    type="text"
                    {...register('address')}
                    placeholder="Full street address"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                  {errors.address && <p className="text-rose-500 mt-0.5">{errors.address.message}</p>}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block mb-1 font-semibold text-slate-700 dark:text-slate-300">City</label>
                    <input
                      type="text"
                      {...register('city')}
                      placeholder="e.g. Bengaluru"
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block mb-1 font-semibold text-slate-700 dark:text-slate-300">Pincode</label>
                    <input
                      type="text"
                      maxLength={6}
                      {...register('pincode')}
                      placeholder="e.g. 560038"
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block mb-1 font-semibold text-slate-700 dark:text-slate-300">Latitude</label>
                    <input
                      type="number"
                      step="any"
                      {...register('latitude')}
                      placeholder="12.9784"
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block mb-1 font-semibold text-slate-700 dark:text-slate-300">Longitude</label>
                    <input
                      type="number"
                      step="any"
                      {...register('longitude')}
                      placeholder="77.6408"
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block mb-1 font-semibold text-slate-700 dark:text-slate-300">Phone</label>
                    <input
                      type="text"
                      {...register('phone')}
                      placeholder="+91 80 2521 1122"
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block mb-1 font-semibold text-slate-700 dark:text-slate-300">Opening Time</label>
                    <input
                      type="text"
                      {...register('openingTime')}
                      placeholder="08:00:00"
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block mb-1 font-semibold text-slate-700 dark:text-slate-300">Closing Time</label>
                    <input
                      type="text"
                      {...register('closingTime')}
                      placeholder="23:00:00"
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-4 pt-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" {...register('deliveryAvailable')} className="w-4 h-4 rounded text-teal-600" />
                    <span>Home Delivery</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" {...register('pickupAvailable')} className="w-4 h-4 rounded text-teal-600" />
                    <span>In-Store Pickup</span>
                  </label>
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-5 py-2 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-xl flex items-center gap-1.5"
                  >
                    {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                    <span>Save Pharmacy</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};
