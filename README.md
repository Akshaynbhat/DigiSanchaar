# DigiSanchaar - Advanced Tourist Safety & E-FIR Platform

DigiSanchaar is a comprehensive Next.js web application designed to enhance tourist safety and streamline emergency response. It integrates AI-powered SOS protocols, multilingual support, and a dedicated portal for police authorities to manage Electronic First Information Reports (E-FIRs).

## 🚀 Key Features

*   **Intelligent SOS Protocol:** 
    *   Triggers emergency alerts instantly with a countdown confirmation.
    *   Captures live audio and uses **Google GenAI** to analyze distress signals.
    *   Automatically logs a provisional E-FIR with the user's live geolocation.
*   **Emergency Notifications:**
    *   Integrates with **Twilio** for automated phone calls.
    *   Integrates with **Resend** to dispatch immediate email alerts to emergency contacts.
*   **E-FIR Management:**
    *   **User Portal:** Citizens can view their auto-filed provisional E-FIRs and track their status.
    *   **Police Dashboard:** A dedicated interface for law enforcement to monitor live maps, listen to SOS audio evidence, and process missing persons/theft reports.
*   **Multilingual Support:** Extensive localization out-of-the-box (English, Hindi, Telugu, Tamil, Marathi, Malayalam, Kannada, Gujarati, Bengali, Punjabi, Assamese) to assist diverse tourists.
*   **Tourist Dashboard:** Quick access to medical aid, current trips, important contacts, cuisine recommendations, and community safety news.

## 🛠 Tech Stack

*   **Frontend:** Next.js (App Router), React, Tailwind CSS, shadcn/ui components
*   **Backend:** Next.js Server Actions, Firebase (Auth, Firestore, Storage)
*   **AI Integration:** Google GenAI (Gemini) via `@genkit-ai/googleai`
*   **Communications:** Twilio SDK (Voice), Resend SDK (Email)

## 📦 Getting Started

### Prerequisites
Make sure you have Node.js and npm installed. You will also need a Firebase project, a Twilio account, a Resend account, and a Google Gemini API key.

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/Akshaynbhat/DigiSanchaar.git
    cd DigiSanchaar
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Environment Variables Setup:**
    Duplicate the `.env.example` file and rename it to `.env.local`:
    ```bash
    cp .env.example .env.local
    ```
    Populate the variables in `.env.local` with your actual API keys:
    *   `NEXT_PUBLIC_FIREBASE_API_KEY`
    *   `GOOGLE_GENAI_API_KEY`
    *   `RESEND_API_KEY`
    *   `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_PHONE_NUMBER`
    *   `WEATHER_API_KEY`

    *(Note: Ensure `.env.local` is listed in `.gitignore` to prevent exposing your secrets!)*

4.  **Run the development server:**
    ```bash
    npm run dev
    ```

5.  Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🔐 Security Notice

This repository uses automated secret scanning. **Never commit actual API keys or credentials directly to your source code.**
If deploying to Firebase App Hosting, ensure you add your variables as secure secrets rather than hardcoding them in `apphosting.yaml`.

## 📂 Project Structure

*   `/src/app`: Next.js App Router pages (Dashboard, E-FIR, Police Portal, SOS, etc.)
*   `/src/ai`: GenKit flows for analyzing distress audio and weather information.
*   `/src/components`: Reusable UI components (Tailwind + shadcn/ui).
*   `/src/lib`: Utility functions, database operations, and notification services.
*   `/src/locales`: JSON files containing translations for 10+ languages.

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the issues page.
