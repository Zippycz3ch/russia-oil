import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

// Your web app's Firebase configuration
// Using import.meta.env for Vite
const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyDAfvZYwn_GmzFB1i1DLc-xCbQuDpzcTvg",
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "russia-oil-tracker.firebaseapp.com",
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "russia-oil-tracker",
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "russia-oil-tracker.firebasestorage.app",
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "86599024625",
    appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:86599024625:web:c833bd2f796bf999784e50"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
export const db = getFirestore(app);

// Initialize Auth
export const auth = getAuth(app);

// Collections
export const COLLECTIONS = {
    FACILITIES: 'facilities',
    HITS: 'hits'
};
