import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  ArrowRight,
  Search,
  Scale,
  TrendingUp,
  Cpu,
  Bot,
  Zap,
  ShoppingBag,
  ExternalLink
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import ProductCard from '../components/ProductCard';

export default function HomePage({ onNavigate, onSearch, onSelectProduct }) {
  const { user } = useAuth();
  const { formatPrice } = useTheme();
  const [heroPrompt, setHeroPrompt] = useState('');
  const [recentSearches, setRecentSearches] = useState([]);
  const [recommended, setRecommended] = useState([]);
  const [trending, setTrending] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [recData, trendData, searchData] = await Promise.all([
          api.getRecommended(8),
          api.getTrending(5),
          api.getRecentSearches()
        ]);
        setRecommended(recData || []);
        setTrending(trendData || []);
        setRecentSearches(searchData || []);
      } catch (e) {
        console.error("Dashboard data load error", e);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const handleHeroSubmit = (e) => {
    e.preventDefault();
    if (heroPrompt.trim()) {
      onSearch(heroPrompt.trim(), true); // Send to AI assistant
    }
  };

  const handleChipClick = (query) => {
    onSearch(query, true);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-300">
      {/* Welcome Greeting */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
          Welcome back, {user?.name ? user.name.split(' ')[0] : 'Sammya'}! 
          <span className="inline-block animate-wave origin-bottom-right">👋</span>
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Discover amazing products with AI-powered recommendations tailored for your preferences.
        </p>
      </div>

      {/* Hero AI Shopping Assistant Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-700 via-indigo-700 to-sky-600 p-6 sm:p-8 text-white shadow-xl shadow-blue-500/15">
        {/* Subtle decorative circles */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-white/10 blur-2xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/3 -mb-16 w-48 h-48 rounded-full bg-cyan-400/20 blur-xl pointer-events-none" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          <div className="lg:col-span-8 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md border border-white/20 text-xs font-semibold text-sky-100">
              <Bot className="w-3.5 h-3.5" />
              <span>Multi-Agent AI Concierge</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold text-white leading-tight">
              Your Personal AI Shopping Assistant
            </h2>
            <p className="text-sm text-blue-100 max-w-xl">
              Find the best products, compare prices across categories, get personalized recommendations, and shop smarter.
            </p>

            {/* Prompt Input Form */}
            <form onSubmit={handleHeroSubmit} className="pt-2 max-w-xl">
              <div className="relative flex items-center">
                <input
                  type="text"
                  value={heroPrompt}
                  onChange={(e) => setHeroPrompt(e.target.value)}
                  placeholder="Ask me anything... (e.g. best gaming laptop under ₹80,000)"
                  className="w-full pl-4 pr-12 py-3.5 bg-white text-slate-800 placeholder-slate-400 rounded-2xl text-sm font-medium shadow-lg focus:outline-none focus:ring-4 focus:ring-cyan-400/40 transition"
                />
                <button
                  type="submit"
                  className="absolute right-2 p-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-md transition cursor-pointer"
                >
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          </div>

          {/* Right Mascot / Quick Action Cards */}
          <div className="lg:col-span-4 flex flex-col gap-2.5">
            <button
              onClick={() => onNavigate('search')}
              className="p-3.5 rounded-2xl bg-white/15 hover:bg-white/25 backdrop-blur-md border border-white/20 flex items-center justify-between text-left transition group cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-white/20 text-white">
                  <Search className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Smart Search</h4>
                  <p className="text-[11px] text-blue-100">Semantic & Vector Discovery</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-white/70 group-hover:translate-x-1 transition" />
            </button>

            <button
              onClick={() => onNavigate('compare')}
              className="p-3.5 rounded-2xl bg-white/15 hover:bg-white/25 backdrop-blur-md border border-white/20 flex items-center justify-between text-left transition group cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-white/20 text-white">
                  <Scale className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Price Compare</h4>
                  <p className="text-[11px] text-blue-100">Side-by-Side Specs Matrix</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-white/70 group-hover:translate-x-1 transition" />
            </button>

            <button
              onClick={() => onNavigate('assistant')}
              className="p-3.5 rounded-2xl bg-white/15 hover:bg-white/25 backdrop-blur-md border border-white/20 flex items-center justify-between text-left transition group cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-white/20 text-white">
                  <Zap className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Personalized Feed</h4>
                  <p className="text-[11px] text-blue-100">Tailored AI Recommendations</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-white/70 group-hover:translate-x-1 transition" />
            </button>
          </div>
        </div>
      </div>

      {/* Recent Searches Chips */}
      {recentSearches.length > 0 && (
        <div className="space-y-2.5">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Recent Searches</span>
          <div className="flex flex-wrap gap-2">
            {recentSearches.map((term, idx) => (
              <button
                key={idx}
                onClick={() => handleChipClick(term)}
                className="px-3.5 py-1.5 rounded-full bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 text-xs font-medium text-slate-700 dark:text-slate-300 hover:border-blue-500 hover:text-blue-600 dark:hover:text-blue-400 hover:shadow-sm transition cursor-pointer flex items-center gap-1.5"
              >
                <Search className="w-3 h-3 text-slate-400" />
                <span>{term}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Main Grid: Recommended For You & Trending Products Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Recommended Products Grid */}
        <div className="lg:col-span-8 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Recommended For You</h3>
              <p className="text-xs text-slate-500">Curated based on your browsing habits and high rating satisfaction</p>
            </div>
            <button
              onClick={() => onNavigate('search')}
              className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-64 rounded-2xl bg-slate-100 dark:bg-slate-800/60 animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {recommended.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onSelectProduct={onSelectProduct}
                />
              ))}
            </div>
          )}
        </div>

        {/* Trending Products Sidebar */}
        <div className="lg:col-span-4 bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-3xl p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-rose-500" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Trending Products</h3>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400">
              Hot Deals
            </span>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {trending.map((prod, idx) => (
              <div
                key={prod.id}
                onClick={() => onSelectProduct(prod.id)}
                className="py-3 flex items-center gap-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 p-2 rounded-xl transition cursor-pointer group"
              >
                <span className="text-xs font-black text-slate-300 dark:text-slate-600 w-4 text-center">
                  #{idx + 1}
                </span>
                <img
                  src={prod.image_url}
                  alt={prod.name}
                  className="w-12 h-12 object-cover rounded-xl bg-slate-100 dark:bg-slate-800 shrink-0 group-hover:scale-105 transition"
                />
                <div className="flex-1 min-w-0">
                  <span className="text-[10px] uppercase font-bold text-blue-600 dark:text-blue-400">
                    {prod.brand}
                  </span>
                  <h4 className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate group-hover:text-blue-500 transition">
                    {prod.name}
                  </h4>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs font-bold text-slate-900 dark:text-white">
                      {formatPrice(prod.price)}
                    </span>
                    {prod.discount_percent > 0 && (
                      <span className="text-[10px] font-bold text-emerald-500">
                        {prod.discount_percent}% off
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={() => onNavigate('search')}
            className="w-full py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-blue-500 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-blue-500 transition cursor-pointer text-center block"
          >
            Explore Catalog (1,000+ Products)
          </button>
        </div>
      </div>
    </div>
  );
}
