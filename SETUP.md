# Setup Guide for MovInit

## Quick Start

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Configure Environment Variables**
   
   Create a `.env.local` file in the root directory with:
   
   ```env
   # Firebase Configuration
   NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_DATABASE_URL=https://your_project-default-rtdb.firebaseio.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
   
   # OpenAI API Key
   OPENAI_API_KEY=your_openai_api_key
   ```

3. **Set Up Firebase**
   
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Create a new project or use an existing one
   - Enable **Authentication** → **Email/Password** provider
   - Enable **Realtime Database** (not Firestore)
   - Copy your Firebase config values to `.env.local`
   - Set up database security rules (see below)

4. **Firebase Security Rules**
   
   In Firebase Console → Realtime Database → Rules, add:
   
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

5. **Get OpenAI API Key**
   
   - Go to [OpenAI Platform](https://platform.openai.com/)
   - Create an account or sign in
   - Navigate to API Keys section
   - Create a new API key
   - Copy it to `.env.local` as `OPENAI_API_KEY`

6. **Run the Application**
   
   ```bash
   npm run dev
   ```
   
   The app will be available at: http://localhost:3000

## Testing the Application

1. **Sign Up**: Navigate to `/signup` and create an account
2. **Dashboard**: After login, you'll see the dashboard
3. **Select Nationality**: Choose one or more nationalities
4. **Select Destination**: Choose where you want to move
5. **Generate Guide**: Click "Start Migration Guide"
6. **View Guide**: You'll be redirected to your personalized guide
7. **Use Chatbot**: Ask questions in the chatbot panel
8. **Track Progress**: Mark steps as complete

## Troubleshooting

### Firebase Connection Issues
- Verify all Firebase environment variables are correct
- Check that Realtime Database (not Firestore) is enabled
- Ensure security rules are properly configured

### OpenAI API Issues
- Verify your API key is correct
- Check that you have API credits available
- Ensure the API key has proper permissions

### Authentication Issues
- Make sure Email/Password authentication is enabled in Firebase
- Check browser console for error messages
- Verify Firebase config values are correct

### Build Errors
- Run `npm install` to ensure all dependencies are installed
- Check that TypeScript types are installed: `npm install --save-dev @types/uuid`
- Clear `.next` folder and rebuild: `rm -rf .next && npm run build`

## Project Structure

```
next-app/
├── app/
│   ├── api/
│   │   ├── generate-guide/route.ts  # Guide generation API
│   │   └── chat/route.ts            # Chatbot API
│   ├── dashboard/page.tsx            # Main dashboard
│   ├── guide/[guideId]/page.tsx     # Guide display page
│   ├── login/page.tsx                # Login page
│   ├── signup/page.tsx               # Signup page
│   ├── layout.tsx                    # Root layout
│   └── page.tsx                      # Home (redirects)
├── components/
│   ├── AuthGuard.tsx                 # Auth wrapper
│   └── Chatbot.tsx                   # Chat component
├── lib/
│   ├── firebase.ts                   # Firebase config
│   ├── auth.ts                       # Auth utilities
│   ├── database.ts                   # DB operations
│   └── api-auth.ts                   # API auth helpers
└── .env.local                        # Environment variables (create this)
```

## Next Steps

- Customize the nationality and destination lists in `app/dashboard/page.tsx`
- Adjust the OpenAI prompts in `app/api/generate-guide/route.ts` for different guide formats
- Add more features like PDF export, document uploads, etc.
- Deploy to Vercel, Netlify, or your preferred hosting platform

