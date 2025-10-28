import * as admin from 'firebase-admin';

// Initialize Firebase Admin
// You'll need to download your service account key from Firebase Console
// and place it in backend/serviceAccountKey.json
// Or use environment variables for production

let app: admin.app.App | null = null;

try {
    if (process.env.FIREBASE_SERVICE_ACCOUNT) {
        // Production: use environment variable
        const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
        app = admin.initializeApp({
            credential: admin.credential.cert(serviceAccount)
        });
    } else {
        // Development: use service account file
        const serviceAccount = require('../../serviceAccountKey.json');
        app = admin.initializeApp({
            credential: admin.credential.cert(serviceAccount)
        });
    }
} catch (error) {
    console.warn('Firebase initialization failed:', error);
    console.warn('Running in mock mode - data will not persist');
}

export const db = app ? admin.firestore() : null;
export const auth = app ? admin.auth() : null;

// Collections
export const COLLECTIONS = {
    FACILITIES: 'facilities',
    HITS: 'hits'
};
