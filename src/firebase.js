import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAGdf0Kk6Q_51IfizGjo6gjIB86isN-JSI",
  authDomain: "my-ai-project-93644.firebaseapp.com",
  projectId: "my-ai-project-93644",
  storageBucket: "my-ai-project-93644.firebasestorage.app",
  messagingSenderId: "144111418980",
  appId: "1:144111418980:web:a21b71f358393aa171a971",
  measurementId: "G-8MHHTEHVKH"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);