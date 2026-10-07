import React, { useState } from 'react';
import {
  User,
  Settings,
  Moon,
  Sun,
  Bell,
  Globe,
  ShieldCheck,
  LogOut,
  Heart,
  Search,
  ShoppingBag,
  Sparkles,
  Save,
  Check
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

export default function ProfilePage() {
  const { user, updatePreferences, logout } = useAuth();
  const { isDarkMode, toggleDarkMode, currency, toggleCurrency } = useTheme();

  const userPrefs = user?.preferences || {};
  const [favoriteBrands, setFavoriteBrands] = useState(userPrefs.favorite_brands || ['Apple', 'Sony', 'ASUS', 'Nike']);
  const [minBudget, setMinBudget] = useState(userPrefs.budget_range?.min || 1000);
  const [maxBudget, setMaxBudget] = useState(userPrefs.budget_range?.max || 100000);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [isSaved, setIsSaved] = useState(false);

  const availableBrandOptions = ['Apple', 'Samsung', 'Sony', 'ASUS', 'Dell', 'HP', 'Lenovo', 'Nike', 'Adidas', 'boAt', 'Philips', 'LG'];

  const toggleBrand = (b) => {
    if (favoriteBrands.includes(b)) {
      setFavoriteBrands(favoriteBrands.filter(item => item !== b));
    } else {
      setFavoriteBrands([...favoriteBrands, b]);
    }
  };

  const handleSave = async () => {
    await updatePreferences({
      favorite_brands: favoriteBrands,
      budget_range: { min: Number(minBudget), max: Number(maxBudget) },
      categories: ['Electronics', 'Fashion'],
      dark_mode: isDarkMode,
      currency
    });
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6 animate-in fade-in duration-300">
      <div>
        <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
          <User className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          <span>Profile & Personalized AI Memory</span>
        </h1>
        <p className="text-xs text-slate-500">
          Manage your account preferences, theme settings, and teaching the AI shopping agent your affinities
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        {/* Left Column: User Card & Settings */}
        <div className="md:col-span-5 bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-6">
          {/* Avatar & Info */}
          <div className="text-center space-y-2">
            <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-black text-2xl flex items-center justify-center mx-auto shadow-lg shadow-blue-500/20">
              {user?.name ? user.name.slice(0, 2).toUpperCase() : 'SK'}
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">{user?.name || 'Sammya Kar Gupta'}</h2>
              <p className="text-xs text-slate-400">{user?.email || 'sammya@shopsmart.ai'}</p>
            </div>
            <span className="inline-block text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400">
              {user?.role === 'admin' ? 'Administrator' : 'Verified Prime Member'}
            </span>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-3 gap-2 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 text-center">
            <div>
              <span className="text-sm font-extrabold text-slate-900 dark:text-white">12</span>
              <p className="text-[10px] text-slate-400 font-medium">Saved Items</p>
            </div>
            <div>
              <span className="text-sm font-extrabold text-slate-900 dark:text-white">28</span>
              <p className="text-[10px] text-slate-400 font-medium">AI Queries</p>
            </div>
            <div>
              <span className="text-sm font-extrabold text-slate-900 dark:text-white">3</span>
              <p className="text-[10px] text-slate-400 font-medium">Orders</p>
            </div>
          </div>

          {/* Preferences Toggles */}
          <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Settings</h3>

            <div className="flex items-center justify-between py-1">
              <div className="flex items-center gap-2.5 text-xs font-semibold text-slate-700 dark:text-slate-300">
                {isDarkMode ? <Moon className="w-4 h-4 text-indigo-400" /> : <Sun className="w-4 h-4 text-amber-500" />}
                <span>Dark Theme</span>
              </div>
              <button
                onClick={toggleDarkMode}
                className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                  isDarkMode ? 'bg-blue-600' : 'bg-slate-300'
                }`}
              >
                <span className={`block w-4 h-4 rounded-full bg-white transition-transform ${
                  isDarkMode ? 'translate-x-6' : 'translate-x-1'
                }`} />
              </button>
            </div>

            <div className="flex items-center justify-between py-1">
              <div className="flex items-center gap-2.5 text-xs font-semibold text-slate-700 dark:text-slate-300">
                <Bell className="w-4 h-4 text-blue-500" />
                <span>Price Drop Alerts</span>
              </div>
              <button
                onClick={() => setNotificationsEnabled(!notificationsEnabled)}
                className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                  notificationsEnabled ? 'bg-blue-600' : 'bg-slate-300'
                }`}
              >
                <span className={`block w-4 h-4 rounded-full bg-white transition-transform ${
                  notificationsEnabled ? 'translate-x-6' : 'translate-x-1'
                }`} />
              </button>
            </div>

            <div className="flex items-center justify-between py-1">
              <div className="flex items-center gap-2.5 text-xs font-semibold text-slate-700 dark:text-slate-300">
                <Globe className="w-4 h-4 text-emerald-500" />
                <span>Display Currency</span>
              </div>
              <div className="flex rounded-lg bg-slate-100 dark:bg-slate-800 p-0.5 text-xs font-bold">
                <button
                  onClick={() => toggleCurrency('INR')}
                  className={`px-2 py-0.5 rounded-md transition cursor-pointer ${
                    currency === 'INR' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-500'
                  }`}
                >
                  ₹ INR
                </button>
                <button
                  onClick={() => toggleCurrency('USD')}
                  className={`px-2 py-0.5 rounded-md transition cursor-pointer ${
                    currency === 'USD' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-500'
                  }`}
                >
                  $ USD
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: AI Memory & Affinity Engine */}
        <div className="md:col-span-7 bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-6">
          <div className="pb-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Personalized AI Memory</h3>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
              Active Context
            </span>
          </div>

          <p className="text-xs text-slate-500 leading-relaxed">
            Our AI Shopping Agent remembers your favorite brands and budget limits to deliver ultra-personalized recommendations in the chat concierge and dashboard feeds.
          </p>

          {/* Favorite Brands */}
          <div className="space-y-2.5">
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
              Favorite Brands:
            </span>
            <div className="flex flex-wrap gap-2">
              {availableBrandOptions.map((brand) => {
                const isSelected = favoriteBrands.includes(brand);
                return (
                  <button
                    key={brand}
                    onClick={() => toggleBrand(brand)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                      isSelected
                        ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    <span>{brand}</span>
                    {isSelected && <Check className="w-3 h-3" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Budget Limits */}
          <div className="space-y-2.5">
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
              Default Budget Range (₹):
            </span>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Minimum (₹)</label>
                <input
                  type="number"
                  value={minBudget}
                  onChange={(e) => setMinBudget(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 font-semibold focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Maximum (₹)</label>
                <input
                  type="number"
                  value={maxBudget}
                  onChange={(e) => setMaxBudget(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 font-semibold focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="pt-2">
            <button
              onClick={handleSave}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition shadow-sm cursor-pointer flex items-center gap-2"
            >
              {isSaved ? <Check className="w-4 h-4 text-emerald-300" /> : <Save className="w-4 h-4" />}
              <span>{isSaved ? 'Preferences Saved!' : 'Save AI Preferences'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
