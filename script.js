// CONFIGURAÇÕES
const telProprietario = "55" + "12" + "997348237"; // formato completo com DDI+DDD+numero
const ANO = 2026;
const DIARIA_PADRAO = 250; // R$ 250 por dia (seg-dom)
const DIARIA_FERIADO_POR_PESSOA = 100; // pacote R$100 por pessoa para carnaval e final de ano
const TAXA_LIMPEZA_FIXA = "media_diarias"; // regra: taxa fixa = média das diárias selecionadas

// períodos especiais (carnaval e final de ano) — ajustar se quiser intervalos diferentes
const PERIODOS_PACOTE = [
  // exemplo carnaval 2026: 2026-02-14 a 2026-02-18 (ajuste conforme calendário oficial)
  { start: "2026-02-14", end: "2026-02-18", label: "Carnaval" },
  // final de ano: 24/12 até 02/01 (inclui réveillon)
  { start: "2026-12-24", end: "2027-01-02", label: "Final de Ano" }
];

// feriados fixos SP adicionais (já usados para marcação)
const FERiadosSP = ["2026-01-01","2026-02-16","2026-02-17","2026-04-03","2026-04-21","2026-05-01",
  "2026-09-07","2026-10-12","2026-11-02","2026-11-15","2026-12-25"];

// --- util helpers
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

// --- estado da seleção
let selectionStart = null;
let selectionEnd = null;

// --- render do calendário
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
      const isFeriado = FERiadosSP.includes(dataStr);
      const inSpecialPeriod = PERIODOS_PACOTE.some(p => dateInRange(dataStr, p.start, p.end));

      const cell = document.createElement("div");
      cell.className = "dia";
      cell.dataset.date = dataStr;

      // preço e texto a exibir
      if(inSpecialPeriod){
        cell.dataset.priceType = "por_pessoa";
        cell.dataset.price = DIARIA_FERIADO_POR_PESSOA; // 100 por pessoa
        cell.innerHTML = `<div>${d}</div><small>R$ ${DIARIA_FERIADO_POR_PESSOA}/p</small>`;
      } else {
        // preço padrão por noite
        cell.dataset.priceType = "por_diaria";
        cell.dataset.price = DIARIA_PADRAO;
        cell.innerHTML = `<div>${d}</div><small>R$ ${DIARIA_PADRAO.toFixed(2)}</small>`;
      }

      // estilo
      if(isFeriado) cell.classList.add("indisponivel");
      else if(isWeekend) cell.classList.add("fimdesemana");
      else cell.classList.add("disponivel");

      // clique para seleção de intervalo
      cell.addEventListener("click", () => onClickDate(cell));

      daysContainer.appendChild(cell);
    }

    mesBox.appendChild(daysContainer);
    container.appendChild(mesBox);
  }
}

// clique em um dia: seleção por dois cliques (start, end). Se já houver start e end, reinicia.
function onClickDate(cell){
  // não permite selecionar dias indisponíveis
  if(cell.classList.contains("indisponivel")){
    alert("Data não disponível para reserva.");
    return;
  }

  // toggle lógica de seleção
  if(!selectionStart || (selectionStart && selectionEnd)){
    // iniciar nova seleção
    clearSelection();
    selectionStart = cell.dataset.date;
    cell.classList.add("selecionado");
    selectionEnd = null;
    updateInputsFromSelection();
    return;
  }

  // se tem apenas start, define end
  const candidate = cell.dataset.date;
  if(candidate < selectionStart){
    alert("A data final não pode ser anterior à inicial. Clique em uma data posterior.");
    return;
  }
  selectionEnd = candidate;

  // marcar range visualmente
  markRange(selectionStart, selectionEnd);
  updateInputsFromSelection();
}

function clearSelection(){
  document.querySelectorAll(".dia.selecionado").forEach(el => el.classList.remove("selecionado","range"));
  document.querySelectorAll(".dia.range").forEach(el => el.classList.remove("range"));
  selectionStart = null; selectionEnd = null;
}

// marca intervalo visual
function markRange(start, end){
  // limpar marcas
  document.querySelectorAll(".dia").forEach(el => el.classList.remove("selecionado","range"));
  // marcar start e end e intermediários
  document.querySelectorAll(".dia").forEach(el => {
    const d = el.dataset.date;
    if(!d) return;
    if(d === start || d === end){
      el.classList.add("selecionado");
    } else if (d > start && d < end){
      el.classList.add("range");
    }
  });
}

// atualiza inputs de data quando selecionar pelo calendário
function updateInputsFromSelection(){
  if(selectionStart) document.getElementById("dataInicio").value = selectionStart;
  if(selectionEnd) document.getElementById("dataFim").value = selectionEnd;
  // atualiza resumo automaticamente
  calcularValorTotal();
}

// --- cálculo do total (dia a dia, com pacote por pessoa nas datas especiais)
function calcularValorTotal(){
  const ini = document.getElementById("dataInicio").value;
  const fim = document.getElementById("dataFim").value;
  const pessoas = Number(document.getElementById("qtdPessoas").value) || 1;
  const resumoEl = document.getElementById("resumoValor");
  const resumoDias = document.getElementById("resumoDiarias");

  if(!ini || !fim){
    resumoEl.innerHTML = "<b>Total calculado: —</b>";
    resumoDias.textContent = "Diárias selecionadas: —";
    return null;
  }
  if(fim < ini){
    alert("A data final não pode ser anterior à inicial.");
    document.getElementById("dataFim").value = "";
    return null;
  }

  let totalDiarias = 0;
  let detalhes = [];
  let countDias = 0;

  for(let d = new Date(ini + "T00:00:00"); d <= new Date(fim + "T00:00:00"); d.setDate(d.getDate()+1)){
    const ds = ymd(d);
    const weekday = d.getDay();
    const isWeekend = weekday === 0 || weekday === 6;
    const isFeriado = FERiadosSP.includes(ds);
    const inSpecial = PERIODOS_PACOTE.some(p => dateInRange(ds, p.start, p.end));

    if(inSpecial){
      // pacote por pessoa
      const valor = DIARIA_FERIADO_POR_PESSOA * pessoas;
      totalDiarias += valor;
      detalhes.push({date: ds, desc: "Pacote (por pessoa)", valor});
    } else {
      const valor = DIARIA_PADRAO;
      totalDiarias += valor;
      detalhes.push({date: ds, desc: "Diária", valor});
    }
    countDias++;
  }

  // taxa de limpeza: regra solicitada = "no valor total da diaria"
  // implementei como média das diárias selecionadas (se preferir outra regra, me diga)
  const taxaLimpeza = (TAXA_LIMPEZA_FIXA === "media_diarias") ? Math.round((totalDiarias / Math.max(1, countDias))) : Number(TAXA_LIMPEZA_FIXA || 0);

  const totalFinal = totalDiarias + taxaLimpeza;

  // atualizar visual
  resumoDias.textContent = `Diárias selecionadas: ${countDias} (${detalhes.map(d=> `${d.date} → R$ ${d.valor.toFixed(2).replace(".",",")}`).join(", ")})`;
  resumoEl.innerHTML = `<b>Total calculado: R$ ${totalFinal.toFixed(2).replace(".",",")} (Diárias: R$ ${totalDiarias.toFixed(2).replace(".",",")} + Limpeza: R$ ${taxaLimpeza.toFixed(2).replace(".",",")})</b>`;

  return { detalhes, totalDiarias, taxaLimpeza, totalFinal, countDias };
}

// --- enviar mensagem para WhatsApp com detalhamento
function enviarReserva(){
  const nome = localStorage.getItem("nome");
  const tel = localStorage.getItem("telefone");
  const ini = document.getElementById("dataInicio").value;
  const fim = document.getElementById("dataFim").value;
  const pessoas = Number(document.getElementById("qtdPessoas").value) || 1;

  if(!nome || !tel){
    alert("Faça login antes de enviar a reserva.");
    return;
  }
  if(!ini || !fim || !pessoas){
    alert("Preencha data inicial, final e número de pessoas.");
    return;
  }
  const vals = calcularValorTotal();
  if(!vals) return;

  // montar texto detalhado
  let linhas = [];
  linhas.push("*Nova Reserva – Aconchego do Rei*");
  linhas.push("");
  linhas.push(`*Nome:* ${nome}`);
  linhas.push(`*Telefone:* ${tel}`);
  linhas.push(`*Período:* ${ini} até ${fim}`);
  linhas.push(`*Pessoas:* ${pessoas}`);
  linhas.push("");
  linhas.push("*Detalhamento das diárias:*");
  vals.detalhes.forEach(d=>{
    linhas.push(`${d.date} — ${d.desc} — R$ ${d.valor.toFixed(2).replace(".",",")}`);
  });
  linhas.push("");
  linhas.push(`*Valor das diárias:* R$ ${vals.totalDiarias.toFixed(2).replace(".",",")}`);
  linhas.push(`*Taxa de limpeza:* R$ ${vals.taxaLimpeza.toFixed(2).replace(".",",")}`);
  linhas.push(`*Total final:* R$ ${vals.totalFinal.toFixed(2).replace(".",",")}`);
  linhas.push("");
  linhas.push("Check-in: 14:00 | Check-out: 12:00");
  linhas.push("");
  linhas.push("Aguardando confirmação do proprietário.");

  const mensagem = encodeURIComponent(linhas.join("%0A"));
  const url = `https://wa.me/${telProprietario}?text=${mensagem}`;
  window.open(url, "_blank");
}

// --- navegação simples
document.getElementById("btn-login").addEventListener("click", ()=>{
  const nome = document.getElementById("login-nome").value;
  const tel = document.getElementById("login-tel").value;
  if(!nome||!tel){ alert("Informe nome e telefone"); return; }
  localStorage.setItem("nome", nome);
  localStorage.setItem("telefone", tel);
  document.getElementById("login-screen").classList.remove("active");
  document.getElementById("main-screen").classList.add("active");
});

document.getElementById("btn-fotos").addEventListener("click", ()=>{
  document.getElementById("main-screen").classList.remove("active");
  document.getElementById("galeria").classList.add("active");
});
document.getElementById("btn-voltar").addEventListener("click", ()=>{
  document.getElementById("galeria").classList.remove("active");
  document.getElementById("main-screen").classList.add("active");
});

document.getElementById("btn-calc").addEventListener("click", calcularValorTotal);
document.getElementById("btn-enviar").addEventListener("click", enviarReserva);

// atualizar quando usuário altera campos manualmente
document.getElementById("dataInicio").addEventListener("change", ()=>{
  // se selecionou dataInicio sem selectionStart, marque visualmente
  selectionStart = document.getElementById("dataInicio").value || null;
  if(selectionStart) markRange(selectionStart, selectionEnd || selectionStart);
  calcularValorTotal();
});
document.getElementById("dataFim").addEventListener("change", ()=>{
  selectionEnd = document.getElementById("dataFim").value || null;
  if(selectionStart && selectionEnd) markRange(selectionStart, selectionEnd);
  calcularValorTotal();
});
document.getElementById("qtdPessoas").addEventListener("change", calcularValorTotal);

// inicializa
gerarCalendario();





