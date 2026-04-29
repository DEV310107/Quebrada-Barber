// 🔥 IMPORTS FIREBASE
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";
import { getAuth, GoogleAuthProvider } 
from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";
import { getFirestore } 
from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";

// 🔐 CONFIG
const firebaseConfig = {
  apiKey: "AIzaSyCuVlCN-ofRnsS7KG6oELedvy84V9U6pUg",
  authDomain: "projeto-test-quebrada-barber.firebaseapp.com",
  projectId: "projeto-test-quebrada-barber",
  storageBucket: "projeto-test-quebrada-barber.firebasestorage.app",
  messagingSenderId: "402917144781",
  appId: "1:402917144781:web:70bd6af69f8eba71299184"
};

// 🚀 INICIALIZA
const app = initializeApp(firebaseConfig);

// 🔐 AUTH
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

// 🔥 FIRESTORE
const db = getFirestore(app);

// 🔥 EXPORTA
export { auth, provider, db };