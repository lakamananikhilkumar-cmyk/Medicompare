import React from 'react';
import { Link } from 'react-router-dom';
import { Pill, ShieldAlert, Heart, ExternalLink } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-600 dark:text-slate-400 text-xs transition-colors">
      {/* Prominent Mandatory Demo Data Disclaimer Banner */}
      <div className="bg-amber-500/10 border-b border-amber-500/20 py-3 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex items-start sm:items-center gap-2.5 text-amber-900 dark:text-amber-200">
          <ShieldAlert className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5 sm:mt-0" />
          <p className="font-medium text-[11px] sm:text-xs leading-relaxed">
            <strong className="font-bold">Transparency Notice:</strong> Demo data — prices, stock availability, and historical graphs shown on MediCompare are illustrative and simulated for demonstration purposes. They may not reflect live verified store inventory. Always confirm directly with the pharmacy before purchasing.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand Info */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-teal-600 flex items-center justify-center text-white">
                <Pill className="w-4 h-4 -rotate-45" />
              </div>
              <span className="text-base font-extrabold text-slate-900 dark:text-white">MediCompare</span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed max-w-md">
              MediCompare empowers patients and families across India to discover transparent retail medicine prices, compare nearby pharmacies, and understand potential healthcare savings with ease and safety.
            </p>
            <div className="p-3 bg-slate-100 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 max-w-md">
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                <strong>Medical Disclaimer:</strong> Information provided by MediCompare is strictly for general educational and price transparency purposes and does NOT constitute medical advice, diagnosis, or prescription. Prescription requirements must be verified with a qualified doctor or licensed pharmacist.
              </p>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px] mb-3">Platform</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/search" className="hover:text-teal-600 dark:hover:text-teal-400 transition-colors">
                  Find Medicines
                </Link>
              </li>
              <li>
                <Link to="/pharmacies" className="hover:text-teal-600 dark:hover:text-teal-400 transition-colors">
                  Pharmacy Directory
                </Link>
              </li>
              <li>
                <Link to="/favorites" className="hover:text-teal-600 dark:hover:text-teal-400 transition-colors">
                  Saved Medicines
                </Link>
              </li>
              <li>
                <Link to="/history" className="hover:text-teal-600 dark:hover:text-teal-400 transition-colors">
                  Comparison History
                </Link>
              </li>
            </ul>
          </div>

          {/* Compliance & Trust */}
          <div>
            <h4 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px] mb-3">Trust & Legal</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/about" className="hover:text-teal-600 dark:hover:text-teal-400 transition-colors">
                  About Our Mission
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="hover:text-teal-600 dark:hover:text-teal-400 transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="hover:text-teal-600 dark:hover:text-teal-400 transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link to="/admin" className="hover:text-teal-600 dark:hover:text-teal-400 transition-colors">
                  Admin Portal
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-6 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-slate-500">
          <p>© {new Date().getFullYear()} MediCompare Technologies. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Built with care for public health transparency
          </p>
        </div>
      </div>
    </footer>
  );
};
