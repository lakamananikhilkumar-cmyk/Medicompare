import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Edit2, Trash2, X, Check, Loader2, Pill, Search } from 'lucide-react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { api } from '../../lib/api';
import type { Medicine } from '../../types';

const medicineFormSchema = z.object({
  name: z.string().trim().min(2, 'Name is required'),
  brandName: z.string().trim().optional(),
  genericName: z.string().trim().optional(),
  composition: z.string().trim().optional(),
  strength: z.string().trim().min(1, 'Strength is required'),
  dosageForm: z.string().trim().min(1, 'Dosage form is required'),
  packSize: z.string().trim().min(1, 'Pack size is required'),
  prescriptionRequired: z.boolean().default(false),
  isActive: z.boolean().default(true),
});

type MedicineFormData = z.infer<typeof medicineFormSchema>;

export const AdminMedicinesPage: React.FC = () => {
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingMedicine, setEditingMedicine] = useState<Medicine | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<MedicineFormData>({
    resolver: zodResolver(medicineFormSchema),
  });

  const loadMedicines = async () => {
    setIsLoading(true);
    try {
      const res = await api.medicines.list({ limit: 100 });
      setMedicines(res.medicines);
    } catch (err) {
      console.error('Failed to load medicines:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadMedicines();
  }, []);

  const openCreateModal = () => {
    setEditingMedicine(null);
    reset({
      name: '',
      brandName: '',
      genericName: '',
      composition: '',
      strength: '500 mg',
      dosageForm: 'Tablet',
      packSize: 'Pack of 10',
      prescriptionRequired: false,
      isActive: true,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (med: Medicine) => {
    setEditingMedicine(med);
    reset({
      name: med.name,
      brandName: med.brand_name || '',
      genericName: med.generic_name || '',
      composition: med.composition || '',
      strength: med.strength,
      dosageForm: med.dosage_form,
      packSize: med.pack_size,
      prescriptionRequired: med.prescription_required,
      isActive: med.is_active ?? true,
    });
    setIsModalOpen(true);
  };

  const onSubmit = async (data: MedicineFormData) => {
    setIsSubmitting(true);
    try {
      if (editingMedicine) {
        await api.admin.updateMedicine(editingMedicine.id, data);
      } else {
        await api.admin.createMedicine(data);
      }
      setIsModalOpen(false);
      loadMedicines();
    } catch (err) {
      console.error('Save medicine error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleArchive = async (id: string) => {
    if (!window.confirm('Are you sure you want to archive this medicine?')) return;
    try {
      await api.admin.deleteMedicine(id);
      loadMedicines();
    } catch (err) {
      console.error('Archive medicine error:', err);
    }
  };

  const filtered = medicines.filter(
    (m) =>
      m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (m.generic_name && m.generic_name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Medicines Master Catalog</h2>
            <p className="text-xs text-slate-500">Manage formulations, strengths, dosage forms, and prescription status.</p>
          </div>

          <button
            onClick={openCreateModal}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-xl shadow-sm transition-colors self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Add Formulation</span>
          </button>
        </div>

        {/* Search */}
        <div className="relative max-w-sm">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Filter catalog..."
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
                  <th className="py-3 px-4">Medicine Name</th>
                  <th className="py-3 px-4">Generic Salt</th>
                  <th className="py-3 px-4">Strength & Form</th>
                  <th className="py-3 px-4">Pack Size</th>
                  <th className="py-3 px-4">Rx</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filtered.map((med) => (
                  <tr key={med.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                    <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">
                      {med.name}
                      {med.brand_name && <span className="block text-[10px] text-slate-400">{med.brand_name}</span>}
                    </td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-300">{med.generic_name}</td>
                    <td className="py-3 px-4">
                      <span className="font-semibold text-teal-700 dark:text-teal-400">{med.strength}</span> • {med.dosage_form}
                    </td>
                    <td className="py-3 px-4">{med.pack_size}</td>
                    <td className="py-3 px-4">
                      {med.prescription_required ? (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-300">
                          Yes
                        </span>
                      ) : (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                          OTC
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right space-x-1">
                      <button
                        onClick={() => openEditModal(med)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-teal-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                        title="Edit medicine"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleArchive(med.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                        title="Archive medicine"
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
                  {editingMedicine ? 'Edit Medicine Formulation' : 'Create New Formulation'}
                </h3>
                <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-3 text-xs">
                <div>
                  <label className="block mb-1 font-semibold text-slate-700 dark:text-slate-300">Medicine Full Name</label>
                  <input
                    type="text"
                    {...register('name')}
                    placeholder="e.g. Paracetamol 500 mg Tablet"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                  {errors.name && <p className="text-rose-500 mt-0.5">{errors.name.message}</p>}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block mb-1 font-semibold text-slate-700 dark:text-slate-300">Generic / Salt Name</label>
                    <input
                      type="text"
                      {...register('genericName')}
                      placeholder="e.g. Paracetamol IP"
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block mb-1 font-semibold text-slate-700 dark:text-slate-300">Popular Brands</label>
                    <input
                      type="text"
                      {...register('brandName')}
                      placeholder="e.g. Crocin / Calpol"
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block mb-1 font-semibold text-slate-700 dark:text-slate-300">Strength</label>
                    <input
                      type="text"
                      {...register('strength')}
                      placeholder="e.g. 500 mg"
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block mb-1 font-semibold text-slate-700 dark:text-slate-300">Dosage Form</label>
                    <input
                      type="text"
                      {...register('dosageForm')}
                      placeholder="e.g. Tablet"
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block mb-1 font-semibold text-slate-700 dark:text-slate-300">Pack Size</label>
                    <input
                      type="text"
                      {...register('packSize')}
                      placeholder="e.g. Pack of 10"
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <input
                    type="checkbox"
                    id="prescriptionRequired"
                    {...register('prescriptionRequired')}
                    className="w-4 h-4 rounded text-teal-600 focus:ring-teal-500"
                  />
                  <label htmlFor="prescriptionRequired" className="font-semibold text-slate-700 dark:text-slate-300">
                    Prescription Required (Schedule H Drug)
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
                    <span>Save Medicine</span>
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
