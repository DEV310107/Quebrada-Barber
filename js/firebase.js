// 🔥 IMPORTS FIREBASE
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";
import { getAuth, GoogleAuthProvider } 
from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";

// 🔐 CONFIG
const firebaseConfig = {
  apiKey: "SUA_KEY",
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

// 🔥 EXPORTA (IMPORTANTE)
export { auth, provider };