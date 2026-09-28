import React from 'react';
import { ShieldCheck, Lock, EyeOff, FileText } from 'lucide-react';

export const PrivacyPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 space-y-8 animate-fade-in text-slate-700 dark:text-slate-300">
      <div>
        <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
          Privacy Policy
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Last updated: September 2026 • Effective immediately
        </p>
      </div>

      <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6 text-xs sm:text-sm leading-relaxed">
        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">1. Commitment to Health Data Privacy</h2>
          <p>
            MediCompare is engineered with strict privacy guardrails. We believe your medicine searches and health queries are sensitive personal records. We do not sell, rent, or trade user search terms, comparison activities, or bookmark histories with third-party advertisers, data aggregators, or insurance companies.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">2. Guest Exploration Without Forced Profiling</h2>
          <p>
            Users are free to search medicines, compare nearby retail and generic pharmacy rates, and review educational terminology in guest mode without creating an account or providing personally identifiable information.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">3. Geolocation Handling</h2>
          <p>
            When you select "Use My Current Location", your browser coordinates are used solely in memory to compute distance vectors to registered pharmacies. MediCompare does not execute background location tracking and does not store continuous GPS tracking traces.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">4. Artificial Intelligence Interaction Data</h2>
          <p>
            When utilizing our Gemini AI medicine information assistant, queries are processed server-side through private API gateways. Conversations are informational and ephemeral by default, ensuring patient inquiries remain private.
          </p>
        </section>
      </div>
    </div>
  );
};
