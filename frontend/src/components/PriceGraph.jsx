import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { useTheme } from '../context/ThemeContext';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function PriceGraph({ history = [], lowestPrice = null }) {
  const { isDarkMode, formatPrice, currency } = useTheme();

  if (!history || history.length === 0) {
    return (
      <div className="h-56 flex items-center justify-center text-xs text-slate-400">
        No price history recorded yet.
      </div>
    );
  }

  const labels = history.map(h => h.date);
  const dataPoints = history.map(h => {
    if (currency === 'USD') return Math.round(h.price / 83.5);
    return h.price;
  });

  const chartData = {
    labels,
    datasets: [
      {
        label: `Price (${currency === 'USD' ? '$' : '₹'})`,
        data: dataPoints,
        borderColor: '#3b82f6',
        backgroundColor: (context) => {
          const ctx = context.chart.ctx;
          const gradient = ctx.createLinearGradient(0, 0, 0, 220);
          gradient.addColorStop(0, 'rgba(59, 130, 246, 0.35)');
          gradient.addColorStop(1, 'rgba(59, 130, 246, 0.0)');
          return gradient;
        },
        fill: true,
        tension: 0.35,
        borderWidth: 2.5,
        pointBackgroundColor: dataPoints.map(p => {
          const actualVal = currency === 'USD' ? Math.round(p * 83.5) : p;
          return lowestPrice && Math.abs(actualVal - lowestPrice) < 100 ? '#10b981' : '#3b82f6';
        }),
        pointRadius: dataPoints.map(p => {
          const actualVal = currency === 'USD' ? Math.round(p * 83.5) : p;
          return lowestPrice && Math.abs(actualVal - lowestPrice) < 100 ? 7 : 4;
        }),
        pointHoverRadius: 8,
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        backgroundColor: isDarkMode ? '#1e293b' : '#0f172a',
        titleColor: '#94a3b8',
        bodyColor: '#ffffff',
        padding: 10,
        displayColors: false,
        callbacks: {
          label: (context) => {
            const val = context.raw;
            return ` Price: ${currency === 'USD' ? '$' : '₹'}${Number(val).toLocaleString()}`;
          }
        }
      }
    },
    scales: {
      x: {
        grid: {
          display: false,
          drawBorder: false
        },
        ticks: {
          color: isDarkMode ? '#64748b' : '#94a3b8',
          font: { size: 11 }
        }
      },
      y: {
        grid: {
          color: isDarkMode ? 'rgba(51, 65, 85, 0.3)' : 'rgba(226, 232, 240, 0.8)',
          drawBorder: false
        },
        ticks: {
          color: isDarkMode ? '#64748b' : '#94a3b8',
          font: { size: 11 },
          callback: (value) => `${currency === 'USD' ? '$' : '₹'}${Number(value).toLocaleString()}`
        }
      }
    }
  };

  return (
    <div className="w-full h-56">
      <Line data={chartData} options={options} />
    </div>
  );
}
