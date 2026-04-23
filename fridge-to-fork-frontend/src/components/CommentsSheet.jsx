import React, { useState, useEffect, useRef } from 'react';
import { X, Send } from 'lucide-react';
import api from '../lib/axios';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function CommentsSheet({ postId, onClose, onCountChange }) {
    const { user } = useAuth();
    const [comments, setComments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [body, setBody] = useState('');
    const [posting, setPosting] = useState(false);
    const bottomRef = useRef();

    useEffect(() => {
        api.get(`/community/${postId}/comments`)
            .then(r => setComments(r.data.comments || []))
            .catch(() => toast.error('Could not load comments'))
            .finally(() => setLoading(false));
    }, [postId]);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [comments]);

    const submit = async () => {
        if (!body.trim()) return;
        setPosting(true);
        try {
            const res = await api.post(`/community/${postId}/comments`, { body: body.trim() });
            setComments(prev => [...prev, res.data]);
            onCountChange?.(comments.length + 1);
            setBody('');
        } catch {
            toast.error('Could not post comment');
        } finally {
            setPosting(false);
        }
    };

    const deleteComment = async (commentId) => {
        try {
            await api.delete(`/community/${postId}/comments/${commentId}`);
            setComments(prev => prev.filter(c => c.id !== commentId));
            onCountChange?.(comments.length - 1);
        } catch {
            toast.error('Could not delete comment');
        }
    };

    return (
        <>
            <div className="fixed inset-0 bg-black/50 z-[60]" onClick={onClose} />
            <div className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl z-[70] flex flex-col max-h-[75vh]">
                {/* Handle */}
                <div className="flex justify-center pt-3 pb-1 flex-shrink-0">
                    <div className="w-10 h-1 bg-gray-200 rounded-full" />
                </div>

                {/* Header */}
                <div className="flex items-center justify-between px-4 py-2 border-b border-gray-100 flex-shrink-0">
                    <h2 className="font-bold text-gray-900">Comments {comments.length > 0 && <span className="text-gray-400 font-normal text-sm">({comments.length})</span>}</h2>
                    <button onClick={onClose} className="p-1.5 rounded-full hover:bg-gray-100">
                        <X size={18} className="text-gray-500" />
                    </button>
                </div>

                {/* Comments list */}
                <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
                    {loading ? (
                        <p className="text-center text-gray-400 text-sm py-8">Loading...</p>
                    ) : comments.length === 0 ? (
                        <p className="text-center text-gray-400 text-sm py-8">No comments yet. Be the first!</p>
                    ) : (
                        comments.map(c => (
                            <CommentRow
                                key={c.id}
                                comment={c}
                                currentUserId={user?.id}
                                onDelete={deleteComment}
                            />
                        ))
                    )}
                    <div ref={bottomRef} />
                </div>

                {/* Input */}
                {user ? (
                    <div className="flex-shrink-0 px-4 py-3 border-t border-gray-100 flex gap-2 items-center bg-white">
                        <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold text-sm flex-shrink-0">
                            {user.name?.[0]?.toUpperCase()}
                        </div>
                        <input
                            value={body}
                            onChange={e => setBody(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && submit()}
                            placeholder="Write a comment..."
                            className="flex-1 px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
                        />
                        <button
                            onClick={submit}
                            disabled={posting || !body.trim()}
                            className="w-9 h-9 bg-orange-500 rounded-xl flex items-center justify-center text-white disabled:opacity-40"
                        >
                            <Send size={16} />
                        </button>
                    </div>
                ) : (
                    <p className="text-center text-sm text-gray-400 py-3 border-t border-gray-100">Log in to comment</p>
                )}
            </div>
        </>
    );
}

function CommentRow({ comment, currentUserId, onDelete }) {
    const isOwner = !!currentUserId && Number(comment.user_id) === Number(currentUserId);
    const timeAgo = formatTime(comment.created_at);

    return (
        <div className="flex items-start gap-2.5">
            <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold text-xs flex-shrink-0 mt-0.5">
                {comment.user?.name?.[0]?.toUpperCase() || '?'}
            </div>
            <div className="flex-1 min-w-0">
                <div className="bg-gray-50 rounded-2xl px-3 py-2">
                    <p className="text-xs font-semibold text-gray-900">{comment.user?.name}</p>
                    <p className="text-sm text-gray-700 mt-0.5">{comment.body}</p>
                </div>
                <p className="text-xs text-gray-400 mt-1 px-1">{timeAgo}</p>
            </div>
            {isOwner && (
                <button onClick={() => onDelete(comment.id)} className="mt-1 text-gray-300 hover:text-red-400 p-1 flex-shrink-0">
                    <X size={14} />
                </button>
            )}
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
