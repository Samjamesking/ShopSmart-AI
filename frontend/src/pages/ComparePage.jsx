import React, { useState, useEffect } from 'react';
import {
  Scale,
  X,
  Plus,
  Sparkles,
  Trophy,
  BadgeDollarSign,
  Zap,
  CheckCircle2,
  AlertTriangle,
  ArrowRight
} from 'lucide-react';
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
} from 'chart.js';
import { Radar } from 'react-chartjs-2';
import { api } from '../services/api';
import { useTheme } from '../context/ThemeContext';
import { useCartWishlist } from '../context/CartWishlistContext';

ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
);

export default function ComparePage({ onSelectProduct }) {
  const { formatPrice, isDarkMode } = useTheme();
  const { compareList, toggleCompare, clearCompare } = useCartWishlist();

  const [comparisonResult, setComparisonResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [availableProducts, setAvailableProducts] = useState([]);
  const [showAddDropdown, setShowAddDropdown] = useState(false);

  useEffect(() => {
    async function loadQuickOptions() {
      try {
        const res = await api.listProducts({ limit: 12 });
        setAvailableProducts(res.items || []);
      } catch (e) {
        console.error(e);
      }
    }
    loadQuickOptions();
  }, []);

  // When compareList changes, fetch detailed comparison
  useEffect(() => {
    async function fetchComparison() {
      if (compareList.length < 2) {
        setComparisonResult(null);
        return;
      }
      setLoading(true);
      try {
        const ids = compareList.map(p => p.id);
        const res = await api.compareProducts(ids);
        setComparisonResult(res);
      } catch (e) {
        console.error("Comparison load error", e);
      } finally {
        setLoading(false);
      }
    }
    fetchComparison();
  }, [compareList]);

  // Radar chart config
  const radarData = comparisonResult?.chart_data || {
    labels: ["Value", "Performance", "Popularity", "Features", "Satisfaction"],
    datasets: []
  };

  const radarOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: isDarkMode ? '#cbd5e1' : '#334155',
          font: { size: 11, weight: 'bold' }
        }
      }
    },
    scales: {
      r: {
        angleLines: {
          color: isDarkMode ? '#334155' : '#e2e8f0'
        },
        grid: {
          color: isDarkMode ? '#1e293b' : '#e2e8f0'
        },
        pointLabels: {
          color: isDarkMode ? '#94a3b8' : '#64748b',
          font: { size: 11, weight: '600' }
        },
        ticks: {
          display: false,
          max: 100,
          min: 0
        }
      }
    }
  };

  const aiVerdict = comparisonResult?.ai_verdict || {};

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <Scale className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            <span>AI Product Comparison</span>
          </h1>
          <p className="text-xs text-slate-500">
            Side-by-side multi-parameter specification analysis with radar benchmarks & AI verdict
          </p>
        </div>

        {compareList.length > 0 && (
          <button
            onClick={clearCompare}
            className="text-xs font-semibold text-rose-500 hover:text-rose-600 transition cursor-pointer self-start sm:self-auto"
          >
            Clear All ({compareList.length})
          </button>
        )}
      </div>

      {/* When less than 2 items are selected, show selection prompts */}
      {compareList.length < 2 ? (
        <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-3xl p-10 text-center space-y-5">
          <div className="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto">
            <Scale className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Select at least 2 products to compare
            </h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto mt-1">
              You currently have {compareList.length} product selected. Choose from the popular suggestions below or click the scale icon on any product card in the catalog.
            </p>
          </div>

          {/* Quick Select Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-3xl mx-auto pt-2">
            {availableProducts.slice(0, 4).map((prod) => (
              <div
                key={prod.id}
                onClick={() => toggleCompare(prod)}
                className={`p-3 rounded-2xl border text-center transition cursor-pointer group ${
                  compareList.some(p => p.id === prod.id)
                    ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-950/30'
                    : 'border-slate-200 dark:border-slate-800 hover:border-blue-500 bg-slate-50/50 dark:bg-slate-800/40'
                }`}
              >
                <img src={prod.image_url} alt={prod.name} className="w-16 h-16 object-cover rounded-xl mx-auto mb-2 group-hover:scale-105 transition" />
                <h4 className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">{prod.name}</h4>
                <p className="text-xs font-bold text-blue-600 dark:text-blue-400 mt-0.5">{formatPrice(prod.price)}</p>
                <span className="text-[10px] font-bold text-slate-400 block mt-1">
                  {compareList.some(p => p.id === prod.id) ? '✓ Added' : '+ Add to Compare'}
                </span>
              </div>
            ))}
          </div>
        </div>
      ) : loading ? (
        <div className="h-96 rounded-3xl bg-slate-100 dark:bg-slate-800 animate-pulse flex items-center justify-center">
          <div className="flex items-center gap-2 text-sm text-blue-600 font-bold">
            <Sparkles className="w-5 h-5 animate-spin" />
            Generating side-by-side specification matrix & radar chart...
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Top Product Cards Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {compareList.map((prod) => (
              <div
                key={prod.id}
                className="relative bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-3xl p-4 flex flex-col justify-between shadow-sm"
              >
                <button
                  onClick={() => toggleCompare(prod)}
                  title="Remove from comparison"
                  className="absolute top-3 right-3 p-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-rose-500 transition cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>

                <div>
                  <img
                    src={prod.image_url}
                    alt={prod.name}
                    className="w-full h-32 object-cover rounded-2xl bg-slate-100 dark:bg-slate-800 mb-3"
                  />
                  <span className="text-[10px] uppercase font-bold text-blue-600 dark:text-blue-400">{prod.brand}</span>
                  <h3
                    onClick={() => onSelectProduct(prod.id)}
                    className="text-xs font-bold text-slate-900 dark:text-white line-clamp-2 hover:text-blue-500 cursor-pointer"
                  >
                    {prod.name}
                  </h3>
                </div>

                <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <span className="text-sm font-extrabold text-slate-900 dark:text-white">
                    {formatPrice(prod.price)}
                  </span>
                  <button
                    onClick={() => onSelectProduct(prod.id)}
                    className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                  >
                    Details →
                  </button>
                </div>
              </div>
            ))}

            {/* Slot to add another product if < 4 */}
            {compareList.length < 4 && (
              <div className="border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl p-4 flex flex-col items-center justify-center text-center bg-slate-50/50 dark:bg-slate-800/20">
                <Plus className="w-8 h-8 text-slate-400 mb-2" />
                <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300">Add Another Product</h4>
                <p className="text-[11px] text-slate-400 mt-1 mb-3">Compare up to 4 items simultaneously</p>
                <div className="relative">
                  <button
                    onClick={() => setShowAddDropdown(!showAddDropdown)}
                    className="px-3 py-1.5 rounded-xl bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition cursor-pointer"
                  >
                    Choose Item
                  </button>

                  {showAddDropdown && (
                    <div className="absolute left-1/2 -translate-x-1/2 mt-2 w-64 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl p-2 z-50 text-left max-h-60 overflow-y-auto">
                      {availableProducts
                        .filter(p => !compareList.some(item => item.id === p.id))
                        .map(p => (
                          <div
                            key={p.id}
                            onClick={() => {
                              toggleCompare(p);
                              setShowAddDropdown(false);
                            }}
                            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl cursor-pointer text-xs font-medium text-slate-800 dark:text-slate-200 truncate"
                          >
                            {p.name} ({formatPrice(p.price)})
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* AI Verdict Banner */}
          {aiVerdict.winner && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl bg-gradient-to-tr from-amber-500/10 to-yellow-500/10 border border-amber-500/20 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0">
                  <Trophy className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase text-amber-600 dark:text-amber-400">AI Top Pick</span>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">{aiVerdict.winner}</h4>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-gradient-to-tr from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0">
                  <BadgeDollarSign className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase text-emerald-600 dark:text-emerald-400">Best Value For Money</span>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">{aiVerdict.best_value}</h4>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-gradient-to-tr from-blue-500/10 to-indigo-500/10 border border-blue-500/20 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0">
                  <Zap className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase text-blue-600 dark:text-blue-400">Best Performance</span>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">{aiVerdict.best_performance}</h4>
                </div>
              </div>
            </div>
          )}

          {/* Spec Comparison Table & Radar Benchmark Chart */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Table */}
            <div className="lg:col-span-8 bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm">
              <div className="p-4 border-b border-slate-100 dark:border-slate-800">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Technical Specifications Matrix</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-800/50 text-slate-400 uppercase tracking-wider text-[10px]">
                      <th className="p-3.5 font-bold">Attribute</th>
                      {comparisonResult?.products.map((p) => (
                        <th key={p.id} className="p-3.5 font-bold truncate max-w-[150px]">{p.name}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {comparisonResult?.common_specs.map((specKey) => (
                      <tr key={specKey} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                        <td className="p-3.5 font-bold text-slate-500 w-32">{specKey}</td>
                        {comparisonResult?.products.map((p) => {
                          const val = comparisonResult.specs_matrix[specKey]?.[String(p.id)] || 'N/A';
                          return (
                            <td key={p.id} className="p-3.5 font-medium text-slate-800 dark:text-slate-200">
                              {val}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Radar Benchmark Chart */}
            <div className="lg:col-span-4 bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-4">
              <div className="pb-2 border-b border-slate-100 dark:border-slate-800">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Multi-Attribute Benchmark</h3>
                <p className="text-[11px] text-slate-400">Comparing value, performance, and buyer satisfaction</p>
              </div>
              <div className="h-64">
                <Radar data={radarData} options={radarOptions} />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
