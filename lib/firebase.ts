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

// Helper to get missing environment variables for better error messages
const getMissingEnvVars = () => {
  const missing: string[] = [];
  if (!requiredEnvVars.apiKey) missing.push('NEXT_PUBLIC_FIREBASE_API_KEY');
  if (!requiredEnvVars.authDomain) missing.push('NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN');
  if (!requiredEnvVars.databaseURL) missing.push('NEXT_PUBLIC_FIREBASE_DATABASE_URL');
  if (!requiredEnvVars.projectId) missing.push('NEXT_PUBLIC_FIREBASE_PROJECT_ID');
  if (!requiredEnvVars.storageBucket) missing.push('NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET');
  if (!requiredEnvVars.messagingSenderId) missing.push('NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID');
  if (!requiredEnvVars.appId) missing.push('NEXT_PUBLIC_FIREBASE_APP_ID');
  return missing;
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
  } catch (error) {
    // Log error details in development and production
    if (typeof window !== 'undefined') {
      const missing = getMissingEnvVars();
      if (missing.length > 0) {
        console.error('Firebase initialization failed. Missing environment variables:', missing);
        console.error('For Railway deployment, set these in Railway Variables tab. See RAILWAY_ENV.md for exact values.');
      } else {
        console.error('Firebase initialization failed:', error);
      }
    }
  }
} else {
  // Config is invalid - log which variables are missing
  if (typeof window !== 'undefined') {
    const missing = getMissingEnvVars();
    if (missing.length > 0) {
      console.error('Firebase configuration is incomplete. Missing variables:', missing);
      console.error('For Railway deployment, set these in Railway Variables tab. See RAILWAY_ENV.md for exact values.');
    }
  }
}
// Don't log errors during module evaluation - handle gracefully when Firebase is used

// Export with null checks - components should handle these cases
export { auth, database, analytics };
export default app;

