const telProprietario = "1297348237";

function login() {
    const nome = document.getElementById("login-nome").value;
    const tel = document.getElementById("login-tel").value;

    if (!nome || !tel) { alert("Preencha nome e telefone!"); return; }

    localStorage.setItem("nome", nome);
    localStorage.setItem("telefone", tel);

    document.getElementById("login-screen").classList.remove("active");
    document.getElementById("main-screen").classList.add("active");
}

function abrirFotos() {
    document.getElementById("main-screen").classList.remove("active");
    document.getElementById("galeria").classList.add("active");
}
function voltarTela() {
    document.getElementById("galeria").classList.remove("active");
    document.getElementById("main-screen").classList.add("active");
}



// ----------------- CALENDÁRIO ---------------------

function gerarCalendario() {
    const calendario = document.getElementById("calendar");
    const meses = ["Janeiro","Fevereiro","Março","Abril","Maio","Junho",
                   "Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"];

    const feriadosSP = [
        "2026-01-01","2026-02-16","2026-02-17","2026-04-03","2026-04-21",
        "2026-05-01","2026-09-07","2026-10-12","2026-11-02","2026-11-15","2026-12-25"
    ];

    for (let m = 0; m < 12; m++) {
        let box = document.createElement("div");
        box.className = "mes-box";
        box.innerHTML = `<h3>${meses[m]}</h3>`;

        let dias = new Date(2026, m + 1, 0).getDate();

        for (let d = 1; d <= dias; d++) {
            let data = `2026-${String(m+1).padStart(2,"0")}-${String(d).padStart(2,"0")}`;
            let diaSemana = new Date(data).getDay();
            let éFeriado = feriadosSP.includes(data);

            let div = document.createElement("div");
            div.className = "dia";

            let fimDeSemana = (diaSemana === 0 || diaSemana === 6);

            if (éFeriado) div.classList.add("indisponivel");
            else if (fimDeSemana) div.classList.add("fimdesemana");
            else div.classList.add("disponivel");

            div.dataset.preco = fimDeSemana || éFeriado ? 200 : 150;
            div.textContent = d;

            box.appendChild(div);
        }

        calendario.appendChild(box);
    }
}

gerarCalendario();


// ----------- CÁLCULO DO VALOR --------------------

function calcularValorTotal() {
    const ini = document.getElementById("dataInicio").value;
    const fim = document.getElementById("dataFim").value;
    const isento = document.getElementById("isentoLimpeza").checked;

    if (!ini || !fim) {
        document.getElementById("resumoValor").textContent = "Total calculado: —";
        return;
    }

    if (fim < ini) {
        alert("A data final não pode ser antes da inicial!");
        document.getElementById("dataFim").value = "";
        return;
    }

    let total = 0;
    let dataInicio = new Date(ini);
    let dataFim = new Date(fim);

    const feriados = [
        "2026-01-01","2026-02-16","2026-02-17","2026-04-03","2026-04-21",
        "2026-05-01","2026-09-07","2026-10-12","2026-11-02","2026-11-15","2026-12-25"
    ];

    for (let d = new Date(dataInicio); d <= dataFim; d.setDate(d.getDate() + 1)) {
        const ano = d.getFullYear();
        const mes = String(d.getMonth() + 1).padStart(2, "0");
        const dia = String(d.getDate()).padStart(2, "0");
        const dataStr = `${ano}-${mes}-${dia}`;

        const diaSemana = d.getDay();
        const fimDeSemana = diaSemana === 0 || diaSemana === 6;
        const feriado = feriados.includes(dataStr);

        total += (fimDeSemana || feriado) ? 200 : 150;
    }

    let limpeza = isento ? 0 : 100;
    let final = total + limpeza;

    document.getElementById("resumoValor").textContent =
        `Total calculado: R$ ${final.toFixed(2).replace(".", ",")}`;

    return { total, limpeza, final };
}

document.getElementById("dataInicio").addEventListener("change", calcularValorTotal);
document.getElementById("dataFim").addEventListener("change", calcularValorTotal);
document.getElementById("isentoLimpeza").addEventListener("change", calcularValorTotal);


// ----------- ENVIO AO WHATSAPP --------------------

function enviarReserva() {
    let nome = localStorage.getItem("nome");
    let tel = localStorage.getItem("telefone");
    let ini = document.getElementById("dataInicio").value;
    let fim = document.getElementById("dataFim").value;
    let pessoas = document.getElementById("qtdPessoas").value;
    let isento = document.getElementById("isentoLimpeza").checked;

    if (!ini || !fim || !pessoas) {
        alert("Preencha todos os campos!");
        return;
    }

    let valores = calcularValorTotal();

    const msg =
        `*Nova Reserva – Aconchego do Rei*%0A%0A` +
        `*Nome:* ${nome}%0A` +
        `*Telefone:* ${tel}%0A` +
        `*Período:* ${ini} até ${fim}%0A` +
        `*Pessoas:* ${pessoas}%0A%0A` +
        `*Valor das diárias:* R$ ${valores.total.toFixed(2).replace(".", ",")}%0A` +
        `*Taxa de limpeza:* ${isento ? "ISENTA" : "R$ 100,00"}%0A` +
        `*Total final:* R$ ${valores.final.toFixed(2).replace(".", ",")}`;

    window.open(`https://wa.me/55${telProprietario}?text=${msg}`);
}



