import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  signInWithPopup,
  GoogleAuthProvider,
  User,
  onAuthStateChanged
} from 'firebase/auth';
import { auth, database } from './firebase';
import { ref, set } from 'firebase/database';
import { createUserProfile } from './user-profile';

function ensureAuth() {
  if (!auth) {
    const isRailway = process.env.RAILWAY_ENVIRONMENT || process.env.RAILWAY_PROJECT_ID;
    const errorMessage = isRailway
      ? 'Firebase Auth is not initialized. Please check Railway Variables tab and ensure all NEXT_PUBLIC_FIREBASE_* environment variables are set. See RAILWAY_ENV.md for exact values.'
      : 'Firebase Auth is not initialized. Please check your .env.local file and ensure all Firebase configuration values are set correctly.';
    throw new Error(errorMessage);
  }
  return auth;
}

function ensureDatabase() {
  if (!database) {
    const isRailway = process.env.RAILWAY_ENVIRONMENT || process.env.RAILWAY_PROJECT_ID;
    const errorMessage = isRailway
      ? 'Firebase Database is not initialized. Please check Railway Variables tab and ensure all NEXT_PUBLIC_FIREBASE_* environment variables are set. See RAILWAY_ENV.md for exact values.'
      : 'Firebase Database is not initialized. Please check your .env.local file and ensure all Firebase configuration values are set correctly.';
    throw new Error(errorMessage);
  }
  return database;
}

export const signIn = async (email: string, password: string) => {
  return await signInWithEmailAndPassword(ensureAuth(), email, password);
};

export const signInWithGoogle = async () => {
  const provider = new GoogleAuthProvider();
  return await signInWithPopup(ensureAuth(), provider);
};

export const signUp = async (
  email: string, 
  password: string, 
  firstName: string, 
  lastName: string, 
  nationalities: string[]
) => {
  const userCredential = await createUserWithEmailAndPassword(ensureAuth(), email, password);
  const user = userCredential.user;
  
  // Create user profile with nationality
  await createUserProfile(
    user.uid,
    user.email || email,
    firstName,
    lastName,
    nationalities
  );
  
  return userCredential;
};

export const signOut = async () => {
  return await firebaseSignOut(ensureAuth());
};

export const getCurrentUser = (): Promise<User | null> => {
  return new Promise((resolve) => {
    if (!auth) {
      // Firebase not initialized - return null gracefully
      resolve(null);
      return;
    }
    
    try {
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        unsubscribe();
        resolve(user);
      });
    } catch {
      // If there's an error, resolve with null
      resolve(null);
    }
  });
};

