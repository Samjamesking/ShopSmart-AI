import React from 'react';
import { Heart, Scale, Star, ArrowUpRight } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useCartWishlist } from '../context/CartWishlistContext';

export default function ProductCard({ product, onSelectProduct }) {
  const { formatPrice } = useTheme();
  const { isWishlisted, toggleWishlist, isComparing, toggleCompare } = useCartWishlist();

  if (!product) return null;

  const wishlisted = isWishlisted(product.id);
  const comparing = isComparing(product.id);

  // Extract a couple of key specs to preview
  const keySpecs = [];
  if (product.specs) {
    if (product.specs.Processor) keySpecs.push(product.specs.Processor);
    else if (product.specs.Display) keySpecs.push(product.specs.Display);
    if (product.specs.RAM) keySpecs.push(product.specs.RAM);
    else if (product.specs.Material) keySpecs.push(product.specs.Material);
  }

  return (
    <div className="group relative bg-white dark:bg-[#111827] border border-slate-200/90 dark:border-slate-800 rounded-2xl p-3.5 flex flex-col justify-between hover:border-blue-400 dark:hover:border-blue-500 hover:shadow-xl hover:shadow-blue-500/5 transition-all duration-300">
      {/* Top Image & Floating Badges */}
      <div className="relative aspect-4/3 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800/50 mb-3 flex items-center justify-center">
        <img
          src={product.image_url}
          alt={product.name}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />

        {/* Discount Badge */}
        {product.discount_percent > 0 && (
          <span className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-md bg-emerald-500 text-white font-bold text-[11px] shadow-sm">
            {product.discount_percent}% OFF
          </span>
        )}

        {/* Quick Actions (Wishlist & Compare) */}
        <div className="absolute top-2.5 right-2.5 flex flex-col gap-1.5 opacity-90 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleWishlist(product);
            }}
            title={wishlisted ? "Remove from Wishlist" : "Add to Wishlist"}
            className={`p-2 rounded-xl backdrop-blur-md transition-all shadow-sm cursor-pointer ${
              wishlisted
                ? 'bg-rose-500 text-white'
                : 'bg-white/80 dark:bg-slate-900/80 text-slate-600 dark:text-slate-300 hover:text-rose-500'
            }`}
          >
            <Heart className={`w-3.5 h-3.5 ${wishlisted ? 'fill-current' : ''}`} />
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleCompare(product);
            }}
            title={comparing ? "Remove from Compare" : "Add to Compare"}
            className={`p-2 rounded-xl backdrop-blur-md transition-all shadow-sm cursor-pointer ${
              comparing
                ? 'bg-blue-600 text-white'
                : 'bg-white/80 dark:bg-slate-900/80 text-slate-600 dark:text-slate-300 hover:text-blue-500'
            }`}
          >
            <Scale className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Body Info */}
      <div className="flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400">
              {product.brand}
            </span>
            <div className="flex items-center gap-1 text-xs font-semibold text-amber-500">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span>{product.rating}</span>
              <span className="text-[11px] text-slate-400 font-normal">({product.rating_count})</span>
            </div>
          </div>

          <h3
            onClick={() => onSelectProduct && onSelectProduct(product.id)}
            className="text-sm font-semibold text-slate-800 dark:text-slate-200 line-clamp-2 hover:text-blue-600 dark:hover:text-blue-400 transition cursor-pointer mb-2"
          >
            {product.name}
          </h3>

          {/* Key Spec Chips */}
          {keySpecs.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-3">
              {keySpecs.slice(0, 2).map((spec, idx) => (
                <span
                  key={idx}
                  className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-medium truncate max-w-[130px]"
                >
                  {spec}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Price & CTA */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between mt-1">
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-base font-bold text-slate-900 dark:text-white">
                {formatPrice(product.price)}
              </span>
              {product.original_price > product.price && (
                <span className="text-xs text-slate-400 line-through">
                  {formatPrice(product.original_price)}
                </span>
              )}
            </div>
          </div>

          <button
            onClick={() => onSelectProduct && onSelectProduct(product.id)}
            className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-blue-600 hover:text-white dark:hover:bg-blue-600 dark:hover:text-white text-xs font-semibold text-slate-700 dark:text-slate-300 transition-all flex items-center gap-1 cursor-pointer"
          >
            <span>View</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
