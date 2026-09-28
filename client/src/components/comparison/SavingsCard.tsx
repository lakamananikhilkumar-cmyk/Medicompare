import React from 'react';
import { TrendingDown, ShieldCheck, Info, Tag, ArrowRight } from 'lucide-react';

interface SavingsCardProps {
  lowestPrice: number;
  highestPrice: number;
  potentialDifference: number;
  priceDifferencePercentage: number;
  totalPharmacies: number;
  inStockCount: number;
  onExplainClick?: () => void;
}

export const SavingsCard: React.FC<SavingsCardProps> = ({
  lowestPrice,
  highestPrice,
  potentialDifference,
  priceDifferencePercentage,
  totalPharmacies,
  inStockCount,
  onExplainClick,
}) => {
  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-teal-900 via-cyan-900 to-slate-900 text-white p-6 sm:p-8 shadow-xl border border-teal-500/20">
      {/* Background Glow */}
      <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-teal-500/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 text-xs font-bold uppercase tracking-wider mb-2 border border-teal-400/30">
              <TrendingDown className="w-3.5 h-3.5" />
              <span>Price Transparency Summary</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
              Potential Savings Up To <span className="text-emerald-400">₹{potentialDifference.toFixed(2)}</span>
            </h2>
            <p className="text-xs sm:text-sm text-teal-100/80 mt-1">
              Comparing {totalPharmacies} surveyed pharmacies in your area ({inStockCount} currently in stock).
            </p>
          </div>

          {onExplainClick && (
            <button
              onClick={onExplainClick}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 transition-all shrink-0 self-start sm:self-center"
            >
              <Info className="w-3.5 h-3.5 text-cyan-300" />
              <span>AI Price Breakdown</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* 4 Stat Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6">
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
            <span className="text-xs font-semibold text-teal-200">Lowest Listed Price</span>
            <p className="text-2xl sm:text-3xl font-black text-emerald-400 mt-1">
              ₹{lowestPrice.toFixed(2)}
            </p>
            <span className="text-[10px] text-teal-200/70">Best available rate</span>
          </div>

          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
            <span className="text-xs font-semibold text-teal-200">Highest Listed Price</span>
            <p className="text-2xl sm:text-3xl font-black text-rose-300 mt-1">
              ₹{highestPrice.toFixed(2)}
            </p>
            <span className="text-[10px] text-teal-200/70">Standard retail listing</span>
          </div>

          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
            <span className="text-xs font-semibold text-teal-200">Price Variance</span>
            <p className="text-2xl sm:text-3xl font-black text-amber-300 mt-1">
              ₹{potentialDifference.toFixed(2)}
            </p>
            <span className="text-[10px] text-teal-200/70">Absolute difference</span>
          </div>

          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
            <span className="text-xs font-semibold text-teal-200">Potential Difference</span>
            <p className="text-2xl sm:text-3xl font-black text-cyan-300 mt-1">
              {priceDifferencePercentage.toFixed(0)}%
            </p>
            <span className="text-[10px] text-teal-200/70">Variance across stores</span>
          </div>
        </div>

        {/* Responsible Disclaimer */}
        <p className="text-[11px] text-teal-200/60 mt-5 pt-3 border-t border-white/5 leading-relaxed">
          * Terms note: MediCompare provides neutral price discovery. Potential savings represent mathematical differences between highest and lowest recorded prices. Availability and prices are illustrative demo records; verify with pharmacy directly.
        </p>
      </div>
    </div>
  );
};
