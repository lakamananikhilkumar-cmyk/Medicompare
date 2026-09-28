import React from 'react';
import { ShieldAlert, FileText, CheckCircle2 } from 'lucide-react';

export const TermsPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 space-y-8 animate-fade-in text-slate-700 dark:text-slate-300">
      <div>
        <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
          Terms of Service & Medical Disclaimer
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Last updated: September 2026 • Please read carefully before using MediCompare
        </p>
      </div>

      {/* Prominent Disclaimer Callout */}
      <div className="p-6 rounded-3xl bg-amber-500/10 border border-amber-500/30 text-amber-900 dark:text-amber-200 space-y-2 text-xs sm:text-sm leading-relaxed">
        <div className="flex items-center gap-2 font-bold text-amber-800 dark:text-amber-300">
          <ShieldAlert className="w-5 h-5 text-amber-600 dark:text-amber-400" />
          <span>IMPORTANT MEDICAL NOTICE</span>
        </div>
        <p>
          MediCompare is an informational technology platform designed exclusively for price discovery and transparency. MediCompare does NOT diagnose medical conditions, prescribe medications, recommend personalized treatments, or instruct users to initiate, alter, or terminate any prescribed therapy. Always consult a qualified physician or pharmacist for clinical matters.
        </p>
      </div>

      <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6 text-xs sm:text-sm leading-relaxed">
        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">1. Nature of Simulated & Demo Information</h2>
          <p>
            During initial releases and evaluations, product catalog pricing, stock availability flags, and historical trend trajectories are simulated demo records. MediCompare makes no representation or warranty that any listed price reflects live stock at a particular storefront. Consumers must verify pricing and stock directly with the dispensing pharmacy.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">2. Prescription Verification Requirement</h2>
          <p>
            Scheduled medications (e.g. Schedule H / H1 / X under Indian Drugs and Cosmetics Rules) strictly require a valid physical or digital prescription issued by a registered medical practitioner. No pharmacy is authorized or obligated to dispense prescription pharmaceuticals without statutory compliance.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">3. Artificial Intelligence Limitations</h2>
          <p>
            The integrated AI assistant provides general, category-level educational summaries based on standard pharmaceutical compendia. It must never be utilized as a substitute for professional clinical judgment, emergency medical services, or diagnostic consultations.
          </p>
        </section>
      </div>
    </div>
  );
};
