import React from 'react';
import { useTranslation } from 'react-i18next';
import { Clock, Users, ChevronRight } from 'lucide-react';
import DietaryBadge from './DietaryBadge';

export default function RecipeCard({ recipe, onClick }) {
  const { i18n } = useTranslation();
  const isAr = i18n.language === 'ar';
  const name = isAr ? recipe.title_ar : recipe.title;
  const desc = isAr ? recipe.description_ar : recipe.description;

  return (
    <div onClick={onClick} className="bg-white rounded-2xl p-4 shadow-sm cursor-pointer active:scale-95 transition-transform">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-gray-900 text-base truncate">{name}</h3>
          {desc && <p className="text-gray-500 text-sm mt-1 line-clamp-2">{desc}</p>}
          <div className="flex items-center gap-3 mt-2 text-gray-400 text-xs">
            {(recipe.prep_time || recipe.cook_time) && (
              <span className="flex items-center gap-1">
                <Clock size={13} /> {(recipe.prep_time || 0) + (recipe.cook_time || 0)}m
              </span>
            )}
            {recipe.servings && (
              <span className="flex items-center gap-1">
                <Users size={13} /> {recipe.servings}
              </span>
            )}
          </div>
          <div className="flex flex-wrap gap-1 mt-2">
            {['is_halal', 'is_vegetarian', 'is_vegan'].map(t =>
              recipe[t] ? <DietaryBadge key={t} type={t} isAr={isAr} /> : null
            )}
          </div>
        </div>
        <ChevronRight size={18} className="text-gray-300 flex-shrink-0 mt-1" />
      </div>
    </div>
  );
}
