import * as admin from 'firebase-admin';
import path from 'path';

// Path to your service account key file
const serviceAccountPath = path.join(__dirname, '../../firebaseServiceAccount.json');

try {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccountPath),
    });
    console.log('Firebase Admin initialized successfully');
} catch (error) {
    console.error('Firebase Admin initialization error:', error);
}

export default admin;
