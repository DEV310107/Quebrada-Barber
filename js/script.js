import {
    loginWithGoogle,
    logoutUser,
    observeAuthState,
    ensureUserProfile,
    findBookedTimesByDate,
    createAppointment
} from "./auth.js";

const loginButton = document.getElementById("loginButton");
const logoutButton = document.getElementById("logoutButton");
const authStatus = document.getElementById("authStatus");
const loginGate = document.getElementById("loginGate");
const agendaContent = document.getElementById("agendaContent");
const userInfo = document.getElementById("userInfo");
const userAvatar = document.getElementById("userAvatar");
const userName = document.getElementById("userName");
const userEmail = document.getElementById("userEmail");
const calendarEl = document.getElementById("calendario");
const horariosDiv = document.getElementById("horarios");
const diaTexto = document.getElementById("diaSelecionado");
const msgDiv = document.getElementById("mensagem");

let currentUser = null;
let selectedDate = null;

const calendar = new FullCalendar.Calendar(calendarEl, {
    initialView: "dayGridMonth",
    locale: "pt-br",
    validRange: {
        start: new Date().toISOString().split("T")[0]
    },
    dateClick: async (info) => {
        if (!currentUser) {
            showMessage("Faca login para escolher um horario.", "warning");
            return;
        }

        const data = new Date(`${info.dateStr}T00:00:00`);
        const diaSemana = data.getDay();

        if (diaSemana === 1) {
            showMessage("A barbearia fica fechada nas segundas-feiras.", "warning");
            return;
        }

        selectedDate = info.dateStr;
        diaTexto.textContent = `Horarios para: ${formatDate(selectedDate)}`;
        await renderTimes(selectedDate);
    }
});

calendar.render();

loginButton.addEventListener("click", async () => {
    disableButton(loginButton, true, "Entrando...");

    try {
        await loginWithGoogle();
    } catch (error) {
        showMessage(getFriendlyError(error), "error");
    } finally {
        disableButton(loginButton, false, "Entrar com Google");
    }
});

logoutButton.addEventListener("click", async () => {
    disableButton(logoutButton, true, "Saindo...");

    try {
        await logoutUser();
        showMessage("Sessao encerrada com sucesso.", "success");
    } catch (error) {
        showMessage(getFriendlyError(error), "error");
    } finally {
        disableButton(logoutButton, false, "Sair");
    }
});

observeAuthState(async (user) => {
    currentUser = user;

    if (!user) {
        setLoggedOutState();
        return;
    }

    try {
        await ensureUserProfile(user);
        setLoggedInState(user);

        if (selectedDate) {
            await renderTimes(selectedDate);
        }
    } catch (error) {
        showMessage(getFriendlyError(error), "error");
    }
});

function setLoggedOutState() {
    authStatus.textContent = "Entre com Google para liberar o calendario.";
    authStatus.className = "auth-status auth-status--off";
    loginGate.hidden = false;
    agendaContent.hidden = true;
    userInfo.hidden = true;
    loginButton.hidden = false;
    logoutButton.hidden = true;
    diaTexto.textContent = "";
    horariosDiv.innerHTML = "";
}

function setLoggedInState(user) {
    authStatus.textContent = "Login ativo. Agora voce pode agendar.";
    authStatus.className = "auth-status auth-status--on";
    loginGate.hidden = true;
    agendaContent.hidden = false;
    userInfo.hidden = false;
    loginButton.hidden = true;
    logoutButton.hidden = false;
    userName.textContent = user.displayName || "Cliente";
    userEmail.textContent = user.email || "";
    userAvatar.src = user.photoURL || "https://via.placeholder.com/48?text=QC";
}

async function renderTimes(dateKey) {
    horariosDiv.innerHTML = "<p class='loading-text'>Carregando horarios...</p>";

    try {
        const bookedTimes = await findBookedTimesByDate(dateKey);
        horariosDiv.innerHTML = "";

        for (let hora = 7; hora <= 18; hora += 1) {
            const horario = `${String(hora).padStart(2, "0")}:00`;
            const button = document.createElement("button");
            const isBooked = bookedTimes.includes(horario);

            button.type = "button";
            button.textContent = isBooked ? `${horario} (ocupado)` : horario;
            button.disabled = isBooked;

            button.addEventListener("click", async () => {
                await saveAppointment(dateKey, horario, button);
            });

            horariosDiv.appendChild(button);
        }
    } catch (error) {
        horariosDiv.innerHTML = "";
        showMessage(getFriendlyError(error), "error");
    }
}

async function saveAppointment(dateKey, horario, button) {
    if (!currentUser) {
        showMessage("Voce precisa estar logado para agendar.", "warning");
        return;
    }

    disableButton(button, true, "Salvando...");

    try {
        await createAppointment({
            dateKey,
            time: horario,
            user: currentUser
        });

        showMessage(`Agendado para ${formatDate(dateKey)} as ${horario}.`, "success");
        await renderTimes(dateKey);
        openWhatsApp(dateKey, horario);
    } catch (error) {
        showMessage(getFriendlyError(error), "error");
    } finally {
        disableButton(button, false, horario);
    }
}

function openWhatsApp(dateKey, horario) {
    const mensagem = [
        "Ola! Vim pelo site da Quebrada Cuts.",
        `Gostaria de confirmar meu agendamento para ${formatDate(dateKey)} as ${horario}.`,
        `Cliente: ${currentUser?.displayName || "Nao informado"}`,
        `Email: ${currentUser?.email || "Nao informado"}`
    ].join("\n");

    const numero = "55119411582335";
    const url = `https://wa.me/${numero}?text=${encodeURIComponent(mensagem)}`;

    window.setTimeout(() => {
        window.open(url, "_blank", "noopener,noreferrer");
    }, 1200);
}

function showMessage(message, type) {
    msgDiv.hidden = false;
    msgDiv.textContent = message;
    msgDiv.className = `feedback feedback--${type}`;
}

function formatDate(dateKey) {
    return new Intl.DateTimeFormat("pt-BR", {
        dateStyle: "full",
        timeZone: "America/Sao_Paulo"
    }).format(new Date(`${dateKey}T00:00:00`));
}

function disableButton(button, disabled, label) {
    button.disabled = disabled;
    button.textContent = label;
}

function getFriendlyError(error) {
    if (error?.code === "permission-denied") {
        return "Sem permissao para acessar o banco. Revise as regras do Firebase.";
    }

    if (error?.code === "unavailable") {
        return "O banco esta indisponivel no momento. Tente novamente.";
    }

    if (error?.message) {
        return error.message;
    }

    return "Nao foi possivel concluir a operacao.";
}
