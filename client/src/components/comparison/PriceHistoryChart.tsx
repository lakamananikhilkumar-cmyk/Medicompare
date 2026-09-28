import React, { useState, useEffect } from 'react';
import { LineChart, Calendar, AlertCircle, Loader2 } from 'lucide-react';
import { api } from '../../lib/api';
import type { PriceHistoryRecord } from '../../types';

interface PriceHistoryChartProps {
  medicineId: string;
  medicineName: string;
}

export const PriceHistoryChart: React.FC<PriceHistoryChartProps> = ({ medicineId, medicineName }) => {
  const [days, setDays] = useState<7 | 30 | 90>(30);
  const [history, setHistory] = useState<PriceHistoryRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    setIsLoading(true);

    api.priceHistory
      .get(medicineId, days)
      .then((res) => {
        if (mounted) {
          setHistory(res.history);
        }
      })
      .catch((err) => console.error('Failed to load price history:', err))
      .finally(() => {
        if (mounted) setIsLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [medicineId, days]);

  // Group by pharmacy
  const pharmacyMap: Record<string, PriceHistoryRecord[]> = {};
  history.forEach((rec) => {
    if (!pharmacyMap[rec.pharmacyName]) {
      pharmacyMap[rec.pharmacyName] = [];
    }
    pharmacyMap[rec.pharmacyName].push(rec);
  });

  const pharmacyNames = Object.keys(pharmacyMap);
  const allPrices = history.map((h) => h.price);
  const minPrice = allPrices.length > 0 ? Math.floor(Math.min(...allPrices) * 0.9) : 0;
  const maxPrice = allPrices.length > 0 ? Math.ceil(Math.max(...allPrices) * 1.1) : 50;

  const colorPalette = ['#0d9488', '#0284c7', '#8b5cf6', '#f59e0b', '#ec4899'];

  return (
    <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="p-2.5 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400">
            <LineChart className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Price Trend Analysis</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Recorded price movement across surveyed pharmacies</p>
          </div>
        </div>

        {/* Days Filter */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs self-start sm:self-center">
          <Calendar className="w-3.5 h-3.5 text-slate-400 ml-1.5" />
          {[7, 30, 90].map((d) => (
            <button
              key={d}
              onClick={() => setDays(d as any)}
              className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                days === d
                  ? 'bg-white dark:bg-slate-900 text-teal-700 dark:text-teal-300 shadow-sm'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {d} Days
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="h-48 flex items-center justify-center text-slate-400">
          <Loader2 className="w-6 h-6 animate-spin mr-2" />
          <span className="text-xs">Loading price points...</span>
        </div>
      ) : pharmacyNames.length === 0 ? (
        <div className="h-48 flex items-center justify-center text-slate-400 text-xs">
          No historical price points recorded for this medicine in the last {days} days.
        </div>
      ) : (
        <div className="space-y-4">
          {/* Pharmacy legend */}
          <div className="flex flex-wrap gap-3">
            {pharmacyNames.map((name, i) => (
              <div key={name} className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: colorPalette[i % colorPalette.length] }} />
                <span>{name}</span>
              </div>
            ))}
          </div>

          {/* SVG Price Graph */}
          <div className="relative w-full h-56 pt-2">
            <svg viewBox="0 0 500 180" className="w-full h-full overflow-visible">
              {/* Grid Lines */}
              {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
                const y = 160 - ratio * 140;
                const priceVal = minPrice + ratio * (maxPrice - minPrice);
                return (
                  <g key={ratio}>
                    <line x1="40" y1={y} x2="490" y2={y} stroke="currentColor" className="text-slate-100 dark:text-slate-800" strokeDasharray="3 3" />
                    <text x="5" y={y + 4} className="text-[10px] fill-slate-400">
                      ₹{priceVal.toFixed(0)}
                    </text>
                  </g>
                );
              })}

              {/* Pharmacy Price Lines */}
              {pharmacyNames.map((pName, pIndex) => {
                const pts = pharmacyMap[pName].sort(
                  (a, b) => new Date(a.recordedAt).getTime() - new Date(b.recordedAt).getTime()
                );
                if (pts.length === 0) return null;

                const color = colorPalette[pIndex % colorPalette.length];
                const nowMs = Date.now();
                const startMs = nowMs - days * 24 * 60 * 60 * 1000;

                const coordinates = pts.map((pt) => {
                  const t = new Date(pt.recordedAt).getTime();
                  const xPct = Math.max(0, Math.min(1, (t - startMs) / (nowMs - startMs)));
                  const x = 50 + xPct * 430;
                  const yPct = maxPrice === minPrice ? 0.5 : (pt.price - minPrice) / (maxPrice - minPrice);
                  const y = 160 - yPct * 140;
                  return { x, y, price: pt.price };
                });

                const pathData = coordinates.reduce((acc, curr, idx) => {
                  return idx === 0 ? `M ${curr.x} ${curr.y}` : `${acc} L ${curr.x} ${curr.y}`;
                }, '');

                return (
                  <g key={pName}>
                    <path d={pathData} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                    {coordinates.map((c, i) => (
                      <circle key={i} cx={c.x} cy={c.y} r="3.5" fill={color} className="transition-transform hover:scale-150" />
                    ))}
                  </g>
                );
              })}
            </svg>
          </div>
        </div>
      )}

      {/* Mandatory Demo Data Notice Banner */}
      <div className="p-3 bg-amber-500/10 rounded-xl border border-amber-500/20 text-amber-900 dark:text-amber-200 flex items-start gap-2 text-[11px] leading-relaxed">
        <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
        <p>
          <strong>Simulated Demo History:</strong> The historical data points displayed are simulated and illustrative for demonstration purposes. They must not be interpreted as verified archival transactions.
        </p>
      </div>
    </div>
  );
};
