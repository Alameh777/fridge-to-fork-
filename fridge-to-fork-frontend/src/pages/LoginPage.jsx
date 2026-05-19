import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, Eye, EyeOff, ChefHat, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(form.email, form.password);
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex" dir="ltr">

      {/* ── Left: photo panel ── */}
      <div className="hidden lg:block lg:w-[46%] relative overflow-hidden flex-shrink-0">
        <img
          src="https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=1400&q=85"
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div
          className="absolute inset-0"
          style={{ background: 'linear-gradient(to top, rgba(8,4,0,0.92) 0%, rgba(8,4,0,0.45) 55%, rgba(8,4,0,0.10) 100%)' }}
        />

        <Link
          to="/"
          className="absolute top-8 left-8 flex items-center gap-1.5 text-white/60 hover:text-white/90 text-sm font-medium transition-colors"
        >
          <ArrowLeft size={15} />
          Home
        </Link>

        <div className="absolute bottom-0 left-0 right-0 p-10 pb-12">
          <div className="w-8 h-0.5 bg-orange-400 mb-6" />
          <p className="text-white/40 text-xs uppercase tracking-widest mb-3">سفرة</p>
          <h1 className="text-4xl font-bold text-white tracking-tight leading-tight mb-4">Sofretna</h1>
          <p className="text-white/40 text-sm leading-relaxed max-w-[260px]">
            Turn whatever's in your fridge into something worth sharing.
          </p>
        </div>
      </div>

      {/* ── Right: form panel ── */}
      <div className="flex-1 flex flex-col justify-center items-center px-8 py-16 bg-white">
        <div className="w-full max-w-[360px]">

          {/* Logo mark */}
          <div className="flex items-center gap-2.5 mb-12">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, #ea7c2b, #c4611a)' }}
            >
              <ChefHat size={15} className="text-white" />
            </div>
            <span className="font-bold text-gray-900 text-sm tracking-tight">Sofretna</span>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-1 tracking-tight">Welcome back</h2>
          <p className="text-gray-400 text-sm mb-8">Sign in to continue to your account</p>

          <form onSubmit={submit} className="space-y-4">

            {/* Email */}
            <div>
              <label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-widest mb-2">
                Email
              </label>
              <div className="relative">
                <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                <input
                  type="email"
                  value={form.email}
                  onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                  placeholder="you@example.com"
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-300 bg-gray-50/60 focus:outline-none focus:ring-2 focus:ring-orange-400/60 focus:border-orange-400 focus:bg-white transition-all"
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-widest mb-2">
                Password
              </label>
              <div className="relative">
                <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                  placeholder="Your password"
                  className="w-full pl-10 pr-11 py-3 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-300 bg-gray-50/60 focus:outline-none focus:ring-2 focus:ring-orange-400/60 focus:border-orange-400 focus:bg-white transition-all"
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl font-semibold text-white text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-1 hover:opacity-90 active:scale-[0.99]"
              style={{ background: 'linear-gradient(135deg, #ea7c2b 0%, #c4611a 100%)' }}
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  Signing in...
                </>
              ) : 'Sign in'}
            </button>
          </form>

          <p className="mt-7 text-center text-sm text-gray-400">
            No account?{' '}
            <Link to="/register" className="text-orange-500 font-semibold hover:text-orange-600 transition-colors">
              Create one
            </Link>
          </p>

          <div className="mt-14 pt-6 border-t border-gray-100 text-center">
            <p className="text-[11px] text-gray-300 tracking-wide">Powered by Gemini AI</p>
          </div>
        </div>
      </div>
    </div>
  );
}
