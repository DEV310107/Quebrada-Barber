import { loginWithGoogle, logoutUser, observeAuthState, ensureUserProfile } from "./auth.js";

const loginButton = document.getElementById("loginButton");
const logoutButton = document.getElementById("logoutButton");
const authStatus = document.getElementById("authStatus");
const userInfo = document.getElementById("userInfo");
const userAvatar = document.getElementById("userAvatar");
const userName = document.getElementById("userName");
const userEmail = document.getElementById("userEmail");
const scheduleButton = document.getElementById("scheduleButton");
const ctaScheduleButton = document.getElementById("ctaScheduleButton");

loginButton.addEventListener("click", async () => {
    disableButton(loginButton, true, "Entrando...");

    try {
        await loginWithGoogle();
    } catch (error) {
        authStatus.textContent = getFriendlyError(error);
        authStatus.className = "auth-status auth-status--off";
    } finally {
        disableButton(loginButton, false, "Entrar com Google");
    }
});

logoutButton.addEventListener("click", async () => {
    disableButton(logoutButton, true, "Saindo...");

    try {
        await logoutUser();
    } catch (error) {
        authStatus.textContent = getFriendlyError(error);
        authStatus.className = "auth-status auth-status--off";
    } finally {
        disableButton(logoutButton, false, "Sair");
    }
});

observeAuthState(async (user) => {
    if (!user) {
        setLoggedOutState();
        return;
    }

    try {
        await ensureUserProfile(user);
        setLoggedInState(user);
    } catch (error) {
        authStatus.textContent = getFriendlyError(error);
        authStatus.className = "auth-status auth-status--off";
    }
});

function setLoggedOutState() {
    authStatus.textContent = "Faca login para liberar o agendamento online.";
    authStatus.className = "auth-status auth-status--off";
    userInfo.hidden = true;
    loginButton.hidden = false;
    logoutButton.hidden = true;
    setScheduleAccess(false);
}

function setLoggedInState(user) {
    authStatus.textContent = "Login conectado. Agendamento liberado.";
    authStatus.className = "auth-status auth-status--on";
    userInfo.hidden = false;
    loginButton.hidden = true;
    logoutButton.hidden = false;
    userName.textContent = user.displayName || "Cliente";
    userEmail.textContent = user.email || "";
    userAvatar.src = user.photoURL || "https://via.placeholder.com/48?text=QC";
    setScheduleAccess(true);
}

function setScheduleAccess(enabled) {
    [scheduleButton, ctaScheduleButton].forEach((link) => {
        link.setAttribute("aria-disabled", String(!enabled));

        if (enabled) {
            link.classList.remove("is-disabled");
        } else {
            link.classList.add("is-disabled");
        }
    });
}

function disableButton(button, disabled, label) {
    button.disabled = disabled;
    button.textContent = label;
}

function getFriendlyError(error) {
    if (error?.message) {
        return error.message;
    }

    return "Nao foi possivel autenticar com o Google.";
}
