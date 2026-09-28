import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { History, Search, Trash2, ArrowRight, Loader2, Pill } from 'lucide-react';
import { api } from '../lib/api';
import type { SearchHistoryItem } from '../types';

export const HistoryPage: React.FC = () => {
  const [history, setHistory] = useState<SearchHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  const loadHistory = async () => {
    setIsLoading(true);
    try {
      const res = await api.history.list();
      setHistory(res.history);
    } catch (err) {
      console.error('Error fetching history:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  const handleDeleteItem = async (id: string) => {
    try {
      await api.history.deleteItem(id);
      setHistory((prev) => prev.filter((h) => h.id !== id));
    } catch (err) {
      console.error('Error deleting history item:', err);
    }
  };

  const handleClearAll = async () => {
    if (!window.confirm('Are you sure you want to clear your entire search history?')) return;
    try {
      await api.history.clearAll();
      setHistory([]);
    } catch (err) {
      console.error('Error clearing history:', err);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Search History
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Review and rerun your recent medicine searches and price comparisons.
          </p>
        </div>

        {history.length > 0 && (
          <button
            onClick={handleClearAll}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear History</span>
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-3 text-slate-400">
          <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
          <p className="text-xs">Loading search logs...</p>
        </div>
      ) : history.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-2">
          <History className="w-10 h-10 text-slate-300 dark:text-slate-700 mx-auto" />
          <h3 className="font-bold text-sm text-slate-900 dark:text-white">No Search History Yet</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Your searches for medicines and local stores will appear here.
          </p>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 divide-y divide-slate-100 dark:divide-slate-800 shadow-sm overflow-hidden">
          {history.map((item) => (
            <div
              key={item.id}
              className="p-4 sm:p-5 flex items-center justify-between gap-4 hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors text-xs"
            >
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 shrink-0 mt-0.5">
                  <Search className="w-4 h-4" />
                </div>
                <div>
                  <button
                    onClick={() => {
                      if (item.medicine_id) {
                        navigate(`/compare/${item.medicine_id}`);
                      } else {
                        navigate(`/search?q=${encodeURIComponent(item.query)}`);
                      }
                    }}
                    className="font-bold text-sm text-slate-900 dark:text-white hover:text-teal-600 text-left"
                  >
                    "{item.query}"
                  </button>
                  {item.medicine_name && (
                    <p className="text-slate-500 mt-0.5">
                      Matched: {item.medicine_name} ({item.strength})
                    </p>
                  )}
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    {new Date(item.searched_at).toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    if (item.medicine_id) {
                      navigate(`/compare/${item.medicine_id}`);
                    } else {
                      navigate(`/search?q=${encodeURIComponent(item.query)}`);
                    }
                  }}
                  className="px-3 py-1.5 rounded-xl bg-teal-50 dark:bg-teal-950 text-teal-700 dark:text-teal-300 font-semibold hover:bg-teal-100 flex items-center gap-1 transition-colors"
                >
                  <span>Rerun</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={() => handleDeleteItem(item.id)}
                  className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
