'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    getCurrentUser()
      .then((user) => {
        if (user) {
          router.push('/dashboard');
        } else {
          router.push('/login');
        }
      })
      .catch(() => {
        // If Firebase is not configured, redirect to login
        router.push('/login');
      });
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-lg text-white">Loading...</div>
    </div>
  );
}
