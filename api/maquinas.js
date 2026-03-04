// ============================================
// API DE MÁQUINAS
// ============================================

const { sql, initDB, corsHeaders } = require('./_db');

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

    // GET - Listar todas as máquinas
    if (req.method === 'GET') {
      const maquinas = await sql`
        SELECT * FROM maquinas ORDER BY nome
      `;
      return res.status(200).json(maquinas.map(m => ({
        id: m.id,
        nome: m.nome,
        especificacoes: m.especificacoes,
        historico: m.historico,
        dataCadastro: m.data_cadastro
      })));
    }

    // POST - Cadastrar nova máquina
    if (req.method === 'POST') {
      const { id, nome, especificacoes, historico } = req.body;

      if (!id || !nome) {
        return res.status(400).json({ erro: 'ID e nome são obrigatórios.' });
      }

      // Verificar se ID já existe
      const existente = await sql`SELECT id FROM maquinas WHERE id = ${id}`;
      if (existente.length > 0) {
        return res.status(409).json({ erro: 'ID da máquina já cadastrado.' });
      }

      await sql`
        INSERT INTO maquinas (id, nome, especificacoes, historico)
        VALUES (${id}, ${nome}, ${especificacoes || ''}, ${historico || ''})
      `;

      return res.status(201).json({
        sucesso: true,
        maquina: { id, nome, especificacoes, historico }
      });
    }

    // DELETE - Remover máquina
    if (req.method === 'DELETE') {
      const { id } = req.query;

      if (!id) {
        return res.status(400).json({ erro: 'ID da máquina é obrigatório.' });
      }

      await sql`DELETE FROM maquinas WHERE id = ${id}`;
      return res.status(200).json({ sucesso: true });
    }

    return res.status(405).json({ erro: 'Método não permitido.' });

  } catch (error) {
    console.error('Erro na API de máquinas:', error);
    return res.status(500).json({ erro: 'Erro interno do servidor.', detalhe: error.message });
  }
};
