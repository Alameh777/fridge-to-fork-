import React, { useEffect, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Search, X } from 'lucide-react';
import api from '../lib/axios';
import TopBar from '../components/TopBar';
import RecipeCard from '../components/RecipeCard';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';

const FILTERS = [
  { key: 'is_halal',             label: 'Halal' },
  { key: 'is_vegetarian',        label: 'Vegetarian' },
  { key: 'is_vegan',             label: 'Vegan' },
  { key: 'is_ramadan_friendly',  label: 'Ramadan' },
];

export default function LibraryPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [tab, setTab] = useState('explore');
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeFilters, setActiveFilters] = useState({});

  const fetchExplore = useCallback(async () => {
    setLoading(true);
    try {
      const params = { ...activeFilters };
      if (search.trim()) params.search = search.trim();
      const res = await api.get('/recipes', { params });
      const data = res.data?.data ?? res.data;
      setRecipes(Array.isArray(data) ? data : []);
    } catch {
      toast.error('Failed to load recipes');
    } finally {
      setLoading(false);
    }
  }, [search, activeFilters]);

  const fetchSaved = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/saved-recipes');
      const data = Array.isArray(res.data) ? res.data : res.data.data || [];
      setRecipes(data);
    } catch {
      toast.error('Failed to load saved recipes');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    setRecipes([]);
    if (tab === 'explore') fetchExplore();
    else fetchSaved();
  }, [tab]);

  useEffect(() => {
    if (tab !== 'explore') return;
    const timer = setTimeout(fetchExplore, 400);
    return () => clearTimeout(timer);
  }, [search, activeFilters]);

  const toggleFilter = (key) => {
    setActiveFilters(prev =>
      prev[key] ? Object.fromEntries(Object.entries(prev).filter(([k]) => k !== key)) : { ...prev, [key]: 1 }
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <TopBar title={t('library')} />

      <div className="flex border-b bg-white">
        {['explore', 'saved'].map(type => (
          <button
            key={type}
            onClick={() => setTab(type)}
            className={`flex-1 py-3 text-sm font-medium transition-colors ${
              tab === type ? 'text-orange-500 border-b-2 border-orange-500' : 'text-gray-500'
            }`}
          >
            {type === 'explore' ? (t('explore') || 'Explore') : (t('saved_recipes') || 'Saved')}
          </button>
        ))}
      </div>

      {tab === 'explore' && (
        <div className="p-4 space-y-3">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder={t('search_recipes') || 'Search recipes...'}
              className="w-full pl-9 pr-9 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 bg-white"
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                <X size={15} />
              </button>
            )}
          </div>

          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {FILTERS.map(({ key, label }) => (
              <button
                key={key}
                onClick={() => toggleFilter(key)}
                className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
                  activeFilters[key]
                    ? 'bg-orange-500 text-white border-orange-500'
                    : 'bg-white text-gray-600 border-gray-200'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="px-4 pb-4">
        {loading ? (
          <div className="flex justify-center py-16"><LoadingSpinner /></div>
        ) : recipes.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <p className="text-5xl mb-3">{tab === 'saved' ? '🔖' : '🍽️'}</p>
            <p>{tab === 'saved' ? (t('no_saved_yet') || 'No saved recipes yet') : (t('no_results') || 'No recipes found')}</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {recipes.map(r => (
              <RecipeCard key={r.id} recipe={r} onClick={() => navigate(`/recipe/${r.id}`, { state: { recipe: r } })} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
