import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Pill,
  Search,
  ShieldCheck,
  TrendingDown,
  Store,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  HeartHandshake,
  MapPin,
  Clock,
  Truck,
  Award,
} from 'lucide-react';
import { MedicineSearch } from '../components/search/MedicineSearch';
import { PrescriptionUploader } from '../components/prescription/PrescriptionUploader';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();

  const featuredMedicines = [
    {
      id: 'bb000000-0000-0000-0000-000000000001',
      name: 'Paracetamol 500 mg Tablet',
      brand: 'Crocin / Calpol',
      form: 'Tablet • Pack of 10',
      minPrice: 7.5,
      maxPrice: 22.0,
      savings: 14.5,
      percent: 66,
      rx: false,
    },
    {
      id: 'bb000000-0000-0000-0000-000000000002',
      name: 'Paracetamol 650 mg Tablet',
      brand: 'Dolo 650 / Calpol 650',
      form: 'Tablet • Pack of 15',
      minPrice: 12.0,
      maxPrice: 33.5,
      savings: 21.5,
      percent: 64,
      rx: false,
    },
    {
      id: 'bb000000-0000-0000-0000-000000000004',
      name: 'Pantoprazole 40 mg Tablet',
      brand: 'Pan 40 / Pantocid',
      form: 'Tablet • Pack of 15',
      minPrice: 45.0,
      maxPrice: 148.0,
      savings: 103.0,
      percent: 70,
      rx: true,
    },
    {
      id: 'bb000000-0000-0000-0000-000000000006',
      name: 'Metformin 500 mg SR',
      brand: 'Glycomet 500 SR',
      form: 'Tablet • Pack of 20',
      minPrice: 18.0,
      maxPrice: 56.0,
      savings: 38.0,
      percent: 68,
      rx: true,
    },
  ];

  return (
    <div className="space-y-16 pb-16">
      {/* Hero Section */}
      <section className="relative pt-12 sm:pt-20 pb-16 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Soft Background Accents */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-gradient-to-tr from-teal-500/10 via-cyan-500/10 to-emerald-500/10 rounded-full blur-3xl pointer-events-none -z-10" />

        <div className="max-w-4xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 text-teal-800 dark:text-teal-300 text-xs font-bold uppercase tracking-wider animate-fade-in shadow-sm">
            <Sparkles className="w-4 h-4 text-teal-600 dark:text-teal-400" />
            <span>Transparent Medicine Price Discovery</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
            Find Your Medicine.{' '}
            <span className="bg-gradient-to-r from-teal-600 via-cyan-600 to-emerald-600 bg-clip-text text-transparent">
              Compare Prices.
            </span>{' '}
            Save More.
          </h1>

          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Same strength. Same formulation. Substantial price differences. Compare nearby retail and generic pharmacies before you buy.
          </p>

          {/* Main Global Search */}
          <div className="pt-4 max-w-2xl mx-auto">
            <MedicineSearch size="large" autoFocus />
          </div>

          {/* Smart Prescription Uploader */}
          <div className="pt-4 max-w-2xl mx-auto text-left">
            <PrescriptionUploader />
          </div>

          {/* Quick Metrics Bar */}
          <div className="pt-6 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl mx-auto text-left">
            <div className="p-3.5 rounded-2xl bg-white/80 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 backdrop-blur-sm shadow-sm">
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Potential Savings</span>
              <p className="text-xl font-black text-teal-600 dark:text-teal-400 mt-0.5">Up to 70%</p>
              <span className="text-[10px] text-slate-400">On identical generics</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-white/80 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 backdrop-blur-sm shadow-sm">
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Pharmacies Mapped</span>
              <p className="text-xl font-black text-cyan-600 dark:text-cyan-400 mt-0.5">10+ Stores</p>
              <span className="text-[10px] text-slate-400">Chains & Independent</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-white/80 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 backdrop-blur-sm shadow-sm">
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Formulations</span>
              <p className="text-xl font-black text-emerald-600 dark:text-emerald-400 mt-0.5">100% Exact</p>
              <span className="text-[10px] text-slate-400">Strength & pack matched</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-white/80 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 backdrop-blur-sm shadow-sm">
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Safety Standard</span>
              <p className="text-xl font-black text-slate-900 dark:text-white mt-0.5">Non-Diagnostic</p>
              <span className="text-[10px] text-slate-400">Doctor-aligned ethics</span>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Price Comparisons */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-6">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-teal-600 dark:text-teal-400 uppercase tracking-wider mb-1">
              <TrendingDown className="w-4 h-4" />
              <span>Real Market Price Differences</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              Compare Popular Medicines
            </h2>
          </div>
          <Link
            to="/search"
            className="text-xs font-bold text-teal-600 dark:text-teal-400 hover:text-teal-700 flex items-center gap-1 self-start sm:self-end"
          >
            <span>Browse Full Directory</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {featuredMedicines.map((med) => (
            <div
              key={med.id}
              onClick={() => navigate(`/compare/${med.id}`)}
              className="group cursor-pointer rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 shadow-sm hover:shadow-xl hover:border-teal-500/50 transition-all duration-200 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded-md bg-teal-50 dark:bg-teal-950 text-teal-700 dark:text-teal-300">
                    {med.form}
                  </span>
                  {med.rx && (
                    <span className="px-1.5 py-0.5 text-[10px] font-semibold rounded bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-300">
                      Rx
                    </span>
                  )}
                </div>

                <h3 className="font-bold text-base text-slate-900 dark:text-white group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                  {med.name}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Brands: {med.brand}</p>
              </div>

              <div className="pt-5 mt-4 border-t border-slate-100 dark:border-slate-800 space-y-2">
                <div className="flex items-baseline justify-between">
                  <span className="text-xs text-slate-400">Price range</span>
                  <span className="text-sm font-black text-slate-900 dark:text-white">
                    ₹{med.minPrice.toFixed(2)} — ₹{med.maxPrice.toFixed(2)}
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/60 dark:border-emerald-800/40 flex items-center justify-between text-xs">
                  <span className="font-semibold text-emerald-800 dark:text-emerald-300">Potential Savings:</span>
                  <span className="font-black text-emerald-700 dark:text-emerald-400">
                    Save ₹{med.savings.toFixed(2)} ({med.percent}%)
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works (3 Steps) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
          <span className="text-xs font-bold text-teal-600 dark:text-teal-400 uppercase tracking-wider">
            Simple 3-Step Journey
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            How MediCompare Works
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Never pay inflated retail prices again. Verify pricing and availability before heading out.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3 shadow-sm">
            <div className="w-12 h-12 rounded-2xl bg-teal-100 text-teal-700 dark:bg-teal-950 dark:text-teal-300 font-black text-lg flex items-center justify-center">
              1
            </div>
            <h3 className="font-bold text-lg text-slate-900 dark:text-white">Search Exact Formulation</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Never compare medicines by generic name alone. We ensure 500mg, 650mg, tablets, or syrups are matched with 100% chemical precision.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3 shadow-sm">
            <div className="w-12 h-12 rounded-2xl bg-cyan-100 text-cyan-700 dark:bg-cyan-950 dark:text-cyan-300 font-black text-lg flex items-center justify-center">
              2
            </div>
            <h3 className="font-bold text-lg text-slate-900 dark:text-white">Compare Nearby Pharmacies</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              View prices from local chemists, retail chains (Apollo, MedPlus), and government Jan Aushadhi generic stores side-by-side with stock status.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3 shadow-sm">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 font-black text-lg flex items-center justify-center">
              3
            </div>
            <h3 className="font-bold text-lg text-slate-900 dark:text-white">Contact & Save</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Call the pharmacy with one tap, open turn-by-turn navigation in Google Maps, or verify delivery availability before purchasing.
            </p>
          </div>
        </div>
      </section>

      {/* Jan Aushadhi & Generic Awareness Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-gradient-to-r from-teal-900 via-cyan-900 to-slate-900 p-8 sm:p-12 text-white shadow-xl flex flex-col lg:flex-row items-center justify-between gap-8 border border-teal-500/20">
          <div className="space-y-3 max-w-xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold uppercase">
              <Award className="w-3.5 h-3.5" />
              <span>Generic Medicine Savings Initiative</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-black tracking-tight">
              Did you know? Generic medicines have identical active ingredients at 50% to 80% lower cost.
            </h3>
            <p className="text-xs sm:text-sm text-teal-100/80 leading-relaxed">
              Government Jan Aushadhi Kendras and certified generic formulations meet stringent pharmacopeial standards (IP/BP/USP). MediCompare highlights verified generic alternatives alongside retail brands.
            </p>
          </div>

          <div className="shrink-0 flex flex-col sm:flex-row gap-3">
            <Link
              to="/compare/bb000000-0000-0000-0000-000000000001"
              className="px-6 py-3.5 text-xs sm:text-sm font-bold rounded-2xl bg-white text-slate-900 hover:bg-teal-50 transition-all text-center shadow-lg"
            >
              See Paracetamol Generic Savings
            </Link>
            <Link
              to="/pharmacies"
              className="px-6 py-3.5 text-xs sm:text-sm font-bold rounded-2xl bg-white/10 hover:bg-white/20 text-white border border-white/20 transition-all text-center"
            >
              Find Nearby Jan Aushadhi
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
