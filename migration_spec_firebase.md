
# Specification: Migration Guidance Web App (Next.js + ChatGPT-5 + Firebase)

## 1. Purpose

Build a **pure Next.js web application** that helps users understand and complete the steps required to migrate to another country.

This application must:
1. Allow users to **sign up and log in**.
2. Ask for the user’s current nationality or nationalities.
3. Let users choose a destination country or city (e.g. “Move to New York”).
4. Use **ChatGPT-5** to generate a personalised, step-by-step migration guide.
5. Provide a **persistent AI chatbot assistant** to help with paperwork.
6. Track user progress across sessions.
7. Run locally with a **single command** once dependencies are installed.

There must be **no Flask or Python backend**. All logic runs through **Next.js route handlers**.

---

## 2. Tech Stack (Mandatory)

### 2.1 Framework
- **Next.js (App Router)**
- TypeScript
- Tailwind CSS

### 2.2 APIs & Services
- OpenAI API (ChatGPT-5)
- Firebase Authentication
- Firebase Realtime Database

### 2.3 Hosting (Local Dev)
- Local development server via:
  ```bash
  npm run dev
````

* App must run at:

  ```
  http://localhost:3000
  ```

---

## 3. Mandatory Setup & Dependency Installation (Cursor Instructions)

Cursor **must execute or generate instructions for** the following steps automatically.

### 3.1 Create Project

```bash
npx create-next-app@latest movinit --typescript --tailwind --eslint --use-npm
cd movinit
```

### 3.2 Install Dependencies

```bash
npm install firebase openai uuid
```

### 3.3 Run Development Server

```bash
npm run dev
```

After running this command, the website must open successfully on:

```
http://localhost:3000
```

No manual configuration should be required beyond environment variables.

---

## 4. Application Routes & Pages

### 4.1 Authentication

#### `/login`

* Email + password login
* Uses Firebase Authentication
* On success → redirect to `/dashboard`

#### `/signup`

* Email + password sign-up
* Creates Firebase user
* Initializes user record in database
* Redirects to `/dashboard`

---

### 4.2 Dashboard

#### `/dashboard`

* Requires authenticated user
* Displays:

  * Nationality selector (supports multiple nationalities)
  * Destination selector (cities or countries)
* “Start Migration Guide” button

---

### 4.3 Migration Guide

#### `/guide/[guideId]`

* Displays:

  * High-level migration summary
  * Step-by-step plan
  * Required paperwork per step
  * External government links
  * Submission instructions
* Each step can be marked as complete
* Progress persists across sessions

---

## 5. ChatGPT-5 Integration

### 5.1 Guide Generation

#### API Route

```
POST /api/generate-guide
```

#### Input

```json
{
  "nationalities": ["Irish"],
  "destination": "New York, USA"
}
```

#### Output

```json
{
  "summary": "Overview of the migration process",
  "steps": [
    {
      "step": 1,
      "title": "Determine visa eligibility",
      "description": "Check eligibility for US visas",
      "paperwork": ["DS-160"],
      "links": ["https://travel.state.gov"],
      "submission": "Online",
      "nextStepCondition": "DS-160 submitted"
    }
  ]
}
```

---

### 5.2 Chatbot Assistant

* Persistent side panel on all `/guide/*` pages
* Uses ChatGPT-5
* Receives:

  * Current guide
  * Current step
  * User question
* Assists with:

  * Filling out forms
  * Understanding paperwork
  * Next steps and submission details

---

## 6. Firebase Data Model

### 6.1 Users

```json
/users/{uid} {
  "email": "user@email.com",
  "createdAt": "timestamp"
}
```

### 6.2 Guides

```json
/guides/{guideId} {
  "uid": "userId",
  "nationalities": ["Irish"],
  "destination": "New York",
  "steps": [...],
  "currentStep": 1,
  "createdAt": "timestamp"
}
```

---

## 7. Authentication & Access Control

* Only authenticated users may:

  * Generate migration guides
  * View guides
  * Update progress
* Firebase security rules must enforce ownership:

  * Users may only read/write their own guides

---

## 8. Non-Functional Requirements

* No Flask, no Python backend
* All secrets stored in `.env.local`
* Deterministic prompts to ChatGPT-5
* JSON-based data exchange
* Mobile-responsive UI
* Fast page loads using Next.js SSR where appropriate

---

## 9. Example User Flow

1. User signs up
2. User logs in
3. User enters nationality: **Irish**
4. User clicks **“Move to New York”**
5. App generates a step-by-step migration guide
6. User completes paperwork step-by-step
7. AI assistant helps with forms and instructions
8. Progress is saved automatically

---

## 10. Future Enhancements

* PDF export of guides
* Admin-editable templates
* Multi-language support
* Paid tiers
* Document uploads and storage

```

---

If you want next, I can:
- Turn this into a **Cursor mega-prompt**
- Generate the **entire file structure**
- Scaffold **auth, guide generation, and chat APIs**
- Or sanity-check this spec like a startup CTO would 🧠🚀
```
