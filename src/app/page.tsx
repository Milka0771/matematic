
'use client';

import { useRouter } from 'next/navigation';
import MathAssistant from "@/components/MathAssistant";
import Header from "@/components/Header";
import { useAuth } from '@/lib/auth';

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

  // Если пользователь не авторизован и загрузка завершена, перенаправляем на страницу аутентификации
  if (!loading && !user) {
    router.push('/auth');
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      <div className="py-12 px-4">
        <MathAssistant />
      </div>
    </div>
  );
}
