import React, { useEffect, useState } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Bookmark, BookmarkCheck, Clock, Users, ChefHat } from 'lucide-react';
import api from '../lib/axios';
import DietaryBadge from '../components/DietaryBadge';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';

export default function RecipeDetailPage() {
  const { id } = useParams();
  const { state } = useLocation();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === 'ar';
  const [recipe, setRecipe] = useState(state?.recipe || null);
  const [loading, setLoading] = useState(!state?.recipe);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!recipe) {
      api.get(`/recipes/${id}`)
        .then(r => setRecipe(r.data))
        .catch(() => toast.error('Not found'))
        .finally(() => setLoading(false));
    }
  }, [id]);

  useEffect(() => {
    if (!recipe?.id) return;
    api.get('/saved-recipes')
      .then(r => {
        const ids = r.data.map(rec => rec.id);
        setSaved(ids.includes(recipe.id));
      })
      .catch(() => {});
  }, [recipe?.id]);

  const toggleSave = async () => {
    setSaving(true);
    try {
      if (saved) {
        await api.delete(`/recipes/${recipe.id}/save`);
        setSaved(false);
        toast.success(t('removed_from_favorites') || 'Removed from favorites');
      } else {
        await api.post(`/recipes/${recipe.id}/save`);
        setSaved(true);
        toast.success(t('added_to_favorites') || 'Added to favorites');
      }
    } catch {
      toast.error('Failed');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><LoadingSpinner /></div>;
  if (!recipe) return null;

  const name = isAr ? recipe.title_ar : recipe.title;
  const desc = isAr ? recipe.description_ar : recipe.description;
  const ingList = recipe.ingredients;
  const steps = isAr ? recipe.steps_ar : recipe.steps;

  const parseList = (val) => {
    if (!val) return [];
    if (Array.isArray(val)) return val;
    try { return JSON.parse(val); } catch { return val.split('\n').filter(Boolean); }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="flex items-center justify-between px-4 py-3 bg-white border-b border-gray-100 sticky top-0 z-40">
        <div className="flex items-center gap-3 min-w-0">
          <button onClick={() => navigate(-1)} className="p-1 rounded-full hover:bg-gray-100 flex-shrink-0">
            <ArrowLeft size={20} className="text-gray-700" />
          </button>
          <h1 className="text-lg font-bold text-gray-900 truncate">{name}</h1>
        </div>
        <button
          onClick={toggleSave}
          disabled={saving}
          className="p-2 text-orange-500 flex-shrink-0 disabled:opacity-50"
        >
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

        {recipe.calories_per_serving && (
          <NutritionCard recipe={recipe} />
        )}

        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <h3 className="font-bold text-gray-900 mb-3">{t('ingredients')}</h3>
          <ul className="space-y-1.5">
            {parseList(ingList).map((ing, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                <span className="text-orange-400 mt-0.5">•</span>
                {typeof ing === 'object' ? `${ing.amount} ${ing.unit} ${ing.name}` : ing}
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

function NutritionCard({ recipe }) {
  const macros = [
    { label: 'Protein', value: recipe.protein_g,  unit: 'g', color: 'bg-blue-400',   daily: 50  },
    { label: 'Carbs',   value: recipe.carbs_g,    unit: 'g', color: 'bg-yellow-400', daily: 300 },
    { label: 'Fat',     value: recipe.fat_g,      unit: 'g', color: 'bg-red-400',    daily: 65  },
    { label: 'Fiber',   value: recipe.fiber_g,    unit: 'g', color: 'bg-green-400',  daily: 28  },
  ];

  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm">
      <h3 className="font-bold text-gray-900 mb-3">Nutrition per serving</h3>

      <div className="flex items-center justify-between bg-orange-50 rounded-xl px-4 py-3 mb-3">
        <span className="text-sm font-medium text-orange-700">Calories</span>
        <span className="text-2xl font-bold text-orange-500">{recipe.calories_per_serving} kcal</span>
      </div>

      <div className="space-y-2.5">
        {macros.filter(m => m.value != null).map(m => {
          const pct = Math.min(100, Math.round((m.value / m.daily) * 100));
          return (
            <div key={m.label}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-gray-500">{m.label}</span>
                <span className="text-xs font-semibold text-gray-700">
                  {m.value}{m.unit} <span className="text-gray-400 font-normal">({pct}% DV)</span>
                </span>
              </div>
              <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div className={`h-full rounded-full ${m.color}`} style={{ width: `${pct}%` }} />
              </div>
            </div>
          );
        })}
      </div>
      <p className="text-xs text-gray-400 mt-3">% Daily Value based on a 2000 kcal diet</p>
    </div>
  );
}
