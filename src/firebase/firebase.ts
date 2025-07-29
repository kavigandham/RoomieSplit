// src/firebase/firebase.ts
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDuHukHMmtejxzb4uRyjANsVG4iNrGSvWk",
  authDomain: "roomiesplit-ac0da.firebaseapp.com",
  projectId: "roomiesplit-ac0da",
  storageBucket: "roomiesplit-ac0da.firebasestorage.app",
  messagingSenderId: "228503123827",
  appId: "1:228503123827:web:6cc7c262465a09e5c57706",
  measurementId: "G-QLY5QLE6BG"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
