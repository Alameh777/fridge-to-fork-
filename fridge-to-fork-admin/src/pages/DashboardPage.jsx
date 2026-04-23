import { useEffect, useState } from 'react';
import { Users, MessageSquare, BookOpen, Heart } from 'lucide-react';
import api from '../lib/axios';

const CARDS = [
    { key: 'users',       label: 'Total Users',      icon: Users,         color: 'bg-blue-50 text-blue-600'   },
    { key: 'posts',       label: 'Community Posts',  icon: MessageSquare, color: 'bg-orange-50 text-orange-600' },
    { key: 'recipes',     label: 'Recipes',          icon: BookOpen,      color: 'bg-green-50 text-green-600' },
    { key: 'total_likes', label: 'Total Likes',      icon: Heart,         color: 'bg-red-50 text-red-500'     },
];

export default function DashboardPage() {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('/admin/stats')
            .then(r => setStats(r.data))
            .finally(() => setLoading(false));
    }, []);

    return (
        <div className="p-8">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
                <p className="text-gray-500 text-sm mt-1">Overview of your platform</p>
            </div>

            <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
                {CARDS.map(({ key, label, icon: Icon, color }) => (
                    <div key={key} className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${color}`}>
                            <Icon size={20} />
                        </div>
                        <p className="text-3xl font-bold text-gray-900">
                            {loading ? '—' : (stats?.[key] ?? 0).toLocaleString()}
                        </p>
                        <p className="text-sm text-gray-500 mt-1">{label}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}
