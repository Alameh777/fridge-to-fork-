import React from 'react';
import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Camera, BookOpen, Users, User } from 'lucide-react';

const tabs = [
  { path: '/', icon: Camera, key: 'scan' },
  { path: '/library', icon: BookOpen, key: 'library' },
  { path: '/community', icon: Users, key: 'community' },
  { path: '/profile', icon: User, key: 'profile' },
];

export default function BottomNav() {
  const { t } = useTranslation();
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 z-50 safe-bottom">
      <div className="flex">
        {tabs.map(({ path, icon: Icon, key }) => (
          <NavLink
            key={key}
            to={path}
            end={path === '/'}
            className={({ isActive }) =>
              `flex-1 flex flex-col items-center py-2 gap-0.5 text-xs font-medium transition-colors ${
                isActive ? 'text-orange-500' : 'text-gray-400'
              }`
            }
          >
            <Icon size={22} />
            <span>{t(key)}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
