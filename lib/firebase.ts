import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getDatabase, Database } from 'firebase/database';
import { getAnalytics, Analytics } from 'firebase/analytics';

// Validate required environment variables
const requiredEnvVars = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Check if config is valid (all required fields are present and non-empty)
const isConfigValid = () => {
  return Object.values(requiredEnvVars).every(
    val => val !== undefined && val !== null && val !== '' && val.trim() !== ''
  );
};

// Initialize Firebase only if config is valid
let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let database: Database | null = null;
let analytics: Analytics | null = null;

if (isConfigValid()) {
  try {
    const firebaseConfig = {
      apiKey: requiredEnvVars.apiKey!,
      authDomain: requiredEnvVars.authDomain!,
      databaseURL: requiredEnvVars.databaseURL!,
      projectId: requiredEnvVars.projectId!,
      storageBucket: requiredEnvVars.storageBucket!,
      messagingSenderId: requiredEnvVars.messagingSenderId!,
      appId: requiredEnvVars.appId!,
    };

    if (getApps().length === 0) {
      app = initializeApp(firebaseConfig);
    } else {
      app = getApps()[0];
    }
    auth = getAuth(app);
    database = getDatabase(app);
    
    // Initialize Analytics only on client-side
    if (typeof window !== 'undefined') {
      try {
        analytics = getAnalytics(app);
      } catch {
        // Analytics initialization failed (might not be available in all environments)
      }
    }
  } catch {
    // Silently fail during module evaluation - errors will be shown when Firebase is actually used
    if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
      console.warn('Firebase initialization failed. Please check your .env.local file.');
    }
  }
}
// Don't log errors during module evaluation - handle gracefully when Firebase is used

// Export with null checks - components should handle these cases
export { auth, database, analytics };
export default app;

