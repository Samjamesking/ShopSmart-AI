import React, { useState, useEffect } from 'react';
import {
  LineChart as LineChartIcon,
  Search,
  Sparkles,
  TrendingDown,
  TrendingUp,
  Bell,
  ArrowRight,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { api } from '../services/api';
import { useTheme } from '../context/ThemeContext';
import PriceGraph from '../components/PriceGraph';

export default function PriceTrackerPage({ initialProductId, onSelectProduct }) {
  const { formatPrice } = useTheme();

  const [availableProducts, setAvailableProducts] = useState([]);
  const [selectedProductId, setSelectedProductId] = useState(initialProductId || null);
  const [trackerData, setTrackerData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeAlerts, setActiveAlerts] = useState([]);

  // Fetch available products list for selector
  useEffect(() => {
    async function loadProducts() {
      try {
        const [prodRes, alertRes] = await Promise.all([
          api.listProducts({ limit: 30 }),
          api.getPriceDropAlerts()
        ]);
        const items = prodRes.items || [];
        setAvailableProducts(items);
        setActiveAlerts(alertRes || []);

        if (!selectedProductId && items.length > 0) {
          setSelectedProductId(items[0].id);
        }
      } catch (e) {
        console.error(e);
      }
    }
    loadProducts();
  }, []);

  // Fetch price tracker details when selectedProductId changes
  useEffect(() => {
    async function fetchTracker() {
      if (!selectedProductId) return;
      setLoading(true);
      try {
        const data = await api.getPriceTracker(selectedProductId);
        setTrackerData(data);
      } catch (e) {
        console.error("Tracker fetch error", e);
      } finally {
        setLoading(false);
      }
    }
    fetchTracker();
  }, [selectedProductId]);

  const prod = trackerData?.product || {};
  const prediction = trackerData?.ai_prediction || {};

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-300">
      {/* Header & Product Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <LineChartIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            <span>AI Price Tracker & Forecasting</span>
          </h1>
          <p className="text-xs text-slate-500">
            Monitor historical price trends, lowest recorded points, and AI-driven discount forecasts
          </p>
        </div>

        {/* Product Dropdown Selector */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-500">Select Item:</span>
          <select
            value={selectedProductId || ''}
            onChange={(e) => setSelectedProductId(Number(e.target.value))}
            className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-200 px-3 py-2 rounded-xl focus:outline-none focus:border-blue-500 cursor-pointer max-w-xs truncate"
          >
            {availableProducts.map((p) => (
              <option key={p.id} value={p.id}>
                {p.brand} - {p.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="h-96 rounded-3xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
      ) : trackerData ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Main Chart & History Card */}
          <div className="lg:col-span-8 bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-6">
            {/* Header info */}
            <div className="flex items-center gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
              <img
                src={prod.image_url}
                alt={prod.name}
                className="w-16 h-16 object-cover rounded-2xl bg-slate-100 dark:bg-slate-800"
              />
              <div>
                <span className="text-[10px] uppercase font-bold text-blue-600 dark:text-blue-400">{prod.brand}</span>
                <h2
                  onClick={() => onSelectProduct(prod.id)}
                  className="text-base font-bold text-slate-900 dark:text-white hover:text-blue-500 cursor-pointer"
                >
                  {prod.name}
                </h2>
                <span className="text-xs text-slate-400">Category: {prod.category}</span>
              </div>
            </div>

            {/* Price Stats Row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
                <span className="text-xs text-slate-400 font-medium">Current Price</span>
                <p className="text-xl font-extrabold text-slate-900 dark:text-white mt-1">
                  {formatPrice(trackerData.current_price)}
                </p>
                <span className="text-[11px] text-emerald-500 font-bold">
                  {prod.discount_percent}% off MRP
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800">
                <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
                  Lowest Recorded Price
                </span>
                <p className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">
                  {formatPrice(trackerData.lowest_recorded_price)}
                </p>
                <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                  All-time lowest point
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
                <span className="text-xs text-slate-400 font-medium">Highest Recorded Price</span>
                <p className="text-xl font-extrabold text-slate-900 dark:text-white mt-1">
                  {formatPrice(trackerData.highest_recorded_price)}
                </p>
                <span className="text-[11px] text-slate-400 font-medium">
                  Peak release price
                </span>
              </div>
            </div>

            {/* Chart */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Price History (Last 6 Months)
                </h3>
                <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                  ● Lowest Point Highlighted
                </span>
              </div>
              <PriceGraph history={trackerData.history} lowestPrice={trackerData.lowest_recorded_price} />
            </div>
          </div>

          {/* Right Sidebar: AI Prediction & Active Alerts */}
          <div className="lg:col-span-4 space-y-4">
            {/* AI Prediction Card */}
            <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">AI Price Forecast</h3>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400">
                  {prediction.confidence_pct}% Confidence
                </span>
              </div>

              <div className={`p-4 rounded-2xl border ${
                prediction.verdict === 'BUY_NOW'
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800'
                  : 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800'
              }`}>
                <div className="flex items-center gap-2 mb-1">
                  {prediction.verdict === 'BUY_NOW' ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  )}
                  <h4 className={`text-xs font-bold uppercase tracking-wider ${
                    prediction.verdict === 'BUY_NOW'
                      ? 'text-emerald-800 dark:text-emerald-300'
                      : 'text-amber-800 dark:text-amber-300'
                  }`}>
                    {prediction.verdict === 'BUY_NOW' ? 'Recommendation: Buy Now' : 'Recommendation: Wait For Drop'}
                  </h4>
                </div>
                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                  {prediction.summary}
                </p>
                <p className="text-[11px] text-slate-500 mt-1">
                  {prediction.details}
                </p>
              </div>

              <button
                onClick={() => onSelectProduct(prod.id)}
                className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition cursor-pointer flex items-center justify-center gap-1.5"
              >
                <span>View Full Product Details</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Active Price Drop Alerts List */}
            <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <Bell className="w-4 h-4 text-rose-500" />
                  <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                    Recent Price Drops
                  </h3>
                </div>
                <span className="text-[10px] font-bold text-slate-400">
                  {activeAlerts.length} Alerts
                </span>
              </div>

              {activeAlerts.length === 0 ? (
                <p className="text-xs text-slate-400 py-3 text-center">
                  No active price drops currently recorded.
                </p>
              ) : (
                <div className="space-y-2">
                  {activeAlerts.map((alt, idx) => (
                    <div
                      key={idx}
                      onClick={() => onSelectProduct(alt.product_id)}
                      className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition flex items-center gap-3"
                    >
                      <img src={alt.image_url} alt={alt.name} className="w-10 h-10 object-cover rounded-lg" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">{alt.name}</p>
                        <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold">
                          Now {formatPrice(alt.current_price)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
