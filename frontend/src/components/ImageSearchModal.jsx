import React, { useState } from 'react';
import { Camera, Upload, X, Sparkles, Check, ArrowRight } from 'lucide-react';
import { api } from '../services/api';
import { useTheme } from '../context/ThemeContext';

export default function ImageSearchModal({ isOpen, onClose, onSelectProduct }) {
  const { formatPrice } = useTheme();
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [results, setResults] = useState(null);

  const samplePresets = [
    { label: "Gaming Laptop", query: "laptop", img: "https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=300&auto=format&fit=crop&q=80" },
    { label: "Sneakers", query: "sneaker", img: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=300&auto=format&fit=crop&q=80" },
    { label: "Smart Phone", query: "smartphone", img: "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=300&auto=format&fit=crop&q=80" },
    { label: "Headphones", query: "headphones", img: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&auto=format&fit=crop&q=80" },
  ];

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      executeSearch(file, null);
    }
  };

  const executePreset = (preset) => {
    setSelectedFile(null);
    setPreviewUrl(preset.img);
    executeSearch(null, preset.query);
  };

  const executeSearch = async (file, presetQuery) => {
    setLoading(true);
    setResults(null);
    try {
      const formData = new FormData();
      if (file) formData.append('file', file);
      if (presetQuery) formData.append('preset_query', presetQuery);

      const res = await api.searchByImage(formData);
      setResults(res);
    } catch (e) {
      console.error("Image search error", e);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setResults(null);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Image-Based Shopping</h3>
              <p className="text-xs text-slate-400">Upload an image or snap a photo to discover matching items</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Upload Dropzone & Preset Thumbnails */}
        {!previewUrl ? (
          <div className="mt-5 space-y-5">
            <label className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-500 rounded-2xl p-8 flex flex-col items-center justify-center text-center cursor-pointer bg-slate-50 dark:bg-slate-800/40 transition">
              <Upload className="w-10 h-10 text-blue-500 mb-3" />
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 mb-1">
                Click to upload or drag & drop image
              </p>
              <p className="text-xs text-slate-400">Supports JPG, PNG, WEBP up to 10MB</p>
              <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
            </label>

            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2.5">Or try sample photos:</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {samplePresets.map((preset, idx) => (
                  <button
                    key={idx}
                    onClick={() => executePreset(preset)}
                    className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-blue-500 dark:hover:border-blue-500 bg-white dark:bg-slate-800/80 flex flex-col items-center text-center group cursor-pointer transition"
                  >
                    <img src={preset.img} alt={preset.label} className="w-16 h-16 object-cover rounded-lg mb-1.5 group-hover:scale-105 transition" />
                    <span className="text-xs font-medium text-slate-700 dark:text-slate-300">{preset.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="mt-4 space-y-4">
            {/* Image Preview & Detected Category Card */}
            <div className="flex items-center gap-4 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
              <img src={previewUrl} alt="Target" className="w-20 h-20 object-cover rounded-xl border border-slate-200 dark:border-slate-700" />
              <div className="flex-1 min-w-0">
                {loading ? (
                  <div className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400 font-semibold animate-pulse">
                    <Sparkles className="w-4 h-4 animate-spin" />
                    Analyzing visual features & detecting products...
                  </div>
                ) : results ? (
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-bold px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400">
                        {Math.round(results.confidence * 100)}% Match Confidence
                      </span>
                      <span className="text-xs font-medium text-slate-400">
                        Category: {results.detected_category}
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                      {results.detected_label}
                    </h4>
                  </div>
                ) : null}
              </div>
              <button
                onClick={handleReset}
                className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600 transition cursor-pointer"
              >
                Change Image
              </button>
            </div>

            {/* Matched Products Grid */}
            {results && results.matched_products && (
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
                  Matching Products in Catalog ({results.matched_products.length})
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-72 overflow-y-auto pr-1">
                  {results.matched_products.map((prod) => (
                    <div
                      key={prod.id}
                      onClick={() => {
                        onClose();
                        onSelectProduct(prod.id);
                      }}
                      className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-blue-500 dark:hover:border-blue-500 bg-white dark:bg-slate-800/80 flex items-center gap-3 cursor-pointer group transition"
                    >
                      <img src={prod.image_url} alt={prod.name} className="w-14 h-14 object-cover rounded-lg shrink-0" />
                      <div className="flex-1 min-w-0">
                        <span className="text-[10px] uppercase font-bold text-blue-600 dark:text-blue-400">{prod.brand}</span>
                        <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate group-hover:text-blue-500">{prod.name}</p>
                        <p className="text-xs font-bold text-slate-900 dark:text-white">{formatPrice(prod.price)}</p>
                      </div>
                      <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-500 group-hover:translate-x-1 transition" />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
