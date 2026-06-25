const pool = require('../config/database');

async function buscarHistorico(usuarioId) {

    const resultado = await pool.query(
        `
        SELECT
            id,
            operacao,
            resultado,
            criado_em

        FROM historico

        WHERE usuario_id = $1

        ORDER BY criado_em DESC
        `,
        [usuarioId]
    );

    return resultado.rows;
}

async function buscarRankingOperacoes(usuarioId) {

    const resultado = await pool.query(
        `
        SELECT
            tipo_operacao,
            SUM(total)::int AS total

        FROM (
            SELECT
                'Soma (+)' AS tipo_operacao,
                LENGTH(operacao) - LENGTH(REPLACE(operacao, '+', '')) AS total

            FROM historico

            WHERE usuario_id = $1

            UNION ALL

            SELECT
                'Subtracao (-)' AS tipo_operacao,
                LENGTH(operacao) - LENGTH(REPLACE(operacao, '-', '')) AS total

            FROM historico

            WHERE usuario_id = $1

            UNION ALL

            SELECT
                'Multiplicacao (*)' AS tipo_operacao,
                LENGTH(operacao) - LENGTH(REPLACE(operacao, '*', '')) AS total

            FROM historico

            WHERE usuario_id = $1

            UNION ALL

            SELECT
                'Divisao (/)' AS tipo_operacao,
                LENGTH(operacao) - LENGTH(REPLACE(operacao, '/', '')) AS total

            FROM historico

            WHERE usuario_id = $1

            UNION ALL

            SELECT
                'Potencia (^)' AS tipo_operacao,
                LENGTH(operacao) - LENGTH(REPLACE(operacao, '^', '')) AS total

            FROM historico

            WHERE usuario_id = $1

            UNION ALL

            SELECT
                'Raiz n-esima' AS tipo_operacao,
                CASE
                    WHEN operacao LIKE '% root %' THEN 1
                    ELSE 0
                END AS total

            FROM historico

            WHERE usuario_id = $1
        ) contagem

        GROUP BY tipo_operacao

        HAVING SUM(total) > 0

        ORDER BY
            total DESC,
            tipo_operacao ASC
        `,
        [usuarioId]
    );

    return resultado.rows;
}

module.exports = {
    buscarHistorico,
    buscarRankingOperacoes
};
