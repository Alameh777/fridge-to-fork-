import { useEffect, useState } from 'react';
import { Trash2, ShieldCheck, Search } from 'lucide-react';
import api from '../lib/axios';
import toast from 'react-hot-toast';

export default function UsersPage() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [confirmId, setConfirmId] = useState(null);

    useEffect(() => {
        api.get('/admin/users')
            .then(r => setUsers(r.data.users || []))
            .catch(() => toast.error('Failed to load users'))
            .finally(() => setLoading(false));
    }, []);

    const deleteUser = async (id) => {
        try {
            await api.delete(`/admin/users/${id}`);
            setUsers(prev => prev.filter(u => u.id !== id));
            setConfirmId(null);
            toast.success('User deleted');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed');
        }
    };

    const filtered = users.filter(u =>
        u.name?.toLowerCase().includes(search.toLowerCase()) ||
        u.email?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="p-8">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Users</h1>
                    <p className="text-gray-500 text-sm mt-1">{users.length} total</p>
                </div>
                <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3 py-2 w-64">
                    <Search size={16} className="text-gray-400" />
                    <input
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Search by name or email..."
                        className="flex-1 text-sm outline-none bg-transparent"
                    />
                </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-gray-100 bg-gray-50 text-left">
                            <th className="px-6 py-3 font-semibold text-gray-600">User</th>
                            <th className="px-6 py-3 font-semibold text-gray-600">Posts</th>
                            <th className="px-6 py-3 font-semibold text-gray-600">Joined</th>
                            <th className="px-6 py-3 font-semibold text-gray-600">Role</th>
                            <th className="px-6 py-3"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {loading ? (
                            <tr><td colSpan={5} className="text-center py-12 text-gray-400">Loading...</td></tr>
                        ) : filtered.length === 0 ? (
                            <tr><td colSpan={5} className="text-center py-12 text-gray-400">No users found</td></tr>
                        ) : filtered.map(u => (
                            <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold text-xs flex-shrink-0">
                                            {u.name?.[0]?.toUpperCase() || '?'}
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-900">{u.name}</p>
                                            <p className="text-xs text-gray-400">{u.email}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-gray-600">{u.community_posts_count}</td>
                                <td className="px-6 py-4 text-gray-500">{new Date(u.created_at).toLocaleDateString()}</td>
                                <td className="px-6 py-4">
                                    {u.is_admin
                                        ? <span className="inline-flex items-center gap-1 text-xs bg-orange-100 text-orange-600 px-2 py-1 rounded-full font-medium"><ShieldCheck size={12} />Admin</span>
                                        : <span className="text-xs text-gray-400">User</span>
                                    }
                                </td>
                                <td className="px-6 py-4 text-right">
                                    {!u.is_admin && (
                                        confirmId === u.id ? (
                                            <div className="flex items-center justify-end gap-2">
                                                <button onClick={() => setConfirmId(null)} className="text-xs text-gray-400 hover:text-gray-600 px-3 py-1.5 rounded-lg">Cancel</button>
                                                <button onClick={() => deleteUser(u.id)} className="text-xs bg-red-500 text-white px-3 py-1.5 rounded-lg hover:bg-red-600">Confirm</button>
                                            </div>
                                        ) : (
                                            <button onClick={() => setConfirmId(u.id)} className="text-gray-300 hover:text-red-400 p-1.5 rounded-lg hover:bg-red-50 transition-colors">
                                                <Trash2 size={16} />
                                            </button>
                                        )
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
