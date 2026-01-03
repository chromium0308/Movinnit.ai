'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { updateGuideStep, Guide } from '@/lib/database';
import { ref, onValue, off } from 'firebase/database';
import { database } from '@/lib/firebase';
import AuthGuard from '@/components/AuthGuard';
import Chatbot from '@/components/Chatbot';
import Navbar from '@/components/Navbar';
import { Confetti, type ConfettiRef } from '@/components/ui/confetti';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

function GuideContent() {
  const params = useParams();
  const router = useRouter();
  const guideId = params.guideId as string;
  const [guide, setGuide] = useState<Guide | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const confettiRef = useRef<ConfettiRef>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  useEffect(() => {
    if (!database) {
      setTimeout(() => {
        setError('Firebase Database is not initialized. Please check your .env.local file.');
        setLoading(false);
      }, 0);
      return;
    }

    const guideRef = ref(database, `guides/${guideId}`);

    const unsubscribe = onValue(guideRef, (snapshot) => {
      if (snapshot.exists()) {
        const guideData = snapshot.val() as Guide;
        setGuide(guideData);
        // Set current step to the first incomplete step or the last step
        const firstIncomplete = guideData.steps.findIndex(s => !s.completed);
        setCurrentStepIndex(firstIncomplete >= 0 ? firstIncomplete : guideData.steps.length - 1);

        // Check if all steps are completed and fire confetti if so
        const allCompleted = guideData.steps.every(s => s.completed);
        if (allCompleted) {
          setTimeout(() => {
            confettiRef.current?.fire({});
          }, 500);
        }

        setLoading(false);
      } else {
        setError('Guide not found');
        setLoading(false);
      }
    }, () => {
      setError('Failed to load guide');
      setLoading(false);
    });

    return () => {
      off(guideRef);
    };
  }, [guideId]);

  const handleStepToggle = async (stepNumber: number, completed: boolean) => {
    if (!guide) return;

    try {
      await updateGuideStep(guideId, stepNumber, completed);
      // Move to next step if completed
      if (completed) {
        if (currentStepIndex < guide.steps.length - 1) {
          setCurrentStepIndex(currentStepIndex + 1);
        } else {
          // Last step completed - fire confetti and show modal!
          confettiRef.current?.fire({});
          setShowSuccessModal(true);
        }
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update step';
      setError(errorMessage);
    }
  };

  const handleNextStep = () => {
    if (guide && currentStepIndex < guide.steps.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    }
  };

  const handlePreviousStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-lg text-white">Loading guide...</div>
      </div>
    );
  }

  if (error || !guide) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-lg text-red-400">{error || 'Guide not found'}</div>
      </div>
    );
  }

  const currentStep = guide.steps[currentStepIndex];
  const progress = ((currentStepIndex + 1) / guide.steps.length) * 100;

  return (
    <div className="min-h-screen">
      <Navbar />

      <Confetti
        ref={confettiRef}
        className="pointer-events-none fixed inset-0 z-50 h-full w-full"
        manualstart={true}
      />

      <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
        <DialogContent className="sm:max-w-md bg-zinc-900 border-zinc-800 text-white">
          <DialogHeader>
            <DialogTitle className="text-2xl text-center">Congratulations! 🎉</DialogTitle>
            <DialogDescription className="text-center text-zinc-400 text-lg pt-4">
              You have successfully verified your move to {guide?.destination}!
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-center p-4">
            <button
              onClick={() => setShowSuccessModal(false)}
              className="px-6 py-2 rounded-full bg-white text-black hover:bg-white/90 transition-colors font-medium"
            >
              Continue
            </button>
          </div>
        </DialogContent>
      </Dialog>

      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8 pt-24">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <div className="rounded-lg bg-black/20 backdrop-blur-md border border-white/20 p-6">
              <div className="mb-6">
                <h1 className="text-3xl font-bold text-white">
                  Paperwork Guide: {guide.destination}
                </h1>
                <p className="mt-2 text-gray-300">
                  From {guide.nationalities.join(' or ')} to {guide.destination}
                </p>
              </div>

              {/* Progress Bar */}
              <div className="mb-6">
                <div className="flex justify-between text-sm text-gray-400 mb-2">
                  <span>Step {currentStepIndex + 1} of {guide.steps.length}</span>
                  <span>{Math.round(progress)}% Complete</span>
                </div>
                <div className="w-full bg-white/10 rounded-full h-2">
                  <div
                    className="bg-white h-2 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>

              {/* Step Navigation */}
              <div className="mb-6 flex gap-2 overflow-x-auto pb-2">
                {guide.steps.map((step, index) => (
                  <button
                    key={step.step}
                    onClick={() => setCurrentStepIndex(index)}
                    className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors ${index === currentStepIndex
                      ? 'bg-white text-black'
                      : step.completed
                        ? 'bg-green-500/20 text-green-400 border border-green-500/50'
                        : 'bg-white/5 text-gray-400 border border-white/10'
                      }`}
                  >
                    {step.step}
                  </button>
                ))}
              </div>

              {/* Current Step Content */}
              {currentStep && (
                <div className="rounded-lg border-2 border-white/30 bg-white/10 p-6">
                  <div className="mb-4">
                    <div className="flex items-center gap-3 mb-4">
                      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-lg font-bold text-black">
                        {currentStep.step}
                      </span>
                      <h2 className="text-2xl font-semibold text-white">
                        {currentStep.title}
                      </h2>
                    </div>
                    <p className="text-gray-300 text-lg leading-relaxed">{currentStep.description}</p>
                  </div>

                  {/* Required Paperwork */}
                  {currentStep.paperwork && currentStep.paperwork.length > 0 && (
                    <div className="mt-6 mb-6">
                      <h3 className="text-xl font-semibold text-white mb-3">Required Paperwork:</h3>
                      <ul className="space-y-2">
                        {currentStep.paperwork.map((doc, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-gray-300">
                            <span className="text-white mt-1">•</span>
                            <span>{doc}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* PDF Downloads */}
                  {currentStep.pdfs && currentStep.pdfs.length > 0 && (
                    <div className="mt-6 mb-6">
                      <h3 className="text-xl font-semibold text-white mb-3">Download Forms (PDFs):</h3>
                      <div className="space-y-3">
                        {currentStep.pdfs.map((pdf, idx) => (
                          <a
                            key={idx}
                            href={pdf}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-3 p-4 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors group overflow-hidden"
                          >
                            <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                            </svg>
                            <div className="flex-1 min-w-0">
                              <p className="text-white group-hover:text-white/80 transition-colors break-words">
                                {pdf.split('/').pop() || `Form ${idx + 1}`}
                              </p>
                              <p className="text-xs text-gray-400 break-all">{pdf}</p>
                            </div>
                            <svg className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Useful Links */}
                  {currentStep.links && currentStep.links.length > 0 && (
                    <div className="mt-6 mb-6">
                      <h3 className="text-xl font-semibold text-white mb-3">Useful Links:</h3>
                      <ul className="space-y-2">
                        {currentStep.links.map((link, idx) => (
                          <li key={idx} className="break-words">
                            <a
                              href={link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-400 hover:text-blue-300 hover:underline flex items-start gap-2 break-all"
                            >
                              <svg className="w-4 h-4 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                              </svg>
                              <span className="break-all">{link}</span>
                            </a>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Submission Info */}
                  <div className="mt-6 mb-6 p-4 rounded-lg bg-black/20 backdrop-blur-md border border-white/20">
                    <p className="text-sm text-gray-300">
                      <span className="font-semibold text-white">Submission Method:</span>{' '}
                      {currentStep.submission}
                    </p>
                    {currentStep.nextStepCondition && (
                      <p className="mt-2 text-sm text-gray-300">
                        <span className="font-semibold text-white">Next Step:</span>{' '}
                        {currentStep.nextStepCondition}
                      </p>
                    )}
                  </div>

                  {/* Complete Checkbox and Navigation */}
                  <div className="flex items-center justify-between mt-6 pt-6 border-t border-white/10">
                    <label className="flex cursor-pointer items-center gap-3">
                      <input
                        type="checkbox"
                        checked={currentStep.completed || false}
                        onChange={(e) => handleStepToggle(currentStep.step, e.target.checked)}
                        className="h-6 w-6 rounded border-white/30 bg-white/5 text-white focus:ring-white/50"
                      />
                      <span className="text-white font-medium">Mark as Complete</span>
                    </label>

                    <div className="flex gap-3">
                      {currentStepIndex > 0 && (
                        <button
                          onClick={handlePreviousStep}
                          className="px-6 py-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
                        >
                          Previous
                        </button>
                      )}
                      {currentStepIndex < guide.steps.length - 1 && (
                        <button
                          onClick={handleNextStep}
                          className="px-6 py-2 rounded-full bg-white text-black hover:bg-white/90 transition-colors font-medium"
                        >
                          Next Step
                        </button>
                      )}
                      {currentStepIndex === guide.steps.length - 1 && currentStep.completed && (
                        <div className="px-6 py-2 rounded-full bg-green-500/20 text-green-400 border border-green-500/50">
                          All Complete!
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Chatbot Sidebar */}
          <div className="lg:col-span-1">
            <Chatbot guide={guide} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function GuidePage() {
  return (
    <AuthGuard>
      <GuideContent />
    </AuthGuard>
  );
}
