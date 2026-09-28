import React, { useState } from 'react';
import {
  Sparkles,
  X,
  Send,
  ShieldAlert,
  Info,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  Loader2,
  Bot,
} from 'lucide-react';
import { api } from '../../lib/api';
import type { AIMedicineInfo } from '../../types';

interface MedicineAIChatProps {
  isOpen: boolean;
  onClose: () => void;
  medicineName: string;
  strength?: string;
  dosageForm?: string;
}

export const MedicineAIChat: React.FC<MedicineAIChatProps> = ({
  isOpen,
  onClose,
  medicineName,
  strength,
  dosageForm,
}) => {
  const [question, setQuestion] = useState('');
  const [info, setInfo] = useState<AIMedicineInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleAsk = async (userPrompt?: string) => {
    const q = userPrompt || question;
    if (!q.trim() && !info) return;

    setIsLoading(true);
    setError(null);

    try {
      const res = await api.ai.getMedicineInfo({
        medicineName,
        strength,
        dosageForm,
        userQuestion: q.trim() || undefined,
      });
      setInfo(res);
      setQuestion('');
    } catch (err: any) {
      setError(err.message || 'Failed to fetch AI medicine information. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const sampleQuestions = [
    'What is this medicine commonly used for?',
    'What are common precautions to keep in mind?',
    'What are documented side effect categories?',
    'What is the difference between brand and generic?',
  ];

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg h-full bg-white dark:bg-slate-900 shadow-2xl flex flex-col border-l border-slate-200 dark:border-slate-800 animate-slide-left">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/80 dark:bg-slate-950/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-teal-500 to-cyan-500 text-white flex items-center justify-center shadow-md shadow-cyan-500/20">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white">
                  Medicine Assistant
                </h3>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold uppercase bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300">
                  Gemini 2.5
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Educational Information for <span className="font-semibold text-teal-600 dark:text-teal-400">{medicineName}</span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Close assistant"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Guardrail Disclaimer Banner */}
        <div className="p-3 bg-amber-500/10 border-b border-amber-500/20 flex items-start gap-2.5 text-amber-900 dark:text-amber-200 text-xs">
          <ShieldAlert className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <p className="leading-relaxed text-[11px]">
            <strong>Non-Diagnostic Notice:</strong> This assistant provides general educational information only. It cannot evaluate personal symptoms, diagnose conditions, or recommend medicine changes. Consult a qualified doctor or pharmacist.
          </p>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {error && (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/50 text-rose-800 dark:text-rose-300 rounded-xl text-xs border border-rose-200 dark:border-rose-800">
              {error}
            </div>
          )}

          {!info && !isLoading && (
            <div className="text-center py-6 space-y-4">
              <div className="w-12 h-12 mx-auto rounded-full bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 flex items-center justify-center">
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-slate-900 dark:text-white">Ask General Medicine Questions</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xs mx-auto">
                  Click a suggested topic below or ask about active ingredients, dosage forms, or precautions.
                </p>
              </div>

              {/* Sample Prompts */}
              <div className="space-y-2 text-left pt-2">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Suggested Questions</span>
                {sampleQuestions.map((sq) => (
                  <button
                    key={sq}
                    onClick={() => handleAsk(sq)}
                    className="w-full text-left p-3 rounded-xl bg-slate-50 hover:bg-teal-50 dark:bg-slate-800 dark:hover:bg-teal-950/40 border border-slate-200 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-200 hover:text-teal-700 dark:hover:text-teal-300 transition-colors flex items-center justify-between"
                  >
                    <span>{sq}</span>
                    <HelpCircle className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {isLoading && (
            <div className="py-12 flex flex-col items-center justify-center gap-3 text-slate-400">
              <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
              <p className="text-xs font-medium">Generating verified non-diagnostic overview...</p>
            </div>
          )}

          {info && !isLoading && (
            <div className="space-y-4 animate-fade-in text-xs">
              {/* Summary */}
              <div className="p-4 rounded-2xl bg-teal-50/80 dark:bg-teal-950/40 border border-teal-200/60 dark:border-teal-800/60 space-y-1.5">
                <span className="font-bold text-teal-800 dark:text-teal-300 uppercase tracking-wider text-[10px]">
                  Clinical Summary
                </span>
                <p className="text-slate-800 dark:text-slate-200 leading-relaxed font-medium">
                  {info.summary}
                </p>
                <div className="pt-2 text-[11px] text-teal-700 dark:text-teal-400">
                  <strong>Active Formulation:</strong> {info.activeIngredient}
                </div>
              </div>

              {/* Common Uses */}
              <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-2">
                <div className="flex items-center gap-1.5 text-slate-900 dark:text-white font-bold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Common General Indications</span>
                </div>
                <ul className="space-y-1 text-slate-600 dark:text-slate-300 pl-5 list-disc leading-relaxed">
                  {info.commonUses.map((use, i) => (
                    <li key={i}>{use}</li>
                  ))}
                </ul>
              </div>

              {/* Precautions */}
              <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-2">
                <div className="flex items-center gap-1.5 text-amber-700 dark:text-amber-400 font-bold">
                  <AlertTriangle className="w-4 h-4 text-amber-500" />
                  <span>General Precaution Categories</span>
                </div>
                <ul className="space-y-1 text-slate-600 dark:text-slate-300 pl-5 list-disc leading-relaxed">
                  {info.precautionCategories.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              </div>

              {/* Side Effects */}
              <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-2">
                <div className="flex items-center gap-1.5 text-slate-900 dark:text-white font-bold">
                  <Info className="w-4 h-4 text-cyan-600" />
                  <span>Documented Side-Effect Categories</span>
                </div>
                <ul className="space-y-1 text-slate-600 dark:text-slate-300 pl-5 list-disc leading-relaxed">
                  {info.commonSideEffectCategories.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              </div>

              {/* Mandatory AI disclaimer */}
              <div className="p-3 bg-slate-100 dark:bg-slate-800/60 rounded-xl text-[10px] text-slate-500 leading-relaxed">
                {info.safetyNotice}
              </div>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleAsk();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Ask an educational question (e.g. precautions, dosage forms)..."
              disabled={isLoading}
              className="flex-1 px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
            <button
              type="submit"
              disabled={isLoading || !question.trim()}
              className="p-2.5 text-white bg-teal-600 hover:bg-teal-700 disabled:opacity-40 rounded-xl shadow-sm transition-colors shrink-0"
              aria-label="Send question"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
