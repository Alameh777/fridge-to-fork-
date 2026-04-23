import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Heart, MessageCircle } from 'lucide-react';
import api from '../lib/axios';
import TopBar from '../components/TopBar';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';

export default function CommunityPage() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/community').then(res => setPosts(res.data.posts || [])).catch(() => toast.error(t('error_loading'))).finally(() => setLoading(false));
  }, []);

  const handleLike = async (postId) => {
    try {
      await api.post(`/community/${postId}/like`);
      setPosts(prev => prev.map(p => p.id === postId ? { ...p, likes_count: (p.likes_count || 0) + 1 } : p));
    } catch {}
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <TopBar title={t('community')} />
      <div className="p-4">
        {loading ? <LoadingSpinner /> : posts.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <p className="text-5xl mb-3">👥</p>
            <p>{t('no_posts_yet')}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {posts.map(post => (
              <div key={post.id} className="bg-white rounded-2xl p-4 shadow-sm">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-500 font-bold">
                    {post.user?.name?.[0] || '?'}
                  </div>
                  <div>
                    <p className="font-semibold text-sm">{post.user?.name}</p>
                    <p className="text-xs text-gray-400">{new Date(post.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
                <p className="text-gray-800 mb-3">{post.content}</p>
                {post.recipe && (
                  <div onClick={() => navigate(`/recipe/${post.recipe.id}`)} className="bg-orange-50 rounded-xl p-3 mb-3 cursor-pointer">
                    <p className="text-sm font-medium text-orange-700">
                      {i18n.language === 'ar' ? post.recipe.name_ar : post.recipe.name_en}
                    </p>
                  </div>
                )}
                <div className="flex gap-4 text-gray-400">
                  <button onClick={() => handleLike(post.id)} className="flex items-center gap-1 text-sm hover:text-red-400">
                    <Heart size={16} /> {post.likes_count || 0}
                  </button>
                  <button className="flex items-center gap-1 text-sm hover:text-blue-400">
                    <MessageCircle size={16} /> {post.comments_count || 0}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
