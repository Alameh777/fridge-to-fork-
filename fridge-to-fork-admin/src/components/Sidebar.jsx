import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, MessageSquare, LogOut, ChefHat } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const links = [
    { to: '/',       icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/users',  icon: Users,           label: 'Users'     },
    { to: '/posts',  icon: MessageSquare,   label: 'Posts'     },
];

export default function Sidebar() {
    const { user, logout } = useAuth();

    return (
        <aside className="w-60 min-h-screen bg-white border-r border-gray-100 flex flex-col">
            {/* Logo */}
            <div className="px-6 py-5 border-b border-gray-100">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-orange-500 flex items-center justify-center">
                        <ChefHat size={18} className="text-white" />
                    </div>
                    <div>
                        <p className="font-bold text-gray-900 text-sm leading-none">Fridge to Fork</p>
                        <p className="text-xs text-orange-500 font-medium">Admin Panel</p>
                    </div>
                </div>
            </div>

            {/* Nav */}
            <nav className="flex-1 px-3 py-4 space-y-1">
                {links.map(({ to, icon: Icon, label }) => (
                    <NavLink
                        key={to}
                        to={to}
                        end={to === '/'}
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                                isActive
                                    ? 'bg-orange-50 text-orange-600'
                                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                            }`
                        }
                    >
                        <Icon size={18} />
                        {label}
                    </NavLink>
                ))}
            </nav>

            {/* User + logout */}
            <div className="px-3 py-4 border-t border-gray-100">
                <div className="px-3 py-2 mb-1">
                    <p className="text-xs font-semibold text-gray-900 truncate">{user?.name}</p>
                    <p className="text-xs text-gray-400 truncate">{user?.email}</p>
                </div>
                <button
                    onClick={logout}
                    className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-red-400 hover:bg-red-50 transition-colors"
                >
                    <LogOut size={18} /> Sign out
                </button>
            </div>
        </aside>
    );
}
