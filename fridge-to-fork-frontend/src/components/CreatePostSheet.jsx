import React, { useState, useRef, useEffect } from 'react';
import { Camera, X, BookOpen, ChevronDown, Search } from 'lucide-react';
import api from '../lib/axios';
import LoadingSpinner from './LoadingSpinner';
import toast from 'react-hot-toast';

export default function CreatePostSheet({ onClose, onPosted }) {
  const fileRef = useRef();
  const [photo, setPhoto] = useState(null);
  const [opinion, setOpinion] = useState('');
  const [recipes, setRecipes] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [showPicker, setShowPicker] = useState(false);
  const [posting, setPosting] = useState(false);

  useEffect(() => {
    api.get('/recipes', { params: { per_page: 50 } })
      .then(res => setRecipes(res.data.data || []))
      .catch(() => {});
  }, []);

  const handlePhoto = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setPhoto(reader.result);
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handlePost = async () => {
    if (!opinion.trim() && !photo) {
      toast.error('Add a photo or write something');
      return;
    }
    setPosting(true);
    try {
      const res = await api.post('/community', {
        type: 'post',
        title: opinion.trim().slice(0, 100) || 'My dish',
        body: opinion.trim(),
        recipe_id: selectedRecipe?.id ?? null,
        image: photo,
      });
      onPosted(res.data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to post');
    } finally {
      setPosting(false);
    }
  };

  const filtered = recipes.filter(r =>
    r.title?.toLowerCase().includes(search.toLowerCase()) ||
    r.title_ar?.includes(search)
  );

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-[60]" onClick={onClose} />

      <div className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl z-[70] max-h-[92vh] flex flex-col">
        <div className="flex justify-center pt-3 pb-1 flex-shrink-0">
          <div className="w-10 h-1 bg-gray-200 rounded-full" />
        </div>

        <div className="flex items-center justify-between px-4 py-2 border-b border-gray-100 flex-shrink-0">
          <h2 className="font-bold text-gray-900">Share your dish</h2>
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-gray-100">
            <X size={18} className="text-gray-500" />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 p-4 space-y-4 pb-2">

          {/* Photo */}
          {photo ? (
            <div className="relative rounded-2xl overflow-hidden">
              <img src={photo} alt="preview" className="w-full h-52 object-cover" />
              <button
                onClick={() => setPhoto(null)}
                className="absolute top-2 right-2 bg-black/50 text-white rounded-full p-1.5"
              >
                <X size={15} />
              </button>
            </div>
          ) : (
            <button
              onClick={() => fileRef.current?.click()}
              className="w-full h-36 border-2 border-dashed border-orange-200 rounded-2xl flex flex-col items-center justify-center gap-2 bg-orange-50 active:bg-orange-100 transition-colors"
            >
              <Camera size={30} className="text-orange-400" />
              <span className="text-sm font-medium text-orange-500">Tap to add a photo</span>
              <span className="text-xs text-orange-300">Show off your dish!</span>
            </button>
          )}
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={handlePhoto}
          />

          {/* Opinion */}
          <textarea
            value={opinion}
            onChange={e => setOpinion(e.target.value)}
            placeholder="How did it turn out? Any tweaks you made?"
            rows={3}
            className="w-full px-4 py-3 border border-gray-200 rounded-2xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-orange-300 placeholder-gray-400"
          />

          {/* Recipe picker */}
          <div>
            <button
              onClick={() => setShowPicker(v => !v)}
              className="w-full flex items-center justify-between px-4 py-3 border border-gray-200 rounded-2xl text-sm bg-white"
            >
              <div className="flex items-center gap-2 min-w-0">
                <BookOpen size={16} className="text-orange-400 flex-shrink-0" />
                {selectedRecipe ? (
                  <span className="font-medium text-orange-700 truncate">{selectedRecipe.title}</span>
                ) : (
                  <span className="text-gray-400">Attach a recipe (optional)</span>
                )}
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                {selectedRecipe && (
                  <button
                    onClick={e => { e.stopPropagation(); setSelectedRecipe(null); }}
                    className="p-1 rounded-full hover:bg-gray-100"
                  >
                    <X size={14} className="text-gray-400" />
                  </button>
                )}
                <ChevronDown size={16} className={`text-gray-400 transition-transform ${showPicker ? 'rotate-180' : ''}`} />
              </div>
            </button>

            {showPicker && (
              <div className="mt-2 border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
                <div className="px-3 py-2 border-b border-gray-100">
                  <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2">
                    <Search size={14} className="text-gray-400" />
                    <input
                      value={search}
                      onChange={e => setSearch(e.target.value)}
                      placeholder="Search recipes..."
                      className="flex-1 text-sm bg-transparent outline-none"
                      autoFocus
                    />
                  </div>
                </div>
                <div className="max-h-44 overflow-y-auto">
                  {filtered.length === 0 ? (
                    <p className="text-sm text-gray-400 text-center py-5">No recipes found</p>
                  ) : (
                    filtered.map(r => (
                      <button
                        key={r.id}
                        onClick={() => { setSelectedRecipe(r); setShowPicker(false); setSearch(''); }}
                        className="w-full text-left px-4 py-3 text-sm hover:bg-orange-50 active:bg-orange-100 border-b border-gray-50 last:border-0 transition-colors"
                      >
                        <p className="font-medium text-gray-800 truncate">{r.title}</p>
                        {r.cuisine && (
                          <p className="text-xs text-gray-400 capitalize mt-0.5">{r.cuisine}</p>
                        )}
                      </button>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

        </div>

        {/* Post button — pinned to bottom, always visible */}
        <div className="flex-shrink-0 px-4 py-4 border-t border-gray-100 bg-white">
          <button
            onClick={handlePost}
            disabled={posting || (!opinion.trim() && !photo)}
            className="w-full py-4 gradient-orange text-white rounded-xl font-bold text-base disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {posting ? <LoadingSpinner /> : 'Post to Community'}
          </button>
        </div>
      </div>
    </>
  );
}
