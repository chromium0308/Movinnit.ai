import { ref, set, get, update } from 'firebase/database';
import { database } from './firebase';

export interface UserProfile {
  uid: string;
  email: string;
  firstName?: string;
  lastName?: string;
  nationalities: string[];
  movingReason?: string;
  createdAt: string;
  updatedAt: string;
}

function ensureDatabase() {
  if (!database) {
    throw new Error('Firebase Database is not initialized. Please check your .env.local file and ensure all Firebase configuration values are set correctly.');
  }
  return database;
}

export const createUserProfile = async (
  uid: string,
  email: string,
  firstName: string,
  lastName: string,
  nationalities: string[],
  movingReason?: string
): Promise<void> => {
  const profile: UserProfile = {
    uid,
    email,
    firstName,
    lastName,
    nationalities,
    movingReason,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  await set(ref(ensureDatabase(), `users/${uid}`), profile);
};

export const getUserProfile = async (uid: string): Promise<UserProfile | null> => {
  const snapshot = await get(ref(ensureDatabase(), `users/${uid}`));
  if (snapshot.exists()) {
    return snapshot.val() as UserProfile;
  }
  return null;
};

export const updateUserProfile = async (
  uid: string,
  updates: Partial<Pick<UserProfile, 'firstName' | 'lastName' | 'nationalities' | 'movingReason'>>
): Promise<void> => {
  const db = ensureDatabase();
  const profileUpdates: Record<string, unknown> = {
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  await update(ref(db, `users/${uid}`), profileUpdates);
};

