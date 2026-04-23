import React, { useEffect, useState } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Bookmark, BookmarkCheck, Clock, Users, ChefHat } from 'lucide-react';
import api from '../lib/axios';
import TopBar from '../components/TopBar';
import DietaryBadge from '../components/DietaryBadge';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';

export default function RecipeDetailPage() {
  const { id } = useParams();
  const { state } = useLocation();
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === 'ar';
  const [recipe, setRecipe] = useState(state?.recipe || null);
  const [loading, setLoading] = useState(!state?.recipe);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!recipe) {
      api.get(`/recipes/${id}`).then(r => setRecipe(r.data.recipe)).catch(() => toast.error('Not found')).finally(() => setLoading(false));
    }
  }, [id]);

  const toggleSave = async () => {
    try {
      if (saved) {
        await api.delete(`/recipes/${recipe.id}/save`);
        setSaved(false);
        toast.success('Removed');
      } else {
        await api.post(`/recipes/${recipe.id}/save`);
        setSaved(true);
        toast.success(t('saved'));
      }
    } catch {
      toast.error('Failed');
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><LoadingSpinner /></div>;
  if (!recipe) return null;

  const name = isAr ? recipe.name_ar : recipe.name_en;
  const desc = isAr ? recipe.description_ar : recipe.description_en;
  const ingList = isAr ? recipe.ingredients_ar : recipe.ingredients_en;
  const steps = isAr ? recipe.instructions_ar : recipe.instructions_en;

  const parseList = (val) => {
    if (!val) return [];
    if (Array.isArray(val)) return val;
    try { return JSON.parse(val); } catch { return val.split('\n').filter(Boolean); }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="flex items-center justify-between px-4 py-3 bg-white border-b sticky top-0 z-40">
        <TopBar title={name} showBack showLang={false} />
        <button onClick={toggleSave} className="p-2 text-orange-500">
          {saved ? <BookmarkCheck size={22} /> : <Bookmark size={22} />}
        </button>
      </div>
      <div className="p-4 space-y-4">
        <div className="flex flex-wrap gap-2">
          {['is_halal', 'is_vegetarian', 'is_vegan'].map(k =>
            recipe[k] ? <DietaryBadge key={k} type={k} isAr={isAr} /> : null
          )}
        </div>
        <div className="flex gap-4 text-sm text-gray-500">
          {recipe.prep_time && <span className="flex items-center gap-1"><Clock size={14} />{t('prep_time')}: {recipe.prep_time}m</span>}
          {recipe.cook_time && <span className="flex items-center gap-1"><ChefHat size={14} />{t('cook_time')}: {recipe.cook_time}m</span>}
          {recipe.servings && <span className="flex items-center gap-1"><Users size={14} />{recipe.servings}</span>}
        </div>
        {desc && <p className="text-gray-600 text-sm leading-relaxed">{desc}</p>}

        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <h3 className="font-bold text-gray-900 mb-3">{t('ingredients')}</h3>
          <ul className="space-y-1.5">
            {parseList(ingList).map((ing, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                <span className="text-orange-400 mt-0.5">•</span>{ing}
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <h3 className="font-bold text-gray-900 mb-3">{t('instructions')}</h3>
          <ol className="space-y-3">
            {parseList(steps).map((step, i) => (
              <li key={i} className="flex gap-3 text-sm text-gray-700">
                <span className="w-6 h-6 rounded-full bg-orange-100 text-orange-600 font-bold text-xs flex items-center justify-center flex-shrink-0 mt-0.5">{i + 1}</span>
                <p className="leading-relaxed">{step}</p>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </div>
  );
}
