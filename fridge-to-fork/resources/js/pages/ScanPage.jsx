import React, { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Camera, Plus, X, Zap } from 'lucide-react';
import api from '../lib/axios';
import TopBar from '../components/TopBar';
import IngredientTag from '../components/IngredientTag';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';

export default function ScanPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const fileRef = useRef();
  const [ingredients, setIngredients] = useState([]);
  const [inputVal, setInputVal] = useState('');
  const [scanning, setScanning] = useState(false);
  const [generating, setGenerating] = useState(false);

  const handlePhoto = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setScanning(true);
    try {
      const fd = new FormData();
      fd.append('image', file);
      const res = await api.post('/ai/scan', fd);
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
      const res = await api.post('/ai/generate', { ingredients });
      navigate('/results', { state: { recipes: res.data.recipes, ingredients } });
    } catch {
      toast.error('Failed to generate recipes');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-cream-50 pb-24">
      <TopBar title={t('scan_title')} />
      <div className="p-4 space-y-4">
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
