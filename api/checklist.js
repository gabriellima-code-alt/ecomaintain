// ============================================
// API DE CHECKLIST DINÂMICO
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

    // GET - Buscar itens do checklist de uma agenda
    if (req.method === 'GET') {
      const { agendaId } = req.query;

      if (!agendaId) {
        return res.status(400).json({ erro: 'agendaId é obrigatório.' });
      }

      const itens = await sql`
        SELECT * FROM checklist_itens
        WHERE agenda_id = ${agendaId}
        ORDER BY ordem ASC, data_criacao ASC
      `;

      return res.status(200).json(itens.map(formatarItem));
    }

    // POST - Adicionar item ao checklist
    if (req.method === 'POST') {
      const { agendaId, descricao, criadoPor, ordem } = req.body;

      if (!agendaId || !descricao) {
        return res.status(400).json({ erro: 'agendaId e descricao são obrigatórios.' });
      }

      const id = 'CHK-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5);

      // Calcular próxima ordem
      const maxOrdem = await sql`
        SELECT COALESCE(MAX(ordem), 0) as max_ordem FROM checklist_itens WHERE agenda_id = ${agendaId}
      `;
      const proximaOrdem = (ordem !== undefined ? ordem : (maxOrdem[0].max_ordem + 1));

      await sql`
        INSERT INTO checklist_itens (id, agenda_id, descricao, status, ordem, criado_por)
        VALUES (${id}, ${agendaId}, ${descricao}, 'pendente', ${proximaOrdem}, ${criadoPor || null})
      `;

      return res.status(201).json({
        sucesso: true,
        item: {
          id,
          agendaId,
          descricao,
          status: 'pendente',
          observacao: null,
          ordem: proximaOrdem,
          criadoPor: criadoPor || null
        }
      });
    }

    // PUT - Atualizar item do checklist (status + observação + respondidoPor)
    if (req.method === 'PUT') {
      const { id, status, observacao, descricao, respondidoPor } = req.body;

      if (!id) {
        return res.status(400).json({ erro: 'ID do item é obrigatório.' });
      }

      if (status !== undefined) {
        await sql`
          UPDATE checklist_itens
          SET status = ${status}, data_atualizacao = NOW()
          WHERE id = ${id}
        `;
      }

      if (observacao !== undefined) {
        await sql`
          UPDATE checklist_itens
          SET observacao = ${observacao}, data_atualizacao = NOW()
          WHERE id = ${id}
        `;
      }

      if (descricao !== undefined) {
        await sql`
          UPDATE checklist_itens
          SET descricao = ${descricao}, data_atualizacao = NOW()
          WHERE id = ${id}
        `;
      }

      if (respondidoPor !== undefined) {
        await sql`
          UPDATE checklist_itens
          SET respondido_por = ${respondidoPor}, data_atualizacao = NOW()
          WHERE id = ${id}
        `;
      }

      return res.status(200).json({ sucesso: true });
    }

    // DELETE - Remover item do checklist
    if (req.method === 'DELETE') {
      const { id } = req.query;

      if (!id) {
        return res.status(400).json({ erro: 'ID do item é obrigatório.' });
      }

      await sql`DELETE FROM checklist_itens WHERE id = ${id}`;
      return res.status(200).json({ sucesso: true });
    }

    return res.status(405).json({ erro: 'Método não permitido.' });

  } catch (error) {
    console.error('Erro na API de checklist:', error);
    return res.status(500).json({ erro: 'Erro interno do servidor.', detalhe: error.message });
  }
};

function formatarItem(i) {
  return {
    id: i.id,
    agendaId: i.agenda_id,
    descricao: i.descricao,
    status: i.status,
    observacao: i.observacao,
    ordem: i.ordem,
    criadoPor: i.criado_por,
    respondidoPor: i.respondido_por,
    dataCriacao: i.data_criacao ? i.data_criacao.toISOString() : null,
    dataAtualizacao: i.data_atualizacao ? i.data_atualizacao.toISOString() : null
  };
}
