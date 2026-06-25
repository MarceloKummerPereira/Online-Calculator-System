const calculatorService =
    require('../services/calculatorService');

async function calcular(
    request,
    reply
) {

    try {

        await calculatorService.verificarLimiteGratuito(
            request.usuario.id,
            request.usuario.tipo_usuario
        );

        const {
            expressao,
            numero1,
            numero2,
            operador
        } = request.body;

        if (expressao) {
            const resultado =
                calculatorService.calcularExpressao(
                    expressao
                );

            const historico =
                await calculatorService.salvarCalculo(
                    request.usuario.id,
                    expressao,
                    resultado
                );

            return reply.send({
                mensagem: 'Cálculo realizado',
                calculo: historico
            });
        }

        const n1 = Number(numero1);
        const n2 = Number(numero2);

        const resultado =
            calculatorService.calcularResultado(
                n1,
                n2,
                operador
            );

        let operacao;

        if (operador === 'sqrt') {
            operacao = `√(${n1})`;
        } else {
            operacao = `${n1} ${operador} ${n2}`;
        }

        const historico =
            await calculatorService.salvarCalculo(
                request.usuario.id,
                operacao,
                resultado
            );

        reply.send({
            mensagem: 'Cálculo realizado',
            calculo: historico
        });

    } catch (erro) {

        reply.code(400).send({
            erro: erro.message
        });
    }
}

module.exports = {
    calcular
};
