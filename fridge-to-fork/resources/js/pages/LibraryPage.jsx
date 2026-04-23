import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import api from '../lib/axios';
import TopBar from '../components/TopBar';
import RecipeCard from '../components/RecipeCard';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';

export default function LibraryPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('saved');

  useEffect(() => {
    fetchRecipes();
  }, [tab]);

  const fetchRecipes = async () => {
    setLoading(true);
    try {
      const endpoint = tab === 'saved' ? '/saved-recipes' : '/recipes?my=1';
      const res = await api.get(endpoint);
      const data = tab === 'saved' ? res.data.saved_recipes?.map(s => s.recipe) : res.data.recipes;
      setRecipes(data?.filter(Boolean) || []);
    } catch {
      toast.error(t('error_loading'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <TopBar title={t('library')} />
      <div className="flex border-b bg-white">
        {['saved', 'mine'].map(type => (
          <button
            key={type}
            onClick={() => setTab(type)}
            className={`flex-1 py-3 text-sm font-medium ${tab === type ? 'text-orange-500 border-b-2 border-orange-500' : 'text-gray-500'}`}
          >
            {t(type === 'saved' ? 'saved_recipes' : 'my_recipes')}
          </button>
        ))}
      </div>
      <div className="p-4">
        {loading ? <LoadingSpinner /> : recipes.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <p className="text-5xl mb-3">📚</p>
            <p>{t('no_recipes_yet')}</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {recipes.map(r => r && (
              <RecipeCard key={r.id} recipe={r} onClick={() => navigate(`/recipe/${r.id}`)} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
