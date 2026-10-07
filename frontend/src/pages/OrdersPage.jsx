import React from 'react';
import { ShoppingBag, Package, CheckCircle2, Clock, Truck, ArrowRight } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export default function OrdersPage({ onSelectProduct }) {
  const { formatPrice } = useTheme();

  const sampleOrders = [
    {
      id: 'ORD-98421',
      date: 'March 24, 2026',
      status: 'Delivered',
      total: 78990,
      savings: 21000,
      items: [
        {
          id: 1,
          name: 'ASUS TUF Gaming A15',
          brand: 'ASUS',
          price: 78990,
          image_url: 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=800&auto=format&fit=crop&q=80'
        }
      ]
    },
    {
      id: 'ORD-76192',
      date: 'February 12, 2026',
      status: 'Delivered',
      total: 26990,
      savings: 8000,
      items: [
        {
          id: 4,
          name: 'Sony WH-1000XM5 Wireless Headphones',
          brand: 'Sony',
          price: 26990,
          image_url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80'
        }
      ]
    },
    {
      id: 'ORD-54128',
      date: 'January 28, 2026',
      status: 'Delivered',
      total: 8195,
      savings: 1500,
      items: [
        {
          id: 8,
          name: "Nike Air Force 1 '07",
          brand: 'Nike',
          price: 8195,
          image_url: 'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=800&auto=format&fit=crop&q=80'
        }
      ]
    }
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-300">
      <div>
        <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
          <ShoppingBag className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          <span>Order History & Purchase Records</span>
        </h1>
        <p className="text-xs text-slate-500">
          Track previous purchases, invoice details, and total verified AI savings
        </p>
      </div>

      <div className="space-y-4">
        {sampleOrders.map((order) => (
          <div
            key={order.id}
            className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-4"
          >
            {/* Header info */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 gap-2">
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{order.id}</span>
                <span className="text-xs text-slate-400">• Placed on {order.date}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  {order.status}
                </span>
                <span className="text-xs font-bold text-slate-900 dark:text-white">
                  Total: {formatPrice(order.total)}
                </span>
              </div>
            </div>

            {/* Items */}
            <div className="space-y-3">
              {order.items.map((it) => (
                <div key={it.id} className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <img src={it.image_url} alt={it.name} className="w-14 h-14 object-cover rounded-xl bg-slate-100 dark:bg-slate-800" />
                    <div>
                      <span className="text-[10px] uppercase font-bold text-blue-600 dark:text-blue-400">{it.brand}</span>
                      <h4
                        onClick={() => onSelectProduct && onSelectProduct(it.id)}
                        className="text-xs font-bold text-slate-900 dark:text-white hover:text-blue-500 cursor-pointer"
                      >
                        {it.name}
                      </h4>
                      <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">{formatPrice(it.price)}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => onSelectProduct && onSelectProduct(it.id)}
                    className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <span>Buy Again</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
