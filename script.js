document.addEventListener("DOMContentLoaded", () => {

    // ================================
    // LOGIN
    // ================================
    window.login = function () {
        const nome = document.getElementById("login-nome").value.trim();
        const tel = document.getElementById("login-tel").value.trim();

        if (!nome || !tel) {
            alert("Preencha nome e telefone para entrar.");
            return;
        }

        document.getElementById("login-screen").classList.remove("active");
        document.getElementById("main-screen").classList.add("active");
    };

    // ================================
    // GALERIA
    // ================================
    const btnFotos = document.getElementById("btn-fotos");
    const btnVoltar = document.getElementById("btn-voltar");

    btnFotos.addEventListener("click", () => {
        document.getElementById("main-screen").classList.remove("active");
        document.getElementById("galeria").classList.add("active");
    });

    btnVoltar.addEventListener("click", () => {
        document.getElementById("galeria").classList.remove("active");
        document.getElementById("main-screen").classList.add("active");
    });

    // ================================
    // CALENDÁRIO
    // ================================
    const calendario = document.getElementById("calendar");
    const diariaNormal = 250;
    const pacoteFeriadoPorPessoa = 100;
    const taxaLimpeza = 100;

    const feriadosEspeciais = [
        "2026-01-01",
        "2026-02-16",
        "2026-02-17",
        "2026-12-24",
        "2026-12-25",
        "2026-12-31"
    ];

    function gerarCalendario() {
        const ano = 2026;
        calendario.innerHTML = "";

        for (let mes = 0; mes < 12; mes++) {
            const primeiroDia = new Date(ano, mes, 1);
            const ultimoDia = new Date(ano, mes + 1, 0);

            const tituloMes = document.createElement("div");
            tituloMes.classList.add("mes-nome");
            tituloMes.textContent = primeiroDia.toLocaleString("pt-BR", { month: "long" }).toUpperCase();
            calendario.appendChild(tituloMes);

            for (let dia = 1; dia <= ultimoDia.getDate(); dia++) {
                const data = new Date(ano, mes, dia);
                const dataISO = data.toISOString().substring(0, 10);

                const cel = document.createElement("div");
                cel.classList.add("dia");

                // Fim de semana
                if (data.getDay() === 0 || data.getDay() === 6) {
                    cel.classList.add("fds");
                }

                // Feriados especiais
                if (feriadosEspeciais.includes(dataISO)) {
                    cel.classList.add("feriado");
                }

                cel.textContent = dia;

                cel.dataset.data = dataISO;

                cel.addEventListener("click", selecionarData);

                calendario.appendChild(cel);
            }
        }
    }

    let dataInicio = null;
    let dataFim = null;

    function selecionarData(e) {
        const dataSelecionada = e.target.dataset.data;

        // Se ainda não escolheu início
        if (!dataInicio) {
            dataInicio = dataSelecionada;
            document.getElementById("dataInicio").value = dataSelecionada;
            return;
        }

        // Se escolheu início e agora fim
        if (!dataFim) {
            if (dataSelecionada < dataInicio) {
                alert("A data final não pode ser antes da inicial.");
                return;
            }

            dataFim = dataSelecionada;
            document.getElementById("dataFim").value = dataSelecionada;
            return;
        }

        // Se clicou de novo, reinicia seleção
        dataInicio = dataSelecionada;
        dataFim = null;
        document.getElementById("dataInicio").value = dataSelecionada;
        document.getElementById("dataFim").value = "";
    }

    gerarCalendario();

    // ================================
    // CÁLCULO DE DIÁRIAS
    // ================================
    function calcularTotal() {
        const inicio = document.getElementById("dataInicio").value;
        const fim = document.getElementById("dataFim").value;
        const pessoas = parseInt(document.getElementById("qtdPessoas").value);

        if (!inicio || !fim) {
            alert("Selecione a data inicial e final.");
            return;
        }

        const d1 = new Date(inicio);
        const d2 = new Date(fim);

        let total = 0;
        let diarias = 0;

        for (let d = new Date(d1); d <= d2; d.setDate(d.getDate() + 1)) {
            const dataISO = d.toISOString().substring(0, 10);

            diarias++;

            // feriados especiais
            if (feriadosEspeciais.includes(dataISO)) {
                total += pessoas * pacoteFeriadoPorPessoa;
            } else {
                total += diariaNormal;
            }
        }

        total += taxaLimpeza;

        document.getElementById("resumoDiarias").textContent =
            `Diárias selecionadas: ${diarias}`;

        document.getElementById("resumoValor").innerHTML =
            `<b>Total calculado: R$ ${total.toFixed(2)}</b>`;
    }

    document.getElementById("btn-calc").addEventListener("click", calcularTotal);

});








