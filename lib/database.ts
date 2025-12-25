import { ref, set, get, update } from 'firebase/database';
import { database } from './firebase';
import { v4 as uuidv4 } from 'uuid';

function ensureDatabase() {
  if (!database) {
    throw new Error('Firebase Database is not initialized. Please check your .env.local file and ensure all Firebase configuration values are set correctly.');
  }
  return database;
}

export interface GuideStep {
  step: number;
  title: string;
  description: string;
  paperwork: string[];
  links: string[];
  pdfs: string[]; // PDF links for forms and documents
  submission: string;
  nextStepCondition: string;
  completed?: boolean;
}

export interface Guide {
  guideId: string;
  uid: string;
  nationalities: string[];
  destination: string;
  summary: string;
  steps: GuideStep[];
  currentStep: number;
  createdAt: string;
}

export const createGuide = async (
  uid: string,
  nationalities: string[],
  destination: string,
  summary: string,
  steps: GuideStep[]
): Promise<string> => {
  const guideId = uuidv4();
  const guide: Guide = {
    guideId,
    uid,
    nationalities,
    destination,
    summary,
    steps,
    currentStep: 1,
    createdAt: new Date().toISOString(),
  };
  
  await set(ref(ensureDatabase(), `guides/${guideId}`), guide);
  return guideId;
};

export const getGuide = async (guideId: string): Promise<Guide | null> => {
  const snapshot = await get(ref(ensureDatabase(), `guides/${guideId}`));
  if (snapshot.exists()) {
    return snapshot.val() as Guide;
  }
  return null;
};

export const updateGuideStep = async (
  guideId: string,
  stepNumber: number,
  completed: boolean
): Promise<void> => {
  const db = ensureDatabase();
  const updates: Record<string, unknown> = {};
  updates[`guides/${guideId}/steps/${stepNumber - 1}/completed`] = completed;
  
  // Update current step if marking as complete
  if (completed) {
    const guide = await getGuide(guideId);
    if (guide && stepNumber === guide.currentStep && stepNumber < guide.steps.length) {
      updates[`guides/${guideId}/currentStep`] = stepNumber + 1;
    }
  }
  
  await update(ref(db), updates);
};

export const getUserGuides = async (uid: string): Promise<Guide[]> => {
  const snapshot = await get(ref(ensureDatabase(), 'guides'));
  if (!snapshot.exists()) {
    return [];
  }
  
  const allGuides = snapshot.val() as Record<string, Guide>;
  return Object.values(allGuides).filter(guide => guide.uid === uid);
};

