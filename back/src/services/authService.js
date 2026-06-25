const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const pool = require('../config/database');

async function cadastrarUsuario(
    nome,
    email,
    senha,
    instituicao,
    escolaridade,
    endereco,
    tipoUsuario
) {

    const senhaCriptografada =
        await bcrypt.hash(senha, 10);

    const resultado = await pool.query(
        `
        INSERT INTO usuarios
        (nome, email, senha, instituicao, escolaridade, endereco, tipo_usuario)

        VALUES ($1, $2, $3, $4, $5, $6, $7)

        RETURNING id, nome, email, tipo_usuario
        `,
        [
            nome,
            email,
            senhaCriptografada,
            instituicao || null,
            escolaridade || null,
            endereco || null,
            tipoUsuario || 'gratuito'
        ]
    );

    return resultado.rows[0];
}

async function loginUsuario(
    email,
    senha
) {

    const resultado = await pool.query(
        `
        SELECT * FROM usuarios
        WHERE email = $1
        `,
        [email]
    );

    const usuario = resultado.rows[0];

    if (!usuario) {
        throw new Error('Usuário inválido');
    }

    const senhaCorreta =
        await bcrypt.compare(
            senha,
            usuario.senha
        );

    if (!senhaCorreta) {
        throw new Error('Usuário inválido');
    }

    const token = jwt.sign(
        {
            id: usuario.id,
            nome: usuario.nome,
            email: usuario.email,
            tipo_usuario: usuario.tipo_usuario
        },
        process.env.JWT_SECRET,
        {
            expiresIn: '2h'
        }
    );

    return {
        token,
        usuario
    };
}

module.exports = {
    cadastrarUsuario,
    loginUsuario
};
