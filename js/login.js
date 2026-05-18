import { auth, provider } from "./firebase.js";

import {
    signInWithPopup,
    signInWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";

const btnLoginGoogle = document.getElementById("loginGoogle");
const btnLoginEmail = document.getElementById("loginEmail");

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
        email: profile.email || existing.email || ""
    };
    localStorage.setItem("perfisUsuario", JSON.stringify(profiles));
}

function validateBasicProfile(isGoogleLogin = false) {
    const aceitarTermos = document.getElementById("aceitarTermos");
    if (!aceitarTermos?.checked) {
        aceitarTermos.classList.add("error");
        status.innerText = "Você deve aceitar os Termos de Uso e Política de Privacidade.";
        status.style.color = "red";
        return false;
    }
    aceitarTermos.classList.remove("error");

    return true;
}


// LOGIN COM GOOGLE
btnLoginGoogle.onclick = async () => {
    if (!validateBasicProfile(true)) return;

    try {
        status.innerText = "⏳ Conectando com Google...";
        status.style.color = "#ffd700";

        const result = await signInWithPopup(auth, provider);
        const user = result.user;
        const existingProfile = getUserProfiles()[user.uid] || {};

        saveUserProfile(user.uid, {
            email: user.email || "",
            nomeCompleto: existingProfile.nomeCompleto || user.displayName || "",
        });

        userText.innerText = `👤 ${user.displayName || user.email}`;
        status.innerText = "✅ Login com Google realizado com sucesso!";
        status.style.color = "#90EE90";

        setTimeout(() => {
            window.location.href = "agendamento.html";
        }, 1500);

    } catch (erro) {
        console.error("Erro no login com Google:", erro);
        
        let mensagem = "❌ Erro ao conectar com Google";
        
        if (erro.code === "auth/popup-closed-by-user") {
            mensagem = "❌ Você cancelou o login";
        } else if (erro.code === "auth/popup-blocked") {
            mensagem = "❌ Pop-up bloqueado. Verifique suas configurações!";
        }
        
        status.innerText = mensagem;
        status.style.color = "red";
    }
};


// LOGIN COM EMAIL E SENHA
btnLoginEmail.onclick = async () => {
    if (!validateBasicProfile()) return;

    // Validar campos vazios
    if (!email.value.trim()) {
        status.innerText = "❌ Por favor, digite seu e-mail";
        status.style.color = "red";
        email.focus();
        return;
    }

    if (!senha.value.trim()) {
        status.innerText = "❌ Por favor, digite sua senha";
        status.style.color = "red";
        senha.focus();
        return;
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.value)) {
        status.innerText = "❌ Por favor, digite um e-mail válido";
        status.style.color = "red";
        email.focus();
        return;
    }

    try {
        status.innerText = "⏳ Entrando...";
        status.style.color = "#ffd700";

        const result = await signInWithEmailAndPassword(
            auth,
            email.value.trim(),
            senha.value
        );

        const user = result.user;
        const existingProfile = getUserProfiles()[user.uid] || {};

        saveUserProfile(user.uid, {
            email: user.email || "",
            nomeCompleto: existingProfile.nomeCompleto || "",
        });

        userText.innerText = `👤 ${existingProfile.nomeCompleto || user.email}`;
        status.innerText = "✅ Login realizado com sucesso!";
        status.style.color = "#90EE90";

        setTimeout(() => {
            window.location.href = "agendamento.html";
        }, 1500);

    } catch (erro) {
        console.error("Erro de login:", erro);
        
        // Mensagens de erro simples e diretas
        let mensagem = "❌ Email ou senha inválidos";
        
        if (erro.code === "auth/too-many-requests") {
            mensagem = "❌ Muitas tentativas. Tente mais tarde!";
        }
        
        status.innerText = mensagem;
        status.style.color = "red";
    }
};