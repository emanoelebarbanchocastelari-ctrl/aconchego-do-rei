// CONFIGURAÇÕES
const telProprietario = "5512997348237";
const ANO = 2026;

const DIARIA_PADRAO = 250;
const DIARIA_FERIADO_POR_PESSOA = 100;
const TAXA_LIMPEZA_FIXA = "media_diarias";

// períodos especiais
const PERIODOS_PACOTE = [
  { start: "2026-02-14", end: "2026-02-18", label: "Carnaval" },
  { start: "2026-12-24", end: "2027-01-02", label: "Final de Ano" }
];

// feriados SP
const FERIADOS = [
  "2026-01-01","2026-02-16","2026-02-17","2026-04-03","2026-04-21","2026-05-01",
  "2026-09-07","2026-10-12","2026-11-02","2026-11-15","2026-12-25"
];

function parseYMD(s){ return new Date(s + "T00:00:00"); }
function ymd(date){
  const y = date.getFullYear();
  const m = String(date.getMonth()+1).padStart(2,"0");
  const d = String(date.getDate()).padStart(2,"0");
  return `${y}-${m}-${d}`;
}
function dateInRange(d, start, end){
  const dd = parseYMD(d);
  return dd >= parseYMD(start) && dd <= parseYMD(end);
}

let selectionStart = null;
let selectionEnd = null;

// LOGIN
function login() {
  const nome = document.getElementById("login-nome").value;
  const tel = document.getElementById("login-tel").value;

  if (!nome || !tel) {
    alert("Preencha nome e telefone!");
    return;
  }

  localStorage.setItem("nome", nome);
  localStorage.setItem("telefone", tel);

  document.getElementById("login-screen").classList.remove("active");
  document.getElementById("main-screen").classList.add("active");
}

// GERAR CALENDÁRIO
function gerarCalendario(){
  const container = document.getElementById("calendar");
  container.innerHTML = "";

  const meses = ["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"];

  for(let m=0;m<12;m++){
    const mesBox = document.createElement("div");
    mesBox.className = "mes-box";

    const titulo = document.createElement("h3");
    titulo.textContent = `${meses[m]} ${ANO}`;
    mesBox.appendChild(titulo);

    const diasNoMes = new Date(ANO, m+1, 0).getDate();
    const daysContainer = document.createElement("div");
    daysContainer.className = "days";

    for(let d=1; d<=diasNoMes; d++){
      const dataStr = `${ANO}-${String(m+1).padStart(2,"0")}-${String(d).padStart(2,"0")}`;
      const dateObj = new Date(dataStr + "T00:00:00");

      const weekday = dateObj.getDay();
      const isWeekend = weekday === 0 || weekday === 6;
      const isFeriado = FERIADOS.includes(dataStr);
      const inSpecialPeriod = PERIODOS_PACOTE.some(p => dateInRange(dataStr, p.start, p.end));

      const cell = document.createElement("div");
      cell.className = "dia";
      cell.dataset.date = dataStr;

      if(inSpecialPeriod){
        cell.dataset.priceType = "por_pessoa";
        cell.dataset.price = DIARIA_FERIADO_POR_PESSOA;
        cell.innerHTML = `<div>${d}</div><small>R$ ${DIARIA_FERIADO_POR_PESSOA}/p</small>`;
      } else {
        cell.dataset.priceType = "por_diaria";
        cell.dataset.price = DIARIA_PADRAO;
        cell.innerHTML = `<div>${d}</div><small>R$ ${DIARIA_PADRAO}</small>`;
      }

      if(isFeriado){
        cell.classList.add("indisponivel");
      } else if(isWeekend){
        cell.classList.add("fimdesemana");
      } else {
        cell.classList.add("disponivel");
      }

      cell.addEventListener("click", () => onClickDate(cell));
      daysContainer.appendChild(cell);
    }

    mesBox.appendChild(daysContainer);
    container.appendChild(mesBox);
  }
}

function clearSelection(){
  document.querySelectorAll(".dia").forEach(el => {
    el.classList.remove("selecionado","range");
  });
  selectionStart = null;
  selectionEnd = null;
}

function onClickDate(cell){
  if(cell.classList.contains("indisponivel")){
    alert("Esta data não está disponível.");
    return;
  }

  const date = cell.dataset.date;

  if(!selectionStart || (selectionStart && selectionEnd)){
    clearSelection();
    selectionStart = date;
    cell.classList.add("selecionado");
    updateInputsFromSelection();
    return;
  }

  if(date < selectionStart){
    alert("A data final não pode ser anterior à inicial.");
    return;
  }

  selectionEnd = date;
  marcarIntervalo();
  updateInputsFromSelection();
}

function marcarIntervalo(){
  document.querySelectorAll(".dia").forEach(el => {
    el.classList.remove("selecionado","range");
    const d = el.dataset.date;
    if(!d) return;

    if(d === selectionStart || d === selectionEnd){
      el.classList.add("selecionado");
    } else if (d > selectionStart && d < selectionEnd){
      el.classList.add("range");
    }
  });
}

function updateInputsFromSelection(){
  if(selectionStart) document.getElementById("dataInicio").value = selectionStart;
  if(selectionEnd) document.getElementById("dataFim").value = selectionEnd;
  calcularValorTotal();
}

// CALCULAR TOTAL
function calcularValorTotal(){
  const ini = document.getElementById("dataInicio").value;
  const fim = document.getElementById("dataFim").value;
  const pessoas = Number(document.getElementById("qtdPessoas").value) || 1;

  if(!ini || !fim) return;

  if(fim < ini){
    alert("A data final não pode ser anterior à inicial.");
    return;
  }

  let total = 0;
  let dias = 0;

  for(let d = new Date(ini + "T00:00:00"); d <= new Date(fim + "T00:00:00"); d.setDate(d.getDate()+1)){
    const data = ymd(d);
    const inSpecial = PERIODOS_PACOTE.some(p => dateInRange(data, p.start, p.end));

    if(inSpecial){
      total += DIARIA_FERIADO_POR_PESSOA * pessoas;
    } else {
      total += DIARIA_PADRAO;
    }
    dias++;
  }

  const taxaLimpeza = Math.round(total / dias);
  const totalFinal = total + taxaLimpeza;

  document.getElementById("resumoDiarias").textContent =
    `Diárias selecionadas: ${dias}`;

  document.getElementById("resumoValor").innerHTML =
    `<b>Total calculado: R$ ${totalFinal.toFixed(2).replace(".", ",")}</b>`;
}

// ENVIAR WHATSAPP
function enviarReserva(){
  const nome = localStorage.getItem("nome");
  const tel = localStorage.getItem("telefone");

  const ini = document.getElementById("dataInicio").value;
  const fim = document.getElementById("dataFim").value;
  const pessoas = document.getElementById("qtdPessoas").value;

  if(!ini || !fim){
    alert("Selecione as datas.");
    return;
  }

  const msg =
    `*Reserva — Aconchego do Rei*%0A%0A` +
    `*Nome:* ${nome}%0A` +
    `*Telefone:* ${tel}%0A` +
    `*Período:* ${ini} até ${fim}%0A` +
    `*Pessoas:* ${pessoas}%0A%0A` +
    `Enviado pelo sistema de reservas.`;

  window.open(`https://wa.me/${telProprietario}?text=${msg}`, "_blank");
}

// GALERIA
document.getElementById("btn-fotos").addEventListener("click", ()=>{
  document.getElementById("main-screen").classList.remove("active");
  document.getElementById("galeria").classList.add("active");
});
document.getElementById("btn-voltar").addEventListener("click", ()=>{
  document.getElementById("galeria").classList.remove("active");
  document.getElementById("main-screen").classList.add("active");
});

// INICIALIZA
gerarCalendario();







