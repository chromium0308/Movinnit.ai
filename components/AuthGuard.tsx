'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { User } from 'firebase/auth';
import { getCurrentUser } from '@/lib/auth';

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    getCurrentUser()
      .then((currentUser) => {
        if (!currentUser) {
          router.push('/login');
        } else {
          setUser(currentUser);
        }
        setLoading(false);
      })
      .catch(() => {
        // If Firebase is not configured, redirect to login
        router.push('/login');
        setLoading(false);
      });
  }, [router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black">
        <div className="text-lg text-white">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return <>{children}</>;
}

