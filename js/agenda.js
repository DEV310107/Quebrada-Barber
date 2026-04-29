// js/agenda.js

import { db } from "./conf.js";

import {
    collection,
    addDoc
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";

async function salvarAgendamento() {
    try {
        await addDoc(collection(db, "agendamentos"), {
            nome: "Mateus Ribeiro",
            telefone: "11999999999",
            servico: "Corte + Barba",
            barbeiro: "João",
            data: "10/04/2026",
            horario: "14:00",
            status: "pendente"
        });

        alert("Agendamento salvo com sucesso!");
        console.log("Agendamento salvo!");

    } catch (error) {
        console.error("Erro ao salvar:", error);
        alert("Erro ao salvar agendamento");
    }
}

window.salvarAgendamento = salvarAgendamento;