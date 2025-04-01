import { initializeApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged } from "firebase/auth";
import { 
  getFirestore, doc, getDoc, setDoc, 
  collection, addDoc 
} from "firebase/firestore";  // ✅ Add collection & addDoc

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyD8-GcQs4qSYKM8x-szl7gyZXfHlkhCMyE",
  authDomain: "jiraclone-a4d67.firebaseapp.com",
  projectId: "jiraclone-a4d67",
  storageBucket: "jiraclone-a4d67.appspot.com", // ✅ Fixed typo here
  messagingSenderId: "1080977237140",
  appId: "1:1080977237140:web:c02e7de756c990dc524081",
  measurementId: "G-V2XYBH4MPT"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Auth and Firestore
const auth = getAuth(app);
const firestore = getFirestore(app);

// ✅ Export Firestore functions properly
export { 
  auth, firestore, createUserWithEmailAndPassword, signInWithEmailAndPassword, 
  doc, getDoc, setDoc, collection, addDoc, onAuthStateChanged 
};
