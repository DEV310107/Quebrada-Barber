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


// LOGIN COM GOOGLE
btnLoginGoogle.onclick = async () => {
    try {
        const result = await signInWithPopup(auth, provider);
        const user = result.user;

        userText.innerText = `👤 ${user.displayName}`;
        status.innerText = "Login com Google realizado com sucesso!";

        setTimeout(() => {
            window.location.href = "agendamento.html";
        }, 1500);

    } catch (erro) {
        console.error(erro);
        status.innerText = erro.code + " - " + erro.message;
    }
};


// LOGIN COM EMAIL E SENHA
btnLoginEmail.onclick = async () => {
    try {
        const result = await signInWithEmailAndPassword(
            auth,
            email.value,
            senha.value
        );

        const user = result.user;

        userText.innerText = `👤 ${user.email}`;
        status.innerText = "Login realizado com sucesso!";

        setTimeout(() => {
            window.location.href = "agendamento.html";
        }, 1500);

    } catch (erro) {
        console.error(erro);
        status.innerText = erro.code + " - " + erro.message;
    }
};