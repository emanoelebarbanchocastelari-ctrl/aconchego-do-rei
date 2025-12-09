const telProprietario = "12997348237";

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

function gerarCalendario() {
    const calendario = document.getElementById("calendar");
    const meses = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];

    const feriadosSP = [
        "2026-01-01","2026-02-16","2026-02-17","2026-04-03","2026-04-21","2026-05-01",
        "2026-09-07","2026-10-12","2026-11-02","2026-11-15","2026-12-25"
    ];

    for (let m = 0; m < 12; m++) {
        let mesDiv = document.createElement("div");
        mesDiv.className = "mes-box";

        mesDiv.innerHTML = `<h3>${meses[m]}</h3>`;
        let diasNoMes = new Date(2026, m + 1, 0).getDate();

        for (let d = 1; d <= diasNoMes; d++) {
            let data = `2026-${String(m+1).padStart(2,"0")}-${String(d).padStart(2,"0")}`;
            let diaSem = new Date(data).getDay();

            let fimDeSemana = diaSem === 0 || diaSem === 6;
            let feriado = feriadosSP.includes(data);

            let divDia = document.createElement("div");
            divDia.className = "dia disponivel";
            divDia.textContent = d;

            divDia.dataset.preco = (fimDeSemana || feriado) ? 200 : 150;

            mesDiv.appendChild(divDia);
        }

        calendario.appendChild(mesDiv);
    }
}

gerarCalendario();

function enviarReserva() {
    let nome = localStorage.getItem("nome");
    let tel = localStorage.getItem("telefone");
    let ini = document.getElementById("dataInicio").value;
    let fim = document.getElementById("dataFim").value;
    let pessoas = document.getElementById("qtdPessoas").value;

    if (!ini || !fim || !pessoas) { alert("Preencha tudo!"); return; }

    const mensagem =
        `*Nova Reserva – Aconchego do Rei*%0A%0A` +
        `*Nome:* ${nome}%0A` +
        `*Telefone:* ${tel}%0A` +
        `*Período:* ${ini} até ${fim}%0A` +
        `*Pessoas:* ${pessoas}`;

    window.open(`https://wa.me/55${telProprietario}?text=${mensagem}`);
}

