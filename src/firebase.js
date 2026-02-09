import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

// Your web app's Firebase configuration
// See: https://firebase.google.com/docs/web/setup#available-libraries
const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyAKPoNf_Ou8VuYW98_5vitzu0cQMxaX-Nw",
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "gen-lang-client-0556123756.firebaseapp.com",
    databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL || "https://gen-lang-client-0556123756-default-rtdb.firebaseio.com",
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "gen-lang-client-0556123756",
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "gen-lang-client-0556123756.firebasestorage.app",
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "463106103162",
    appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:463106103162:web:660f4da3a32643a5f728c3"
};

// Check for placeholders
const isConfigured = firebaseConfig.apiKey && !firebaseConfig.apiKey.includes('your_api_key');

if (!isConfigured) {
    console.warn("Firebase is NOT configured. Messaging and Video Chat signaling will be restricted to local/mirror mode.");
}

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

export { db };
