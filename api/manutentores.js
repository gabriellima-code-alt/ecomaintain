// ============================================
// API DE MANUTENTORES
// ============================================

const { sql, initDB, corsHeaders } = require('./_db');
const bcrypt = require('bcryptjs');

module.exports = async (req, res) => {
  if (req.method === 'OPTIONS') {
    return res.status(200)
      .setHeader('Access-Control-Allow-Origin', '*')
      .setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
      .setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
      .end();
  }

  const headers = corsHeaders();
  Object.entries(headers).forEach(([k, v]) => res.setHeader(k, v));

  try {
    await initDB();

    // GET - Listar todos os manutentores
    if (req.method === 'GET') {
      const manutentores = await sql`
        SELECT id, nome, email, role, turno_inicio, turno_fim, almoco_inicio, almoco_fim, data_cadastro
        FROM usuarios
        WHERE role = 'manutentor'
        ORDER BY nome
      `;

      return res.status(200).json(manutentores.map(m => ({
        id: m.id,
        nome: m.nome,
        email: m.email,
        role: m.role,
        turnoInicio: m.turno_inicio,
        turnoFim: m.turno_fim,
        almocoInicio: m.almoco_inicio,
        almocoFim: m.almoco_fim,
        dataCadastro: m.data_cadastro
      })));
    }

    // POST - Criar novo manutentor
    if (req.method === 'POST') {
      const { nome, email, senha, turnoInicio, turnoFim, almocoInicio, almocoFim } = req.body;

      if (!nome || !email || !senha) {
        return res.status(400).json({ erro: 'Nome, email e senha são obrigatórios.' });
      }

      // Verificar se email já existe
      const existente = await sql`SELECT id FROM usuarios WHERE email = ${email}`;
      if (existente.length > 0) {
        return res.status(409).json({ erro: 'Email já cadastrado.' });
      }

      const id = 'MAN_' + Date.now();
      const senhaHash = await bcrypt.hash(senha, 10);

      await sql`
        INSERT INTO usuarios (id, nome, email, senha, role, turno_inicio, turno_fim, almoco_inicio, almoco_fim)
        VALUES (${id}, ${nome}, ${email}, ${senhaHash}, 'manutentor',
                ${turnoInicio || null}, ${turnoFim || null},
                ${almocoInicio || null}, ${almocoFim || null})
      `;

      return res.status(201).json({
        sucesso: true,
        manutentor: { id, nome, email, role: 'manutentor', turnoInicio, turnoFim, almocoInicio, almocoFim }
      });
    }

    // DELETE - Remover manutentor
    if (req.method === 'DELETE') {
      const { id } = req.query;

      if (!id) {
        return res.status(400).json({ erro: 'ID do manutentor é obrigatório.' });
      }

      await sql`DELETE FROM usuarios WHERE id = ${id} AND role = 'manutentor'`;
      return res.status(200).json({ sucesso: true });
    }

    // PUT - Atualizar manutentor (incluindo senha do PCM)
    if (req.method === 'PUT') {
      const { id, nome, email, senha } = req.body;

      if (!id || !email) {
        return res.status(400).json({ erro: 'ID e email são obrigatórios.' });
      }

      if (senha && senha.length >= 4) {
        const senhaHash = await bcrypt.hash(senha, 10);
        await sql`
          UPDATE usuarios SET email = ${email}, senha = ${senhaHash}
          WHERE id = ${id}
        `;
      } else {
        await sql`
          UPDATE usuarios SET email = ${email}
          WHERE id = ${id}
        `;
      }

      return res.status(200).json({ sucesso: true });
    }

    return res.status(405).json({ erro: 'Método não permitido.' });

  } catch (error) {
    console.error('Erro na API de manutentores:', error);
    return res.status(500).json({ erro: 'Erro interno do servidor.', detalhe: error.message });
  }
};
