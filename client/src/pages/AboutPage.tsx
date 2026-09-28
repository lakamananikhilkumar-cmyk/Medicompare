import React from 'react';
import { Pill, ShieldCheck, HeartHandshake, Eye, Award, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export const AboutPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 space-y-12 animate-fade-in text-slate-700 dark:text-slate-300">
      <div className="text-center space-y-4">
        <div className="w-14 h-14 mx-auto rounded-3xl bg-gradient-to-tr from-teal-600 to-cyan-600 text-white flex items-center justify-center shadow-lg shadow-teal-500/20">
          <Pill className="w-8 h-8 -rotate-45" />
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
          About MediCompare
        </h1>
        <p className="text-base sm:text-lg text-slate-500 dark:text-slate-400 max-w-xl mx-auto font-medium">
          Transparent Medicine Price Discovery • Fair Access • Healthcare Literacy
        </p>
      </div>

      {/* Core Mission */}
      <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 leading-relaxed text-sm">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Our Mission Directive</h2>
        <p>
          In India, millions of patients encounter substantial retail price differences for the exact same active pharmaceutical ingredient, strength, dosage form, and pack size across different chemists.
        </p>
        <p>
          Branded formulations are often marketed at 2x to 5x the price of equivalent generic medicines produced to identical pharmacopeial standards. Consumers frequently lack a convenient, transparent tool to discover nearby pharmacy options, compare inventory availability, and understand genuine savings opportunities before making a purchase.
        </p>
        <p>
          <strong>MediCompare</strong> bridges this information asymmetry by empowering users to compare prices, verify local stock, and make informed choices alongside their healthcare providers.
        </p>
      </div>

      {/* Core Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
          <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-950 text-teal-600 flex items-center justify-center">
            <Eye className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-slate-900 dark:text-white">100% Transparency</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            We never rank pharmacies based on hidden promotional fees or opaque algorithms. Prices and distances are displayed impartially.
          </p>
        </div>

        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-50 dark:bg-cyan-950 text-cyan-600 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-slate-900 dark:text-white">Clinical Safety</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            We are not a diagnostic service. Our integrated AI assistant operates strictly within non-diagnostic, educational boundaries.
          </p>
        </div>

        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center">
            <Award className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-slate-900 dark:text-white">Exact Formulations</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Comparisons strictly match salt strength, dosage form, and packaging volume. Different strengths are never conflated.
          </p>
        </div>
      </div>

      {/* Non-Diagnostic Pledge */}
      <div className="p-6 rounded-3xl bg-teal-50/80 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800 text-xs space-y-2 leading-relaxed">
        <h4 className="font-bold text-teal-900 dark:text-teal-200 text-sm">Our Medical Safety Pledge</h4>
        <p>
          MediCompare does not provide medical advice, diagnosis, treatment, or prescription services. Any decisions regarding switching medications, altering doses, or discontinuing treatment must always be made in consultation with a qualified physician or licensed pharmacist.
        </p>
      </div>
    </div>
  );
};
