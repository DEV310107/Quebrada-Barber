import { auth } from "./firebase.js";

import {
    createUserWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";

const btnCriarConta = document.getElementById("criarConta");

const nomeCompleto = document.getElementById("nomeCompleto");
const telefone = document.getElementById("telefone");
const email = document.getElementById("email");
const senha = document.getElementById("senha");
const confirmarSenha = document.getElementById("confirmarSenha");

const userText = document.getElementById("user");
const status = document.getElementById("status");

function getUserProfiles() {
    return JSON.parse(localStorage.getItem("perfisUsuario") || "{}");
}

function saveUserProfile(uid, profile) {
    if (!uid) return;
    const profiles = getUserProfiles();
    profiles[uid] = profile;
    localStorage.setItem("perfisUsuario", JSON.stringify(profiles));
}

function validateCreationProfile() {
    const aceitarTermos = document.getElementById("aceitarTermos");
    if (!aceitarTermos?.checked) {
        aceitarTermos.classList.add("error");
        status.innerText = "Você deve aceitar os Termos de Uso e Política de Privacidade.";
        status.style.color = "red";
        return false;
    }
    aceitarTermos.classList.remove("error");
    if (!nomeCompleto?.value.trim()) {
        status.innerText = "Por favor, informe seu nome completo.";
        status.style.color = "red";
        return false;
    }
    if (!telefone?.value.trim()) {
        status.innerText = "Por favor, informe seu telefone.";
        status.style.color = "red";
        return false;
    }
    return true;
}

// CRIAR CONTA COM EMAIL E SENHA
btnCriarConta.onclick = async () => {
    try {
        if (!validateCreationProfile()) return;

        // Verificar se as senhas coincidem
        if (senha.value !== confirmarSenha.value) {
            status.innerText = "As senhas não coincidem!";
            status.style.color = "red";
            return;
        }

        // Verificar se a senha tem pelo menos 6 caracteres
        if (senha.value.length < 6) {
            status.innerText = "A senha deve ter pelo menos 6 caracteres!";
            status.style.color = "red";
            return;
        }

        const result = await createUserWithEmailAndPassword(
            auth,
            email.value,
            senha.value
        );

        const user = result.user;

        saveUserProfile(user.uid, {
            nomeCompleto: nomeCompleto.value.trim(),
            telefone: telefone.value.trim(),
            email: user.email || "",
        });

        userText.innerText = `👤 Conta criada: ${user.email}`;
        status.innerText = "Conta criada com sucesso!";
        status.style.color = "#ccc";

        setTimeout(() => {
            window.location.href = "login.html";
        }, 2000);

    } catch (erro) {
        console.error(erro);
        status.style.color = "red";

        if (erro.code === "auth/email-already-in-use") {
            status.innerText = "Este e-mail já está em uso!";
        } else if (erro.code === "auth/invalid-email") {
            status.innerText = "E-mail inválido!";
        } else if (erro.code === "auth/weak-password") {
            status.innerText = "Senha muito fraca!";
        } else {
            status.innerText = erro.code + " - " + erro.message;
        }
    }
};