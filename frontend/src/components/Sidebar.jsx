import React from 'react';
import {
  LayoutDashboard,
  Bot,
  Search,
  Scale,
  Heart,
  LineChart,
  ShoppingBag,
  User,
  Settings,
  ShieldAlert,
  LogOut,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCartWishlist } from '../context/CartWishlistContext';

export default function Sidebar({ currentPage, setCurrentPage }) {
  const { user, logout } = useAuth();
  const { wishlist, compareList } = useCartWishlist();

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'assistant', label: 'AI Shopping Assistant', icon: Bot, isHighlight: true },
    { id: 'search', label: 'Product Search', icon: Search },
    { id: 'compare', label: 'Compare Products', icon: Scale, badge: compareList.length },
    { id: 'wishlist', label: 'Wishlist', icon: Heart, badge: wishlist.length },
    { id: 'price-tracker', label: 'Price Tracker', icon: LineChart },
    { id: 'orders', label: 'Order History', icon: ShoppingBag },
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'settings', label: 'Settings', icon: Settings },
    { id: 'admin', label: 'Admin Dashboard', icon: ShieldAlert, badge: 'PRO' },
  ];

  return (
    <aside className="w-64 shrink-0 bg-white dark:bg-[#111827] border-r border-slate-200 dark:border-slate-800 flex flex-col h-screen sticky top-0 transition-colors z-30 select-none">
      {/* Brand Header */}
      <div className="h-18 px-6 flex items-center gap-3 border-b border-slate-100 dark:border-slate-800/80">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-400 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
          <Bot className="w-5 h-5" />
        </div>
        <div>
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-lg text-slate-900 dark:text-white tracking-tight">ShopSmart</span>
            <span className="text-xs font-extrabold px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-950/70 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
              AI
            </span>
          </div>
          <span className="text-[11px] text-slate-400 font-medium">Smart Shopping Assistant</span>
        </div>
      </div>

      {/* Nav Menu */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setCurrentPage(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all duration-150 cursor-pointer text-left ${
                isActive
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/30'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/70 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4.5 h-4.5 shrink-0 ${isActive ? 'text-white' : item.isHighlight ? 'text-blue-500' : 'text-slate-400 dark:text-slate-500'}`} />
                <span className="truncate">{item.label}</span>
              </div>
              
              {item.badge !== undefined && item.badge !== 0 && (
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  isActive
                    ? 'bg-blue-800 text-white'
                    : typeof item.badge === 'string'
                      ? 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800'
                      : 'bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400'
                }`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* User Quick Info & Logout */}
      <div className="p-3 border-t border-slate-100 dark:border-slate-800/80">
        <button
          onClick={() => {
            if (user) {
              logout();
            } else {
              setCurrentPage('auth');
            }
          }}
          className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition cursor-pointer"
        >
          <LogOut className="w-4.5 h-4.5" />
          <span>{user ? 'Log Out' : 'Sign In'}</span>
        </button>
      </div>
    </aside>
  );
}
