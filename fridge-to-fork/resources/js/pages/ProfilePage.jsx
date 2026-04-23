import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import api from '../lib/axios';
import TopBar from '../components/TopBar';
import toast from 'react-hot-toast';
import { LogOut, ChevronRight } from 'lucide-react';

const DIETS = ['vegetarian', 'vegan', 'gluten_free', 'dairy_free', 'halal', 'kosher'];

export default function ProfilePage() {
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const [saving, setSaving] = useState(false);
  const [selectedDiets, setSelectedDiets] = useState([]);

  useEffect(() => {
    api.get('/profile').then(res => setSelectedDiets(res.data.profile?.dietary_preferences || [])).catch(() => {});
  }, []);

  const toggleDiet = (d) => setSelectedDiets(prev => prev.includes(d) ? prev.filter(x => x !== d) : [...prev, d]);

  const save = async () => {
    setSaving(true);
    try {
      await api.put('/profile', { dietary_preferences: selectedDiets });
      toast.success(t('saved'));
    } catch {
      toast.error(t('error_saving'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <TopBar title={t('profile')} />
      <div className="p-4 space-y-4">
        <div className="bg-white rounded-2xl p-4 shadow-sm flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-orange-100 flex items-center justify-center text-2xl font-bold text-orange-500">
            {user?.name?.[0] || '?'}
          </div>
          <div>
            <p className="font-bold text-lg">{user?.name}</p>
            <p className="text-gray-400 text-sm">{user?.email}</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <h3 className="font-semibold mb-3">{t('dietary_preferences')}</h3>
          <div className="flex flex-wrap gap-2">
            {DIETS.map(d => (
              <button key={d} onClick={() => toggleDiet(d)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${selectedDiets.includes(d) ? 'bg-orange-500 text-white border-orange-500' : 'bg-white text-gray-600 border-gray-200'}`}>
                {t(d)}
              </button>
            ))}
          </div>
          <button onClick={save} disabled={saving} className="mt-4 w-full py-2.5 bg-orange-500 text-white rounded-xl font-semibold disabled:opacity-50">
            {saving ? t('saving') : t('save')}
          </button>
        </div>
        <button onClick={logout} className="w-full flex items-center justify-between bg-white rounded-2xl p-4 shadow-sm text-red-500 font-medium">
          <div className="flex items-center gap-3"><LogOut size={18} />{t('logout')}</div>
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}
