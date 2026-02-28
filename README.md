# CampusTrace - Lost & Found Community Portal

This project is a Next.js 15 application designed to help campus communities reunite with lost belongings using AI-powered matching and Firebase.

## Features

- **Live Browse:** Real-time filtering and search for lost/found items using Firestore.
- **Smart Posting:** Easy form to report items with image support (data URIs).
- **User Dashboard:** Personal space to manage your listings and track AI-suggested matches.
- **AI Matching:** Automated suggestions for potential matches between lost and found reports using Google Genkit.
- **Google Auth:** Secure sign-in using university Google accounts or email/password.

## Local Setup

To run this project on your desktop:

1. **Download the Source:** Use the download option in your workspace to get the ZIP of all files.
2. **Install Dependencies:**
   Run `npm install` in your terminal within the project folder.
3. **Firebase Configuration:**
   Update `src/firebase/config.ts` with your actual Firebase project credentials if you haven't already. For Vercel, use environment variables as described below.
4. **Environment Variables:**
   Create a `.env.local` file and add your `GOOGLE_GENAI_API_KEY` to enable the AI matching features.
5. **Run the App:**
   - Start the web server: `npm run dev`

## Deployment & Git Instructions

To push this project to your own GitHub repository, open your terminal in the project folder and run:

```bash
git init
git add .
git commit -m "Initial commit of CampusTrace"
git branch -M main
git remote add origin YOUR_GITHUB_REPO_URL
git push -u origin main
```

### Vercel Deployment Tips
- **Environment Variables:** Add all `NEXT_PUBLIC_FIREBASE_*` variables and `GOOGLE_GENAI_API_KEY` in the Vercel dashboard.
- **Authorized Domains:** In the Firebase Console (Authentication > Settings), add your Vercel URL (e.g., `your-project.vercel.app`) to the "Authorized Domains" list.

## Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Styling:** Tailwind CSS + ShadCN UI
- **Backend:** Firebase (Firestore & Auth)
- **AI:** Google Genkit + Gemini 2.5 Flash
