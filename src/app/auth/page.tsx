'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import LoginForm from '@/components/LoginForm';
import RegisterForm from '@/components/RegisterForm';
import { useAuth } from '@/lib/auth';

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const router = useRouter();
  const { user } = useAuth();

  // Если пользователь уже авторизован, перенаправляем на главную страницу
  if (user) {
    router.push('/');
    return null;
  }

  const handleSuccess = () => {
    router.push('/');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4 py-12">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">
            Визуальный помощник по математике
          </h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            {isLogin ? 'Войдите в свой аккаунт' : 'Создайте новый аккаунт'}
          </p>
        </div>

        {isLogin ? (
          <LoginForm 
            onSuccess={handleSuccess} 
            onRegisterClick={() => setIsLogin(false)} 
          />
        ) : (
          <RegisterForm 
            onSuccess={handleSuccess} 
            onLoginClick={() => setIsLogin(true)} 
          />
        )}
      </div>
    </div>
  );
};

export default AuthPage;