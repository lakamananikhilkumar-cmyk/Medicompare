import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingDown, Search, Loader2, Sparkles, Layers, ShieldCheck } from 'lucide-react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { api } from '../../lib/api';

export const AdminAnalyticsPage: React.FC = () => {
  const [analytics, setAnalytics] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    api.admin
      .getAnalytics()
      .then((res) => setAnalytics(res))
      .catch((err) => console.error('Analytics error:', err))
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="py-24 flex items-center justify-center text-slate-400">
          <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
        </div>
      </AdminLayout>
    );
  }

  const { totals = {}, topSearches = [], priceVariances = [] } = analytics || {};
  const maxSearchCount = topSearches.length > 0 ? Math.max(...topSearches.map((s: any) => s.search_count)) : 1;

  return (
    <AdminLayout>
      <div className="space-y-8 animate-fade-in text-xs">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Platform Health & Market Analytics</h2>
          <p className="text-slate-500">
            Insights on medicine search trends, pharmacy coverage, and consumer price variation across retail channels.
          </p>
        </div>

        {/* Aggregate Metrics Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <span className="text-slate-400 block mb-1">Catalog Size</span>
            <p className="text-xl font-black text-slate-900 dark:text-white">{totals.medicines ?? 0}</p>
          </div>
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <span className="text-slate-400 block mb-1">Pharmacies</span>
            <p className="text-xl font-black text-teal-600">{totals.pharmacies ?? 0}</p>
          </div>
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <span className="text-slate-400 block mb-1">Stocked Pairs</span>
            <p className="text-xl font-black text-cyan-600">{totals.inventoryRecords ?? 0}</p>
          </div>
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <span className="text-slate-400 block mb-1">Total Users</span>
            <p className="text-xl font-black text-emerald-600">{totals.users ?? 0}</p>
          </div>
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <span className="text-slate-400 block mb-1">Searches Run</span>
            <p className="text-xl font-black text-indigo-600">{totals.searches ?? 0}</p>
          </div>
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <span className="text-slate-400 block mb-1">Saved Bookmarks</span>
            <p className="text-xl font-black text-rose-600">{totals.favorites ?? 0}</p>
          </div>
        </div>

        {/* Visual Search Frequency Bar Chart */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <Search className="w-4 h-4 text-teal-600" />
              <span>Top Medicine Search Term Distribution</span>
            </h3>
            <span className="text-[10px] text-slate-400">Relative search volume</span>
          </div>

          <div className="space-y-3 pt-2">
            {topSearches.map((s: any, idx: number) => {
              const widthPct = Math.max(10, Math.round((s.search_count / maxSearchCount) * 100));
              return (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between font-semibold text-slate-700 dark:text-slate-300">
                    <span>"{s.query}"</span>
                    <span>{s.search_count} inquiries</span>
                  </div>
                  <div className="w-full h-3 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-teal-500 to-cyan-500 rounded-full transition-all duration-500"
                      style={{ width: `${widthPct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Deep Price Variance Table */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <TrendingDown className="w-4 h-4 text-emerald-600" />
              <span>Formulations with Highest Consumer Price Variance</span>
            </h3>
            <span className="text-[10px] text-slate-400">Potential consumer savings hotspots</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 font-semibold border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="py-2.5 px-3">Medicine</th>
                  <th className="py-2.5 px-3">Dosage & Strength</th>
                  <th className="py-2.5 px-3">Stores</th>
                  <th className="py-2.5 px-3">Lowest Rate</th>
                  <th className="py-2.5 px-3">Highest Rate</th>
                  <th className="py-2.5 px-3 text-right">Potential Variance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {priceVariances.map((item: any, i: number) => {
                  const min = parseFloat(item.min_price);
                  const max = parseFloat(item.max_price);
                  const diff = parseFloat(item.difference);
                  const pct = max > 0 ? ((diff / max) * 100).toFixed(0) : 0;
                  return (
                    <tr key={i} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                      <td className="py-2.5 px-3 font-bold text-slate-900 dark:text-white">{item.name}</td>
                      <td className="py-2.5 px-3 text-slate-500">{item.strength} • {item.dosage_form}</td>
                      <td className="py-2.5 px-3 font-semibold">{item.stocking_pharmacies} stores</td>
                      <td className="py-2.5 px-3 font-black text-emerald-600">₹{min.toFixed(2)}</td>
                      <td className="py-2.5 px-3 text-slate-500">₹{max.toFixed(2)}</td>
                      <td className="py-2.5 px-3 text-right font-black text-emerald-600">
                        ₹{diff.toFixed(2)} ({pct}%)
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};
