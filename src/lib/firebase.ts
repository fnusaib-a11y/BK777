import { initializeApp } from "firebase/app";
import { getAnalytics, isSupported, Analytics } from "firebase/analytics";
import { getAuth, Auth } from "firebase/auth";
import { getFirestore, Firestore } from "firebase/firestore";
import { getDatabase, Database } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyCQWp-n8VmYEDbJgeiw-scbA_iyJeVTxSc",
  authDomain: "bk4777-aee07.firebaseapp.com",
  databaseURL: "https://bk4777-aee07-default-rtdb.firebaseio.com",
  projectId: "bk4777-aee07",
  storageBucket: "bk4777-aee07.firebasestorage.app",
  messagingSenderId: "661891484761",
  appId: "1:661891484761:web:f267d621f4c1c231763548",
  measurementId: "G-E3R20TGDP9"
};

// Initialize Firebase App
let app: any;
try {
  app = initializeApp(firebaseConfig);
  const analytics = getAnalytics(app);
} catch (e) {
  console.error("Firebase app initialization failed:", e);
}

// Initialize Services safely as lazy getters
let auth: Auth | null = null;
let db: Firestore | null = null;
let rtdb: Database | null = null;

export const getAuthService = () => {
  if (!auth && app) auth = getAuth(app);
  return auth;
};

export const getFirestoreService = () => {
  if (!db && app) db = getFirestore(app, 'default');
  return db;
};

export const getDatabaseService = () => {
  if (!rtdb && app) rtdb = getDatabase(app);
  return rtdb;
};

export { app };
