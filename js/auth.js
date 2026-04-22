import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
    getAuth,
    GoogleAuthProvider,
    signInWithPopup,
    signOut,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import {
    getFirestore,
    doc,
    getDoc,
    getDocs,
    setDoc,
    collection,
    query,
    where,
    serverTimestamp,
    runTransaction
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { firebaseConfig } from "./firebase-config.js";

validateFirebaseConfig(firebaseConfig);

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const provider = new GoogleAuthProvider();

provider.setCustomParameters({
    prompt: "select_account"
});

export async function loginWithGoogle() {
    const result = await signInWithPopup(auth, provider);
    return result.user;
}

export async function logoutUser() {
    await signOut(auth);
}

export function observeAuthState(callback) {
    return onAuthStateChanged(auth, callback);
}

export async function ensureUserProfile(user) {
    const userRef = doc(db, "usuarios", user.uid);

    await setDoc(userRef, {
        uid: user.uid,
        name: user.displayName || "",
        email: user.email || "",
        photoURL: user.photoURL || "",
        lastLoginAt: serverTimestamp()
    }, { merge: true });
}

export async function findBookedTimesByDate(dateKey) {
    const appointmentsRef = collection(db, "agendamentos");
    const appointmentsQuery = query(appointmentsRef, where("dateKey", "==", dateKey));
    const snapshot = await getDocs(appointmentsQuery);

    return snapshot.docs
        .map((item) => item.data().time)
        .sort((a, b) => a.localeCompare(b));
}

export async function createAppointment({ dateKey, time, user }) {
    const appointmentId = `${dateKey}_${time.replace(":", "-")}`;
    const appointmentRef = doc(db, "agendamentos", appointmentId);

    await runTransaction(db, async (transaction) => {
        const existingAppointment = await transaction.get(appointmentRef);

        if (existingAppointment.exists()) {
            throw new Error("Esse horario ja foi reservado por outro cliente.");
        }

        transaction.set(appointmentRef, {
            dateKey,
            time,
            userUid: user.uid,
            userName: user.displayName || "",
            userEmail: user.email || "",
            createdAt: serverTimestamp()
        });
    });

    return getDoc(appointmentRef);
}

function validateFirebaseConfig(config) {
    const hasPlaceholder = Object.values(config).some((value) => String(value).startsWith("COLE_AQUI"));

    if (hasPlaceholder) {
        throw new Error("Configure o arquivo js/firebase-config.js com as chaves do seu projeto Firebase.");
    }
}
