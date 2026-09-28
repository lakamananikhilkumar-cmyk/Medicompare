import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Edit2, Trash2, X, Check, Loader2, Layers, Search, Filter } from 'lucide-react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { api } from '../../lib/api';
import type { Medicine, Pharmacy } from '../../types';

const inventoryFormSchema = z
  .object({
    pharmacyId: z.string().uuid('Please select a pharmacy'),
    medicineId: z.string().uuid('Please select a medicine'),
    price: z.coerce.number().min(0, 'Price must be non-negative'),
    mrp: z.coerce.number().min(0).optional().nullable(),
    stockQuantity: z.coerce.number().int().min(0, 'Stock must be non-negative'),
    availability: z.enum(['in_stock', 'limited_stock', 'out_of_stock']),
    deliveryAvailable: z.boolean().default(false),
    pickupAvailable: z.boolean().default(true),
  })
  .refine((data) => !data.mrp || data.price <= data.mrp, {
    message: 'Price cannot exceed MRP',
    path: ['price'],
  });

type InventoryFormData = z.infer<typeof inventoryFormSchema>;

export const AdminInventoryPage: React.FC = () => {
  const [inventory, setInventory] = useState<any[]>([]);
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [pharmacies, setPharmacies] = useState<Pharmacy[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingItem, setEditingItem] = useState<any | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<InventoryFormData>({
    resolver: zodResolver(inventoryFormSchema),
  });

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [invRes, medRes, pharmRes] = await Promise.all([
        api.admin.getInventory(),
        api.medicines.list({ limit: 100 }),
        api.pharmacies.list({ limit: 100 }),
      ]);
      setInventory(invRes.inventory);
      setMedicines(medRes.medicines);
      setPharmacies(pharmRes.pharmacies);
    } catch (err) {
      console.error('Failed to load inventory data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openCreateModal = () => {
    setEditingItem(null);
    reset({
      pharmacyId: pharmacies[0]?.id || '',
      medicineId: medicines[0]?.id || '',
      price: 20.0,
      mrp: 25.0,
      stockQuantity: 100,
      availability: 'in_stock',
      deliveryAvailable: true,
      pickupAvailable: true,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (item: any) => {
    setEditingItem(item);
    reset({
      pharmacyId: item.pharmacy_id,
      medicineId: item.medicine_id,
      price: parseFloat(item.price),
      mrp: item.mrp ? parseFloat(item.mrp) : null,
      stockQuantity: item.stock_quantity,
      availability: item.availability,
      deliveryAvailable: item.delivery_available,
      pickupAvailable: item.pickup_available,
    });
    setIsModalOpen(true);
  };

  const onSubmit = async (data: InventoryFormData) => {
    setIsSubmitting(true);
    try {
      if (editingItem) {
        await api.admin.updateInventory(editingItem.id, data);
      } else {
        await api.admin.saveInventory(data);
      }
      setIsModalOpen(false);
      loadData();
    } catch (err) {
      console.error('Save inventory error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this inventory record?')) return;
    try {
      await api.admin.deleteInventory(id);
      loadData();
    } catch (err) {
      console.error('Delete inventory error:', err);
    }
  };

  const filtered = inventory.filter(
    (item) =>
      item.medicine_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.pharmacy_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Pharmacy Inventory & Pricing</h2>
            <p className="text-xs text-slate-500">Manage real-time rates, MRP compliance, and stock status across stores.</p>
          </div>

          <button
            onClick={openCreateModal}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-xl shadow-sm transition-colors self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Add / Update Stock</span>
          </button>
        </div>

        {/* Search */}
        <div className="relative max-w-sm">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by pharmacy or medicine..."
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>

        {/* Inventory Table */}
        {isLoading ? (
          <div className="py-20 flex justify-center text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
          </div>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm text-xs">
            <table className="w-full text-left">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 font-semibold border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="py-3 px-4">Medicine</th>
                  <th className="py-3 px-4">Pharmacy</th>
                  <th className="py-3 px-4">Listed Price</th>
                  <th className="py-3 px-4">MRP</th>
                  <th className="py-3 px-4">Stock Status</th>
                  <th className="py-3 px-4">Last Updated</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filtered.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                    <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">
                      {item.medicine_name}
                      <span className="block text-[10px] text-slate-400 font-normal">
                        {item.strength} • {item.dosage_form}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-700 dark:text-slate-300">{item.pharmacy_name}</td>
                    <td className="py-3 px-4 font-black text-slate-900 dark:text-white">
                      ₹{parseFloat(item.price).toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-slate-400">
                      {item.mrp ? `₹${parseFloat(item.mrp).toFixed(2)}` : '—'}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                          item.availability === 'in_stock'
                            ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            : item.availability === 'limited_stock'
                            ? 'bg-amber-50 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                            : 'bg-rose-50 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                        }`}
                      >
                        {item.availability.replace('_', ' ')} ({item.stock_quantity})
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-400 text-[10px]">
                      {new Date(item.updated_at).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 text-right space-x-1">
                      <button
                        onClick={() => openEditModal(item)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-teal-600 hover:bg-slate-100"
                        title="Edit inventory"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                        title="Delete inventory"
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
            <div className="w-full max-w-md p-6 bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <h3 className="font-bold text-base text-slate-900 dark:text-white">
                  {editingItem ? 'Update Inventory Record' : 'Add Inventory & Price'}
                </h3>
                <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-3 text-xs">
                <div>
                  <label className="block mb-1 font-semibold text-slate-700 dark:text-slate-300">Pharmacy</label>
                  <select
                    {...register('pharmacyId')}
                    disabled={!!editingItem}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    {pharmacies.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.city})
                      </option>
                    ))}
                  </select>
                  {errors.pharmacyId && <p className="text-rose-500 mt-0.5">{errors.pharmacyId.message}</p>}
                </div>

                <div>
                  <label className="block mb-1 font-semibold text-slate-700 dark:text-slate-300">Medicine</label>
                  <select
                    {...register('medicineId')}
                    disabled={!!editingItem}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    {medicines.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name} ({m.strength})
                      </option>
                    ))}
                  </select>
                  {errors.medicineId && <p className="text-rose-500 mt-0.5">{errors.medicineId.message}</p>}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block mb-1 font-semibold text-slate-700 dark:text-slate-300">Listed Price (₹)</label>
                    <input
                      type="number"
                      step="0.01"
                      {...register('price')}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
                    {errors.price && <p className="text-rose-500 mt-0.5">{errors.price.message}</p>}
                  </div>
                  <div>
                    <label className="block mb-1 font-semibold text-slate-700 dark:text-slate-300">MRP (₹)</label>
                    <input
                      type="number"
                      step="0.01"
                      {...register('mrp')}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
                    {errors.mrp && <p className="text-rose-500 mt-0.5">{errors.mrp.message}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block mb-1 font-semibold text-slate-700 dark:text-slate-300">Stock Quantity</label>
                    <input
                      type="number"
                      {...register('stockQuantity')}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block mb-1 font-semibold text-slate-700 dark:text-slate-300">Availability</label>
                    <select
                      {...register('availability')}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                    >
                      <option value="in_stock">In Stock</option>
                      <option value="limited_stock">Limited Stock</option>
                      <option value="out_of_stock">Out of Stock</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center gap-4 pt-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" {...register('deliveryAvailable')} className="w-4 h-4 rounded text-teal-600" />
                    <span>Delivery Offered</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" {...register('pickupAvailable')} className="w-4 h-4 rounded text-teal-600" />
                    <span>Store Pickup</span>
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
                    <span>Save Inventory</span>
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
