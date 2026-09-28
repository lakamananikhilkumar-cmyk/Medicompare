import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Store,
  MapPin,
  Phone,
  Clock,
  Star,
  Truck,
  Navigation,
  Loader2,
  AlertCircle,
  Pill,
  ArrowRight,
  Bookmark,
} from 'lucide-react';
import { api } from '../lib/api';
import type { Pharmacy } from '../types';
import { useAuth } from '../context/AuthContext';

export const PharmacyDetailPage: React.FC = () => {
  const { pharmacyId } = useParams<{ pharmacyId: string }>();
  const { isAuthenticated } = useAuth();
  const [pharmacy, setPharmacy] = useState<Pharmacy | null>(null);
  const [inventory, setInventory] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    if (!pharmacyId) return;

    let mounted = true;
    setIsLoading(true);

    Promise.all([api.pharmacies.getById(pharmacyId), api.pharmacies.getInventory(pharmacyId)])
      .then(([pharmRes, invRes]: [{ pharmacy: Pharmacy }, { pharmacyId: string; count: number; inventory: any[] }]) => {
        if (mounted) {
          setPharmacy(pharmRes.pharmacy);
          setInventory(invRes.inventory);
        }
      })
      .catch((err: any) => console.error('Error fetching pharmacy profile:', err))
      .finally(() => {
        if (mounted) setIsLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [pharmacyId]);

  const toggleFavorite = async () => {
    if (!isAuthenticated) {
      alert('Please sign in to save this pharmacy.');
      return;
    }
    if (!pharmacyId) return;

    try {
      if (isSaved) {
        await api.favorites.remove(pharmacyId);
        setIsSaved(false);
      } else {
        await api.favorites.add({ pharmacyId });
        setIsSaved(true);
      }
    } catch (err) {
      console.error('Favorite error:', err);
    }
  };

  if (isLoading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center gap-3 text-slate-400">
        <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
        <p className="text-xs">Loading pharmacy profile & inventory...</p>
      </div>
    );
  }

  if (!pharmacy) {
    return (
      <div className="max-w-md mx-auto py-16 text-center space-y-3">
        <AlertCircle className="w-10 h-10 text-rose-500 mx-auto" />
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">Pharmacy Not Found</h2>
        <Link to="/pharmacies" className="text-xs text-teal-600 font-bold underline">
          Browse Directory
        </Link>
      </div>
    );
  }

  const directionsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    `${pharmacy.name} ${pharmacy.address} ${pharmacy.city}`
  )}`;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8 animate-fade-in">
      {/* Pharmacy Header Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold uppercase bg-teal-50 text-teal-700 dark:bg-teal-950 dark:text-teal-300">
                {pharmacy.city}
              </span>
              {pharmacy.rating && (
                <div className="flex items-center gap-1 text-xs font-bold text-amber-600">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span>{Number(pharmacy.rating).toFixed(1)}</span>
                </div>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              {pharmacy.name}
            </h1>

            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              {pharmacy.address} {pharmacy.pincode && `— ${pharmacy.pincode}`}
            </p>

            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-1">
              <span className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-teal-600" />
                {pharmacy.opening_time?.slice(0, 5)} - {pharmacy.closing_time?.slice(0, 5)}
              </span>
              {pharmacy.phone && (
                <span className="flex items-center gap-1.5">
                  <Phone className="w-4 h-4 text-teal-600" />
                  {pharmacy.phone}
                </span>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            {pharmacy.phone && (
              <a
                href={`tel:${pharmacy.phone}`}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 transition-colors"
              >
                <Phone className="w-4 h-4 text-teal-600" />
                <span>Call Store</span>
              </a>
            )}

            <a
              href={directionsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-xs font-semibold text-white shadow-sm transition-colors"
            >
              <Navigation className="w-4 h-4" />
              <span>Get Directions</span>
            </a>

            <button
              onClick={toggleFavorite}
              className={`p-2.5 rounded-xl border text-xs font-semibold transition-colors ${
                isSaved
                  ? 'bg-teal-50 border-teal-300 text-teal-700 dark:bg-teal-950 dark:border-teal-700 dark:text-teal-300'
                  : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200'
              }`}
            >
              <Bookmark className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Stocked Medicines Table */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            Available Medicines ({inventory.length})
          </h2>
          <span className="text-xs text-slate-400">Listed Store Rates</span>
        </div>

        {inventory.length === 0 ? (
          <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs text-slate-500">
            No medicine inventory records listed for this pharmacy.
          </div>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="py-3.5 px-4">Medicine / Formulation</th>
                  <th className="py-3.5 px-4">Availability</th>
                  <th className="py-3.5 px-4">Price</th>
                  <th className="py-3.5 px-4">MRP</th>
                  <th className="py-3.5 px-4 text-right">Compare</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {inventory.map((item) => (
                  <tr key={item.inventory_id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30">
                    <td className="py-3.5 px-4">
                      <Link to={`/compare/${item.medicine_id}`} className="font-bold text-slate-900 dark:text-white hover:text-teal-600">
                        {item.medicine_name}
                      </Link>
                      <p className="text-[11px] text-slate-400">{item.dosage_form} • {item.pack_size}</p>
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-block px-2 py-0.5 rounded font-semibold text-[10px] ${
                          item.availability === 'in_stock'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            : item.availability === 'limited_stock'
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                            : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                        }`}
                      >
                        {item.availability.replace('_', ' ')} ({item.stock_quantity})
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-black text-slate-900 dark:text-white">
                      ₹{parseFloat(item.price).toFixed(2)}
                    </td>
                    <td className="py-3.5 px-4 text-slate-400">
                      {item.mrp ? `₹${parseFloat(item.mrp).toFixed(2)}` : '—'}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Link
                        to={`/compare/${item.medicine_id}`}
                        className="inline-flex items-center gap-1 text-teal-600 dark:text-teal-400 font-bold hover:underline"
                      >
                        <span>Compare</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
