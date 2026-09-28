import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Pill,
  Store,
  Layers,
  Users,
  Search,
  Bookmark,
  TrendingDown,
  ArrowRight,
  Plus,
  Loader2,
} from 'lucide-react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { api } from '../../lib/api';

export const AdminDashboardPage: React.FC = () => {
  const [analytics, setAnalytics] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    api.admin
      .getAnalytics()
      .then((res) => setAnalytics(res))
      .catch((err) => console.error('Analytics load error:', err))
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

  const totals = analytics?.totals || {};
  const topSearches = analytics?.topSearches || [];
  const priceVariances = analytics?.priceVariances || [];

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-semibold">Medicines</span>
              <Pill className="w-4 h-4 text-teal-600" />
            </div>
            <p className="text-2xl font-black text-slate-900 dark:text-white">{totals.medicines ?? 0}</p>
            <span className="text-[10px] text-teal-600 font-bold">Catalog count</span>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-semibold">Pharmacies</span>
              <Store className="w-4 h-4 text-cyan-600" />
            </div>
            <p className="text-2xl font-black text-slate-900 dark:text-white">{totals.pharmacies ?? 0}</p>
            <span className="text-[10px] text-cyan-600 font-bold">Mapped stores</span>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-semibold">Inventory</span>
              <Layers className="w-4 h-4 text-amber-600" />
            </div>
            <p className="text-2xl font-black text-slate-900 dark:text-white">{totals.inventoryRecords ?? 0}</p>
            <span className="text-[10px] text-amber-600 font-bold">Price records</span>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-semibold">Users</span>
              <Users className="w-4 h-4 text-emerald-600" />
            </div>
            <p className="text-2xl font-black text-slate-900 dark:text-white">{totals.users ?? 0}</p>
            <span className="text-[10px] text-emerald-600 font-bold">Profiles</span>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-semibold">Searches</span>
              <Search className="w-4 h-4 text-indigo-600" />
            </div>
            <p className="text-2xl font-black text-slate-900 dark:text-white">{totals.searches ?? 0}</p>
            <span className="text-[10px] text-indigo-600 font-bold">Query volume</span>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-semibold">Bookmarks</span>
              <Bookmark className="w-4 h-4 text-rose-600" />
            </div>
            <p className="text-2xl font-black text-slate-900 dark:text-white">{totals.favorites ?? 0}</p>
            <span className="text-[10px] text-rose-600 font-bold">Favorites pinned</span>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="p-5 rounded-2xl bg-gradient-to-r from-amber-500/10 via-teal-500/10 to-transparent border border-amber-500/20 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Admin Quick Management</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Rapidly update pricing, stock status, or register new medical catalog items.</p>
          </div>
          <div className="flex items-center gap-2">
            <Link
              to="/admin/medicines"
              className="px-3.5 py-2 text-xs font-bold rounded-xl bg-teal-600 text-white hover:bg-teal-700 flex items-center gap-1.5 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Medicine</span>
            </Link>
            <Link
              to="/admin/pharmacies"
              className="px-3.5 py-2 text-xs font-bold rounded-xl bg-cyan-600 text-white hover:bg-cyan-700 flex items-center gap-1.5 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Pharmacy</span>
            </Link>
            <Link
              to="/admin/inventory"
              className="px-3.5 py-2 text-xs font-bold rounded-xl bg-amber-600 text-white hover:bg-amber-700 flex items-center gap-1.5 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Manage Pricing</span>
            </Link>
          </div>
        </div>

        {/* Analytics Breakdown Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 text-xs">
          {/* Top Searches */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <Search className="w-4 h-4 text-teal-600" />
                <span>Most Frequent Search Queries</span>
              </h3>
              <span className="text-[10px] text-slate-400 uppercase font-semibold">User Demand</span>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {topSearches.map((item: any, i: number) => (
                <div key={i} className="py-2.5 flex items-center justify-between">
                  <span className="font-medium text-slate-700 dark:text-slate-300">"{item.query}"</span>
                  <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 font-bold text-slate-600 dark:text-slate-400">
                    {item.search_count} queries
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Highest Price Variance Leaderboard */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <TrendingDown className="w-4 h-4 text-amber-500" />
                <span>Largest Price Variances</span>
              </h3>
              <span className="text-[10px] text-slate-400 uppercase font-semibold">Market Differences</span>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {priceVariances.map((item: any, i: number) => (
                <div key={i} className="py-2.5 flex items-center justify-between gap-2">
                  <div>
                    <span className="font-bold text-slate-900 dark:text-white block">{item.name}</span>
                    <span className="text-[11px] text-slate-400">
                      ₹{parseFloat(item.min_price).toFixed(2)} — ₹{parseFloat(item.max_price).toFixed(2)} across {item.stocking_pharmacies} stores
                    </span>
                  </div>
                  <span className="px-2 py-1 rounded-lg bg-emerald-50 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-black shrink-0">
                    Δ ₹{parseFloat(item.difference).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};
