import React, { useState, useEffect } from 'react';
import {
  Star,
  Heart,
  Scale,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  ArrowLeft,
  ShoppingBag,
  TrendingDown,
  Clock,
  ShieldCheck,
  Truck,
  RotateCcw,
  MessageSquarePlus
} from 'lucide-react';
import { api } from '../services/api';
import { useTheme } from '../context/ThemeContext';
import { useCartWishlist } from '../context/CartWishlistContext';
import PriceGraph from '../components/PriceGraph';
import ProductCard from '../components/ProductCard';

export default function ProductDetailPage({ productId, onBack, onSelectProduct }) {
  const { formatPrice } = useTheme();
  const { isWishlisted, toggleWishlist, isComparing, toggleCompare, triggerConfetti } = useCartWishlist();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'specs' | 'reviews' | 'price'
  const [activeImage, setActiveImage] = useState('');

  // Review Form state
  const [newRating, setNewRating] = useState(5.0);
  const [newReviewText, setNewReviewText] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [reviewSubmitMessage, setReviewSubmitMessage] = useState(null);

  useEffect(() => {
    async function loadDetail() {
      setLoading(true);
      try {
        const data = await api.getProductDetail(productId);
        setProduct(data);
        setActiveImage(data.image_url);
      } catch (e) {
        console.error("Product detail error", e);
      } finally {
        setLoading(false);
      }
    }
    if (productId) loadDetail();
  }, [productId]);

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!newReviewText.trim()) return;
    setIsSubmittingReview(true);
    try {
      const res = await api.submitReview(productId, newRating, newReviewText.trim());
      setReviewSubmitMessage("Thank you! Your verified review has been posted and factored into the AI sentiment score.");
      setNewReviewText('');
      // Reload product data to refresh reviews
      const updated = await api.getProductDetail(productId);
      setProduct(updated);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 max-w-6xl mx-auto space-y-6 animate-pulse">
        <div className="h-6 w-32 bg-slate-200 dark:bg-slate-800 rounded-lg" />
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          <div className="md:col-span-6 h-96 bg-slate-200 dark:bg-slate-800 rounded-3xl" />
          <div className="md:col-span-6 space-y-4">
            <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded-xl" />
            <div className="h-20 bg-slate-200 dark:bg-slate-800 rounded-xl" />
            <div className="h-40 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="p-12 text-center">
        <p className="text-sm text-slate-500">Product not found.</p>
        <button onClick={onBack} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-semibold cursor-pointer">
          Go Back
        </button>
      </div>
    );
  }

  const wishlisted = isWishlisted(product.id);
  const comparing = isComparing(product.id);
  const aiSummary = product.ai_summary || {};
  const pricePrediction = product.price_prediction || {};

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-300">
      {/* Breadcrumbs & Back */}
      <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
        <button onClick={onBack} className="hover:text-blue-600 flex items-center gap-1 cursor-pointer">
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Products</span>
        </button>
        <span>/</span>
        <span>{product.category}</span>
        <span>/</span>
        <span className="text-slate-800 dark:text-slate-200 truncate max-w-xs">{product.name}</span>
      </div>

      {/* Hero Section: Left Image Gallery, Middle Specs & Pricing, Right AI Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Gallery */}
        <div className="lg:col-span-5 space-y-3">
          <div className="relative aspect-4/3 rounded-3xl overflow-hidden bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-800 flex items-center justify-center shadow-sm">
            <img
              src={activeImage || product.image_url}
              alt={product.name}
              className="w-full h-full object-cover"
            />
            {product.discount_percent > 0 && (
              <span className="absolute top-4 left-4 px-2.5 py-1 rounded-xl bg-emerald-500 text-white font-extrabold text-xs shadow-md">
                {product.discount_percent}% OFF
              </span>
            )}
          </div>

          {/* Thumbnails */}
          {product.additional_images && product.additional_images.length > 1 && (
            <div className="flex gap-2">
              {product.additional_images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImage(img)}
                  className={`w-16 h-16 rounded-xl overflow-hidden border-2 cursor-pointer transition ${
                    activeImage === img ? 'border-blue-600' : 'border-transparent opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt="Thumb" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}

          {/* Perks */}
          <div className="grid grid-cols-3 gap-2 pt-2 text-center">
            <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800/50 text-[11px] font-medium text-slate-600 dark:text-slate-400">
              <Truck className="w-4 h-4 mx-auto mb-1 text-blue-500" />
              Free Delivery
            </div>
            <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800/50 text-[11px] font-medium text-slate-600 dark:text-slate-400">
              <ShieldCheck className="w-4 h-4 mx-auto mb-1 text-emerald-500" />
              Verified Brand
            </div>
            <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800/50 text-[11px] font-medium text-slate-600 dark:text-slate-400">
              <RotateCcw className="w-4 h-4 mx-auto mb-1 text-indigo-500" />
              7-Day Returns
            </div>
          </div>
        </div>

        {/* Center: Details & Actions */}
        <div className="lg:col-span-4 space-y-4">
          <div>
            <span className="text-xs uppercase font-extrabold text-blue-600 dark:text-blue-400 tracking-wider">
              {product.brand}
            </span>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white mt-1 leading-snug">
              {product.name}
            </h1>
            <div className="flex items-center gap-2 mt-2">
              <div className="flex items-center gap-1 text-amber-500 font-bold text-xs">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                <span>{product.rating}</span>
              </div>
              <span className="text-xs text-slate-400">
                ({product.rating_count} verified ratings)
              </span>
            </div>
          </div>

          {/* Price Box */}
          <div className="p-4 rounded-2xl bg-slate-100/80 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 space-y-1">
            <div className="flex items-baseline gap-2.5">
              <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
                {formatPrice(product.price)}
              </span>
              {product.original_price > product.price && (
                <span className="text-sm text-slate-400 line-through">
                  {formatPrice(product.original_price)}
                </span>
              )}
              {product.discount_percent > 0 && (
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                  Save {formatPrice(product.original_price - product.price)}
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-400">Inclusive of all taxes & standard delivery fees</p>
          </div>

          {/* Key Spec Chips */}
          {product.specs && Object.keys(product.specs).length > 0 && (
            <div className="space-y-1.5">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Key Highlights:</span>
              <div className="flex flex-wrap gap-1.5">
                {Object.entries(product.specs).slice(0, 5).map(([key, val], idx) => (
                  <div
                    key={idx}
                    className="text-xs px-2.5 py-1 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-medium"
                  >
                    <span className="text-slate-400 font-normal">{key}: </span>
                    <span>{String(val)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action CTAs */}
          <div className="space-y-2 pt-2">
            <button
              onClick={() => {
                triggerConfetti();
                alert(`Order placed successfully for ${product.name}! Your AI savings have been applied.`);
              }}
              className="w-full py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-lg shadow-blue-500/25 transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Buy Now ({formatPrice(product.price)})</span>
            </button>

            <div className="flex gap-2">
              <button
                onClick={() => toggleWishlist(product)}
                className={`flex-1 py-2.5 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                  wishlisted
                    ? 'bg-rose-50 dark:bg-rose-950/50 border-rose-400 text-rose-600 dark:text-rose-400'
                    : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-rose-400 hover:text-rose-500'
                }`}
              >
                <Heart className={`w-3.5 h-3.5 ${wishlisted ? 'fill-current' : ''}`} />
                <span>{wishlisted ? 'Saved in Wishlist' : 'Add to Wishlist'}</span>
              </button>

              <button
                onClick={() => toggleCompare(product)}
                className={`flex-1 py-2.5 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                  comparing
                    ? 'bg-blue-50 dark:bg-blue-950/50 border-blue-400 text-blue-600 dark:text-blue-400'
                    : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-blue-400 hover:text-blue-500'
                }`}
              >
                <Scale className="w-3.5 h-3.5" />
                <span>{comparing ? 'Added to Compare' : 'Compare'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right: AI Summary & Recommendation Score */}
        <div className="lg:col-span-3 bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-3xl p-5 space-y-4 shadow-sm">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">AI Summary</h3>
            </div>
            <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400">
              NLP Verified
            </span>
          </div>

          {/* AI Recommendation Score Badge */}
          <div className="p-3 rounded-2xl bg-gradient-to-tr from-blue-50 to-indigo-50 dark:from-blue-950/40 dark:to-indigo-950/30 border border-blue-100 dark:border-blue-900/50 flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-blue-600 text-white flex flex-col items-center justify-center shrink-0">
              <span className="text-base font-black leading-none">{aiSummary.ai_recommendation_score || '8.5'}</span>
              <span className="text-[9px] font-bold opacity-80">/ 10</span>
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900 dark:text-white">AI Recommendation Score</h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight mt-0.5">
                {aiSummary.verdict_label || 'Great choice for everyday performance & durability'}
              </p>
            </div>
          </div>

          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            {aiSummary.ai_summary || product.description}
          </p>

          {/* Pros */}
          {aiSummary.most_mentioned_advantages && (
            <div className="space-y-1.5 pt-1">
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Top Advantages (Pros)</span>
              </span>
              <ul className="space-y-1">
                {aiSummary.most_mentioned_advantages.map((pro, idx) => (
                  <li key={idx} className="text-xs text-slate-600 dark:text-slate-400 flex items-start gap-2">
                    <span className="text-emerald-500 font-bold">•</span>
                    <span>{pro}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Cons */}
          {aiSummary.most_mentioned_complaints && (
            <div className="space-y-1.5 pt-1">
              <span className="text-xs font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Considerations (Cons)</span>
              </span>
              <ul className="space-y-1">
                {aiSummary.most_mentioned_complaints.map((con, idx) => (
                  <li key={idx} className="text-xs text-slate-600 dark:text-slate-400 flex items-start gap-2">
                    <span className="text-amber-500 font-bold">•</span>
                    <span>{con}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Tabs Section */}
      <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 space-y-6">
        {/* Tab Headers */}
        <div className="flex border-b border-slate-100 dark:border-slate-800 gap-6">
          {[
            { id: 'overview', label: 'Overview' },
            { id: 'specs', label: 'Specifications' },
            { id: 'price', label: 'Price History & Tracker' },
            { id: 'reviews', label: `Reviews (${product.recent_reviews?.length || 0})` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`pb-3 text-sm font-bold border-b-2 transition cursor-pointer ${
                activeTab === tab.id
                  ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab: Overview */}
        {activeTab === 'overview' && (
          <div className="space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Product Description</h3>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed max-w-4xl">
              {product.description}
            </p>
          </div>
        )}

        {/* Tab: Specifications */}
        {activeTab === 'specs' && (
          <div className="space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Technical Specifications</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-4xl">
              {product.specs && Object.entries(product.specs).map(([key, val], idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 flex justify-between text-xs"
                >
                  <span className="font-semibold text-slate-500">{key}</span>
                  <span className="font-bold text-slate-900 dark:text-white text-right">{String(val)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab: Price History & Tracker */}
        {activeTab === 'price' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
                <span className="text-xs text-slate-400 font-medium">Current Price</span>
                <p className="text-xl font-extrabold text-slate-900 dark:text-white mt-1">
                  {formatPrice(product.price)}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800">
                <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
                  Lowest Recorded Price
                </span>
                <p className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">
                  {formatPrice(product.lowest_recorded_price)}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
                <span className="text-xs text-slate-400 font-medium">Highest Recorded Price</span>
                <p className="text-xl font-extrabold text-slate-900 dark:text-white mt-1">
                  {formatPrice(product.highest_recorded_price)}
                </p>
              </div>
            </div>

            {/* AI Price Prediction Alert */}
            {pricePrediction.prediction && (
              <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 flex items-center gap-3">
                <Sparkles className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0" />
                <div>
                  <h4 className="text-xs font-bold text-blue-900 dark:text-blue-200">
                    AI Price Prediction ({pricePrediction.confidence}% Confidence)
                  </h4>
                  <p className="text-xs text-blue-700 dark:text-blue-300 mt-0.5">
                    {pricePrediction.prediction}
                  </p>
                </div>
              </div>
            )}

            {/* Interactive Graph */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                6-Month Price Trend
              </h4>
              <PriceGraph history={product.price_history} lowestPrice={product.lowest_recorded_price} />
            </div>
          </div>
        )}

        {/* Tab: Reviews & Sentiment */}
        {activeTab === 'reviews' && (
          <div className="space-y-6">
            {/* Sentiment Index Bar */}
            {aiSummary.positive_percentage !== undefined && (
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 space-y-2">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-emerald-600">👍 Positive: {aiSummary.positive_percentage}%</span>
                  <span className="text-slate-500">Neutral: {aiSummary.neutral_percentage}%</span>
                  <span className="text-rose-600">👎 Negative: {aiSummary.negative_percentage}%</span>
                </div>
                <div className="w-full h-3 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden flex">
                  <div style={{ width: `${aiSummary.positive_percentage}%` }} className="bg-emerald-500 h-full" />
                  <div style={{ width: `${aiSummary.neutral_percentage}%` }} className="bg-slate-400 h-full" />
                  <div style={{ width: `${aiSummary.negative_percentage}%` }} className="bg-rose-500 h-full" />
                </div>
              </div>
            )}

            {/* Write a Review Form */}
            <form onSubmit={handleReviewSubmit} className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <MessageSquarePlus className="w-4 h-4 text-blue-500" />
                <span>Write a Verified Customer Review</span>
              </h4>

              <div className="flex items-center gap-3">
                <span className="text-xs text-slate-400">Rating:</span>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setNewRating(star)}
                      className="cursor-pointer text-amber-400"
                    >
                      <Star className={`w-4 h-4 ${newRating >= star ? 'fill-amber-400' : ''}`} />
                    </button>
                  ))}
                </div>
              </div>

              <textarea
                value={newReviewText}
                onChange={(e) => setNewReviewText(e.target.value)}
                placeholder="Share your experience with this product... AI will analyze sentiment and pros/cons."
                rows={3}
                className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-blue-500"
              />

              <div className="flex items-center justify-between">
                {reviewSubmitMessage && (
                  <span className="text-xs font-semibold text-emerald-600">{reviewSubmitMessage}</span>
                )}
                <button
                  type="submit"
                  disabled={isSubmittingReview || !newReviewText.trim()}
                  className="ml-auto px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white rounded-xl text-xs font-semibold cursor-pointer transition"
                >
                  {isSubmittingReview ? 'Submitting...' : 'Post Review'}
                </button>
              </div>
            </form>

            {/* Review List */}
            <div className="space-y-3">
              {product.recent_reviews?.map((r, idx) => (
                <div key={idx} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{r.user_name}</span>
                    <span className="text-[11px] text-slate-400">{r.created_at}</span>
                  </div>
                  <div className="flex items-center gap-1 text-amber-500 text-xs">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span>{r.rating}★</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 ml-2 capitalize">
                      {r.sentiment_label}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300">{r.review_text}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Similar Products Carousel */}
      {product.similar_products && product.similar_products.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">Similar Products</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {product.similar_products.map((p) => (
              <ProductCard
                key={p.id}
                product={p}
                onSelectProduct={onSelectProduct}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
