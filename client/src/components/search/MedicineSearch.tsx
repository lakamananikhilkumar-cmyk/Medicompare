import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Pill, ShieldAlert, ArrowRight, Loader2, Sparkles } from 'lucide-react';
import { api } from '../../lib/api';
import type { Medicine } from '../../types';

interface MedicineSearchProps {
  initialQuery?: string;
  autoFocus?: boolean;
  size?: 'normal' | 'large';
  onSelectMedicine?: (medicine: Medicine) => void;
}

export const MedicineSearch: React.FC<MedicineSearchProps> = ({
  initialQuery = '',
  autoFocus = false,
  size = 'large',
  onSelectMedicine,
}) => {
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<Medicine[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  // Debounced autocomplete query
  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length < 2) {
      setResults([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const timer = setTimeout(async () => {
      try {
        const res = await api.medicines.search(trimmed, 8);
        setResults(res.results);
        setIsOpen(true);
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setIsLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [query]);

  // Click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (medicine: Medicine) => {
    setIsOpen(false);
    setQuery(medicine.name);
    if (onSelectMedicine) {
      onSelectMedicine(medicine);
    } else {
      navigate(`/compare/${medicine.id}`);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setIsOpen(false);
    navigate(`/search?q=${encodeURIComponent(query.trim())}`);
  };

  const quickPicks = [
    { label: 'Paracetamol 500 mg', query: 'Paracetamol 500' },
    { label: 'Pantoprazole 40 mg', query: 'Pantoprazole 40' },
    { label: 'Metformin 500 mg SR', query: 'Metformin 500' },
    { label: 'Cetirizine 10 mg', query: 'Cetirizine' },
  ];

  return (
    <div className="relative w-full max-w-3xl mx-auto" ref={dropdownRef}>
      <form onSubmit={handleSubmit} className="relative flex items-center">
        <div className="absolute left-4 text-slate-400 dark:text-slate-500 pointer-events-none">
          <Search className={size === 'large' ? 'w-6 h-6 text-teal-600 dark:text-teal-400' : 'w-4 h-4'} />
        </div>

        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => {
            if (results.length > 0) setIsOpen(true);
          }}
          autoFocus={autoFocus}
          placeholder="Search by medicine name, salt, composition, or brand (e.g. Paracetamol, Dolo 650, Pan 40)..."
          className={`w-full rounded-2xl bg-white dark:bg-slate-900 text-slate-900 dark:text-white border-2 border-slate-200 dark:border-slate-800 focus:border-teal-500 dark:focus:border-teal-400 shadow-lg shadow-teal-900/5 dark:shadow-black/40 focus:outline-none transition-all pl-12 pr-28 sm:pr-32 ${
            size === 'large' ? 'py-4 text-base sm:text-lg font-medium' : 'py-2.5 text-sm'
          }`}
        />

        <div className="absolute right-2 flex items-center gap-1.5">
          {isLoading ? (
            <div className="px-3 py-1.5 text-slate-400">
              <Loader2 className="w-5 h-5 animate-spin" />
            </div>
          ) : (
            <button
              type="submit"
              className={`rounded-xl font-semibold text-white bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 shadow-sm transition-all flex items-center gap-1 ${
                size === 'large' ? 'px-4 py-2.5 text-sm' : 'px-3 py-1.5 text-xs'
              }`}
            >
              <span>Compare</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </form>

      {/* Quick Picks for Rapid Exploration */}
      <div className="flex flex-wrap items-center gap-1.5 mt-2.5 px-2">
        <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-amber-500" /> Popular:
        </span>
        {quickPicks.map((qp) => (
          <button
            key={qp.query}
            type="button"
            onClick={() => {
              setQuery(qp.query);
              inputRef.current?.focus();
            }}
            className="text-[11px] px-2.5 py-0.5 rounded-full bg-slate-100 hover:bg-teal-50 dark:bg-slate-800 dark:hover:bg-teal-950/60 text-slate-600 dark:text-slate-300 hover:text-teal-700 dark:hover:text-teal-300 border border-slate-200/60 dark:border-slate-700/60 transition-colors"
          >
            {qp.label}
          </button>
        ))}
      </div>

      {/* Autocomplete Dropdown */}
      {isOpen && (
        <div className="absolute left-0 right-0 mt-2 p-2 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 z-50 max-h-96 overflow-y-auto animate-fade-in">
          {results.length > 0 ? (
            <div className="divide-y divide-slate-100 dark:divide-slate-800/60">
              <div className="px-3 py-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider flex justify-between">
                <span>Exact Formulations</span>
                <span>Price Discovery</span>
              </div>
              {results.map((med) => (
                <button
                  key={med.id}
                  type="button"
                  onClick={() => handleSelect(med)}
                  className="w-full text-left p-3 hover:bg-teal-50/70 dark:hover:bg-teal-950/40 rounded-xl transition-colors flex items-center justify-between gap-3 group"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-lg bg-teal-100/70 dark:bg-teal-950 text-teal-700 dark:text-teal-300 flex items-center justify-center shrink-0 mt-0.5">
                      <Pill className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                          {med.name}
                        </span>
                        {med.prescription_required && (
                          <span className="px-1.5 py-0.5 text-[10px] font-semibold bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-300 rounded border border-rose-200 dark:border-rose-800">
                            Rx Required
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        {med.generic_name} • {med.dosage_form} • {med.pack_size}
                      </p>
                      {med.brand_name && (
                        <p className="text-[11px] text-teal-700 dark:text-teal-400 font-medium">
                          Brands: {med.brand_name}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    {med.lowest_price != null ? (
                      <div>
                        <span className="text-xs text-slate-400">from</span>
                        <p className="text-sm font-extrabold text-teal-600 dark:text-teal-400">
                          ₹{Number(med.lowest_price).toFixed(2)}
                        </p>
                        {med.highest_price && med.highest_price > med.lowest_price && (
                          <p className="text-[10px] text-slate-400">up to ₹{Number(med.highest_price).toFixed(2)}</p>
                        )}
                      </div>
                    ) : (
                      <span className="text-xs text-slate-400">Check price</span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          ) : !isLoading ? (
            <div className="p-6 text-center text-slate-500 dark:text-slate-400">
              <p className="text-sm font-medium">No matching medicines found for "{query}"</p>
              <p className="text-xs mt-1 text-slate-400">Try searching by generic salt name or popular brands like Dolo, Pan, Glycomet</p>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
};
