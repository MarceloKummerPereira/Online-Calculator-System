const pool = require('../config/database');

function criarParser(expressao) {

    let indice = 0;

    function caractereAtual() {
        return expressao[indice];
    }

    function pularEspacos() {
        while (/\s/.test(caractereAtual())) {
            indice += 1;
        }
    }

    function consumir(caractere) {
        pularEspacos();

        if (caractereAtual() === caractere) {
            indice += 1;
            return true;
        }

        return false;
    }

    function numero() {
        pularEspacos();

        const inicio = indice;

        while (/[0-9.]/.test(caractereAtual())) {
            indice += 1;
        }

        if (inicio === indice) {
            throw new Error('Numero esperado');
        }

        const valor =
            Number(expressao.slice(inicio, indice));

        if (Number.isNaN(valor)) {
            throw new Error('Numero invalido');
        }

        return valor;
    }

    function fator() {
        pularEspacos();

        if (consumir('+')) {
            return fator();
        }

        if (consumir('-')) {
            return -fator();
        }

        if (consumir('(')) {
            const valor = somaSubtracao();

            if (!consumir(')')) {
                throw new Error('Parentese nao fechado');
            }

            return valor;
        }

        return numero();
    }

    function potencia() {
        let resultado = fator();

        if (consumir('^')) {
            resultado = Math.pow(
                resultado,
                potencia()
            );
        }

        return resultado;
    }

    function multiplicacaoDivisao() {
        let resultado = potencia();

        while (true) {
            if (consumir('*')) {
                resultado *= potencia();
            } else if (consumir('/')) {
                const divisor = potencia();

                if (divisor === 0) {
                    throw new Error('Divisao por zero');
                }

                resultado /= divisor;
            } else {
                return resultado;
            }
        }
    }

    function somaSubtracao() {
        let resultado = multiplicacaoDivisao();

        while (true) {
            if (consumir('+')) {
                resultado += multiplicacaoDivisao();
            } else if (consumir('-')) {
                resultado -= multiplicacaoDivisao();
            } else {
                return resultado;
            }
        }
    }

    return {
        calcular() {
            const resultado = somaSubtracao();

            pularEspacos();

            if (indice < expressao.length) {
                throw new Error('Expressao invalida');
            }

            return resultado;
        }
    };
}

function calcularExpressao(expressao) {

    if (
        typeof expressao !== 'string' ||
        expressao.trim() === ''
    ) {
        throw new Error('Expressao nao enviada');
    }

    const caracteresPermitidos =
        /^[0-9+\-*/^().\s]+$/;

    if (!caracteresPermitidos.test(expressao)) {
        throw new Error('Expressao contem caracteres invalidos');
    }

    const resultado =
        criarParser(expressao).calcular();

    if (!Number.isFinite(resultado)) {
        throw new Error('Resultado invalido');
    }

    return resultado;
}

function calcularResultado(
    numero1,
    numero2,
    operador
) {

    switch (operador) {

    case '+':
        return numero1 + numero2;

    case '-':
        return numero1 - numero2;

    case '*':
        return numero1 * numero2;

    case '/':

        if (numero2 === 0) {
            throw new Error(
                'Divisão por zero'
            );
        }
        return numero1 / numero2;
        
    case '^':
        return Math.pow(numero1, numero2);

    case 'sqrt':

        if (numero1 < 0) {
            throw new Error(
                'Raiz de número negativo'
            );
        }

        return Math.sqrt(numero1);
    
    case "root":
        if (numero2 === 0) {
            throw new Error(
                'Índice da raiz não pode ser zero'
            );
        }
        if (!Number.isInteger(numero2)) {
            throw new Error(
                'Indice da raiz deve ser inteiro'
            );
        }

        if (numero1 < 0 && numero2 % 2 === 0) {
            throw new Error(
                'Raiz de número negativo'
            );
        }
        if (numero1 < 0) {
            return -Math.pow(Math.abs(numero1), 1 / numero2);
        }
        return Math.pow(numero1, 1 / numero2);


    default:

        throw new Error(
            'Operador inválido'
        );
}
}

async function verificarLimiteGratuito(usuarioId, tipoUsuario) {

    if (tipoUsuario === 'pago') {
        return;
    }

    const resultado = await pool.query(
        `SELECT COUNT(*) AS total FROM historico WHERE usuario_id = $1`,
        [usuarioId]
    );

    const total = parseInt(resultado.rows[0].total);

    if (total >= 10) {
        throw new Error(
            'Limite de 10 cálculos atingido. Faça upgrade para conta paga.'
        );
    }
}

async function salvarCalculo(
    usuarioId,
    operacao,
    resultado
) {

    const historico = await pool.query(
        `
        INSERT INTO historico
        (
            usuario_id,
            operacao,
            resultado
        )

        VALUES ($1, $2, $3)

        RETURNING
            id,
            operacao,
            resultado,
            criado_em
        `,
        [
            usuarioId,
            operacao,
            resultado
        ]
    );

    return historico.rows[0];
}

module.exports = {
    calcularExpressao,
    calcularResultado,
    salvarCalculo,
    verificarLimiteGratuito
};
