import React, { useEffect, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Heart, Plus, BookOpen, Trash2, MessageCircle } from 'lucide-react';
import api from '../lib/axios';
import TopBar from '../components/TopBar';
import LoadingSpinner from '../components/LoadingSpinner';
import CreatePostSheet from '../components/CreatePostSheet';
import CommentsSheet from '../components/CommentsSheet';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

export default function CommunityPage() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [commentPostId, setCommentPostId] = useState(null);

  const fetchPosts = () => {
    setLoading(true);
    api.get('/community')
      .then(res => setPosts(res.data.posts || []))
      .catch(() => toast.error('Could not load posts'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchPosts(); }, []);

  const handleLike = async (postId) => {
    if (!user) { toast.error('Login to like posts'); return; }
    try {
      const res = await api.post(`/community/${postId}/like`);
      setPosts(prev => prev.map(p =>
        p.id === postId
          ? { ...p, likes: res.data.likes_count, user_liked: res.data.liked }
          : p
      ));
    } catch {}
  };

  const handleDelete = async (postId) => {
    try {
      await api.delete(`/community/${postId}`);
      setPosts(prev => prev.filter(p => p.id !== postId));
      toast.success('Post deleted');
    } catch {
      toast.error('Could not delete post');
    }
  };

  const handlePostCreated = (newPost) => {
    setPosts(prev => [newPost, ...prev]);
    setShowCreate(false);
    toast.success('Posted!');
  };

  const isAr = i18n.language === 'ar';

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <TopBar title={t('community')} />

      <div className="p-4 space-y-4">
        {loading ? (
          <div className="flex justify-center py-16">
            <LoadingSpinner />
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <p className="text-5xl mb-3">👨‍🍳</p>
            <p className="font-medium">No posts yet</p>
            <p className="text-sm mt-1">Be the first to share a dish!</p>
          </div>
        ) : (
          posts.map(post => (
            <PostCard
              key={post.id}
              post={post}
              isAr={isAr}
              currentUserId={user?.id}
              onLike={handleLike}
              onDelete={handleDelete}
              onRecipeClick={(id) => navigate(`/recipe/${id}`)}
              onComment={() => setCommentPostId(post.id)}
              onCommentCountChange={(n) => setPosts(prev => prev.map(p => p.id === post.id ? { ...p, comments_count: n } : p))}
              liked={!!post.user_liked}
            />
          ))
        )}
      </div>

      {user && (
        <button
          onClick={() => setShowCreate(true)}
          className="fixed bottom-24 right-4 w-14 h-14 gradient-orange rounded-full shadow-lg flex items-center justify-center text-white z-30 active:scale-95 transition-transform"
        >
          <Plus size={26} />
        </button>
      )}

      {showCreate && (
        <CreatePostSheet
          onClose={() => setShowCreate(false)}
          onPosted={handlePostCreated}
        />
      )}

      {commentPostId && (
        <CommentsSheet
          postId={commentPostId}
          onClose={() => setCommentPostId(null)}
          onCountChange={(n) => setPosts(prev => prev.map(p => p.id === commentPostId ? { ...p, comments_count: n } : p))}
        />
      )}
    </div>
  );
}

function PostCard({ post, isAr, currentUserId, onLike, onDelete, onRecipeClick, onComment, liked }) {
  const [confirming, setConfirming] = useState(false);
  const initial = post.user?.name?.[0]?.toUpperCase() || '?';
  const recipeTitle = isAr ? (post.recipe?.title_ar || post.recipe?.title) : post.recipe?.title;
  const isOwner = !!currentUserId && Number(post.user_id) === Number(currentUserId);

  const handleDelete = () => {
    if (!confirming) { setConfirming(true); return; }
    onDelete(post.id);
  };

  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm">
      {post.image && (
        <img
          src={post.image}
          alt="dish"
          className="w-full h-56 object-cover"
        />
      )}

      <div className="p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold text-sm flex-shrink-0">
              {initial}
            </div>
            <div>
              <p className="font-semibold text-sm text-gray-900">{post.user?.name}</p>
              <p className="text-xs text-gray-400">{formatTime(post.created_at)}</p>
            </div>
          </div>
          {isOwner && (
            <button
              onClick={handleDelete}
              onBlur={() => setConfirming(false)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors ${
                confirming ? 'bg-red-500 text-white' : 'text-gray-300 hover:text-red-400'
              }`}
            >
              {confirming ? 'Delete?' : <Trash2 size={16} />}
            </button>
          )}
        </div>

        {/* Opinion */}
        {post.body && (
          <p className="text-gray-800 text-sm leading-relaxed mb-3">{post.body}</p>
        )}

        {/* Attached recipe */}
        {post.recipe && (
          <button
            onClick={() => onRecipeClick(post.recipe.id)}
            className="flex items-center gap-2 w-full bg-orange-50 border border-orange-100 rounded-xl px-3 py-2.5 mb-3 text-left active:bg-orange-100 transition-colors"
          >
            <BookOpen size={15} className="text-orange-500 flex-shrink-0" />
            <div className="min-w-0">
              <p className="text-sm font-semibold text-orange-700 truncate">{recipeTitle}</p>
              {post.recipe.cuisine && (
                <p className="text-xs text-orange-400 capitalize">{post.recipe.cuisine}</p>
              )}
            </div>
          </button>
        )}

        {/* Actions */}
        <div className="flex items-center gap-4 pt-1">
          <button
            onClick={() => onLike(post.id)}
            className="flex items-center gap-1.5 text-sm transition-colors"
          >
            <Heart
              size={16}
              className={liked ? 'text-red-500' : 'text-gray-400'}
              fill={liked ? 'currentColor' : 'none'}
            />
            <span className={liked ? 'text-red-500' : 'text-gray-400'}>{post.likes || 0}</span>
          </button>
          <button
            onClick={onComment}
            className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-blue-400 transition-colors"
          >
            <MessageCircle size={16} />
            <span>{post.comments_count || 0}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

function formatTime(dateStr) {
  if (!dateStr) return '';
  const diff = Math.floor((Date.now() - new Date(dateStr)) / 1000);
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return new Date(dateStr).toLocaleDateString();
}
