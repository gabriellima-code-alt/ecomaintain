// ============================================
// API DE AUTENTICAÇÃO
// ============================================

const { sql, initDB, corsHeaders } = require('./_db');
const bcrypt = require('bcryptjs');

module.exports = async (req, res) => {
  // Preflight CORS
  if (req.method === 'OPTIONS') {
    return res.status(200).setHeader('Access-Control-Allow-Origin', '*')
      .setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
      .setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
      .end();
  }

  const headers = corsHeaders();
  Object.entries(headers).forEach(([k, v]) => res.setHeader(k, v));

  try {
    await initDB();

    if (req.method === 'POST') {
      const { action, email, senha } = req.body;

      // LOGIN
      if (action === 'login') {
        if (!email || !senha) {
          return res.status(400).json({ erro: 'Email e senha são obrigatórios.' });
        }

        const usuarios = await sql`
          SELECT * FROM usuarios WHERE email = ${email}
        `;

        if (usuarios.length === 0) {
          return res.status(401).json({ erro: 'Usuário não encontrado. Verifique o email.' });
        }

        const usuario = usuarios[0];
        const senhaValida = await bcrypt.compare(senha, usuario.senha);

        if (!senhaValida) {
          return res.status(401).json({ erro: 'Senha incorreta!' });
        }

        // Retornar dados do usuário (sem a senha)
        return res.status(200).json({
          sucesso: true,
          usuario: {
            id: usuario.id,
            nome: usuario.nome,
            email: usuario.email,
            role: usuario.role,
            turnoInicio: usuario.turno_inicio,
            turnoFim: usuario.turno_fim,
            almocoInicio: usuario.almoco_inicio,
            almocoFim: usuario.almoco_fim
          }
        });
      }

      return res.status(400).json({ erro: 'Ação inválida.' });
    }

    return res.status(405).json({ erro: 'Método não permitido.' });

  } catch (error) {
    console.error('Erro na API de autenticação:', error);
    return res.status(500).json({ erro: 'Erro interno do servidor.', detalhe: error.message });
  }
};
