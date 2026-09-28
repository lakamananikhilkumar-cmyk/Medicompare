import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Bookmark, Pill, Store, Trash2, ArrowRight, Loader2 } from 'lucide-react';
import { api } from '../lib/api';
import type { Medicine, Pharmacy } from '../types';

export const FavoritesPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'medicines' | 'pharmacies'>('medicines');
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [pharmacies, setPharmacies] = useState<Pharmacy[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadFavorites = async () => {
    setIsLoading(true);
    try {
      const res = await api.favorites.list();
      setMedicines(res.medicines);
      setPharmacies(res.pharmacies);
    } catch (err) {
      console.error('Error fetching favorites:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadFavorites();
  }, []);

  const handleRemove = async (id: string) => {
    try {
      await api.favorites.remove(id);
      loadFavorites();
    } catch (err) {
      console.error('Error removing favorite:', err);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
          Saved Favorites
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Quickly monitor your essential medicines and preferred nearby pharmacies.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 text-xs">
        <button
          onClick={() => setActiveTab('medicines')}
          className={`flex items-center gap-2 px-5 py-3 font-bold border-b-2 transition-all ${
            activeTab === 'medicines'
              ? 'border-teal-600 text-teal-600 dark:text-teal-400'
              : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Pill className="w-4 h-4" />
          <span>Saved Medicines ({medicines.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('pharmacies')}
          className={`flex items-center gap-2 px-5 py-3 font-bold border-b-2 transition-all ${
            activeTab === 'pharmacies'
              ? 'border-teal-600 text-teal-600 dark:text-teal-400'
              : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Store className="w-4 h-4" />
          <span>Saved Pharmacies ({pharmacies.length})</span>
        </button>
      </div>

      {isLoading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-3 text-slate-400">
          <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
          <p className="text-xs">Loading bookmarks...</p>
        </div>
      ) : activeTab === 'medicines' ? (
        medicines.length === 0 ? (
          <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-2">
            <Pill className="w-10 h-10 text-slate-300 dark:text-slate-700 mx-auto" />
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">No Saved Medicines Yet</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              When searching or comparing medicines, click the Save button to pin them here for rapid price tracking.
            </p>
            <div className="pt-2">
              <Link to="/search" className="text-xs font-bold text-teal-600 underline">
                Browse Medicines
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {medicines.map((med) => (
              <div
                key={med.id}
                className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase text-teal-600">
                    {med.dosage_form} • {med.pack_size}
                  </span>
                  <Link to={`/compare/${med.id}`} className="font-bold text-sm text-slate-900 dark:text-white hover:text-teal-600 block">
                    {med.name}
                  </Link>
                  <p className="text-xs text-slate-500">{med.generic_name}</p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <Link
                    to={`/compare/${med.id}`}
                    className="p-2.5 rounded-xl bg-teal-50 dark:bg-teal-950 text-teal-700 dark:text-teal-300 hover:bg-teal-100 transition-colors"
                    title="Compare prices"
                  >
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                  <button
                    onClick={() => handleRemove(med.id)}
                    className="p-2.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                    title="Remove from favorites"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )
      ) : (
        pharmacies.length === 0 ? (
          <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-2">
            <Store className="w-10 h-10 text-slate-300 dark:text-slate-700 mx-auto" />
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">No Saved Pharmacies Yet</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Save your local chemist or preferred store to quickly inspect inventory and pricing anytime.
            </p>
            <div className="pt-2">
              <Link to="/pharmacies" className="text-xs font-bold text-teal-600 underline">
                Browse Pharmacies
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pharmacies.map((pharm) => (
              <div
                key={pharm.id}
                className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase text-teal-600">{pharm.city}</span>
                  <Link to={`/pharmacy/${pharm.id}`} className="font-bold text-sm text-slate-900 dark:text-white hover:text-teal-600 block">
                    {pharm.name}
                  </Link>
                  <p className="text-xs text-slate-500 line-clamp-1">{pharm.address}</p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <Link
                    to={`/pharmacy/${pharm.id}`}
                    className="p-2.5 rounded-xl bg-teal-50 dark:bg-teal-950 text-teal-700 dark:text-teal-300 hover:bg-teal-100 transition-colors"
                  >
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                  <button
                    onClick={() => handleRemove(pharm.id)}
                    className="p-2.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )
      )}
    </div>
  );
};
