const historyController =
    require('../controllers/historyController');

const authMiddleware =
    require('../middleware/authMiddleware');

async function historyRoutes(fastify) {

    fastify.get(
        '/historico',
        {
            preHandler: authMiddleware
        },
        historyController.listarHistorico
    );

    fastify.get(
        '/ranking-operacoes',
        {
            preHandler: authMiddleware
        },
        historyController.listarRankingOperacoes
    );
}

module.exports = historyRoutes;
