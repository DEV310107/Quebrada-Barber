// 🔥 IMPORTA DO FIREBASE
import { auth, provider } from "./firebase.js";
import { signInWithPopup } 
from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";

// ============================
// 🔐 LOGIN GOOGLE
// ============================

const btnLogin = document.getElementById("loginGoogle");
const userText = document.getElementById("user");

if (btnLogin) {
    btnLogin.onclick = async () => {
        try {
            const result = await signInWithPopup(auth, provider);
            const user = result.user;

            userText.innerText = `👤 ${user.displayName}`;
        } catch (erro) {
            console.error("Erro no login:", erro);
        }
    };
}

// ============================
// 📅 SISTEMA DE AGENDAMENTO
// ============================

document.addEventListener('DOMContentLoaded', function () {

    const calendarEl = document.getElementById('calendario');
    const horariosDiv = document.getElementById('horarios');
    const diaTexto = document.getElementById('diaSelecionado');
    const msgDiv = document.getElementById("mensagem");
    const msgTexto = document.getElementById("msg-texto");

    if (!calendarEl) return;

    const calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'dayGridMonth',
        locale: 'pt-br',

        validRange: {
            start: new Date().toISOString().split("T")[0]
        },

        dateClick: function(info) {
            let data = new Date(info.dateStr);
            let diaSemana = data.getDay();

            if (diaSemana === 1) {
                alert("Fechado às segundas!");
                return;
            }

            diaTexto.innerText = "Horários para: " + info.dateStr;
            gerarHorarios(info.dateStr);
        }
    });

    calendar.render();

    function gerarHorarios(data) {
        horariosDiv.innerHTML = "";

        let agendamentos = JSON.parse(localStorage.getItem("agendamentos")) || {};

        for (let hora = 7; hora <= 18; hora++) {

            let horario = hora + ":00";
            let btn = document.createElement("button");
            btn.innerText = horario;

            if (agendamentos[data] && agendamentos[data].includes(horario)) {
                btn.disabled = true;
                btn.style.background = "gray";
                btn.innerText += " (ocupado)";
            }

            btn.onclick = () => {

                if (!agendamentos[data]) {
                    agendamentos[data] = [];
                }

                agendamentos[data].push(horario);
                localStorage.setItem("agendamentos", JSON.stringify(agendamentos));

                let dataFormatada = new Date(data).toLocaleDateString("pt-BR");

                // 🔥 MENSAGEM VISUAL
                if (msgDiv && msgTexto) {
                    msgDiv.classList.add("show");
                    msgTexto.innerText = `✔️ Agendado para ${dataFormatada} às ${horario}`;

                    setTimeout(() => {
                        msgDiv.classList.remove("show");
                    }, 3000);
                }

                // 💬 WHATSAPP
                let mensagem = `💈 *QUEBRADA CUTS* 💈

Olá! 👋

Seu agendamento foi confirmado:

📅 *${dataFormatada}*
⏰ *${horario}*

Te esperamos! 🔥`;

                let numero = "55119411582335";

                let url = `https://wa.me/${numero}?text=${encodeURIComponent(mensagem)}`;

                setTimeout(() => {
                    window.open(url, "_blank");
                }, 1500);

                gerarHorarios(data);
            };

            horariosDiv.appendChild(btn);
        }
    }
});