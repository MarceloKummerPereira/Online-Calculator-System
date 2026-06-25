const API = "http://localhost:3000";

async function login() {
    const email = document.getElementById("username").value;
    const senha = document.getElementById("password").value;

    try {
        const response = await fetch(`${API}/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                email,
                senha
            })
        });

        const data = await response.json();

        if (response.ok && data.token) {
            localStorage.setItem("token", data.token);

            alert("Login realizado com sucesso!");
            window.location.href = "index.html";
        } else {
            alert(data.erro || "Erro no login");
        }

    } catch (err) {
        console.log(err);
        alert("Erro ao conectar com servidor");
    }
}

async function register() {
    const nome = document.getElementById("registerUsername").value;
    const email = document.getElementById("registerEmail").value;
    const senha = document.getElementById("registerPassword").value;
    const instituicao = document.getElementById("registerInstituicao").value;
    const escolaridade = document.getElementById("registerEscolaridade").value;
    const endereco = document.getElementById("registerEndereco").value;
    const tipo_usuario = document.getElementById("registerTipo").value;

    try {
        const response = await fetch(`${API}/cadastro`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                nome,
                email,
                senha,
                instituicao,
                escolaridade,
                endereco,
                tipo_usuario
            })
        });

        const data = await response.json();

        if (response.ok) {
            alert("Usuário criado com sucesso!");
            window.location.href = "login.html";
        } else {
            alert(data.erro || "Erro ao cadastrar");
        }

    } catch (err) {
        console.log(err);
        alert("Erro ao conectar com servidor");
    }
}

async function calculate() {
    const expressao = document.getElementById("expression").value.trim();
    const numero1 = Number(document.getElementById("a").value);
    const numero2 = Number(document.getElementById("b").value);
    const operador = document.getElementById("operation").value;
    const token = localStorage.getItem("token");

    if (!token) {
        alert("Você precisa fazer login primeiro.");
        window.location.href = "login.html";
        return;
    }

    try {
        const body = expressao
            ? { expressao }
            : {
                numero1,
                numero2,
                operador
            };

        const response = await fetch(`${API}/calcular`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify(body)
        });

        const data = await response.json();

        if (response.ok) {
            document.getElementById("result").innerText =
                `Resultado: ${data.calculo.resultado}`;

            loadHistory();
            loadRanking();
        } else {
            alert(data.erro || "Erro ao calcular");
        }

    } catch (err) {
        console.log(err);
        alert("Erro ao conectar com servidor");
    }
}

async function loadHistory() {
    const token = localStorage.getItem("token");

    if (!token) {
        return;
    }

    try {
        const response = await fetch(`${API}/historico`, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        const data = await response.json();

        const history = document.getElementById("history");

        if (!history) {
            return;
        }

        history.innerHTML = "";

        if (!response.ok) {
            history.innerHTML = "<li>Erro ao carregar histórico.</li>";
            return;
        }

        data.historico.forEach(item => {
            const li = document.createElement("li");

            li.innerText =
                `${item.operacao} = ${item.resultado} (${new Date(item.criado_em).toLocaleString()})`;

            history.appendChild(li);
        });

    } catch (err) {
        console.log(err);
        alert("Erro ao carregar histórico");
    }
}

async function loadRanking() {
    const token = localStorage.getItem("token");

    if (!token) {
        return;
    }

    try {
        const response = await fetch(`${API}/ranking-operacoes`, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        const data = await response.json();

        const ranking = document.getElementById("ranking");

        if (!ranking) {
            return;
        }

        ranking.innerHTML = "";

        if (!response.ok) {
            ranking.innerHTML = "<li>Erro ao carregar ranking.</li>";
            return;
        }

        if (data.ranking.length === 0) {
            ranking.innerHTML = "<li>Nenhuma operacao realizada ainda.</li>";
            return;
        }

        data.ranking.forEach((item, index) => {
            const li = document.createElement("li");

            li.innerText =
                `${index + 1}. ${item.tipo_operacao}: ${item.total} vez(es)`;

            ranking.appendChild(li);
        });

    } catch (err) {
        console.log(err);
        alert("Erro ao carregar ranking");
    }
}

function toggleSecondInput() {

    const operation =
        document.getElementById('operation').value;

    const secondInput =
        document.getElementById(
            'secondInputContainer'
        );

    if (operation === 'sqrt') {

        secondInput.style.display = 'none';

    } else {

        secondInput.style.display = 'block';
    }
}

function logout() {
    localStorage.removeItem("token");
    window.location.href = "login.html";
}

document.addEventListener("DOMContentLoaded", () => {
    if (document.getElementById("history")) {
        loadHistory();
        loadRanking();
    }
});
