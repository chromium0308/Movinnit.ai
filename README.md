# Movinnit.ai

A Next.js web application that helps users understand and complete the steps required to migrate to another country. Built with TypeScript, Tailwind CSS, Firebase, and OpenAI integration.

A webapp that helps you plan a move helping you through any government related paperwork that may be required :)

## Features

- **User Authentication**: Firebase Authentication for secure sign-up and login
- **Personalized Migration Guides**: AI-powered step-by-step migration guides using OpenAI (GPT-4o)
- **Interactive Chat Assistant**: Persistent AI chatbot to help with paperwork, forms, and questions
- **Progress Tracking**: Save and track migration progress across sessions with real-time updates
- **Multi-Nationality Support**: Support for users with multiple nationalities
- **Destination Selection**: Choose from common destinations or enter custom locations

## Getting Started

### Prerequisites

- Node.js 20.9.0 or higher (required for Next.js 16)
- npm 10.0.0 or higher
- Firebase project with Realtime Database enabled
- OpenAI API key

### Local Development

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
   Create a `.env.local` file in the root directory with the following variables:
   
   **To get Firebase configuration:**
   - Go to [Firebase Console](https://console.firebase.google.com) → Your Project → Project Settings → Your apps
   - Copy values from the `firebaseConfig` object
   
   **To get OpenAI API key:**
   - Go to [OpenAI Platform](https://platform.openai.com/api-keys)
   - Create a new secret key and copy it

   ```env
   # Firebase Configuration (from Firebase Console)
   NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_DATABASE_URL=https://your_project-default-rtdb.firebaseio.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

   # OpenAI API Key (from OpenAI Platform)
   OPENAI_API_KEY=your_openai_api_key
   ```

3. Configure Firebase:
   - Enable Firebase Authentication (Email/Password)
   - Enable Firebase Realtime Database
   - Set up database security rules (see below)

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Deployment to Railway

### Prerequisites for Railway Deployment

1. A Railway account ([railway.app](https://railway.app))
2. A GitHub account with this repository
3. Firebase project configured (see above)
4. OpenAI API key

### Step-by-Step Railway Deployment

1. **Connect Repository to Railway:**
   - Log in to [Railway](https://railway.app)
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Authorize Railway to access your GitHub account
   - Select the `chromium0308/Movinnit.ai` repository

2. **Get Your Firebase Configuration:**
   - Go to [Firebase Console](https://console.firebase.google.com)
   - Select your project (or create a new one)
   - Click the gear icon ⚙️ next to "Project Overview" → "Project settings"
   - Scroll down to "Your apps" section
   - If you don't have a web app, click "Add app" → Web (</>) icon
   - Copy the configuration values from the `firebaseConfig` object:
     ```javascript
     const firebaseConfig = {
       apiKey: "AIza...",           // → NEXT_PUBLIC_FIREBASE_API_KEY
       authDomain: "...",           // → NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
       databaseURL: "https://...",  // → NEXT_PUBLIC_FIREBASE_DATABASE_URL
       projectId: "...",            // → NEXT_PUBLIC_FIREBASE_PROJECT_ID
       storageBucket: "...",        // → NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
       messagingSenderId: "...",   // → NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
       appId: "1:..."               // → NEXT_PUBLIC_FIREBASE_APP_ID
     };
     ```

3. **Get Your OpenAI API Key:**
   - Go to [OpenAI Platform](https://platform.openai.com/api-keys)
   - Sign in or create an account
   - Click "Create new secret key"
   - Give it a name (e.g., "Movinnit Production")
   - Copy the key immediately (you won't be able to see it again)
   - This is your `OPENAI_API_KEY`

4. **Configure Environment Variables in Railway:**
   - In your Railway project dashboard, click on your service
   - Go to the "Variables" tab
   - Click "New Variable" for each of the following:
   
   **Firebase Variables (all required):**
   - `NEXT_PUBLIC_FIREBASE_API_KEY` = (paste your Firebase apiKey)
   - `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` = (paste your Firebase authDomain)
   - `NEXT_PUBLIC_FIREBASE_DATABASE_URL` = (paste your Firebase databaseURL)
   - `NEXT_PUBLIC_FIREBASE_PROJECT_ID` = (paste your Firebase projectId)
   - `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` = (paste your Firebase storageBucket)
   - `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` = (paste your Firebase messagingSenderId)
   - `NEXT_PUBLIC_FIREBASE_APP_ID` = (paste your Firebase appId)
   
   **OpenAI Variable (required):**
   - `OPENAI_API_KEY` = (paste your OpenAI API key)
   
   **Important Notes:**
   - Variable names are case-sensitive - use exact names shown above
   - Do NOT include quotes around the values
   - After adding variables, Railway will automatically redeploy
   - All `NEXT_PUBLIC_*` variables are exposed to the browser (this is safe for Firebase config)

5. **Configure Build Settings:**
   - Railway will auto-detect Next.js
   - Build Command: `npm run build` (auto-detected)
   - Start Command: `npm start` (auto-detected)
   - Root Directory: `/` (default)

6. **Update Firebase Authorized Domains:**
   - Go to Firebase Console → Authentication → Settings → Authorized domains
   - Add your Railway domain (e.g., `your-app.up.railway.app`)
   - If you set up a custom domain, add that as well

7. **Deploy:**
   - Railway will automatically build and deploy your app
   - The deployment will start automatically when you push to the main branch
   - You can also trigger manual deployments from the Railway dashboard

8. **Set Up Custom Domain (Optional):**
   - In Railway, go to your service → Settings → Domains
   - Click "Generate Domain" or "Add Custom Domain"
   - Follow the DNS configuration instructions
   - Update Firebase Authorized Domains with your custom domain

### Railway-Specific Notes

- **Automatic Deployments:** Railway automatically deploys on every push to the main branch
- **Environment Variables:** All environment variables are securely stored in Railway
- **Build Process:** Railway runs `npm install` and `npm run build` automatically
- **Port:** Railway automatically assigns a PORT environment variable (Next.js handles this automatically)
- **Logs:** View deployment and runtime logs in the Railway dashboard

### Post-Deployment Checklist

- [ ] All environment variables are set in Railway
- [ ] Firebase Authorized Domains includes your Railway domain
- [ ] Application builds successfully (check Railway logs)
- [ ] Application is accessible via Railway URL
- [ ] Firebase Authentication works correctly
- [ ] OpenAI API calls are functioning
- [ ] Custom domain is configured (if applicable)

### Troubleshooting Railway Deployment

**Build Failures:**
- Check Railway logs for specific error messages
- Ensure all dependencies are listed in `package.json`
- **Node.js Version:** The app requires Node.js >=20.9.0. Railway should auto-detect this from `package.json` engines field, `.nvmrc`, or `.node-version` files. If issues persist, manually set `NODE_VERSION=20` in Railway environment variables.

**Environment Variable Issues:**
- Double-check all environment variables are set in Railway (case-sensitive)
- Ensure `NEXT_PUBLIC_*` variables are set (required for client-side access)
- **Verify variable names match exactly** (no extra spaces, correct capitalization)
- **Do NOT include quotes** around values in Railway (e.g., use `sk-proj-...` not `"sk-proj-..."`)
- After adding/updating environment variables, Railway will automatically redeploy
- If variables aren't working, check Railway logs for "Missing environment variables" errors
- Common mistake: Using `FIREBASE_API_KEY` instead of `NEXT_PUBLIC_FIREBASE_API_KEY` (the `NEXT_PUBLIC_` prefix is required!)

**Firebase Authentication Errors:**
- Verify your Railway domain is added to Firebase Authorized Domains
- Check that Firebase API keys are correct
- Ensure Firebase Authentication is enabled in Firebase Console

**OpenAI API Errors:**
- Verify `OPENAI_API_KEY` is set correctly in Railway
- Check OpenAI API usage limits and billing
- Review Railway logs for specific API error messages

**Port/Connection Issues:**
- Railway automatically handles port configuration
- Next.js will use the `PORT` environment variable automatically
- No manual port configuration needed

## Firebase Security Rules

Add these rules to your Firebase Realtime Database:

```json
{
  "rules": {
    "users": {
      "$uid": {
        ".read": "$uid === auth.uid",
        ".write": "$uid === auth.uid"
      }
    },
    "guides": {
      "$guideId": {
        ".read": "data.child('uid').val() === auth.uid",
        ".write": "data.child('uid').val() === auth.uid || (!data.exists() && newData.child('uid').val() === auth.uid)"
      }
    }
  }
}
```

## Project Structure

```
next-app/
├── app/
│   ├── api/                # API routes
│   │   ├── generate-guide/ # Guide generation endpoint
│   │   └── chat/           # Chatbot endpoint
│   ├── dashboard/          # User dashboard
│   ├── guide/[guideId]/    # Individual guide pages
│   ├── login/              # Login page
│   ├── signup/             # Signup page
│   ├── layout.tsx          # Root layout
│   └── page.tsx            # Home page (redirects)
├── components/
│   ├── AuthGuard.tsx       # Authentication wrapper
│   └── Chatbot.tsx         # Chat assistant component
├── lib/
│   ├── firebase.ts         # Firebase configuration
│   ├── auth.ts             # Authentication utilities
│   ├── database.ts         # Database operations
│   └── api-auth.ts         # API authentication helpers
├── public/                  # Static assets
└── package.json            # Dependencies
```

## Available Scripts

- `npm run dev` - Start development server on http://localhost:3000
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## User Flow

1. User signs up or logs in
2. User enters their nationality/ies and destination
3. App generates a personalized migration guide using AI
4. User views step-by-step plan with paperwork requirements
5. User can mark steps as complete (progress persists)
6. AI chatbot assistant helps with questions about forms and procedures

## Technologies

- **Next.js 16** - React framework with App Router
- **TypeScript** - Type safety
- **Tailwind CSS** - Utility-first CSS framework
- **Firebase** - Authentication and Realtime Database
- **OpenAI API** - AI-powered migration guidance (GPT-4o)

## Documentation

See `migration_spec_firebase.md` for detailed specification and architecture.

## Notes

- The app uses OpenAI's GPT-4o model (ChatGPT-5 may not be available yet)
- All authentication is handled client-side with Firebase Auth
- Database operations use Firebase Realtime Database for real-time updates
- The app is mobile-responsive and works on all screen sizes
- **Production Deployment:** This app is configured for deployment on Railway. See the [Deployment to Railway](#deployment-to-railway) section for detailed instructions.
