import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Pill,
  MapPin,
  Filter,
  ArrowUpDown,
  Sparkles,
  Bot,
  Bookmark,
  Share2,
  AlertCircle,
  Loader2,
  Store,
  ChevronRight,
  ShieldAlert,
  Info,
} from 'lucide-react';
import { api } from '../lib/api';
import type { ComparisonResponse, AICompareExplanation, PharmacyComparisonItem } from '../types';
import { SavingsCard } from '../components/comparison/SavingsCard';
import { ComparisonTable } from '../components/comparison/ComparisonTable';
import { PriceHistoryChart } from '../components/comparison/PriceHistoryChart';
import { MedicineAIChat } from '../components/ai/MedicineAIChat';
import { useLocation } from '../context/LocationContext';
import { useAuth } from '../context/AuthContext';

export const ComparePage: React.FC = () => {
  const { medicineId } = useParams<{ medicineId: string }>();
  const { latitude, longitude, pincode, city } = useLocation();
  const { isAuthenticated } = useAuth();

  const [data, setData] = useState<ComparisonResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter & Sort State
  const [sort, setSort] = useState<string>('price_asc');
  const [openNow, setOpenNow] = useState<boolean>(false);
  const [delivery, setDelivery] = useState<boolean>(false);
  const [availability, setAvailability] = useState<string>('all');
  const [radius, setRadius] = useState<number>(25);

  // Modal / Drawer state
  const [isAiOpen, setIsAiOpen] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [aiExplanation, setAiExplanation] = useState<AICompareExplanation | null>(null);
  const [isExplaining, setIsExplaining] = useState(false);

  useEffect(() => {
    if (!medicineId) return;

    let mounted = true;
    setIsLoading(true);
    setError(null);

    const params: Record<string, any> = {
      sort,
      radius,
      ...(latitude && longitude ? { lat: latitude, lng: longitude } : {}),
      ...(pincode ? { pincode } : {}),
      ...(openNow ? { openNow: 'true' } : {}),
      ...(delivery ? { delivery: 'true' } : {}),
      ...(availability !== 'all' ? { availability } : {}),
    };

    api.compare
      .getComparison(medicineId, params)
      .then((res: ComparisonResponse) => {
        if (mounted) {
          setData(res);
        }
      })
      .catch((err: any) => {
        if (mounted) {
          setError(err.message || 'Failed to load medicine comparison data.');
        }
      })
      .finally(() => {
        if (mounted) setIsLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [medicineId, sort, openNow, delivery, availability, radius, latitude, longitude, pincode]);

  const handleToggleFavorite = async () => {
    if (!isAuthenticated) {
      alert('Please sign in to save this medicine to your favorites.');
      return;
    }
    if (!medicineId) return;

    try {
      if (isSaved) {
        await api.favorites.remove(medicineId);
        setIsSaved(false);
      } else {
        await api.favorites.add({ medicineId });
        setIsSaved(true);
      }
    } catch (err) {
      console.error('Favorite error:', err);
    }
  };

  const handleExplainVariance = async () => {
    if (!data || data.pharmacies.length < 2) return;
    setIsExplaining(true);
    try {
      const res = await api.ai.getCompareExplanation({
        medicine: data.medicine.name,
        prices: data.pharmacies.map((p: PharmacyComparisonItem) => ({
          pharmacy: p.pharmacyName,
          price: p.price,
        })),
      });
      setAiExplanation(res);
    } catch (err: any) {
      console.error('Variance explanation error:', err);
    } finally {
      setIsExplaining(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 flex flex-col items-center justify-center gap-4 text-slate-500">
        <Loader2 className="w-10 h-10 animate-spin text-teal-600" />
        <p className="text-sm font-semibold">Comparing prices across pharmacies in {city}...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-16 h-16 mx-auto rounded-full bg-rose-50 text-rose-600 flex items-center justify-center">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Medicine Not Found</h2>
        <p className="text-sm text-slate-500">{error || 'Unable to retrieve comparison records.'}</p>
        <Link
          to="/search"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-teal-600 text-white font-semibold text-sm hover:bg-teal-700 transition-colors"
        >
          Return to Search
        </Link>
      </div>
    );
  }

  const { medicine, comparison, pharmacies } = data;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
        <Link to="/" className="hover:text-teal-600">Home</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <Link to="/search" className="hover:text-teal-600">Medicines</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="font-semibold text-slate-900 dark:text-white truncate">{medicine.name}</span>
      </div>

      {/* Exact Medicine Identity Header */}
      <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-1 text-xs font-bold uppercase rounded-lg bg-teal-50 dark:bg-teal-950 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
                Exact Identity Match
              </span>
              <span className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                {medicine.dosageForm} • {medicine.packSize}
              </span>
              {medicine.prescriptionRequired && (
                <span className="px-2.5 py-1 text-xs font-bold rounded-lg bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
                  Prescription Required (Schedule H)
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
              {medicine.name}
            </h1>

            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">
              <strong>Active Salt:</strong> {medicine.genericName || medicine.composition}
              {medicine.brandName && (
                <span className="ml-2 text-teal-700 dark:text-teal-400 font-medium">
                  (Popular Brands: {medicine.brandName})
                </span>
              )}
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              onClick={() => setIsAiOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white font-bold text-xs shadow-md shadow-cyan-500/10 transition-all"
            >
              <Bot className="w-4 h-4" />
              <span>Ask AI Assistant</span>
            </button>

            <button
              onClick={handleToggleFavorite}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl border text-xs font-semibold transition-colors ${
                isSaved
                  ? 'bg-teal-50 border-teal-300 text-teal-700 dark:bg-teal-950 dark:border-teal-700 dark:text-teal-300'
                  : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50'
              }`}
            >
              <Bookmark className="w-4 h-4" />
              <span>{isSaved ? 'Saved' : 'Save'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Savings Summary Banner */}
      <SavingsCard
        lowestPrice={comparison.lowestPrice}
        highestPrice={comparison.highestPrice}
        potentialDifference={comparison.potentialDifference}
        priceDifferencePercentage={comparison.priceDifferencePercentage}
        totalPharmacies={comparison.totalPharmacies}
        inStockCount={comparison.inStockCount}
        onExplainClick={handleExplainVariance}
      />

      {/* AI Price Variance Breakdown Popup if requested */}
      {aiExplanation && (
        <div className="p-5 rounded-2xl bg-teal-50/90 dark:bg-teal-950/50 border border-teal-200 dark:border-teal-800 space-y-2 animate-fade-in text-xs">
          <div className="flex items-center justify-between font-bold text-teal-900 dark:text-teal-200">
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-teal-600" />
              <span>AI Neutral Price Variance Analysis</span>
            </span>
            <button onClick={() => setAiExplanation(null)} className="text-slate-400 hover:text-slate-600">
              Dismiss
            </button>
          </div>
          <p className="text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
            {aiExplanation.explanation}
          </p>
        </div>
      )}

      {/* Filter & Sort Toolbar */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 text-xs">
        {/* Sort Options */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-bold text-slate-500 flex items-center gap-1">
            <ArrowUpDown className="w-3.5 h-3.5" /> Sort:
          </span>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold focus:outline-none focus:ring-2 focus:ring-teal-500"
          >
            <option value="price_asc">Lowest Price (Default)</option>
            <option value="savings_desc">Highest Potential Savings</option>
            <option value="distance_asc">Nearest Pharmacy</option>
            <option value="availability_desc">Highest Availability</option>
            <option value="rating_desc">Highest Rated Store</option>
          </select>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setOpenNow(!openNow)}
            className={`px-3 py-1.5 rounded-xl font-semibold border transition-colors ${
              openNow
                ? 'bg-teal-600 text-white border-teal-600'
                : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
            }`}
          >
            Open Now Only
          </button>

          <button
            onClick={() => setDelivery(!delivery)}
            className={`px-3 py-1.5 rounded-xl font-semibold border transition-colors ${
              delivery
                ? 'bg-teal-600 text-white border-teal-600'
                : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
            }`}
          >
            Home Delivery
          </button>

          <select
            value={availability}
            onChange={(e) => setAvailability(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold focus:outline-none focus:ring-2 focus:ring-teal-500"
          >
            <option value="all">All Availability</option>
            <option value="in_stock">In Stock Only</option>
            <option value="limited_stock">Limited Stock</option>
          </select>
        </div>
      </div>

      {/* Main Pharmacy Comparison List */}
      <ComparisonTable
        pharmacies={pharmacies}
        lowestPrice={comparison.lowestPrice}
        highestPrice={comparison.highestPrice}
      />

      {/* Price History Section */}
      <PriceHistoryChart medicineId={medicine.id} medicineName={medicine.name} />

      {/* AI Assistant Drawer */}
      <MedicineAIChat
        isOpen={isAiOpen}
        onClose={() => setIsAiOpen(false)}
        medicineName={medicine.name}
        strength={medicine.strength}
        dosageForm={medicine.dosageForm}
      />
    </div>
  );
};
