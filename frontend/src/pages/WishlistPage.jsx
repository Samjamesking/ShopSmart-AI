import React, { useState } from 'react';
import {
  Heart,
  Bell,
  Trash2,
  ShoppingBag,
  Share2,
  Check,
  Sparkles,
  ArrowRight,
  TrendingDown
} from 'lucide-react';
import { useCartWishlist } from '../context/CartWishlistContext';
import { useTheme } from '../context/ThemeContext';
import { api } from '../services/api';

export default function WishlistPage({ onSelectProduct }) {
  const { wishlist, toggleWishlist, triggerConfetti, refreshWishlist } = useCartWishlist();
  const { formatPrice } = useTheme();

  const [copiedLink, setCopiedLink] = useState(false);
  const [editingTargetId, setEditingTargetId] = useState(null);
  const [tempTargetPrice, setTempTargetPrice] = useState('');

  const handleShareWishlist = () => {
    navigator.clipboard.writeText(window.location.origin + '/?shared_wishlist=sammya');
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleSaveTarget = async (productId) => {
    const num = parseFloat(tempTargetPrice);
    if (!isNaN(num) && num > 0) {
      await api.updateWishlistItem(productId, num, true);
      refreshWishlist();
      setEditingTargetId(null);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <Heart className="w-6 h-6 text-rose-500 fill-rose-500" />
            <span>Smart Wishlist & Price Drops</span>
          </h1>
          <p className="text-xs text-slate-500">
            Track your favorite items, configure target prices, and get automated price drop alerts
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleShareWishlist}
            className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-blue-500 text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2 transition cursor-pointer"
          >
            {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Share2 className="w-3.5 h-3.5" />}
            <span>{copiedLink ? 'Link Copied!' : 'Share Wishlist'}</span>
          </button>
        </div>
      </div>

      {/* Wishlist Items List */}
      {wishlist.length === 0 ? (
        <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-3xl p-12 text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-rose-50 dark:bg-rose-950/40 text-rose-500 flex items-center justify-center mx-auto">
            <Heart className="w-8 h-8" />
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">Your wishlist is empty</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Explore our catalog and click the heart icon on any product to start tracking prices and alerts!
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {wishlist.map((item) => {
            const prod = item.product || {};
            const isTargetMet = prod.price && item.target_price && prod.price <= item.target_price;

            return (
              <div
                key={item.id}
                className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-3xl p-4 sm:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm hover:border-blue-400 dark:hover:border-blue-500 transition"
              >
                {/* Product Thumbnail & Title */}
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <img
                    src={prod.image_url}
                    alt={prod.name}
                    className="w-18 h-18 object-cover rounded-2xl bg-slate-100 dark:bg-slate-800 shrink-0"
                  />
                  <div className="min-w-0">
                    <span className="text-[10px] uppercase font-bold text-blue-600 dark:text-blue-400">
                      {prod.brand}
                    </span>
                    <h3
                      onClick={() => onSelectProduct(prod.id)}
                      className="text-sm font-bold text-slate-900 dark:text-white truncate hover:text-blue-500 cursor-pointer"
                    >
                      {prod.name}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-base font-extrabold text-slate-900 dark:text-white">
                        {formatPrice(prod.price)}
                      </span>
                      {prod.original_price > prod.price && (
                        <span className="text-xs text-slate-400 line-through">
                          {formatPrice(prod.original_price)}
                        </span>
                      )}
                      {prod.discount_percent > 0 && (
                        <span className="text-[10px] font-bold text-emerald-500">
                          {prod.discount_percent}% off
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Target Price & Alert Configuration */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full md:w-auto">
                  <div className="p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 min-w-[190px]">
                    <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500 mb-1">
                      <span>Target Alert Price:</span>
                      {isTargetMet ? (
                        <span className="text-emerald-500 font-bold flex items-center gap-1">
                          <TrendingDown className="w-3 h-3" /> Met!
                        </span>
                      ) : (
                        <span className="text-blue-500">Tracking</span>
                      )}
                    </div>

                    {editingTargetId === item.id ? (
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          value={tempTargetPrice}
                          onChange={(e) => setTempTargetPrice(e.target.value)}
                          placeholder="Amount in ₹"
                          className="w-24 p-1 text-xs bg-white dark:bg-slate-900 border rounded-lg focus:outline-none"
                        />
                        <button
                          onClick={() => handleSaveTarget(prod.id)}
                          className="px-2 py-1 bg-blue-600 text-white rounded-lg text-[10px] font-bold cursor-pointer"
                        >
                          Save
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                          {formatPrice(item.target_price)}
                        </span>
                        <button
                          onClick={() => {
                            setEditingTargetId(item.id);
                            setTempTargetPrice(item.target_price || '');
                          }}
                          className="text-[11px] text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                        >
                          Edit
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        triggerConfetti();
                        alert(`Purchased ${prod.name}! Order confirmed.`);
                      }}
                      className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition shadow-sm cursor-pointer flex items-center gap-1.5"
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                      <span>Buy Now</span>
                    </button>

                    <button
                      onClick={() => toggleWishlist(prod)}
                      title="Remove from Wishlist"
                      className="p-2.5 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
