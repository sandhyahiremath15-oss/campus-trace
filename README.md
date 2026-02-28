# CampusTrace - Lost & Found Community Portal

This project is a Next.js 15 application designed to help campus communities reunite with lost belongings using AI-powered matching and Firebase.

## Features

- **Live Browse:** Real-time filtering and search for lost/found items using Firestore.
- **Smart Posting:** Easy form to report items with image support (data URIs).
- **User Dashboard:** Personal space to manage your listings and track AI-suggested matches.
- **AI Matching:** Automated suggestions for potential matches between lost and found reports using Google Genkit.

## Local Setup

To run this project on your desktop:

1. **Copy the Files:** Download or copy all files from this workspace to a folder on your desktop.
2. **Install Dependencies:**
   Run `npm install` in your terminal within the project folder.
3. **Firebase Configuration:**
   Update `src/firebase/config.ts` with your actual Firebase project credentials from the [Firebase Console](https://console.firebase.google.com/).
4. **Environment Variables:**
   Create a `.env.local` file and add your `GOOGLE_GENAI_API_KEY` to enable the AI matching features.
5. **Run the App:**
   - Start the web server: `npm run dev`
   - Start the Genkit UI: `npm run genkit:dev`

## Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Styling:** Tailwind CSS + ShadCN UI
- **Backend:** Firebase (Firestore & Auth)
- **AI:** Google Genkit + Gemini 2.5 Flash
