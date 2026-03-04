// ============================================
// API DE PEÇAS / ESTOQUE
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

    // GET - Listar todas as peças
    if (req.method === 'GET') {
      const pecas = await sql`
        SELECT * FROM pecas ORDER BY nome
      `;
      return res.status(200).json(pecas.map(p => ({
        id: p.id,
        nome: p.nome,
        quantidade: p.quantidade,
        valor: parseFloat(p.valor),
        minimoEstoque: p.minimo_estoque,
        dataCadastro: p.data_cadastro
      })));
    }

    // POST - Adicionar nova peça
    if (req.method === 'POST') {
      const { nome, quantidade, valor, minimoEstoque } = req.body;

      if (!nome || quantidade === undefined) {
        return res.status(400).json({ erro: 'Nome e quantidade são obrigatórios.' });
      }

      const id = 'PEC_' + Date.now();

      await sql`
        INSERT INTO pecas (id, nome, quantidade, valor, minimo_estoque)
        VALUES (${id}, ${nome}, ${parseInt(quantidade)}, ${parseFloat(valor) || 0}, ${parseInt(minimoEstoque) || 0})
      `;

      return res.status(201).json({
        sucesso: true,
        peca: { id, nome, quantidade: parseInt(quantidade), valor: parseFloat(valor) || 0, minimoEstoque: parseInt(minimoEstoque) || 0 }
      });
    }

    // PUT - Atualizar quantidade de uma peça (ao usar em O.S.)
    if (req.method === 'PUT') {
      const { id, quantidade } = req.body;

      if (!id || quantidade === undefined) {
        return res.status(400).json({ erro: 'ID e quantidade são obrigatórios.' });
      }

      await sql`
        UPDATE pecas SET quantidade = quantidade - ${parseInt(quantidade)}
        WHERE id = ${id}
      `;

      return res.status(200).json({ sucesso: true });
    }

    // DELETE - Remover peça
    if (req.method === 'DELETE') {
      const { id } = req.query;

      if (!id) {
        return res.status(400).json({ erro: 'ID da peça é obrigatório.' });
      }

      await sql`DELETE FROM pecas WHERE id = ${id}`;
      return res.status(200).json({ sucesso: true });
    }

    return res.status(405).json({ erro: 'Método não permitido.' });

  } catch (error) {
    console.error('Erro na API de peças:', error);
    return res.status(500).json({ erro: 'Erro interno do servidor.', detalhe: error.message });
  }
};
