import { auth, provider } from "./firebase.js";

import {
    signInWithPopup,
    signInWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";

const btnLoginGoogle = document.getElementById("loginGoogle");
const btnLoginEmail = document.getElementById("loginEmail");

const telefone = document.getElementById("telefone");
const email = document.getElementById("email");
const senha = document.getElementById("senha");

const userText = document.getElementById("user");
const status = document.getElementById("status");

function getUserProfiles() {
    return JSON.parse(localStorage.getItem("perfisUsuario") || "{}");
}

function saveUserProfile(uid, profile) {
    if (!uid) return;
    const profiles = getUserProfiles();
    const existing = profiles[uid] || {};
    profiles[uid] = {
        nomeCompleto: existing.nomeCompleto || profile.nomeCompleto || "",
        telefone: profile.telefone || existing.telefone || "",
        email: profile.email || existing.email || ""
    };
    localStorage.setItem("perfisUsuario", JSON.stringify(profiles));
}

function validateBasicProfile(isGoogleLogin = false) {
    if (!isGoogleLogin && !telefone?.value.trim()) {
        status.innerText = "Por favor, informe seu telefone.";
        status.style.color = "red";
        return false;
    }
    return true;
}


// LOGIN COM GOOGLE
btnLoginGoogle.onclick = async () => {
    if (!validateBasicProfile(true)) return;

    try {
        const result = await signInWithPopup(auth, provider);
        const user = result.user;
        const existingProfile = getUserProfiles()[user.uid] || {};

        saveUserProfile(user.uid, {
            telefone: telefone?.value.trim() || existingProfile.telefone || "",
            email: user.email || "",
            nomeCompleto: existingProfile.nomeCompleto || user.displayName || "",
        });

        userText.innerText = `👤 ${user.displayName || user.email}`;
        status.innerText = "Login com Google realizado com sucesso!";
        status.style.color = "#ccc";

        setTimeout(() => {
            window.location.href = "agendamento.html";
        }, 1500);

    } catch (erro) {
        console.error(erro);
        status.innerText = erro.code + " - " + erro.message;
        status.style.color = "red";
    }
};


// LOGIN COM EMAIL E SENHA
btnLoginEmail.onclick = async () => {
    if (!validateBasicProfile()) return;

    try {
        const result = await signInWithEmailAndPassword(
            auth,
            email.value,
            senha.value
        );

        const user = result.user;
        const existingProfile = getUserProfiles()[user.uid] || {};

        saveUserProfile(user.uid, {
            telefone: telefone.value.trim(),
            email: user.email || "",
            nomeCompleto: existingProfile.nomeCompleto || "",
        });

        userText.innerText = `👤 ${existingProfile.nomeCompleto || user.email}`;
        status.innerText = "Login realizado com sucesso!";
        status.style.color = "#ccc";

        setTimeout(() => {
            window.location.href = "agendamento.html";
        }, 1500);

    } catch (erro) {
        console.error(erro);
        status.innerText = erro.code + " - " + erro.message;
        status.style.color = "red";
    }
};