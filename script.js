// CONFIG
const telProprietario = "5512997348237"; // WhatsApp corrigido

const ANO = 2026;
const DIARIA_PADRAO = 250;
const DIARIA_FERIADO_POR_PESSOA = 100;
const TAXA_LIMPEZA = 100;

const PERIODOS_PACOTE = [
    { start: "2026-02-14", end: "2026-02-18", label: "Carnaval" },
    { start: "2026-12-24", end: "2027-01-02", label: "Final do Ano" }
];

const FERiadosSP = [
    "2026-01-01","2026-02-16","2026-02-17","2026-04-03","2026-04-21",
    "2026-05-01","2026-09-07","2026-10-12","2026-11-02","2026-11-15","2026-12-25"
];

function parseYMD(s){ return new Date(s + "T00:00:00"); }
function ymd(d){
    return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0");
}
function dateInRange(d, a, b){
    const x = parseYMD(d);
    return x >= parseYMD(a) && x <= parseYMD(b);
}

let selectionStart = null;
let selectionEnd = null;

function gerarCalendario(){
    const container = document.getElementById("calendar");
    container.innerHTML = "";

    const meses = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];

    for(let m=0;m<12;m++){
        const box = document.createElement("div");
        box.className = "mes-box";

        const h = document.createElement("h3");
        h.textContent = `${meses[m]} ${ANO}`;
        box.appendChild(h);

        const days = document.createElement("div");
        days.className = "days";

        const qtdDias = new Date(ANO, m+1, 0).getDate();

        for(let d=1; d<=qtdDias; d++){
            const dataStr = `${ANO}-${String(m+1).padStart(2,"0")}-${String(d).padStart(2,"0")}`;
            const dt = new Date(dataStr+"T00:00:00");

            const weekday = dt.getDay();
            const isWeekend = weekday===0 || weekday===6;
            const isFeriado = FERiadosSP.includes(dataStr);
            const isPacote = PERIODOS_PACOTE.some(p => dateInRange(dataStr,p.start,p.end));

            const cell = document.createElement("div");
            cell.className = "dia";
            cell.dataset.date = dataStr;

            if(isPacote){
                cell.innerHTML = `${d}<small>R$ ${DIARIA_FERIADO_PESSOAp}/p</small>`;
            } else {
                cell.innerHTML = `${d}<small>R$ ${DIARIA_PADRAO}</small>`;
            }

            if(isFeriado) cell.classList.add("indisponivel");
            else if(isWeekend) cell.classList.add("fimdesemana");
            else cell.classList.add("disponivel");

            cell.onclick = () => selectDate(cell);

            days.appendChild(cell);
        }

        box.appendChild(days);
        container.appendChild(box);
    }
}

function selectDate(cell){
    if(cell.classList.contains("indisponivel")){
        alert("Data indisponível.");
        return;
    }

    const d = cell.dataset.date;

    if(!selectionStart || (selectionStart && selectionEnd)){
        clearSelection();
        selectionStart = d;
        cell.classList.add("selecionado");
        selectionEnd = null;
        document.getElementById("dataInicio").value = selectionStart;
        calcularValor();
        return;
    }

    if(d < selectionStart){
        alert("A data final não pode ser antes da inicial.");
        return;
    }

    selectionEnd = d;
    document.getElementById("dataFim").value = selectionEnd;
    markRange(selectionStart, selectionEnd);
    calcularValor();
}

function clearSelection(){
    document.querySelectorAll(".dia").forEach(c=>{
        c.classList.remove("selecionado","range");
    });
}

function markRange(a,b){
    document.querySelectorAll(".dia").forEach(c=>{
        let dt = c.dataset.date;
        if(dt===a || dt===b) c.classList.add("selecionado");
        else if(dt > a && dt < b) c.classList.add("range");
    });
}

function calcularValor(){
    const ini = document.getElementById("dataInicio").value;
    const fim = document.getElementById("dataFim").value;
    const pessoas = Number(document.getElementById("qtdPessoas").value);

    const rDias = document.getElementById("resumoDiarias");
    const rVal = document.getElementById("resumoValor");

    if(!ini || !fim){
        rDias.textContent = "Diárias selecionadas: —";
        rVal.textContent = "";
        return;
    }

    if(fim < ini){
        alert("Data final inválida!");
        return;
    }

    let total = 0;
    let count = 0;
    let detalhes = [];

    for(let d = parseYMD(ini); d <= parseYMD(fim); d.setDate(d.getDate()+1)){
        const ds = ymd(d);

        const isPacote = PERIODOS_PACOTE.some(p => dateInRange(ds,p.start,p.end));

        let valor = isPacote ? DIARIA_FERIADO_POR_PESSOA * pessoas : DIARIA_PADRAO;
        total += valor;

        detalhes.push(`${ds} → R$ ${valor}`);
        count++;
    }

    let totalFinal = total + TAXA_LIMPEZA;

    rDias.textContent = `Diárias selecionadas: ${count}`;
    rVal.innerHTML = `<b>Total: R$ ${totalFinal} (inclui limpeza de R$ ${TAXA_LIMPEZA})</b>`;

    return {totalFinal, total, count};
}

function enviarReserva(){
    const nome = localStorage.getItem("nome");
    const tele = localStorage.getItem("telefone");
    const ini = document.getElementById("dataInicio").value;
    const fim = document.getElementById("dataFim").value;
    const pessoas = document.getElementById("qtdPessoas").value;

    const calc = calcularValor();
    if(!calc) return;

    const msg = `
*Nova Reserva – Aconchego do Rei*

*Nome:* ${nome}
*Telefone:* ${tele}
*Período:* ${ini} até ${fim}
*Pessoas:* ${pessoas}

*Total com limpeza:* R$ ${calc.totalFinal}

Check-in: 14:00
Check-out: 12:00
    `;

    window.open(`https://wa.me/${telProprietario}?text=${encodeURIComponent(msg)}`);
}

// EVENTOS
document.getElementById("btn-login").onclick = ()=>{
    const n = document.getElementById("login-nome").value;
    const t = document.getElementById("login-tel").value;

    if(!n || !t){ alert("Preencha os dados."); return; }

    localStorage.setItem("nome",n);
    localStorage.setItem("telefone",t);

    document.getElementById("login-screen").classList.remove("active");
    document.getElementById("main-screen").classList.add("active");
};

document.getElementById("btn-fotos").onclick = ()=>{
    document.getElementById("main-screen").classList.remove("active");
    document.getElementById("galeria").classList.add("active");
};

document.getElementById("btn-voltar").onclick = ()=>{
    document.getElementById("galeria").classList.remove("active");
    document.getElementById("main-screen").classList.add("active");
};

document.getElementById("btn-calc").onclick = calcularValor;
document.getElementById("btn-enviar").onclick = enviarReserva;

gerarCalendario();










