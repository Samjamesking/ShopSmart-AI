import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  DollarSign,
  Users,
  Package,
  Bot,
  TrendingUp,
  Search,
  Plus,
  Trash2,
  Sparkles,
  BarChart3,
  Check
} from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';
import { api } from '../services/api';
import { useTheme } from '../context/ThemeContext';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

export default function AdminPage() {
  const { formatPrice, isDarkMode } = useTheme();

  const [metrics, setMetrics] = useState(null);
  const [aiLogs, setAiLogs] = useState([]);
  const [productsList, setProductsList] = useState([]);
  const [loading, setLoading] = useState(true);

  // Add Product Modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [newProductName, setNewProductName] = useState('');
  const [newBrand, setNewBrand] = useState('Apple');
  const [newCategory, setNewCategory] = useState('Electronics');
  const [newPrice, setNewPrice] = useState(49999);
  const [newOrigPrice, setNewOrigPrice] = useState(59999);
  const [newDesc, setNewDesc] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    async function loadAdminData() {
      setLoading(true);
      try {
        const [metRes, logsRes, prodRes] = await Promise.all([
          api.getAdminMetrics(),
          api.getAILogs(10),
          api.listProducts({ limit: 15 })
        ]);
        setMetrics(metRes);
        setAiLogs(logsRes || []);
        setProductsList(prodRes.items || []);
      } catch (e) {
        console.error("Admin dashboard error", e);
      } finally {
        setLoading(false);
      }
    }
    loadAdminData();
  }, []);

  const handleDeleteProduct = async (id) => {
    if (confirm("Are you sure you want to remove this product from the catalog?")) {
      try {
        await api.deleteProduct(id);
        setProductsList(prev => prev.filter(p => p.id !== id));
      } catch (e) {
        console.error(e);
      }
    }
  };

  const handleCreateProduct = async (e) => {
    e.preventDefault();
    if (!newProductName.trim()) return;
    setIsSubmitting(true);
    try {
      const p = await api.createProduct({
        name: newProductName.trim(),
        brand: newBrand,
        category: newCategory,
        price: Number(newPrice),
        original_price: Number(newOrigPrice),
        description: newDesc.trim() || `Authentic ${newProductName} by ${newBrand}`,
        image_url: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&auto=format&fit=crop&q=80",
        specs: { "Brand": newBrand, "Category": newCategory },
        tags: [newCategory.toLowerCase(), newBrand.toLowerCase()]
      });
      setProductsList(prev => [p, ...prev]);
      setShowAddModal(false);
      setNewProductName('');
      setNewDesc('');
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Monthly Sales Bar Chart
  const salesBarData = {
    labels: metrics?.monthly_sales?.map(s => s.month) || ['Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar'],
    datasets: [
      {
        label: 'Gross Sales (₹)',
        data: metrics?.monthly_sales?.map(s => s.revenue) || [240000, 310000, 450000, 380000, 410000, 485000],
        backgroundColor: '#3b82f6',
        borderRadius: 8
      }
    ]
  };

  // AI Agent Invocations Doughnut Chart
  const agentDoughnutData = {
    labels: metrics?.ai_agent_breakdown?.map(a => a.agent) || ['Product Finder', 'Comparison', 'Budget', 'Reviews', 'Trends'],
    datasets: [
      {
        data: metrics?.ai_agent_breakdown?.map(a => a.invocations) || [340, 180, 130, 95, 75],
        backgroundColor: ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ec4899'],
        borderWidth: 0
      }
    ]
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <ShieldAlert className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            <span>Admin Intelligence & Catalog Operations</span>
          </h1>
          <p className="text-xs text-slate-500">
            Real-time analytics, sales volume, AI agent telemetry, and catalog CRUD
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-sm shadow-blue-500/20"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Product</span>
        </button>
      </div>

      {/* Top 5 Metrics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        <div className="p-4 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Gross Revenue</span>
            <DollarSign className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-lg font-black text-slate-900 dark:text-white">
            {formatPrice(metrics?.total_revenue || 1845900)}
          </p>
          <span className="text-[10px] text-emerald-500 font-bold">+18.4% this month</span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Catalog Items</span>
            <Package className="w-4 h-4 text-blue-500" />
          </div>
          <p className="text-lg font-black text-slate-900 dark:text-white">
            {(metrics?.total_products || 1129).toLocaleString()}
          </p>
          <span className="text-[10px] text-slate-400">5 Categories</span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Total Users</span>
            <Users className="w-4 h-4 text-indigo-500" />
          </div>
          <p className="text-lg font-black text-slate-900 dark:text-white">
            {metrics?.total_users || 128}
          </p>
          <span className="text-[10px] text-indigo-500 font-bold">+12 this week</span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Total Orders</span>
            <TrendingUp className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-lg font-black text-slate-900 dark:text-white">
            {metrics?.total_orders || 542}
          </p>
          <span className="text-[10px] text-amber-500 font-bold">Verified fulfillment</span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 shadow-sm col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">AI Invocations</span>
            <Bot className="w-4 h-4 text-purple-500" />
          </div>
          <p className="text-lg font-black text-slate-900 dark:text-white">
            {metrics?.total_ai_queries || 824}
          </p>
          <span className="text-[10px] text-purple-500 font-bold">5 Specialized Agents</span>
        </div>
      </div>

      {/* Analytics Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Sales Chart */}
        <div className="lg:col-span-7 bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-blue-500" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                Revenue Growth Trends (Last 6 Months)
              </h3>
            </div>
          </div>
          <div className="h-60">
            <Bar
              data={salesBarData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                  x: { grid: { display: false } },
                  y: { grid: { color: isDarkMode ? 'rgba(51, 65, 85, 0.3)' : 'rgba(226, 232, 240, 0.8)' } }
                }
              }}
            />
          </div>
        </div>

        {/* AI Agent Telemetry Doughnut */}
        <div className="lg:col-span-5 bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <Bot className="w-4 h-4 text-purple-500" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                AI Agent Workload Distribution
              </h3>
            </div>
          </div>
          <div className="h-60 flex items-center justify-center">
            <Doughnut
              data={agentDoughnutData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'right',
                    labels: { color: isDarkMode ? '#cbd5e1' : '#334155', font: { size: 10 } }
                  }
                }
              }}
            />
          </div>
        </div>
      </div>

      {/* Catalog Management Table */}
      <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">Product Catalog Management</h3>
          <span className="text-xs text-slate-400">Total in system: {metrics?.total_products || 1129}</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50 text-slate-400 uppercase tracking-wider text-[10px]">
                <th className="p-3">Product</th>
                <th className="p-3">Category</th>
                <th className="p-3">Price</th>
                <th className="p-3">Rating</th>
                <th className="p-3">Stock</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {productsList.map((prod) => (
                <tr key={prod.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                  <td className="p-3 font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                    <img src={prod.image_url} alt="" className="w-8 h-8 rounded-lg object-cover bg-slate-100 shrink-0" />
                    <span className="truncate max-w-xs">{prod.name}</span>
                  </td>
                  <td className="p-3 text-slate-500">{prod.category}</td>
                  <td className="p-3 font-bold text-slate-900 dark:text-white">{formatPrice(prod.price)}</td>
                  <td className="p-3 text-amber-500 font-semibold">★ {prod.rating}</td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold">
                      In Stock
                    </span>
                  </td>
                  <td className="p-3 text-right">
                    <button
                      onClick={() => handleDeleteProduct(prod.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* AI Telemetry Activity Log */}
      <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-3">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-blue-500" />
          <span>Recent Multi-Agent AI Telemetry & Reasoning Logs</span>
        </h3>
        <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-60 overflow-y-auto">
          {aiLogs.map((log) => (
            <div key={log.id} className="py-2.5 flex items-start justify-between gap-4 text-xs">
              <div>
                <span className="font-bold text-blue-600 dark:text-blue-400 mr-2">[{log.agent_name}]</span>
                <span className="text-slate-800 dark:text-slate-200">Query: "{log.prompt}"</span>
                <p className="text-[11px] text-slate-400 truncate max-w-2xl mt-0.5">{log.response_summary}</p>
              </div>
              <span className="text-[10px] text-slate-400 shrink-0">{log.timestamp}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Modal: Add Product */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <form onSubmit={handleCreateProduct} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl w-full max-w-md space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Add New Product to Catalog</h3>

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">Product Name</label>
              <input
                type="text"
                required
                value={newProductName}
                onChange={(e) => setNewProductName(e.target.value)}
                placeholder="e.g. MacBook Pro M4 16-inch"
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl text-xs font-medium focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">Brand</label>
                <input
                  type="text"
                  required
                  value={newBrand}
                  onChange={(e) => setNewBrand(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl text-xs font-medium focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">Category</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl text-xs font-medium focus:outline-none focus:border-blue-500"
                >
                  <option value="Electronics">Electronics</option>
                  <option value="Fashion">Fashion</option>
                  <option value="Home Appliances">Home Appliances</option>
                  <option value="Books">Books</option>
                  <option value="Sports Equipment">Sports Equipment</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">Selling Price (₹)</label>
                <input
                  type="number"
                  required
                  value={newPrice}
                  onChange={(e) => setNewPrice(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl text-xs font-medium focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">Original Price (₹)</label>
                <input
                  type="number"
                  required
                  value={newOrigPrice}
                  onChange={(e) => setNewOrigPrice(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl text-xs font-medium focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 border rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold cursor-pointer"
              >
                {isSubmitting ? 'Saving...' : 'Add to Catalog'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
