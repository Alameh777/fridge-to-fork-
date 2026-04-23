import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import TopBar from '../components/TopBar';
import RecipeCard from '../components/RecipeCard';

export default function ResultsPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { state } = useLocation();
  const recipes = state?.recipes || [];

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <TopBar title={t('results_title')} showBack />
      <div className="p-4">
        {recipes.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <p className="text-5xl mb-3">🤔</p>
            <p>{t('no_results')}</p>
            <button onClick={() => navigate(-1)} className="mt-4 px-6 py-2.5 bg-orange-500 text-white rounded-xl font-semibold text-sm">
              {t('go_home')}
            </button>
          </div>
        ) : (
          <div className="grid gap-4">
            {recipes.map((recipe, i) => (
              <RecipeCard key={recipe.id || i} recipe={recipe} onClick={() => navigate(`/recipe/${recipe.id}`, { state: { recipe } })} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
