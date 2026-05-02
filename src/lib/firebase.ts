
// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";
import "firebase/auth";


// Your web app's Firebase configuration
const firebaseConfig = {
  "projectId": "studio-8617476926-d49f3",
  "appId": "1:568448725576:web:4f72043c8e3def044a9e7d",
  "storageBucket": "studio-8617476926-d49f3.appspot.com",
  "apiKey": process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  "authDomain": "studio-8617476926-d49f3.firebaseapp.com",
  "messagingSenderId": "568448725576"
};


// A more robust way to initialize Firebase, ensuring it's only done once.
let app: FirebaseApp;
if (getApps().length === 0) {
    app = initializeApp(firebaseConfig);
} else {
    app = getApp();
}

const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);

export { app, db, auth, storage };

