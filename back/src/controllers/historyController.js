const historyService =
    require('../services/historyService');

async function listarHistorico(
    request,
    reply
) {

    try {

        const historico =
            await historyService.buscarHistorico(
                request.usuario.id
            );

        reply.send({
            usuario: request.usuario.nome,
            historico
        });

    } catch (erro) {

        reply.code(500).send({
            erro: 'Erro ao buscar histórico'
        });
    }
}

async function listarRankingOperacoes(
    request,
    reply
) {

    try {

        const ranking =
            await historyService.buscarRankingOperacoes(
                request.usuario.id
            );

        reply.send({
            usuario: request.usuario.nome,
            ranking
        });

    } catch (erro) {

        reply.code(500).send({
            erro: 'Erro ao buscar ranking'
        });
    }
}

module.exports = {
    listarHistorico,
    listarRankingOperacoes
};
