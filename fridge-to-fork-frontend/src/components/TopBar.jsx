import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Globe } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function TopBar({ title, showBack = false, showLang = true }) {
  const navigate = useNavigate();
  const { i18n } = useTranslation();

  const toggleLang = () => {
    const next = i18n.language === 'ar' ? 'en' : 'ar';
    i18n.changeLanguage(next);
    document.documentElement.dir = next === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = next;
  };

  return (
    <div className="flex items-center justify-between px-4 py-3 bg-white border-b border-gray-100 sticky top-0 z-40">
      <div className="flex items-center gap-3">
        {showBack && (
          <button onClick={() => navigate(-1)} className="p-1 rounded-full hover:bg-gray-100">
            <ArrowLeft size={20} className="text-gray-700" />
          </button>
        )}
        <h1 className="text-lg font-bold text-gray-900">{title}</h1>
      </div>
      {showLang && (
        <button onClick={toggleLang} className="flex items-center gap-1 text-sm text-orange-500 font-medium">
          <Globe size={16} />
          {i18n.language === 'ar' ? 'EN' : 'عر'}
        </button>
      )}
    </div>
  );
}
