const { initializeApp } = require("firebase/app");
const { getDatabase } = require("firebase/database");
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

const firebaseConfig = {
    apiKey: process.env.VITE_FIREBASE_API_KEY,
    authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
    databaseURL: process.env.VITE_FIREBASE_DATABASE_URL,
    projectId: process.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.VITE_FIREBASE_APP_ID,
    measurementId: "G-1N0FYZK2W9" // Hardcoded from user request if needed, or ignored for backend
};

// Singleton pattern
let app;
let db;

try {
    app = initializeApp(firebaseConfig);
    db = getDatabase(app);
    console.log("[Firebase Backend] Initialized successfully");
} catch (error) {
    console.error("[Firebase Backend] Initialization failed:", error);
}

module.exports = { db };
