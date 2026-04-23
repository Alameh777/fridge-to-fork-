import React, { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Camera, Plus, Zap } from 'lucide-react';
import api from '../lib/axios';
import TopBar from '../components/TopBar';
import IngredientTag from '../components/IngredientTag';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';

const DIET_FILTERS = [
  { key: 'is_halal',      emoji: '🥩', label: 'Halal' },
  { key: 'is_vegetarian', emoji: '🥗', label: 'Vegetarian' },
  { key: 'is_vegan',      emoji: '🌱', label: 'Vegan' },
];

export default function ScanPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const fileRef = useRef();
  const [ingredients, setIngredients] = useState([]);
  const [inputVal, setInputVal] = useState('');
  const [scanning, setScanning] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [activeFilters, setActiveFilters] = useState({});

  const toggleFilter = (key) => {
    setActiveFilters(prev =>
      prev[key]
        ? Object.fromEntries(Object.entries(prev).filter(([k]) => k !== key))
        : { ...prev, [key]: true }
    );
  };

  const handlePhoto = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setScanning(true);
    try {
      const base64 = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result.split(',')[1]);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      const res = await api.post('/ai/scan', {
        image: base64,
        mime_type: file.type || 'image/jpeg',
      });
      const found = res.data.ingredients || [];
      setIngredients(prev => [...new Set([...prev, ...found])]);
      toast.success(`${found.length} ${t('ingredients_found')}`);
    } catch {
      toast.error('Could not detect ingredients');
    } finally {
      setScanning(false);
      e.target.value = '';
    }
  };

  const addIngredient = () => {
    const val = inputVal.trim();
    if (!val) return;
    setIngredients(prev => prev.includes(val) ? prev : [...prev, val]);
    setInputVal('');
  };

  const removeIngredient = (ing) => setIngredients(prev => prev.filter(i => i !== ing));

  const generate = async () => {
    if (ingredients.length === 0) { toast.error('Add at least one ingredient'); return; }
    setGenerating(true);
    try {
      const res = await api.post('/ai/generate', { ingredients, filters: activeFilters });
      navigate('/results', { state: { recipes: res.data.recipes, ingredients } });
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to generate recipes';
      toast.error(msg, { duration: 5000 });
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-cream-50 pb-24">
      <TopBar title={t('scan_title')} />
      <div className="p-4 space-y-4">

        {/* Photo scan */}
        <div className="bg-white rounded-2xl p-5 shadow-sm text-center">
          <p className="text-gray-500 text-sm mb-4">{t('scan_subtitle')}</p>
          <button
            onClick={() => fileRef.current?.click()}
            disabled={scanning}
            className="w-full py-4 gradient-orange text-white rounded-xl font-bold flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {scanning ? <LoadingSpinner /> : <><Camera size={22} />{t('take_photo')}</>}
          </button>
          <input ref={fileRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handlePhoto} />
        </div>

        {/* Manual ingredient input */}
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <div className="flex gap-2">
            <input
              value={inputVal}
              onChange={e => setInputVal(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addIngredient()}
              placeholder={t('ingredient_placeholder')}
              className="flex-1 px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
            />
            <button onClick={addIngredient} className="p-2.5 bg-orange-500 text-white rounded-xl">
              <Plus size={20} />
            </button>
          </div>
          {ingredients.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {ingredients.map(ing => (
                <IngredientTag key={ing} ingredient={ing} onRemove={removeIngredient} />
              ))}
            </div>
          )}
        </div>

        {/* Dietary filters */}
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <p className="text-sm font-semibold text-gray-700 mb-3">{t('dietary_preferences') || 'Dietary Preferences'}</p>
          <div className="grid grid-cols-2 gap-2">
            {DIET_FILTERS.map(({ key, emoji, label }) => (
              <button
                key={key}
                onClick={() => toggleFilter(key)}
                className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-sm font-medium transition-colors ${
                  activeFilters[key]
                    ? 'bg-orange-500 text-white border-orange-500'
                    : 'bg-gray-50 text-gray-600 border-gray-200'
                }`}
              >
                <span>{emoji}</span>
                <span>{label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Generate button */}
        {ingredients.length > 0 && (
          <button
            onClick={generate}
            disabled={generating}
            className="w-full py-4 gradient-orange text-white rounded-xl font-bold text-lg flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {generating ? <LoadingSpinner text={t('generating')} /> : <><Zap size={22} />{t('generate_recipes')}</>}
          </button>
        )}
      </div>
    </div>
  );
}
