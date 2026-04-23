import React, { useEffect, useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import api from '../lib/axios';
import TopBar from '../components/TopBar';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { LogOut, ChevronRight, Trash2, Heart, BookOpen, ImageOff, ShieldCheck, Plus, X } from 'lucide-react';

const DIET_TOGGLES = [
  { key: 'is_halal',      emoji: '🥩', label: 'Halal'        },
  { key: 'is_vegetarian', emoji: '🥗', label: 'Vegetarian'   },
  { key: 'is_vegan',      emoji: '🌱', label: 'Vegan'        },
  { key: 'ramadan_mode',  emoji: '🌙', label: 'Ramadan Mode' },
];

const COMMON_ALLERGENS = [
  { emoji: '🥜', label: 'Peanuts'   },
  { emoji: '🌰', label: 'Tree Nuts' },
  { emoji: '🥛', label: 'Dairy'     },
  { emoji: '🌾', label: 'Gluten'    },
  { emoji: '🥚', label: 'Eggs'      },
  { emoji: '🦐', label: 'Shellfish' },
  { emoji: '🐟', label: 'Fish'      },
  { emoji: '🫘', label: 'Soy'       },
  { emoji: '🌿', label: 'Sesame'    },
];

const CULTURAL_OPTIONS = ['Moroccan', 'Algerian', 'Tunisian', 'Egyptian', 'Lebanese', 'Turkish', 'Pakistani', 'Indian', 'French', 'Italian', 'Other'];

export default function ProfilePage() {
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const allergyInputRef = useRef();

  const [saving, setSaving] = useState(false);
  const [prefs, setPrefs] = useState({
    is_halal: false,
    is_vegetarian: false,
    is_vegan: false,
    ramadan_mode: false,
  });
  const [allergies, setAllergies] = useState([]);
  const [customAllergy, setCustomAllergy] = useState('');
  const [cultural, setCultural] = useState('');
  const [allergySaving, setAllergySaving] = useState(false);

  const [posts, setPosts] = useState([]);
  const [postsLoading, setPostsLoading] = useState(true);

  const loadedRef = useRef(false);
  const prefsRef = useRef(prefs);
  const culturalRef = useRef(cultural);
  prefsRef.current = prefs;
  culturalRef.current = cultural;

  useEffect(() => {
    api.get('/profile').then(res => {
      const p = res.data.profile || {};
      setPrefs({
        is_halal:      !!p.is_halal,
        is_vegetarian: !!p.is_vegetarian,
        is_vegan:      !!p.is_vegan,
        ramadan_mode:  !!p.ramadan_mode,
      });
      setAllergies(p.allergies || []);
      setCultural(p.cultural_background || '');
      loadedRef.current = true;
    }).catch(() => {});

    api.get('/my-posts')
      .then(res => setPosts(res.data.posts || []))
      .catch(() => {})
      .finally(() => setPostsLoading(false));
  }, []);

  useEffect(() => {
    if (!loadedRef.current) return;
    setAllergySaving(true);
    const timer = setTimeout(async () => {
      try {
        await api.put('/profile', {
          ...prefsRef.current,
          allergies,
          cultural_background: culturalRef.current || null,
        });
      } catch (e) {
        toast.error('Could not save allergies');
        console.error(e);
      } finally {
        setAllergySaving(false);
      }
    }, 600);
    return () => clearTimeout(timer);
  }, [allergies]);

  const togglePref = (key) => setPrefs(prev => ({ ...prev, [key]: !prev[key] }));

  const addAllergen = (label) => {
    const val = label.trim();
    if (!val || allergies.map(a => a.toLowerCase()).includes(val.toLowerCase())) return;
    setAllergies(prev => [...prev, val]);
  };

  const removeAllergen = (val) => setAllergies(prev => prev.filter(a => a !== val));

  const addCustom = () => {
    addAllergen(customAllergy);
    setCustomAllergy('');
  };

  const save = async () => {
    setSaving(true);
    try {
      await api.put('/profile', {
        ...prefs,
        allergies,
        cultural_background: cultural || null,
      });
      toast.success('Preferences saved!');
    } catch (e) {
      console.error(e);
      toast.error('Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const deletePost = async (id) => {
    try {
      await api.delete(`/community/${id}`);
      setPosts(prev => prev.filter(p => p.id !== id));
      toast.success('Post deleted');
    } catch {
      toast.error('Could not delete post');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <TopBar title={t('profile')} />
      <div className="p-4 space-y-4">

        {/* Avatar */}
        <div className="bg-white rounded-2xl p-4 shadow-sm flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-orange-100 flex items-center justify-center text-2xl font-bold text-orange-500">
            {user?.name?.[0]?.toUpperCase() || '?'}
          </div>
          <div>
            <p className="font-bold text-lg text-gray-900">{user?.name}</p>
            <p className="text-gray-400 text-sm">{user?.email}</p>
          </div>
        </div>

        {/* Dietary preferences */}
        <div className="bg-white rounded-2xl p-4 shadow-sm space-y-3">
          <h3 className="font-semibold text-gray-900">Dietary Preferences</h3>
          <div className="grid grid-cols-2 gap-2">
            {DIET_TOGGLES.map(({ key, emoji, label }) => (
              <button
                key={key}
                onClick={() => togglePref(key)}
                className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-sm font-medium transition-colors ${
                  prefs[key]
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

        {/* Allergies */}
        <div className="bg-white rounded-2xl p-4 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-gray-900">Allergies</h3>
              <p className="text-xs text-gray-400 mt-0.5">Recipes will never include these ingredients</p>
            </div>
            {allergySaving && <span className="text-xs text-orange-400">Saving...</span>}
          </div>

          {/* Common allergen chips */}
          <div className="flex flex-wrap gap-2">
            {COMMON_ALLERGENS.map(({ emoji, label }) => {
              const active = allergies.map(a => a.toLowerCase()).includes(label.toLowerCase());
              return (
                <button
                  key={label}
                  onClick={() => active ? removeAllergen(allergies.find(a => a.toLowerCase() === label.toLowerCase())) : addAllergen(label)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                    active
                      ? 'bg-red-500 text-white border-red-500'
                      : 'bg-gray-50 text-gray-600 border-gray-200'
                  }`}
                >
                  <span>{emoji}</span>
                  <span>{label}</span>
                  {active && <X size={12} />}
                </button>
              );
            })}
          </div>

          {/* Custom allergy input */}
          <div className="flex gap-2">
            <input
              ref={allergyInputRef}
              value={customAllergy}
              onChange={e => setCustomAllergy(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addCustom()}
              placeholder="Other allergy (e.g. Mango, Mustard...)"
              className="flex-1 px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
            />
            <button
              onClick={addCustom}
              disabled={!customAllergy.trim()}
              className="px-3 py-2.5 bg-orange-500 text-white rounded-xl disabled:opacity-40"
            >
              <Plus size={18} />
            </button>
          </div>

          {/* Active custom allergies (non-common ones) */}
          {allergies.filter(a => !COMMON_ALLERGENS.map(c => c.label.toLowerCase()).includes(a.toLowerCase())).length > 0 && (
            <div className="flex flex-wrap gap-2">
              {allergies
                .filter(a => !COMMON_ALLERGENS.map(c => c.label.toLowerCase()).includes(a.toLowerCase()))
                .map(a => (
                  <span key={a} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium bg-red-500 text-white">
                    {a}
                    <button onClick={() => removeAllergen(a)}><X size={12} /></button>
                  </span>
                ))
              }
            </div>
          )}
        </div>

        {/* Cultural background */}
        <div className="bg-white rounded-2xl p-4 shadow-sm space-y-3">
          <div>
            <h3 className="font-semibold text-gray-900">Cultural Background</h3>
            <p className="text-xs text-gray-400 mt-0.5">Influences the style of recipes suggested to you</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {CULTURAL_OPTIONS.map(opt => (
              <button
                key={opt}
                onClick={() => setCultural(cultural === opt ? '' : opt)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                  cultural === opt
                    ? 'bg-orange-500 text-white border-orange-500'
                    : 'bg-gray-50 text-gray-600 border-gray-200'
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
          {cultural && !CULTURAL_OPTIONS.includes(cultural) && (
            <p className="text-sm text-orange-600 font-medium">Current: {cultural}</p>
          )}
        </div>

        {/* Save button */}
        <button
          onClick={save}
          disabled={saving}
          className="w-full py-3.5 bg-orange-500 text-white rounded-xl font-bold text-base disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save Preferences'}
        </button>

        {/* My Posts */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="px-4 pt-4 pb-3 border-b border-gray-100">
            <h3 className="font-semibold text-gray-900">My Posts</h3>
            <p className="text-xs text-gray-400 mt-0.5">{posts.length} {posts.length === 1 ? 'post' : 'posts'}</p>
          </div>
          {postsLoading ? (
            <div className="py-8 text-center text-gray-300 text-sm">Loading...</div>
          ) : posts.length === 0 ? (
            <div className="py-10 text-center text-gray-400">
              <p className="text-3xl mb-2">📸</p>
              <p className="text-sm">You haven't posted anything yet</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {posts.map(post => (
                <PostRow key={post.id} post={post} onDelete={deletePost} />
              ))}
            </div>
          )}
        </div>

        {/* Admin panel link */}
        {user?.is_admin && (
          <a href="http://localhost:5174" target="_blank" rel="noreferrer" className="w-full flex items-center justify-between bg-orange-50 border border-orange-100 rounded-2xl p-4 shadow-sm text-orange-600 font-medium">
            <div className="flex items-center gap-3"><ShieldCheck size={18} />Admin Panel</div>
            <ChevronRight size={16} />
          </a>
        )}

        {/* Logout */}
        <button onClick={logout} className="w-full flex items-center justify-between bg-white rounded-2xl p-4 shadow-sm text-red-500 font-medium">
          <div className="flex items-center gap-3"><LogOut size={18} />{t('logout')}</div>
          <ChevronRight size={16} />
        </button>

      </div>
    </div>
  );
}

function PostRow({ post, onDelete }) {
  const [confirming, setConfirming] = useState(false);
  return (
    <div className="flex items-start gap-3 px-4 py-3">
      <div className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 bg-gray-100 flex items-center justify-center">
        {post.image
          ? <img src={post.image} alt="" className="w-full h-full object-cover" />
          : <ImageOff size={18} className="text-gray-300" />
        }
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-gray-800 leading-snug line-clamp-2">
          {post.body || <span className="text-gray-400 italic">No caption</span>}
        </p>
        {post.recipe && (
          <div className="flex items-center gap-1 mt-1">
            <BookOpen size={11} className="text-orange-400" />
            <span className="text-xs text-orange-500 truncate">{post.recipe.title}</span>
          </div>
        )}
        <div className="flex items-center gap-1 mt-1">
          <Heart size={11} className="text-gray-300" />
          <span className="text-xs text-gray-400">{post.likes || 0}</span>
        </div>
      </div>
      <button
        onClick={() => { if (!confirming) { setConfirming(true); return; } onDelete(post.id); }}
        onBlur={() => setConfirming(false)}
        className={`flex-shrink-0 px-2.5 py-1.5 rounded-xl text-xs font-medium transition-colors ${
          confirming ? 'bg-red-500 text-white' : 'text-gray-300 hover:text-red-400'
        }`}
      >
        {confirming ? 'Delete?' : <Trash2 size={16} />}
      </button>
    </div>
  );
}
