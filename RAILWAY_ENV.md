# Railway Environment Variables

Copy and paste these exact values into Railway's Variables tab:

## Firebase Configuration

```
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyCI97qXgCFClaWmlmd72LezZ48GyJDd6bs
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=movinnit.firebaseapp.com
NEXT_PUBLIC_FIREBASE_DATABASE_URL=https://movinnit-default-rtdb.europe-west1.firebasedatabase.app
NEXT_PUBLIC_FIREBASE_PROJECT_ID=movinnit
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=movinnit.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=605518545048
NEXT_PUBLIC_FIREBASE_APP_ID=1:605518545048:web:5a66c47fb3ba74a6c7d0ed
```

## OpenAI API Key

**IMPORTANT:** Get your OpenAI API key from: https://platform.openai.com/api-keys

```
OPENAI_API_KEY=your_openai_api_key_here
```

⚠️ **Note:** Replace `your_openai_api_key_here` with your actual OpenAI API key when setting in Railway. 
**Your API key was provided separately - use that value in Railway.**

## Instructions

1. Go to your Railway project dashboard
2. Click on your service
3. Go to the "Variables" tab
4. Click "New Variable" for each variable above
5. Copy the variable name (left side) and value (right side) exactly as shown
6. Do NOT include quotes around the values
7. After adding all variables, Railway will automatically redeploy

## Important Notes

- Variable names are case-sensitive
- All `NEXT_PUBLIC_*` variables are required for client-side Firebase access
- The `OPENAI_API_KEY` is required for guide generation
- After setting variables, check Railway logs to verify they're being read correctly

