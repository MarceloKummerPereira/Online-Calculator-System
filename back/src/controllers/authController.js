const authService =
    require('../services/authService');

async function cadastro(request, reply) {

    try {

        const {
            nome,
            email,
            senha,
            instituicao,
            escolaridade,
            endereco,
            tipo_usuario
        } = request.body;

        const usuario =
            await authService.cadastrarUsuario(
                nome,
                email,
                senha,
                instituicao,
                escolaridade,
                endereco,
                tipo_usuario
            );

        reply.send({
            mensagem: 'Usuário criado',
            usuario
        });

    } catch (erro) {

        reply.code(400).send({
            erro: erro.message
        });
    }
}

async function login(request, reply) {

    try {

        const {
            email,
            senha
        } = request.body;

        const resultado =
            await authService.loginUsuario(
                email,
                senha
            );

        reply.send(resultado);

    } catch (erro) {

        reply.code(401).send({
            erro: erro.message
        });
    }
}

module.exports = {
    cadastro,
    login
};
