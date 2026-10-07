import React, { useState } from 'react';
import {
  Bot,
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  TrendingDown,
  ShoppingBag
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function AuthPage({ onSuccess }) {
  const { login, register } = useAuth();
  const [isRegister, setIsRegister] = useState(false);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('sammya@shopsmart.ai');
  const [password, setPassword] = useState('password123');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (isRegister) {
      if (!name.trim()) {
        setError('Please enter your full name');
        return;
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match');
        return;
      }
    }

    setLoading(true);
    try {
      if (isRegister) {
        await register(name.trim(), email.trim(), password);
      } else {
        await login(email.trim(), password);
      }
      if (onSuccess) onSuccess();
    } catch (err) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async (demoEmail, demoPass) => {
    setError('');
    setLoading(true);
    try {
      await login(demoEmail, demoPass);
      if (onSuccess) onSuccess();
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  // Password strength calculation
  const getPasswordStrength = () => {
    if (!password) return 0;
    let s = 0;
    if (password.length >= 6) s += 25;
    if (password.length >= 8) s += 25;
    if (/[0-9]/.test(password)) s += 25;
    if (/[^A-Za-z0-9]/.test(password)) s += 25;
    return s;
  };

  const strength = getPasswordStrength();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0b0f19] flex items-center justify-center p-4 sm:p-6 transition-colors">
      <div className="w-full max-w-5xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-2xl grid grid-cols-1 md:grid-cols-12 min-h-[620px]">
        {/* Left Hero Graphic Column */}
        <div className="md:col-span-6 bg-gradient-to-br from-blue-700 via-indigo-800 to-slate-900 p-8 sm:p-12 text-white flex flex-col justify-between relative overflow-hidden">
          {/* Ambient glow circles */}
          <div className="absolute top-0 left-0 w-72 h-72 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 right-0 w-72 h-72 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />

          {/* Logo */}
          <div className="relative z-10 flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white border border-white/20">
              <Bot className="w-5 h-5" />
            </div>
            <span className="font-extrabold text-xl tracking-tight text-white">ShopSmart AI</span>
          </div>

          {/* Center Graphic & Tagline */}
          <div className="relative z-10 py-8 space-y-4">
            <div className="w-32 h-32 rounded-3xl bg-gradient-to-tr from-cyan-400/20 to-blue-500/30 border border-white/20 backdrop-blur-xl flex items-center justify-center mx-auto shadow-2xl">
              <div className="relative">
                <ShoppingBag className="w-16 h-16 text-cyan-300 animate-bounce duration-1000" />
                <Sparkles className="w-6 h-6 text-yellow-300 absolute -top-1 -right-2 animate-pulse" />
              </div>
            </div>

            <div className="text-center space-y-2">
              <h1 className="text-2xl sm:text-3xl font-black text-white leading-tight">
                Your Personal AI Shopping Assistant
              </h1>
              <p className="text-xs sm:text-sm text-blue-100 max-w-sm mx-auto">
                Compare, Discover, Save & Shop Smarter with multi-agent intelligence and real-time price tracking.
              </p>
            </div>
          </div>

          {/* Feature Badges */}
          <div className="relative z-10 flex flex-wrap gap-2 justify-center">
            <span className="text-[11px] font-semibold px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-blue-100 flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 text-cyan-300" /> Smart Recommendations
            </span>
            <span className="text-[11px] font-semibold px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-blue-100 flex items-center gap-1.5">
              <TrendingDown className="w-3 h-3 text-emerald-300" /> Price Comparison
            </span>
            <span className="text-[11px] font-semibold px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-blue-100 flex items-center gap-1.5">
              <ShieldCheck className="w-3 h-3 text-indigo-300" /> Track & Save
            </span>
          </div>
        </div>

        {/* Right Auth Form Column */}
        <div className="md:col-span-6 p-8 sm:p-12 flex flex-col justify-center space-y-6">
          <div>
            <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">
              {isRegister ? 'Create Your Account' : 'Welcome Back'}
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              {isRegister
                ? 'Start your personalized shopping journey with AI today'
                : 'Sign in to your account to continue discovering deals'}
            </p>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-xs font-semibold text-rose-600 dark:text-rose-400">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegister && (
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">Full Name</label>
                <div className="relative flex items-center">
                  <User className="w-4 h-4 text-slate-400 absolute left-3" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your full name"
                    className="w-full pl-9 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">Email Address</label>
              <div className="relative flex items-center">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full pl-9 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">Password</label>
              <div className="relative flex items-center">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full pl-9 pr-10 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {isRegister && (
                <div className="mt-2 space-y-1">
                  <div className="w-full h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div
                      style={{ width: `${strength}%` }}
                      className={`h-full transition-all ${
                        strength < 50 ? 'bg-amber-500' : 'bg-emerald-500'
                      }`}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-400">
                    <span>Password Strength</span>
                    <span className="font-bold">{strength < 50 ? 'Fair' : 'Strong'}</span>
                  </div>
                </div>
              )}
            </div>

            {isRegister && (
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">Confirm Password</label>
                <div className="relative flex items-center">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3" />
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm your password"
                    className="w-full pl-9 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>
            )}

            {!isRegister && (
              <div className="flex items-center justify-between text-xs">
                <label className="flex items-center gap-2 cursor-pointer text-slate-600 dark:text-slate-400">
                  <input type="checkbox" defaultChecked className="rounded text-blue-600 accent-blue-600" />
                  <span>Remember me</span>
                </label>
                <button
                  type="button"
                  onClick={() => alert("Password reset link sent to registered email.")}
                  className="text-blue-600 dark:text-blue-400 hover:underline font-semibold"
                >
                  Forgot password?
                </button>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition shadow-md shadow-blue-500/20 cursor-pointer"
            >
              {loading ? 'Please wait...' : isRegister ? 'Create Account' : 'Login'}
            </button>
          </form>

          {/* Divider */}
          <div className="relative flex items-center justify-center">
            <span className="w-full border-t border-slate-200 dark:border-slate-800" />
            <span className="absolute px-3 bg-white dark:bg-[#111827] text-[11px] font-bold text-slate-400 uppercase">
              OR QUICK ACCESS
            </span>
          </div>

          {/* Quick Demo Access Buttons */}
          <div className="grid grid-cols-2 gap-2.5">
            <button
              onClick={() => handleDemoLogin('sammya@shopsmart.ai', 'password123')}
              className="p-2.5 border border-slate-200 dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-500 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 hover:text-blue-600 transition flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <User className="w-3.5 h-3.5 text-blue-500" />
              <span>Demo Shopper</span>
            </button>

            <button
              onClick={() => handleDemoLogin('admin@shopsmart.ai', 'admin123')}
              className="p-2.5 border border-slate-200 dark:border-slate-700 hover:border-indigo-500 dark:hover:border-indigo-500 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 hover:text-indigo-600 transition flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Bot className="w-3.5 h-3.5 text-indigo-500" />
              <span>Admin Access</span>
            </button>
          </div>

          {/* Toggle between Login and Register */}
          <div className="text-center text-xs text-slate-500">
            {isRegister ? (
              <span>
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => setIsRegister(false)}
                  className="font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                >
                  Login
                </button>
              </span>
            ) : (
              <span>
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={() => setIsRegister(true)}
                  className="font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                >
                  Create New Account
                </button>
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
