import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  signOut
} from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  updateDoc
} from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";
import {
  getStorage,
  ref as storageRef,
  uploadBytes,
  getDownloadURL
} from "https://www.gstatic.com/firebasejs/11.6.0/firebase-storage.js";

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyD8L_WuO4BeE2_MzsMgIV3ooWKmCaqOyE0",
  authDomain: "career-compass-318e7.firebaseapp.com",
  projectId: "career-compass-318e7",
  storageBucket: "career-compass-318e7.appspot.com",
  messagingSenderId: "745724931177",
  appId: "1:745724931177:web:6a85fc478c7c2989ac46f8",
  measurementId: "G-5PW2LJZ4BW"
};

// Init Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export {
  auth,
  db,
  storage,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  storageRef,
  uploadBytes,
  getDownloadURL,
  signOut
};
