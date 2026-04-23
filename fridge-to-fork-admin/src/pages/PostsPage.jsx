import { useEffect, useState } from 'react';
import { Trash2, Search, Heart, ImageOff, MessageCircle, ChevronDown, ChevronUp, X } from 'lucide-react';
import api from '../lib/axios';
import toast from 'react-hot-toast';

export default function PostsPage() {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [confirmId, setConfirmId] = useState(null);
    const [expandedId, setExpandedId] = useState(null);

    useEffect(() => {
        api.get('/admin/posts')
            .then(r => setPosts(r.data.posts || []))
            .catch(() => toast.error('Failed to load posts'))
            .finally(() => setLoading(false));
    }, []);

    const deletePost = async (id) => {
        try {
            await api.delete(`/admin/posts/${id}`);
            setPosts(prev => prev.filter(p => p.id !== id));
            setConfirmId(null);
            if (expandedId === id) setExpandedId(null);
            toast.success('Post deleted');
        } catch {
            toast.error('Failed');
        }
    };

    const handleDeleteComment = (postId, commentId) => {
        setPosts(prev => prev.map(p =>
            p.id === postId
                ? { ...p, comments_count: Math.max(0, (p.comments_count || 1) - 1) }
                : p
        ));
    };

    const filtered = posts.filter(p =>
        p.body?.toLowerCase().includes(search.toLowerCase()) ||
        p.user?.name?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="p-8">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Community Posts</h1>
                    <p className="text-gray-500 text-sm mt-1">{posts.length} total</p>
                </div>
                <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3 py-2 w-64">
                    <Search size={16} className="text-gray-400" />
                    <input
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Search by user or caption..."
                        className="flex-1 text-sm outline-none bg-transparent"
                    />
                </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-gray-100 bg-gray-50 text-left">
                            <th className="px-4 py-3 font-semibold text-gray-600">Photo</th>
                            <th className="px-4 py-3 font-semibold text-gray-600">Caption</th>
                            <th className="px-4 py-3 font-semibold text-gray-600">Author</th>
                            <th className="px-4 py-3 font-semibold text-gray-600">Likes</th>
                            <th className="px-4 py-3 font-semibold text-gray-600">Comments</th>
                            <th className="px-4 py-3 font-semibold text-gray-600">Date</th>
                            <th className="px-4 py-3"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {loading ? (
                            <tr><td colSpan={7} className="text-center py-12 text-gray-400">Loading...</td></tr>
                        ) : filtered.length === 0 ? (
                            <tr><td colSpan={7} className="text-center py-12 text-gray-400">No posts found</td></tr>
                        ) : filtered.map(p => (
                            <>
                                <tr key={p.id} className="hover:bg-gray-50 transition-colors align-top">
                                    {/* Photo */}
                                    <td className="px-4 py-4">
                                        <div className="w-14 h-14 rounded-xl overflow-hidden bg-gray-100 flex items-center justify-center flex-shrink-0">
                                            {p.image
                                                ? <img src={p.image} alt="" className="w-full h-full object-cover" />
                                                : <ImageOff size={16} className="text-gray-300" />
                                            }
                                        </div>
                                    </td>
                                    {/* Caption */}
                                    <td className="px-4 py-4 max-w-sm">
                                        <p className="text-gray-700 text-sm break-words whitespace-pre-wrap">
                                            {p.body || <span className="text-gray-400 italic">No caption</span>}
                                        </p>
                                    </td>
                                    {/* Author */}
                                    <td className="px-4 py-4">
                                        <div className="flex items-center gap-2">
                                            <div className="w-7 h-7 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold text-xs flex-shrink-0">
                                                {p.user?.name?.[0]?.toUpperCase() || '?'}
                                            </div>
                                            <span className="text-gray-700 text-sm whitespace-nowrap">{p.user?.name || 'Unknown'}</span>
                                        </div>
                                    </td>
                                    {/* Likes */}
                                    <td className="px-4 py-4">
                                        <span className="flex items-center gap-1 text-gray-500 text-sm">
                                            <Heart size={14} className="text-red-400" /> {p.likes || 0}
                                        </span>
                                    </td>
                                    {/* Comments */}
                                    <td className="px-4 py-4">
                                        <button
                                            onClick={() => setExpandedId(expandedId === p.id ? null : p.id)}
                                            className="flex items-center gap-1.5 text-gray-500 hover:text-blue-500 transition-colors text-sm"
                                        >
                                            <MessageCircle size={14} className="text-blue-400" />
                                            <span>{p.comments_count || 0}</span>
                                            {expandedId === p.id ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                                        </button>
                                    </td>
                                    {/* Date */}
                                    <td className="px-4 py-4 text-gray-500 text-sm whitespace-nowrap">
                                        {new Date(p.created_at).toLocaleDateString()}
                                    </td>
                                    {/* Actions */}
                                    <td className="px-4 py-4 text-right">
                                        {confirmId === p.id ? (
                                            <div className="flex items-center justify-end gap-2">
                                                <button onClick={() => setConfirmId(null)} className="text-xs text-gray-400 hover:text-gray-600 px-3 py-1.5 rounded-lg">Cancel</button>
                                                <button onClick={() => deletePost(p.id)} className="text-xs bg-red-500 text-white px-3 py-1.5 rounded-lg hover:bg-red-600">Confirm</button>
                                            </div>
                                        ) : (
                                            <button onClick={() => setConfirmId(p.id)} className="text-gray-300 hover:text-red-400 p-1.5 rounded-lg hover:bg-red-50 transition-colors">
                                                <Trash2 size={16} />
                                            </button>
                                        )}
                                    </td>
                                </tr>
                                {expandedId === p.id && (
                                    <tr key={`${p.id}-comments`}>
                                        <td colSpan={7} className="bg-blue-50/40 px-6 py-4 border-b border-blue-100">
                                            <CommentsPanel
                                                postId={p.id}
                                                onDelete={(cid) => handleDeleteComment(p.id, cid)}
                                            />
                                        </td>
                                    </tr>
                                )}
                            </>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

function CommentsPanel({ postId, onDelete }) {
    const [comments, setComments] = useState(null);
    const [confirmId, setConfirmId] = useState(null);

    useEffect(() => {
        api.get(`/admin/posts/${postId}/comments`)
            .then(r => setComments(r.data.comments || []))
            .catch(() => toast.error('Failed to load comments'));
    }, [postId]);

    const deleteComment = async (id) => {
        try {
            await api.delete(`/admin/comments/${id}`);
            setComments(prev => prev.filter(c => c.id !== id));
            onDelete(id);
            setConfirmId(null);
            toast.success('Comment deleted');
        } catch {
            toast.error('Failed');
        }
    };

    if (comments === null) return <p className="text-sm text-gray-400">Loading comments...</p>;
    if (comments.length === 0) return <p className="text-sm text-gray-400 italic">No comments on this post.</p>;

    return (
        <div className="space-y-2">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                {comments.length} comment{comments.length !== 1 ? 's' : ''}
            </p>
            {comments.map(c => (
                <div key={c.id} className="flex items-start gap-3 bg-white rounded-xl px-4 py-3 border border-gray-100">
                    <div className="w-7 h-7 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold text-xs flex-shrink-0 mt-0.5">
                        {c.user?.name?.[0]?.toUpperCase() || '?'}
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold text-gray-900">{c.user?.name}</span>
                            <span className="text-xs text-gray-400">{new Date(c.created_at).toLocaleString()}</span>
                        </div>
                        <p className="text-sm text-gray-700 mt-0.5">{c.body}</p>
                    </div>
                    {confirmId === c.id ? (
                        <div className="flex items-center gap-1.5 flex-shrink-0">
                            <button onClick={() => setConfirmId(null)} className="text-xs text-gray-400 px-2 py-1 rounded-lg hover:bg-gray-100">Cancel</button>
                            <button onClick={() => deleteComment(c.id)} className="text-xs bg-red-500 text-white px-2 py-1 rounded-lg">Delete</button>
                        </div>
                    ) : (
                        <button onClick={() => setConfirmId(c.id)} className="text-gray-300 hover:text-red-400 p-1 flex-shrink-0 transition-colors">
                            <X size={14} />
                        </button>
                    )}
                </div>
            ))}
        </div>
    );
}
