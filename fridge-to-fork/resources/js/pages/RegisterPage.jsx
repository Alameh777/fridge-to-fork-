import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function RegisterPage() {
  const { t } = useTranslation();
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', password_confirmation: '' });
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (form.password !== form.password_confirmation) {
      toast.error('Passwords do not match');
      return;
    }
    setLoading(true);
    try {
      await register(form.name, form.email, form.password, form.password_confirmation);
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const field = (key, type = 'text') => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{t(key)}</label>
      <input
        type={type}
        value={form[key]}
        onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))}
        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400"
        required
      />
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-cream-50 p-6">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <p className="text-6xl mb-3">🍽️</p>
          <h1 className="text-3xl font-bold text-gray-900">Fridge to Fork</h1>
        </div>
        <form onSubmit={submit} className="space-y-4">
          {field('name')}
          {field('email', 'email')}
          {field('password', 'password')}
          {field('confirm_password', 'password')}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-orange-500 text-white rounded-xl font-bold text-lg disabled:opacity-50"
          >
            {loading ? '...' : t('sign_up')}
          </button>
        </form>
        <p className="text-center text-sm text-gray-500 mt-6">
          {t('have_account')}{' '}
          <Link to="/login" className="text-orange-500 font-semibold">{t('sign_in')}</Link>
        </p>
      </div>
    </div>
  );
}
