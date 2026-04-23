import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trash2, Users, MessageSquare, ArrowLeft, ShieldCheck } from 'lucide-react';
import api from '../lib/axios';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';

export default function AdminPage() {
  const navigate = useNavigate();
  const [tab, setTab] = useState('users');
  const [users, setUsers] = useState([]);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const req = tab === 'users'
      ? api.get('/admin/users').then(r => setUsers(r.data.users || []))
      : api.get('/admin/posts').then(r => setPosts(r.data.posts || []));
    req.catch(() => toast.error('Failed to load')).finally(() => setLoading(false));
  }, [tab]);

  const deleteUser = async (id) => {
    try {
      await api.delete(`/admin/users/${id}`);
      setUsers(prev => prev.filter(u => u.id !== id));
      toast.success('User deleted');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    }
  };

  const deletePost = async (id) => {
    try {
      await api.delete(`/admin/posts/${id}`);
      setPosts(prev => prev.filter(p => p.id !== id));
      toast.success('Post deleted');
    } catch {
      toast.error('Failed');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 bg-white border-b border-gray-100 sticky top-0 z-40">
        <button onClick={() => navigate(-1)} className="p-1 rounded-full hover:bg-gray-100">
          <ArrowLeft size={20} className="text-gray-700" />
        </button>
        <ShieldCheck size={20} className="text-orange-500" />
        <h1 className="text-lg font-bold text-gray-900">Admin Panel</h1>
      </div>

      {/* Tabs */}
      <div className="flex bg-white border-b border-gray-100">
        <TabBtn active={tab === 'users'} onClick={() => setTab('users')} icon={<Users size={16} />} label={`Users (${users.length})`} />
        <TabBtn active={tab === 'posts'} onClick={() => setTab('posts')} icon={<MessageSquare size={16} />} label={`Posts (${posts.length})`} />
      </div>

      <div className="p-4">
        {loading ? (
          <div className="flex justify-center py-16"><LoadingSpinner /></div>
        ) : tab === 'users' ? (
          <UsersList users={users} onDelete={deleteUser} />
        ) : (
          <PostsList posts={posts} onDelete={deletePost} />
        )}
      </div>
    </div>
  );
}

function TabBtn({ active, onClick, icon, label }) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium border-b-2 transition-colors ${
        active ? 'border-orange-500 text-orange-600' : 'border-transparent text-gray-400'
      }`}
    >
      {icon}{label}
    </button>
  );
}

function UsersList({ users, onDelete }) {
  if (users.length === 0) return <Empty icon="👤" text="No users found" />;
  return (
    <div className="space-y-2">
      {users.map(u => (
        <UserRow key={u.id} user={u} onDelete={onDelete} />
      ))}
    </div>
  );
}

function UserRow({ user, onDelete }) {
  const [confirming, setConfirming] = useState(false);
  return (
    <div className="bg-white rounded-2xl px-4 py-3 shadow-sm flex items-center gap-3">
      <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold flex-shrink-0">
        {user.name?.[0]?.toUpperCase() || '?'}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="font-semibold text-sm text-gray-900 truncate">{user.name}</p>
          {user.is_admin && (
            <span className="text-xs bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full font-medium">Admin</span>
          )}
        </div>
        <p className="text-xs text-gray-400 truncate">{user.email}</p>
        <p className="text-xs text-gray-300">{user.community_posts_count} posts · joined {new Date(user.created_at).toLocaleDateString()}</p>
      </div>
      {!user.is_admin && (
        <DeleteBtn confirming={confirming} setConfirming={setConfirming} onConfirm={() => onDelete(user.id)} />
      )}
    </div>
  );
}

function PostsList({ posts, onDelete }) {
  if (posts.length === 0) return <Empty icon="📝" text="No posts found" />;
  return (
    <div className="space-y-2">
      {posts.map(p => (
        <PostRow key={p.id} post={p} onDelete={onDelete} />
      ))}
    </div>
  );
}

function PostRow({ post, onDelete }) {
  const [confirming, setConfirming] = useState(false);
  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden flex items-start gap-3 p-3">
      {post.image ? (
        <img src={post.image} alt="" className="w-14 h-14 rounded-xl object-cover flex-shrink-0" />
      ) : (
        <div className="w-14 h-14 rounded-xl bg-gray-100 flex-shrink-0" />
      )}
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-orange-500">{post.user?.name || 'Unknown'}</p>
        <p className="text-sm text-gray-700 line-clamp-2 mt-0.5">
          {post.body || <span className="text-gray-400 italic">No caption</span>}
        </p>
        <p className="text-xs text-gray-300 mt-1">{new Date(post.created_at).toLocaleDateString()} · ♥ {post.likes || 0}</p>
      </div>
      <DeleteBtn confirming={confirming} setConfirming={setConfirming} onConfirm={() => onDelete(post.id)} />
    </div>
  );
}

function DeleteBtn({ confirming, setConfirming, onConfirm }) {
  return (
    <button
      onClick={() => confirming ? onConfirm() : setConfirming(true)}
      onBlur={() => setConfirming(false)}
      className={`flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-medium transition-colors ${
        confirming ? 'bg-red-500 text-white' : 'text-gray-300 hover:text-red-400'
      }`}
    >
      {confirming ? 'Delete?' : <Trash2 size={15} />}
    </button>
  );
}

function Empty({ icon, text }) {
  return (
    <div className="text-center py-16 text-gray-400">
      <p className="text-4xl mb-2">{icon}</p>
      <p className="text-sm">{text}</p>
    </div>
  );
}
