import React, { useState } from 'react';
import {
  Search,
  Mic,
  Camera,
  Sun,
  Moon,
  Bell,
  Sparkles,
  ArrowRight,
  ChevronDown
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useCartWishlist } from '../context/CartWishlistContext';

export default function Navbar({ onSearchSubmit, onOpenVoice, onOpenImage, setCurrentPage }) {
  const { user } = useAuth();
  const { isDarkMode, toggleDarkMode } = useTheme();
  const { alerts } = useCartWishlist();
  const [searchInput, setSearchInput] = useState('');
  const [showAlertsDropdown, setShowAlertsDropdown] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (searchInput.trim()) {
      onSearchSubmit(searchInput.trim());
      setSearchInput('');
    }
  };

  return (
    <header className="h-18 px-6 bg-white/80 dark:bg-[#111827]/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 flex items-center justify-between sticky top-0 z-20 transition-colors">
      {/* Global AI Search Input */}
      <form onSubmit={handleSubmit} className="flex-1 max-w-2xl relative">
        <div className="relative flex items-center">
          <div className="absolute left-3.5 text-blue-500 pointer-events-none flex items-center">
            <Sparkles className="w-4.5 h-4.5" />
          </div>
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Ask AI to find products, compare prices, or recommend items..."
            className="w-full pl-10 pr-24 py-2.5 bg-slate-100/80 dark:bg-slate-800/80 border border-transparent focus:border-blue-500 dark:focus:border-blue-500 rounded-xl text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition"
          />
          <div className="absolute right-2 flex items-center gap-1">
            <button
              type="button"
              onClick={onOpenVoice}
              title="Voice Shopping Assistant"
              className="p-1.5 text-slate-400 hover:text-blue-500 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition cursor-pointer"
            >
              <Mic className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={onOpenImage}
              title="Image-Based Shopping"
              className="p-1.5 text-slate-400 hover:text-blue-500 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition cursor-pointer"
            >
              <Camera className="w-4 h-4" />
            </button>
            <button
              type="submit"
              className="p-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition cursor-pointer"
            >
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </form>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        {/* Dark / Light Toggle */}
        <button
          onClick={toggleDarkMode}
          title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
          className="p-2.5 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
        >
          {isDarkMode ? <Sun className="w-4.5 h-4.5 text-amber-400" /> : <Moon className="w-4.5 h-4.5 text-slate-600" />}
        </button>

        {/* Notifications / Price Alerts */}
        <div className="relative">
          <button
            onClick={() => setShowAlertsDropdown(!showAlertsDropdown)}
            className="p-2.5 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition relative cursor-pointer"
          >
            <Bell className="w-4.5 h-4.5" />
            {alerts.length > 0 && (
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            )}
          </button>

          {/* Price Alerts Dropdown */}
          {showAlertsDropdown && (
            <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl py-3 z-50">
              <div className="px-4 pb-2 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <span className="font-semibold text-xs tracking-wider uppercase text-slate-500">Price Drop Alerts</span>
                <span className="text-[11px] font-bold px-1.5 py-0.5 rounded bg-green-100 dark:bg-green-950 text-green-600 dark:text-green-400">
                  {alerts.length} Active
                </span>
              </div>
              <div className="max-h-60 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
                {alerts.length === 0 ? (
                  <div className="p-4 text-center text-xs text-slate-400">
                    No price drops yet. Set target prices in your wishlist!
                  </div>
                ) : (
                  alerts.map((alert, idx) => (
                    <div
                      key={idx}
                      onClick={() => {
                        setShowAlertsDropdown(false);
                        setCurrentPage('price-tracker');
                      }}
                      className="p-3 flex items-center gap-3 hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer transition"
                    >
                      <img src={alert.image_url} alt={alert.name} className="w-10 h-10 rounded-lg object-cover bg-slate-100" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">{alert.name}</p>
                        <p className="text-[11px] text-green-600 dark:text-green-400 font-medium">
                          Dropped to ₹{Number(alert.current_price).toLocaleString()} (Save ₹{Number(alert.saving).toLocaleString()})
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Pill */}
        <div
          onClick={() => setCurrentPage('profile')}
          className="flex items-center gap-2.5 pl-2 pr-3 py-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800/80 cursor-pointer border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition"
        >
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold overflow-hidden shadow-sm">
            {user?.name ? user.name.slice(0, 2).toUpperCase() : 'SK'}
          </div>
          <div className="text-left hidden sm:block">
            <span className="block text-xs font-semibold text-slate-800 dark:text-slate-200 leading-tight">
              {user?.name || 'Sammya'}
            </span>
            <span className="block text-[10px] text-slate-400 capitalize">
              {user?.role || 'Shopper'}
            </span>
          </div>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
        </div>
      </div>
    </header>
  );
}
