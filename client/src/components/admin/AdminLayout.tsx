import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Pill,
  Store,
  Layers,
  Users,
  BarChart3,
  ShieldCheck,
  ArrowLeft,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const AdminLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const routerLocation = useLocation();
  const { user } = useAuth();

  const links = [
    { label: 'Overview', path: '/admin', icon: LayoutDashboard },
    { label: 'Medicines', path: '/admin/medicines', icon: Pill },
    { label: 'Pharmacies', path: '/admin/pharmacies', icon: Store },
    { label: 'Inventory & Prices', path: '/admin/inventory', icon: Layers },
    { label: 'Users', path: '/admin/users', icon: Users },
    { label: 'Analytics', path: '/admin/analytics', icon: BarChart3 },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Admin Subheader Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-md shadow-amber-500/20 font-bold">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                Admin Management Console
              </h1>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                Authorized
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Logged in as <strong className="text-slate-700 dark:text-slate-300">{user?.email}</strong>
            </p>
          </div>
        </div>

        <Link
          to="/"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 transition-colors self-start sm:self-center"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Exit to Public Site</span>
        </Link>
      </div>

      {/* Admin Nav Tabs */}
      <div className="flex items-center gap-1 overflow-x-auto pb-2 text-xs border-b border-slate-100 dark:border-slate-800/80">
        {links.map((link) => {
          const active = routerLocation.pathname === link.path;
          const Icon = link.icon;
          return (
            <Link
              key={link.path}
              to={link.path}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl font-bold transition-colors whitespace-nowrap ${
                active
                  ? 'bg-amber-500 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{link.label}</span>
            </Link>
          );
        })}
      </div>

      {/* Main Admin Content */}
      <div className="pt-2">{children}</div>
    </div>
  );
};
