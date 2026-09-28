import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Store,
  MapPin,
  Phone,
  Clock,
  Star,
  Truck,
  Search,
  Loader2,
  Navigation,
  ArrowRight,
  Filter,
} from 'lucide-react';
import { api } from '../lib/api';
import type { Pharmacy } from '../types';
import { useLocation } from '../context/LocationContext';

export const PharmaciesPage: React.FC = () => {
  const { city } = useLocation();
  const [pharmacies, setPharmacies] = useState<Pharmacy[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [cityFilter, setCityFilter] = useState('');
  const [deliveryOnly, setDeliveryOnly] = useState(false);

  useEffect(() => {
    let mounted = true;
    setIsLoading(true);

    api.pharmacies
      .list({
        search: search.trim() || undefined,
        city: cityFilter || undefined,
        delivery: deliveryOnly || undefined,
        limit: 50,
      })
      .then((res: { pharmacies: Pharmacy[]; total: number }) => {
        if (mounted) setPharmacies(res.pharmacies);
      })
      .catch((err: any) => console.error('Error fetching pharmacies:', err))
      .finally(() => {
        if (mounted) setIsLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [search, cityFilter, deliveryOnly]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
          Pharmacy Directory
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Explore retail pharmacy chains, independent neighborhood chemists, and Jan Aushadhi generic centers.
        </p>
      </div>

      {/* Search and Filters Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by pharmacy name or locality..."
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <select
            value={cityFilter}
            onChange={(e) => setCityFilter(e.target.value)}
            className="px-3 py-2 text-xs font-medium rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300"
          >
            <option value="">All Cities</option>
            <option value="bengaluru">Bengaluru</option>
            <option value="new delhi">New Delhi</option>
            <option value="mumbai">Mumbai</option>
          </select>

          <button
            onClick={() => setDeliveryOnly(!deliveryOnly)}
            className={`px-3 py-2 text-xs font-semibold rounded-xl border transition-colors ${
              deliveryOnly
                ? 'bg-teal-600 text-white border-teal-600'
                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
            }`}
          >
            Delivery Available
          </button>
        </div>
      </div>

      {/* Directory Grid */}
      {isLoading ? (
        <div className="py-24 flex flex-col items-center justify-center gap-3 text-slate-400">
          <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
          <p className="text-xs">Loading local pharmacies...</p>
        </div>
      ) : pharmacies.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
          <Store className="w-10 h-10 text-slate-400 mx-auto mb-2" />
          <h3 className="font-bold text-sm text-slate-900 dark:text-white">No Pharmacies Found</h3>
          <p className="text-xs text-slate-500 mt-1">Try changing your search terms or city filter.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {pharmacies.map((pharmacy) => {
            const directionsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
              `${pharmacy.name} ${pharmacy.address} ${pharmacy.city}`
            )}`;

            return (
              <div
                key={pharmacy.id}
                className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-teal-500/40 transition-all flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-teal-50 dark:bg-teal-950 text-teal-700 dark:text-teal-300">
                      {pharmacy.city}
                    </span>
                    {pharmacy.rating && (
                      <div className="flex items-center gap-1 text-xs font-bold text-amber-600 dark:text-amber-400">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        <span>{Number(pharmacy.rating).toFixed(1)}</span>
                      </div>
                    )}
                  </div>

                  <Link
                    to={`/pharmacy/${pharmacy.id}`}
                    className="font-bold text-base text-slate-900 dark:text-white hover:text-teal-600 transition-colors block"
                  >
                    {pharmacy.name}
                  </Link>

                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                    {pharmacy.address} {pharmacy.pincode && `— ${pharmacy.pincode}`}
                  </p>

                  <div className="flex items-center gap-3 text-[11px] text-slate-500 pt-1">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-teal-600" />
                      {pharmacy.opening_time?.slice(0, 5)} - {pharmacy.closing_time?.slice(0, 5)}
                    </span>
                    {pharmacy.active_medicines_count != null && (
                      <span>• {pharmacy.active_medicines_count} medicines</span>
                    )}
                  </div>
                </div>

                <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {pharmacy.phone && (
                      <a
                        href={`tel:${pharmacy.phone}`}
                        className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 hover:text-teal-600 transition-colors"
                        title="Call pharmacy"
                      >
                        <Phone className="w-3.5 h-3.5" />
                      </a>
                    )}
                    <a
                      href={directionsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 hover:text-teal-600 transition-colors"
                      title="Get directions"
                    >
                      <Navigation className="w-3.5 h-3.5" />
                    </a>
                  </div>

                  <Link
                    to={`/pharmacy/${pharmacy.id}`}
                    className="inline-flex items-center gap-1 text-xs font-bold text-teal-600 dark:text-teal-400 hover:underline"
                  >
                    <span>View Store</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
