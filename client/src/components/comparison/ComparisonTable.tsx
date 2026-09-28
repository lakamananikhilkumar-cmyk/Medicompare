import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Phone,
  Navigation,
  Bookmark,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Truck,
  Store,
  Clock,
  Star,
  Sparkles,
  ExternalLink,
  ChevronRight,
  TrendingDown,
} from 'lucide-react';
import type { PharmacyComparisonItem } from '../../types';
import { api } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';

interface ComparisonTableProps {
  pharmacies: PharmacyComparisonItem[];
  lowestPrice: number;
  highestPrice: number;
}

export const ComparisonTable: React.FC<ComparisonTableProps> = ({ pharmacies, lowestPrice, highestPrice }) => {
  const { isAuthenticated } = useAuth();
  const [savedPharmacies, setSavedPharmacies] = useState<Record<string, boolean>>({});
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');

  const toggleSave = async (pharmacyId: string) => {
    if (!isAuthenticated) {
      alert('Please sign in to save pharmacies to your favorites.');
      return;
    }

    try {
      if (savedPharmacies[pharmacyId]) {
        await api.favorites.remove(pharmacyId);
        setSavedPharmacies((prev) => ({ ...prev, [pharmacyId]: false }));
      } else {
        await api.favorites.add({ pharmacyId });
        setSavedPharmacies((prev) => ({ ...prev, [pharmacyId]: true }));
      }
    } catch (err) {
      console.error('Error toggling favorite:', err);
    }
  };

  if (pharmacies.length === 0) {
    return (
      <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
          <Store className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-bold text-slate-900 dark:text-white">No Pharmacies Match Filters</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
          Try expanding your search radius, adjusting price limits, or toggling off delivery/stock filters.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Controls header */}
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
          Showing <span className="font-bold text-slate-900 dark:text-white">{pharmacies.length}</span> verified pharmacies
        </p>

        {/* View Toggle */}
        <div className="flex items-center p-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs">
          <button
            onClick={() => setViewMode('cards')}
            className={`px-3 py-1 rounded-lg font-medium transition-colors ${
              viewMode === 'cards'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm font-semibold'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Cards
          </button>
          <button
            onClick={() => setViewMode('table')}
            className={`px-3 py-1 rounded-lg font-medium transition-colors ${
              viewMode === 'table'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm font-semibold'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Table
          </button>
        </div>
      </div>

      {viewMode === 'cards' ? (
        /* Cards View */
        <div className="space-y-3">
          {pharmacies.map((p) => {
            const isLowest = p.price === lowestPrice;
            const directionsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
              `${p.pharmacyName} ${p.address} ${p.city}`
            )}`;

            return (
              <div
                key={p.inventoryId}
                className={`relative rounded-2xl bg-white dark:bg-slate-900 p-5 border transition-all duration-200 hover:shadow-md ${
                  isLowest
                    ? 'border-emerald-500/60 dark:border-emerald-500/40 ring-1 ring-emerald-500/20 shadow-emerald-500/5'
                    : 'border-slate-200 dark:border-slate-800'
                }`}
              >
                {/* Lowest Price Tag */}
                {isLowest && (
                  <div className="absolute -top-3 left-6 inline-flex items-center gap-1 px-3 py-0.5 rounded-full bg-emerald-600 text-white text-[11px] font-bold shadow-sm uppercase tracking-wide">
                    <Sparkles className="w-3 h-3" />
                    <span>Lowest Price Option</span>
                  </div>
                )}

                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
                  {/* Pharmacy Identity */}
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Link
                        to={`/pharmacy/${p.pharmacyId}`}
                        className="font-bold text-base text-slate-900 dark:text-white hover:text-teal-600 dark:hover:text-teal-400 transition-colors flex items-center gap-1.5"
                      >
                        <span>{p.pharmacyName}</span>
                        <ChevronRight className="w-4 h-4 text-slate-400" />
                      </Link>

                      {p.rating && (
                        <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 text-xs font-bold">
                          <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                          <span>{p.rating.toFixed(1)}</span>
                        </div>
                      )}

                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold ${
                          p.isOpen
                            ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        <Clock className="w-3 h-3" />
                        {p.isOpen ? 'Open Now' : 'Closed'}
                      </span>
                    </div>

                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                      {p.address}, {p.city} {p.pincode && `— ${p.pincode}`}
                    </p>

                    {/* Features Row */}
                    <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] text-slate-500 dark:text-slate-400">
                      {p.distance != null && (
                        <span className="font-semibold text-teal-700 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/50 px-2 py-0.5 rounded-md">
                          {p.distance} km away
                        </span>
                      )}

                      {/* Stock Status */}
                      {p.availability === 'in_stock' && (
                        <span className="inline-flex items-center gap-1 text-emerald-700 dark:text-emerald-400 font-medium">
                          <CheckCircle2 className="w-3.5 h-3.5" /> In Stock ({p.stockQuantity} available)
                        </span>
                      )}
                      {p.availability === 'limited_stock' && (
                        <span className="inline-flex items-center gap-1 text-amber-700 dark:text-amber-400 font-medium">
                          <AlertTriangle className="w-3.5 h-3.5" /> Limited Stock ({p.stockQuantity} left)
                        </span>
                      )}
                      {p.availability === 'out_of_stock' && (
                        <span className="inline-flex items-center gap-1 text-rose-600 dark:text-rose-400 font-medium">
                          <XCircle className="w-3.5 h-3.5" /> Currently Out of Stock
                        </span>
                      )}

                      {/* Fulfillment */}
                      {p.deliveryAvailable && (
                        <span className="inline-flex items-center gap-1 text-slate-600 dark:text-slate-300">
                          <Truck className="w-3.5 h-3.5 text-cyan-600" /> Delivery
                        </span>
                      )}
                      {p.pickupAvailable && (
                        <span className="inline-flex items-center gap-1 text-slate-600 dark:text-slate-300">
                          <Store className="w-3.5 h-3.5 text-teal-600" /> In-Store Pickup
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Pricing and Action Column */}
                  <div className="flex flex-row lg:flex-col items-center lg:items-end justify-between gap-4 pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-100 dark:border-slate-800">
                    <div className="text-left lg:text-right">
                      <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-black text-slate-900 dark:text-white">
                          ₹{p.price.toFixed(2)}
                        </span>
                        {p.mrp && p.mrp > p.price && (
                          <span className="text-xs text-slate-400 line-through">
                            MRP ₹{p.mrp.toFixed(2)}
                          </span>
                        )}
                      </div>

                      {p.potentialSavingsFromHighest > 0 ? (
                        <div className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
                          <TrendingDown className="w-3 h-3" />
                          <span>Save ₹{p.potentialSavingsFromHighest.toFixed(2)} ({p.savingsPercentFromHighest}%)</span>
                        </div>
                      ) : (
                        <span className="text-[10px] text-slate-400">Highest recorded price</span>
                      )}
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => toggleSave(p.pharmacyId)}
                        className={`p-2 rounded-xl border transition-colors ${
                          savedPharmacies[p.pharmacyId]
                            ? 'bg-teal-50 border-teal-300 text-teal-600 dark:bg-teal-950 dark:border-teal-700 dark:text-teal-300'
                            : 'bg-slate-50 border-slate-200 dark:bg-slate-800 dark:border-slate-700 text-slate-500 hover:text-slate-900 dark:hover:text-white'
                        }`}
                        title="Save to favorites"
                      >
                        <Bookmark className="w-4 h-4" />
                      </button>

                      {p.phone && (
                        <a
                          href={`tel:${p.phone}`}
                          className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors"
                          title="Call pharmacy directly"
                        >
                          <Phone className="w-3.5 h-3.5 text-teal-600" />
                          <span className="hidden sm:inline">Call</span>
                        </a>
                      )}

                      <a
                        href={directionsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl text-white bg-teal-600 hover:bg-teal-700 shadow-sm transition-all"
                      >
                        <Navigation className="w-3.5 h-3.5" />
                        <span>Directions</span>
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Detailed Table View */
        <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="py-3.5 px-4">Pharmacy</th>
                <th className="py-3.5 px-4">Distance</th>
                <th className="py-3.5 px-4">Listed Price</th>
                <th className="py-3.5 px-4">Availability</th>
                <th className="py-3.5 px-4">Fulfillment</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {pharmacies.map((p) => {
                const isLowest = p.price === lowestPrice;
                return (
                  <tr
                    key={p.inventoryId}
                    className={`hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors ${
                      isLowest ? 'bg-emerald-50/30 dark:bg-emerald-950/20' : ''
                    }`}
                  >
                    <td className="py-3.5 px-4">
                      <Link to={`/pharmacy/${p.pharmacyId}`} className="font-bold text-slate-900 dark:text-white hover:text-teal-600">
                        {p.pharmacyName}
                      </Link>
                      <p className="text-[11px] text-slate-400 truncate max-w-xs">{p.address}</p>
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-600 dark:text-slate-300">
                      {p.distance != null ? `${p.distance} km` : '—'}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-extrabold text-slate-900 dark:text-white">
                        ₹{p.price.toFixed(2)}
                      </div>
                      {p.potentialSavingsFromHighest > 0 && (
                        <span className="text-[10px] font-bold text-emerald-600">
                          -₹{p.potentialSavingsFromHighest.toFixed(2)}
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-block px-2 py-0.5 rounded font-semibold text-[10px] ${
                          p.availability === 'in_stock'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            : p.availability === 'limited_stock'
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                            : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                        }`}
                      >
                        {p.availability.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 space-x-1">
                      {p.deliveryAvailable && <span className="text-cyan-600 font-medium">Delivery</span>}
                      {p.deliveryAvailable && p.pickupAvailable && <span>•</span>}
                      {p.pickupAvailable && <span className="text-teal-600 font-medium">Pickup</span>}
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-2">
                      {p.phone && (
                        <a href={`tel:${p.phone}`} className="text-teal-600 font-semibold hover:underline">
                          Call
                        </a>
                      )}
                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                          `${p.pharmacyName} ${p.address}`
                        )}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-cyan-600 font-semibold hover:underline"
                      >
                        Map
                      </a>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
