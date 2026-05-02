
import { initializeApp, getApps, cert, App } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';
import { getStorage, Storage } from 'firebase-admin/storage';

// This function initializes the Firebase Admin SDK.
// It ensures that it's only initialized once (singleton pattern).
export function getFirebaseAdmin() {
  if (getApps().length) {
    const app = getApps()[0];
    const db = getFirestore(app);
    const storage = getStorage(app);
    return { app, db, storage };
  }
  
  // This simplified initialization will work correctly in a deployed Google Cloud environment
  // (like App Hosting) where service account credentials are automatically available.
  // It will also work for local development if you have run `gcloud auth application-default login`.
  console.log('Initializing Firebase Admin SDK with application default credentials.');
  const app = initializeApp({
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  });

  const db = getFirestore(app);
  const storage = getStorage(app);

  return { app, db, storage };
}
