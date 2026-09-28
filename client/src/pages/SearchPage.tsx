import React, { useState, useEffect } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { Pill, Search, Filter, ArrowRight, Loader2, ShieldCheck, Tag } from 'lucide-react';
import { api } from '../lib/api';
import type { Medicine } from '../types';

export const SearchPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  const [query, setQuery] = useState(initialQuery);
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [prescriptionFilter, setPrescriptionFilter] = useState<string>('all');
  const [dosageFilter, setDosageFilter] = useState<string>('all');
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;
    setIsLoading(true);

    const q = searchParams.get('q') || '';
    setQuery(q);

    if (q.trim()) {
      api.medicines
        .search(q, 30)
        .then((res: { query: string; count: number; results: Medicine[] }) => {
          if (mounted) setMedicines(res.results);
        })
        .finally(() => {
          if (mounted) setIsLoading(false);
        });
    } else {
      api.medicines
        .list({ limit: 50 })
        .then((res: { medicines: Medicine[]; total: number }) => {
          if (mounted) setMedicines(res.medicines);
        })
        .finally(() => {
          if (mounted) setIsLoading(false);
        });
    }

    return () => {
      mounted = false;
    };
  }, [searchParams]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchParams({ q: query.trim() });
  };

  // Filter medicines locally
  const filtered = medicines.filter((m) => {
    if (prescriptionFilter === 'rx' && !m.prescription_required) return false;
    if (prescriptionFilter === 'otc' && m.prescription_required) return false;
    if (dosageFilter !== 'all' && m.dosage_form.toLowerCase() !== dosageFilter.toLowerCase()) return false;
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header & Search Bar */}
      <div className="space-y-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Medicine Catalog & Search
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Search by brand, salt, formulation, or composition to compare exact local pharmacy rates.
          </p>
        </div>

        <form onSubmit={handleSearchSubmit} className="relative flex items-center max-w-2xl">
          <Search className="absolute left-4 w-5 h-5 text-slate-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search medicine (e.g. Paracetamol, Dolo 650, Pantoprazole)..."
            className="w-full pl-12 pr-24 py-3 text-sm rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500 shadow-sm"
          />
          <button
            type="submit"
            className="absolute right-2 px-4 py-1.5 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-xl transition-colors"
          >
            Search
          </button>
        </form>
      </div>

      {/* Filter Chips */}
      <div className="flex flex-wrap items-center gap-3 pt-2 text-xs">
        <span className="font-semibold text-slate-400 flex items-center gap-1">
          <Filter className="w-3.5 h-3.5" /> Filters:
        </span>

        {/* Prescription filter */}
        <select
          value={prescriptionFilter}
          onChange={(e) => setPrescriptionFilter(e.target.value)}
          className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 font-medium"
        >
          <option value="all">All Medicines</option>
          <option value="rx">Prescription (Rx) Only</option>
          <option value="otc">Over-The-Counter (OTC)</option>
        </select>

        {/* Dosage Form filter */}
        <select
          value={dosageFilter}
          onChange={(e) => setDosageFilter(e.target.value)}
          className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 font-medium"
        >
          <option value="all">All Dosage Forms</option>
          <option value="tablet">Tablets</option>
          <option value="capsule">Capsules</option>
          <option value="oral suspension">Oral Suspensions</option>
          <option value="inhaler">Inhalers</option>
        </select>
      </div>

      {/* Results List */}
      {isLoading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-3 text-slate-400">
          <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
          <p className="text-xs">Finding matching formulations...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-2">
          <p className="text-sm font-bold text-slate-900 dark:text-white">No medicines found</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Try adjusting your search keywords or clearing filters.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((med) => (
            <div
              key={med.id}
              className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-teal-500/40 transition-all flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded bg-teal-50 dark:bg-teal-950 text-teal-700 dark:text-teal-300">
                    {med.dosage_form} • {med.pack_size}
                  </span>
                  {med.prescription_required ? (
                    <span className="px-1.5 py-0.5 text-[10px] font-semibold rounded bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-300">
                      Rx
                    </span>
                  ) : (
                    <span className="px-1.5 py-0.5 text-[10px] font-semibold rounded bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                      OTC
                    </span>
                  )}
                </div>

                <Link
                  to={`/compare/${med.id}`}
                  className="font-bold text-base text-slate-900 dark:text-white hover:text-teal-600 transition-colors block"
                >
                  {med.name}
                </Link>

                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {med.generic_name} • {med.strength}
                </p>

                {med.brand_name && (
                  <p className="text-[11px] text-teal-700 dark:text-teal-400 font-medium">
                    Brands: {med.brand_name}
                  </p>
                )}
              </div>

              <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Local Rates</span>
                  <span className="text-sm font-black text-slate-900 dark:text-white">
                    {med.lowest_price != null ? `from ₹${Number(med.lowest_price).toFixed(2)}` : 'Check nearby'}
                  </span>
                </div>

                <Link
                  to={`/compare/${med.id}`}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-xl shadow-sm transition-colors"
                >
                  <span>Compare</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
