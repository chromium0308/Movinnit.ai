'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { signIn, signInWithGoogle } from '@/lib/auth';
import Navbar from '@/components/Navbar';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await signIn(email, password);
      router.push('/dashboard');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to sign in';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setLoading(true);

    try {
      await signInWithGoogle();
      router.push('/dashboard');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to sign in with Google';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex w-full flex-col min-h-screen relative">
      <Navbar />

      {/* Content */}
      <div className="relative z-10 flex flex-1 flex-col justify-center items-center mt-[100px]">
        <div className="w-full max-w-sm px-4">
          <div className="space-y-5 text-center">
            <div className="space-y-1">
              <h1 className="text-[3.5rem] md:text-[4rem] font-bold leading-[1.1] tracking-tight text-white">Welcome to Movin&apos; it</h1>
              <p className="text-base md:text-lg text-white/70 font-light whitespace-nowrap">Your migration paperwork assistant</p>
            </div>

            {error && (
              <div className="rounded-md bg-red-500/20 border border-red-500/50 p-4 text-sm text-red-200">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="relative">
                <input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full backdrop-blur-[1px] text-white border-1 border-white/10 rounded-full py-3 px-4 focus:outline-none focus:border focus:border-white/30 text-center bg-white/5 placeholder:text-white/50"
                  required
                  disabled={loading}
                />
              </div>

              <div className="relative">
                <input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full backdrop-blur-[1px] text-white border-1 border-white/10 rounded-full py-3 px-4 focus:outline-none focus:border focus:border-white/30 text-center bg-white/5 placeholder:text-white/50"
                  required
                  disabled={loading}
                />
              </div>

              <button
                type="submit"
                disabled={loading || !email || !password}
                className="w-full rounded-full bg-white text-black font-medium py-3 hover:bg-white/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>

            <div className="space-y-3">
              <div className="flex items-center gap-4">
                <div className="h-px bg-white/10 flex-1" />
                <span className="text-white/40 text-sm">or</span>
                <div className="h-px bg-white/10 flex-1" />
              </div>

              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="backdrop-blur-[2px] w-full flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-full py-3 px-4 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="text-lg">G</span>
                <span>Sign in with Google</span>
              </button>
            </div>

            <p className="text-xs text-white/40 pt-6">
              Don&apos;t have an account?{' '}
              <Link href="/signup" className="underline text-white/40 hover:text-white/60 transition-colors">
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
