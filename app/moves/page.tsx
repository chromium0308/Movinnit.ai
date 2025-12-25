'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { User } from 'firebase/auth';
import { getUserGuides, Guide } from '@/lib/database';
import AuthGuard from '@/components/AuthGuard';
import Navbar from '@/components/Navbar';
import { CategoryList, Category } from '@/components/ui/category-list';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';

function MovesContent() {
  const [user, setUser] = useState<User | null>(null);
  const [guides, setGuides] = useState<Guide[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    getCurrentUser().then(async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        try {
          const userGuides = await getUserGuides(currentUser.uid);
          // Filter to only show unfinished guides (guides where not all steps are completed)
          const unfinishedGuides = userGuides.filter(guide => {
            const allCompleted = guide.steps.every(step => step.completed === true);
            return !allCompleted;
          });
          // Sort by creation date, newest first
          unfinishedGuides.sort((a, b) => 
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
          setGuides(unfinishedGuides);
        } catch (err) {
          const errorMessage = err instanceof Error ? err.message : 'Failed to load moves';
          setError(errorMessage);
        }
      }
      setLoading(false);
    });
  }, []);

  const getProgress = (guide: Guide): number => {
    const completedSteps = guide.steps.filter(step => step.completed).length;
    return Math.round((completedSteps / guide.steps.length) * 100);
  };

  const getCurrentStepNumber = (guide: Guide): number => {
    const firstIncomplete = guide.steps.findIndex(step => !step.completed);
    return firstIncomplete >= 0 ? firstIncomplete + 1 : guide.steps.length;
  };

  // Convert guides to categories
  const categories: Category[] = guides.map((guide) => {
    const progress = getProgress(guide);
    const currentStep = getCurrentStepNumber(guide);
    const currentStepData = guide.steps[currentStep - 1];
    const completedSteps = guide.steps.filter(step => step.completed).length;

    return {
      id: guide.guideId,
      title: guide.destination,
      subtitle: `Step ${currentStep} of ${guide.steps.length}: ${currentStepData?.title || 'Getting started'} • ${progress}% complete`,
      icon: <ArrowRight className="w-8 h-8" />,
      onClick: () => router.push(`/guide/${guide.guideId}`),
      featured: guides.indexOf(guide) === 0, // First guide is featured
    };
  });

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-lg text-white">Loading moves...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navbar />

      {error && (
        <div className="mx-auto max-w-4xl px-4 pt-24 pb-4">
          <div className="rounded-md bg-red-500/20 border border-red-500/50 p-4 text-sm text-red-200">
            {error}
          </div>
        </div>
      )}

      {guides.length === 0 ? (
        <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8 pt-24">
          <div className="rounded-lg bg-black/20 backdrop-blur-md border border-white/20 p-8 text-center">
            <p className="text-gray-300 mb-4">You don't have any active moves.</p>
            <Link
              href="/dashboard"
              className="inline-block rounded-full bg-white text-black px-6 py-3 text-lg font-medium hover:bg-white/90 transition-colors"
            >
              Start a New Move
            </Link>
          </div>
        </main>
      ) : (
        <CategoryList
          title="Current Moves"
          categories={categories}
          className="pt-24"
        />
      )}
    </div>
  );
}

export default function MovesPage() {
  return (
    <AuthGuard>
      <MovesContent />
    </AuthGuard>
  );
}

