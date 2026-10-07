import React, { useState, useEffect } from 'react';
import {
  Search,
  Filter,
  X,
  SlidersHorizontal,
  ChevronDown,
  Star,
  Check,
  RotateCcw
} from 'lucide-react';
import { api } from '../services/api';
import { useTheme } from '../context/ThemeContext';
import ProductCard from '../components/ProductCard';

export default function ProductsPage({ initialSearch, onSelectProduct }) {
  const { formatPrice, currency } = useTheme();

  const [products, setProducts] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // Filters state
  const [searchQuery, setSearchQuery] = useState(initialSearch || '');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('');
  const [maxPrice, setMaxPrice] = useState(200000);
  const [minRating, setMinRating] = useState(0);
  const [sortBy, setSortBy] = useState('relevance');
  const [page, setPage] = useState(1);

  // Available filter options from backend
  const [filterOptions, setFilterOptions] = useState({
    categories: ['Electronics', 'Fashion', 'Home Appliances', 'Books', 'Sports Equipment'],
    brands: ['Apple', 'Samsung', 'Sony', 'ASUS', 'Dell', 'HP', 'Lenovo', 'Nike', 'Adidas', 'boAt', 'Philips', 'LG'],
    min_price: 0,
    max_price: 200000
  });

  useEffect(() => {
    async function loadFilters() {
      try {
        const filters = await api.getProductFilters();
        if (filters) {
          setFilterOptions(filters);
          if (filters.max_price) setMaxPrice(filters.max_price);
        }
      } catch (e) {
        console.error("Failed to load filter metadata", e);
      }
    }
    loadFilters();
  }, []);

  useEffect(() => {
    if (initialSearch !== undefined) {
      setSearchQuery(initialSearch);
      setPage(1);
    }
  }, [initialSearch]);

  useEffect(() => {
    async function fetchProducts() {
      setLoading(true);
      try {
        const res = await api.listProducts({
          q: searchQuery,
          category: selectedCategory || undefined,
          brand: selectedBrand || undefined,
          max_price: maxPrice,
          min_rating: minRating || undefined,
          sort_by: sortBy,
          page,
          limit: 18
        });

        setProducts(res.items || []);
        setTotalCount(res.total || 0);
      } catch (e) {
        console.error("Products search error", e);
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, [searchQuery, selectedCategory, selectedBrand, maxPrice, minRating, sortBy, page]);

  const handleResetFilters = () => {
    setSelectedCategory('');
    setSelectedBrand('');
    setMaxPrice(filterOptions.max_price || 200000);
    setMinRating(0);
    setSortBy('relevance');
    setSearchQuery('');
    setPage(1);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-300">
      {/* Top Header & Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Product Search & Discovery
          </h1>
          <p className="text-xs text-slate-500">
            Browse across 1,000+ verified products with smart vector search & parametric filters
          </p>
        </div>

        {/* Local Search input */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setPage(1);
            }}
            placeholder="Filter by name, spec, or tag..."
            className="w-full pl-9 pr-4 py-2 bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-blue-500"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Main Grid: Filters Sidebar + Results */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Filter Sidebar */}
        <aside className="lg:col-span-3 bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-3xl p-5 space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Filters</h3>
            </div>
            <button
              onClick={handleResetFilters}
              title="Reset all filters"
              className="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          </div>

          {/* Price Range Slider */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="text-slate-700 dark:text-slate-300">Max Price</span>
              <span className="text-blue-600 dark:text-blue-400 font-bold">{formatPrice(maxPrice)}</span>
            </div>
            <input
              type="range"
              min={1000}
              max={200000}
              step={2000}
              value={maxPrice}
              onChange={(e) => {
                setMaxPrice(Number(e.target.value));
                setPage(1);
              }}
              className="w-full accent-blue-600 cursor-pointer"
            />
            <div className="flex justify-between text-[11px] text-slate-400 font-medium">
              <span>{formatPrice(0)}</span>
              <span>{formatPrice(200000)}</span>
            </div>
          </div>

          {/* Category Filter */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Category</h4>
            <div className="space-y-1">
              <button
                onClick={() => {
                  setSelectedCategory('');
                  setPage(1);
                }}
                className={`w-full flex items-center justify-between px-3 py-1.5 rounded-xl text-xs font-medium transition cursor-pointer text-left ${
                  selectedCategory === ''
                    ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 font-bold'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <span>All Categories</span>
                {selectedCategory === '' && <Check className="w-3.5 h-3.5" />}
              </button>
              {filterOptions.categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => {
                    setSelectedCategory(selectedCategory === cat ? '' : cat);
                    setPage(1);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-1.5 rounded-xl text-xs font-medium transition cursor-pointer text-left ${
                    selectedCategory === cat
                      ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 font-bold'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <span>{cat}</span>
                  {selectedCategory === cat && <Check className="w-3.5 h-3.5" />}
                </button>
              ))}
            </div>
          </div>

          {/* Brand Filter */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Brand</h4>
            <div className="max-h-48 overflow-y-auto space-y-1 pr-1">
              {filterOptions.brands.slice(0, 15).map((brand) => (
                <button
                  key={brand}
                  onClick={() => {
                    setSelectedBrand(selectedBrand === brand ? '' : brand);
                    setPage(1);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-1.5 rounded-xl text-xs font-medium transition cursor-pointer text-left ${
                    selectedBrand === brand
                      ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 font-bold'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <span>{brand}</span>
                  {selectedBrand === brand && <Check className="w-3.5 h-3.5" />}
                </button>
              ))}
            </div>
          </div>

          {/* Rating Filter */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Minimum Rating</h4>
            <div className="space-y-1">
              {[4.5, 4.0, 3.5].map((stars) => (
                <button
                  key={stars}
                  onClick={() => {
                    setMinRating(minRating === stars ? 0 : stars);
                    setPage(1);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-1.5 rounded-xl text-xs font-medium transition cursor-pointer ${
                    minRating === stars
                      ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 font-bold'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span>{stars}★ & above</span>
                  </div>
                  {minRating === stars && <Check className="w-3.5 h-3.5" />}
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* Right Search Results */}
        <main className="lg:col-span-9 space-y-4">
          {/* Status & Sort Dropdown */}
          <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-2xl px-4 py-3 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                {searchQuery ? `Search Results for "${searchQuery}"` : 'All Products Catalog'}
              </span>
              <span className="text-xs text-slate-400">
                (Showing {products.length} of {totalCount} items)
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 font-medium">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => {
                  setSortBy(e.target.value);
                  setPage(1);
                }}
                className="bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-semibold px-3 py-1.5 rounded-xl border border-transparent focus:border-blue-500 focus:outline-none cursor-pointer"
              >
                <option value="relevance">Relevance</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
                <option value="discount">Biggest Discount</option>
              </select>
            </div>
          </div>

          {/* Results Grid */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {[...Array(9)].map((_, i) => (
                <div key={i} className="h-72 rounded-2xl bg-slate-100 dark:bg-slate-800/60 animate-pulse" />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-3xl p-12 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
                <Search className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">No products found</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                No items matched your selected filters or search terms. Try clearing some filters.
              </p>
              <button
                onClick={handleResetFilters}
                className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-semibold hover:bg-blue-700 transition cursor-pointer"
              >
                Clear All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onSelectProduct={onSelectProduct}
                />
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalCount > 18 && (
            <div className="flex items-center justify-center gap-2 pt-4">
              <button
                disabled={page <= 1}
                onClick={() => setPage(p => p - 1)}
                className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
              >
                Previous
              </button>
              <span className="text-xs font-bold text-slate-600 dark:text-slate-400 px-3">
                Page {page} of {Math.ceil(totalCount / 18)}
              </span>
              <button
                disabled={page >= Math.ceil(totalCount / 18)}
                onClick={() => setPage(p => p + 1)}
                className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
              >
                Next
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
