'use client';

import React from 'react';
import { useAuth } from '@/lib/auth';

interface UserProfileProps {
  onLogout?: () => void;
}

const UserProfile: React.FC<UserProfileProps> = ({ onLogout }) => {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      if (onLogout) onLogout();
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="flex items-center space-x-4">
      <div className="flex-shrink-0">
        {user.photoURL ? (
          <img
            src={user.photoURL}
            alt="Аватар пользователя"
            className="h-8 w-8 rounded-full"
          />
        ) : (
          <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center text-white">
            {user.email?.charAt(0).toUpperCase() || 'U'}
          </div>
        )}
      </div>
      <div className="flex flex-col">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {user.displayName || user.email}
        </span>
        <button
          onClick={handleLogout}
          className="text-xs text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
        >
          Выйти
        </button>
      </div>
    </div>
  );
};

export default UserProfile;