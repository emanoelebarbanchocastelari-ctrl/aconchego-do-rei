/* ---------------------------------------------------
   IMPORTS DO FIREBASE — funcionando no navegador
--------------------------------------------------- */
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-analytics.js";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

/* ---------------------------------------------------
   CONFIGURAÇÃO DO SEU FIREBASE
--------------------------------------------------- */
const firebaseConfig = {
  apiKey: "AIzaSyAboD4-CMUE8tyARA9MVvT5tOS1pBIRC0Y",
  authDomain: "aconchego-do-rei.firebaseapp.com",
  projectId: "aconchego-do-rei",
  storageBucket: "aconchego-do-rei.firebasestorage.app",
  messagingSenderId: "552480407298",
  appId: "1:552480407298:web:e2ab65809fc87608778c1b",
  measurementId: "G-QBFQWCB4KC"
};

/* ---------------------------------------------------
   INICIALIZAÇÃO DO FIREBASE
--------------------------------------------------- */
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);

/* ---------- LOGIN SIMPLES (proprietário) ---------- */
const ADMIN_USER = "admin";
const ADMIN_PASSWORD = "1299734-8237";

window.login = function () {
  const user = document.getElementById("login-user").value;
  const pass = document.getElementById("login-pass").value;

  if (user === ADMIN_USER && pass === ADMIN_PASSWORD) {
    alert("Login realizado com sucesso!");
    document.getElementById("login-area").style.display = "none";
    document.getElementById("admin-panel").style.display = "block";
  } else {
    alert("Usuário ou senha incorretos.");
  }
};

/* ---------- FUNÇÃO PARA SALVAR RESERVA ---------- */
window.salvarReserva = async function () {
  const nome = document.getElementById("nome").value;
  const telefone = document.getElementById("telefone").value;
  const data = document.getElementById("data").value;

  if (!nome || !telefone || !data) {
    alert("Preencha todos os campos!");
    return;
  }

  try {
    await addDoc(collection(db, "reservas"), {
      nome,
      telefone,
      data,
      status: "pendente"
    });

    alert("Reserva enviada! O proprietário irá confirmar.");
    document.getElementById("nome").value = "";
    document.getElementById("telefone").value = "";
    document.getElementById("data").value = "";
    document.getElementById("aviso-data").textContent = "";
    carregarDatasIndisponiveis(); // atualiza datas bloqueadas
  } catch (error) {
    console.error("Erro ao salvar no Firebase:", error);
    alert("Erro ao enviar reserva.");
  }
};

/* ---------- LISTAR DATAS RESERVADAS NO CALENDÁRIO ---------- */
async function carregarDatasIndisponiveis() {
  const snapshot = await getDocs(collection(db, "reservas"));
  const datas = [];

  snapshot.forEach((doc) => {
    datas.push(doc.data().data);
  });

  window.datasReservadas = datas; // salva globalmente
}

carregarDatasIndisponiveis();

/* ---------- MARCAR DATA INDISPONÍVEL NO CALENDÁRIO ---------- */
document.addEventListener("DOMContentLoaded", () => {
  const inputData = document.getElementById("data");
  const avisoData = document.getElementById("aviso-data");

  if (!inputData) return;

  // Bloqueia datas passadas
  const hoje = new Date().toISOString().split("T")[0];
  inputData.setAttribute("min", hoje);

  // Verifica datas já reservadas
  inputData.addEventListener("input", () => {
    if (window.datasReservadas.includes(inputData.value)) {
      avisoData.textContent = "❌ Esta data já está reservada!";
      inputData.value = "";
    } else {
      avisoData.textContent = "";
    }
  });
});








