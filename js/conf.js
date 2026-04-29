// 🔥 IMPORTA DO FIREBASE
import { auth, provider } from "./firebase.js";
import { signInWithPopup, onAuthStateChanged } 
from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";

// ============================
// 🔐 VERIFICAR AUTENTICAÇÃO
// ============================

onAuthStateChanged(auth, (user) => {
    const authBlockModal = document.getElementById('authBlockModal');
    const agendaContent = document.getElementById('agendaContent');
    const formAgendamento = document.getElementById('formAgendamento');
    const resumoSection = document.getElementById('resumoAgendamento');
    const agendaHeader = document.querySelector('.agenda-header');
    const voltarBtn = document.querySelector('.voltar');
    
    if (!user) {
        // Usuário não está logado - mostrar bloqueio
        if (authBlockModal) authBlockModal.style.display = 'flex';
        if (agendaContent) agendaContent.style.display = 'none';
        if (formAgendamento) formAgendamento.style.display = 'none';
        if (resumoSection) resumoSection.style.display = 'none';
        if (agendaHeader) agendaHeader.style.display = 'none';
        if (voltarBtn) voltarBtn.style.display = 'none';
    } else {
        // Usuário está logado - mostrar conteúdo
        if (authBlockModal) authBlockModal.style.display = 'none';
        if (agendaContent) agendaContent.style.display = 'block';
        if (formAgendamento) formAgendamento.style.display = 'block';
        if (resumoSection) resumoSection.style.display = 'block';
        if (agendaHeader) agendaHeader.style.display = 'block';
        if (voltarBtn) voltarBtn.style.display = 'inline-block';
    }
});

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
    const servicoSelect = document.getElementById("servico");
    const barbeiroSelect = document.getElementById("barbeiro");
    const modalOk = document.getElementById("modalOk");
    const resumoSection = document.getElementById("resumoAgendamento");
    const resumoDetalhes = document.getElementById("resumoDetalhes");
    const cancelarBtn = document.getElementById("cancelarAgendamento");
    const bookingModal = document.getElementById("bookingModal");
    const bookingNome = document.getElementById("bookingNome");
    const bookingTelefone = document.getElementById("bookingTelefone");
    const bookingConfirm = document.getElementById("bookingConfirm");
    const bookingCancel = document.getElementById("bookingCancel");

    if (!calendarEl) return;

    let currentUser = null;
    let selectedDate = null;
    let selectedTime = null;

    function showMessage(text) {
        if (!msgDiv || !msgTexto) return;
        msgTexto.innerText = text;
        msgDiv.classList.remove("hidden");
        msgDiv.classList.add("show");
    }

    function hideMessage() {
        if (!msgDiv) return;
        msgDiv.classList.add("hidden");
        msgDiv.classList.remove("show");
    }

    function showBookingModal(data, horario) {
        if (!bookingModal) return;
        selectedDate = data;
        selectedTime = horario;
        const perfil = getUserProfile();

        bookingNome.value = perfil?.nomeCompleto || "";
        bookingTelefone.value = perfil?.telefone || "";

        bookingModal.classList.remove("hidden");
        bookingModal.classList.add("show");
    }

    function hideBookingModal() {
        if (!bookingModal) return;
        bookingModal.classList.add("hidden");
        bookingModal.classList.remove("show");
    }

    function validarBookingFields() {
        const nome = bookingNome?.value.trim();
        const telefone = bookingTelefone?.value.trim();

        if (!nome) {
            showMessage("Por favor, informe seu nome completo para confirmar o agendamento.");
            return null;
        }
        if (!telefone) {
            showMessage("Por favor, informe seu telefone para confirmar o agendamento.");
            return null;
        }
        return { nome, telefone };
    }

    function validarServicoBarbeiro() {
        const servico = servicoSelect?.value;
        const barbeiro = barbeiroSelect?.value;

        if (!servico) {
            showMessage("Por favor, escolha um serviço antes de agendar.");
            return false;
        }
        if (!barbeiro) {
            showMessage("Por favor, escolha um barbeiro antes de agendar.");
            return false;
        }
        return true;
    }

    function getUserKey() {
        return currentUser?.uid || null;
    }

    function getBookingsByUser() {
        return JSON.parse(localStorage.getItem("agendamentosUsuario")) || {};
    }

    function getUserBooking() {
        const key = getUserKey();
        if (!key) return null;
        return getBookingsByUser()[key] || null;
    }

    function setUserBooking(booking) {
        const key = getUserKey();
        if (!key) return;
        const all = getBookingsByUser();
        all[key] = booking;
        localStorage.setItem("agendamentosUsuario", JSON.stringify(all));
    }

    function removeUserBooking() {
        const key = getUserKey();
        if (!key) return false;
        const all = getBookingsByUser();
        if (!all[key]) return false;
        delete all[key];
        localStorage.setItem("agendamentosUsuario", JSON.stringify(all));
        return true;
    }

    function getUserProfiles() {
        return JSON.parse(localStorage.getItem("perfisUsuario") || "{}");
    }

    function getUserProfile() {
        const key = getUserKey();
        if (!key) return null;
        return getUserProfiles()[key] || null;
    }

    function setUserProfile(profile) {
        const key = getUserKey();
        if (!key || !profile) return;
        const all = getUserProfiles();
        all[key] = profile;
        localStorage.setItem("perfisUsuario", JSON.stringify(all));
    }

    function atualizarResumo() {
        const agendamento = getUserBooking();
        if (!resumoSection || !resumoDetalhes) return;

        if (!agendamento) {
            resumoSection.classList.add("hidden");
            return;
        }

        resumoDetalhes.innerText = `Nome: ${agendamento.nome}\nTelefone: ${agendamento.telefone}\nServiço: ${agendamento.servico}\nBarbeiro: ${agendamento.barbeiro}\nData: ${agendamento.data}\nHorário: ${agendamento.horario}`;
        resumoSection.classList.remove("hidden");
    }

    function carregarUsuario() {
        onAuthStateChanged(auth, (user) => {
            currentUser = user;
            atualizarResumo();
        });
    }

    if (modalOk) {
        modalOk.onclick = hideMessage;
    }

    if (msgDiv) {
        msgDiv.onclick = (event) => {
            if (event.target === msgDiv) {
                hideMessage();
            }
        };
    }

    if (bookingCancel) {
        bookingCancel.onclick = hideBookingModal;
    }

    if (bookingConfirm) {
        bookingConfirm.onclick = () => {
            const info = validarBookingFields();
            if (!info) return;
            if (!selectedDate || !selectedTime) {
                showMessage("Selecione um horário antes de confirmar.");
                return;
            }
            if (!validarServicoBarbeiro()) return;
            if (!currentUser) {
                showMessage("Você precisa estar logado para agendar. Faça login ou crie conta primeiro.");
                hideBookingModal();
                return;
            }

            setUserProfile({
                nomeCompleto: info.nome,
                telefone: info.telefone,
                email: getUserProfile()?.email || ""
            });

            agendarHorario(selectedDate, selectedTime, info.nome, info.telefone);
            hideBookingModal();
        };
    }

    if (cancelarBtn) {
        cancelarBtn.onclick = () => {
            const booking = getUserBooking();
            if (!booking) {
                showMessage("Nenhum agendamento ativo para cancelar.");
                return;
            }

            const data = booking.data;
            const horario = booking.horario;
            const agendamentos = JSON.parse(localStorage.getItem("agendamentos")) || {};
            if (agendamentos[data]) {
                agendamentos[data] = agendamentos[data].filter((item) => item !== horario);
                if (agendamentos[data].length === 0) {
                    delete agendamentos[data];
                }
                localStorage.setItem("agendamentos", JSON.stringify(agendamentos));
            }

            removeUserBooking();
            atualizarResumo();

            showMessage(`⚠️ Agendamento cancelado. Uma mensagem de cancelamento está sendo enviada pelo WhatsApp.`);

            const mensagem = `💈 *QUEBRADA CUTS* 💈\n\nOlá! Estou cancelando o meu agendamento:\n\nNome: ${booking.nome}\nTelefone: ${booking.telefone}\nServiço: ${booking.servico}\nBarbeiro: ${booking.barbeiro}\nData: ${booking.data}\nHorário: ${booking.horario}\n\nPor favor, confirme o cancelamento.`;
            const numero = "55119411582335";
            const url = `https://wa.me/${numero}?text=${encodeURIComponent(mensagem)}`;
            window.open(url, "_blank");
        };
    }

    carregarUsuario();

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
                showMessage("Fechado às segundas! Por favor, selecione outro dia.");
                return;
            }

            diaTexto.innerText = "Horários para: " + info.dateStr;
            gerarHorarios(info.dateStr);
        }
    });

    calendar.render();

    function agendarHorario(data, horario, nome, telefone) {
        if (!validarServicoBarbeiro()) return;

        const agendamentos = JSON.parse(localStorage.getItem("agendamentos") || "{}");
        if (!agendamentos[data]) {
            agendamentos[data] = [];
        }
        agendamentos[data].push(horario);
        localStorage.setItem("agendamentos", JSON.stringify(agendamentos));

        const dataFormatada = new Date(data).toLocaleDateString("pt-BR");
        const servico = servicoSelect?.value || "Serviço não definido";
        const barbeiro = barbeiroSelect?.value || "Barbeiro não definido";

        const booking = {
            nome,
            telefone,
            servico,
            barbeiro,
            data: dataFormatada,
            horario,
            timestamp: new Date().toISOString()
        };
        setUserBooking(booking);
        atualizarResumo();

        showMessage(`✔️ Agendado com sucesso!\n\nData: ${dataFormatada}\nHorário: ${horario}\nServiço: ${servico}\nBarbeiro: ${barbeiro}`);

        setTimeout(hideMessage, 4000);

        const mensagem = `💈 *QUEBRADA CUTS* 💈\n\nOlá! 👋\n\nSeu agendamento foi confirmado:\n\n📅 *${dataFormatada}*\n⏰ *${horario}*\n💇 *${servico}*\n👨‍🦱 *${barbeiro}*\n\nTe esperamos! 🔥`;
        const numero = "55119411582335";
        const url = `https://wa.me/${numero}?text=${encodeURIComponent(mensagem)}`;
        setTimeout(() => {
            window.open(url, "_blank");
        }, 1500);

        gerarHorarios(data);
    }

    function gerarHorarios(data) {
        horariosDiv.innerHTML = "";

        let agendamentos = JSON.parse(localStorage.getItem("agendamentos")) || {};
        const agendamentoDoUsuario = getUserBooking();
        const hoje = new Date();
        const dataSelecionada = new Date(data);
        const mesmoDia = hoje.toDateString() === dataSelecionada.toDateString();

        for (let hora = 7; hora <= 18; hora++) {
            let horario = hora + ":00";
            let btn = document.createElement("button");
            btn.innerText = horario;

            const estaOcupado = agendamentos[data] && agendamentos[data].includes(horario);
            const passou = mesmoDia && hora <= hoje.getHours();

            if (estaOcupado || passou) {
                btn.disabled = true;
                btn.style.background = "gray";
                btn.innerText += estaOcupado ? " (ocupado)" : " (passado)";
            }

            btn.onclick = () => {
                if (agendamentoDoUsuario) {
                    showMessage(`Você já tem um agendamento em ${agendamentoDoUsuario.data} às ${agendamentoDoUsuario.horario}. Cancela-o antes de agendar outro.`);
                    return;
                }

                if (!currentUser) {
                    showMessage("Você precisa estar logado para agendar. Faça login ou crie conta primeiro.");
                    return;
                }

                if (!validarServicoBarbeiro()) return;

                const perfil = getUserProfile();
                if (perfil?.nomeCompleto && perfil?.telefone) {
                    agendarHorario(data, horario, perfil.nomeCompleto, perfil.telefone);
                } else {
                    showBookingModal(data, horario);
                }
            };

            horariosDiv.appendChild(btn);
        }
    }
});