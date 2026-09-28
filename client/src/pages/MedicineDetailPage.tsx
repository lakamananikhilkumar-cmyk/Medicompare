import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Pill, Bot, ArrowRight, ShieldCheck, Loader2, Sparkles, AlertCircle, Bookmark } from 'lucide-react';
import { api } from '../lib/api';
import type { Medicine } from '../types';
import { MedicineAIChat } from '../components/ai/MedicineAIChat';
import { useAuth } from '../context/AuthContext';

export const MedicineDetailPage: React.FC = () => {
  const { medicineId } = useParams<{ medicineId: string }>();
  const { isAuthenticated } = useAuth();
  const [medicine, setMedicine] = useState<Medicine | null>(null);
  const [alternatives, setAlternatives] = useState<Medicine[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAiOpen, setIsAiOpen] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    if (!medicineId) return;

    let mounted = true;
    setIsLoading(true);

    api.medicines
      .getById(medicineId)
      .then((res: { medicine: Medicine; alternatives: Medicine[] }) => {
        if (mounted) {
          setMedicine(res.medicine);
          setAlternatives(res.alternatives);
        }
      })
      .catch((err: any) => console.error('Medicine detail error:', err))
      .finally(() => {
        if (mounted) setIsLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [medicineId]);

  const toggleFavorite = async () => {
    if (!isAuthenticated) {
      alert('Please sign in to save this medicine.');
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

  if (isLoading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center gap-3 text-slate-400">
        <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
        <p className="text-xs">Loading medicine profile...</p>
      </div>
    );
  }

  if (!medicine) {
    return (
      <div className="max-w-md mx-auto py-16 text-center space-y-3">
        <AlertCircle className="w-10 h-10 text-rose-500 mx-auto" />
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">Medicine Not Found</h2>
        <Link to="/search" className="text-xs text-teal-600 font-bold underline">
          Search Directory
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-8 animate-fade-in">
      {/* Medicine Header */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold uppercase bg-teal-50 text-teal-700 dark:bg-teal-950 dark:text-teal-300">
                {medicine.dosage_form}
              </span>
              <span className="px-2.5 py-0.5 rounded-md text-[11px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                {medicine.pack_size}
              </span>
              {medicine.prescription_required && (
                <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-300">
                  Prescription Required
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              {medicine.name}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              <strong>Active Generic Formulation:</strong> {medicine.generic_name} ({medicine.strength})
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setIsAiOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-teal-50 dark:bg-teal-950 text-teal-700 dark:text-teal-300 font-bold text-xs border border-teal-200 dark:border-teal-800 transition-colors"
            >
              <Bot className="w-4 h-4" />
              <span>AI Info</span>
            </button>

            <button
              onClick={toggleFavorite}
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100"
              title="Bookmark medicine"
            >
              <Bookmark className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Pricing Highlights Bar */}
        <div className="p-4 rounded-2xl bg-teal-50/70 dark:bg-teal-950/40 border border-teal-200/60 dark:border-teal-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-semibold text-teal-800 dark:text-teal-300">
              Surveyed Pharmacy Pricing
            </span>
            <p className="text-xl font-extrabold text-slate-900 dark:text-white mt-0.5">
              {medicine.lowest_price != null ? `₹${Number(medicine.lowest_price).toFixed(2)} — ₹${Number(medicine.highest_price).toFixed(2)}` : 'Pricing available upon comparison'}
            </p>
          </div>

          <Link
            to={`/compare/${medicine.id}`}
            className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-sm transition-all"
          >
            <span>Compare Pharmacy Rates</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Alternative strengths & formulations */}
      {alternatives.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            Alternative Strengths & Formulations
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {alternatives.map((alt) => (
              <Link
                key={alt.id}
                to={`/compare/${alt.id}`}
                className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-teal-500/50 p-4 transition-all block group"
              >
                <span className="text-[10px] font-bold uppercase text-teal-600 block">
                  {alt.dosage_form} • {alt.pack_size}
                </span>
                <p className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-teal-600 mt-1">
                  {alt.name}
                </p>
                <span className="text-xs text-slate-400 mt-0.5 block">{alt.strength}</span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* AI Drawer */}
      <MedicineAIChat
        isOpen={isAiOpen}
        onClose={() => setIsAiOpen(false)}
        medicineName={medicine.name}
        strength={medicine.strength}
        dosageForm={medicine.dosage_form}
      />
    </div>
  );
};
