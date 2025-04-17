'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth';
import UserProfile from './UserProfile';

const Header: React.FC = () => {
  const { user, loading } = useAuth();

  return (
    <header className="bg-white dark:bg-gray-800 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex-shrink-0">
            <Link href="/" className="flex items-center">
              <span className="text-xl font-bold text-blue-600 dark:text-blue-400">
                Математический помощник
              </span>
            </Link>
          </div>
          
          <div className="ml-4 flex items-center">
            {loading ? (
              <div className="h-8 w-8 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse"></div>
            ) : user ? (
              <UserProfile />
            ) : (
              <Link
                href="/auth"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Войти
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;