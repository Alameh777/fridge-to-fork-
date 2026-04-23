import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export default function NotFoundPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-6 text-center">
      <p className="text-8xl mb-4">🍽️</p>
      <h1 className="text-2xl font-bold text-gray-800 mb-2">404</h1>
      <p className="text-gray-500 mb-6">{t('page_not_found')}</p>
      <button onClick={() => navigate('/')} className="px-6 py-3 bg-orange-500 text-white rounded-xl font-semibold">
        {t('go_home')}
      </button>
    </div>
  );
}
