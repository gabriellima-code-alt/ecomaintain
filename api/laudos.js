// ============================================
// API DE LAUDOS DE CHECKLIST
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

    // GET - Buscar laudos
    if (req.method === 'GET') {
      const { id, agendaId, status } = req.query;

      if (id) {
        const laudos = await sql`SELECT * FROM laudos WHERE id = ${id}`;
        if (laudos.length === 0) {
          return res.status(404).json({ erro: 'Laudo não encontrado.' });
        }
        return res.status(200).json(formatarLaudo(laudos[0]));
      }

      if (agendaId) {
        const laudos = await sql`
          SELECT * FROM laudos WHERE agenda_id = ${agendaId} ORDER BY data_geracao DESC
        `;
        return res.status(200).json(laudos.map(formatarLaudo));
      }

      // Listar todos (com filtro de status)
      let laudos;
      if (status) {
        laudos = await sql`
          SELECT * FROM laudos WHERE status_laudo = ${status} ORDER BY data_geracao DESC
        `;
      } else {
        laudos = await sql`SELECT * FROM laudos ORDER BY data_geracao DESC`;
      }

      return res.status(200).json(laudos.map(formatarLaudo));
    }

    // POST - Gerar laudo ao finalizar checklist
    if (req.method === 'POST') {
      const {
        agendaId, osId, maquinaId, maquinaNome,
        manutentorId, manutentorNome, tipoManutencao,
        itensChecklist, observacoesGerais
      } = req.body;

      if (!agendaId || !itensChecklist) {
        return res.status(400).json({ erro: 'agendaId e itensChecklist são obrigatórios.' });
      }

      const id = 'LAU-' + Date.now();
      const totalItens = itensChecklist.length;
      const itensOk = itensChecklist.filter(i => i.status === 'ok').length;
      const itensNaoOk = itensChecklist.filter(i => i.status === 'nao_ok').length;

      await sql`
        INSERT INTO laudos (
          id, agenda_id, os_id, maquina_id, maquina_nome,
          manutentor_id, manutentor_nome, tipo_manutencao,
          data_execucao, itens_checklist, total_itens,
          itens_ok, itens_nao_ok, observacoes_gerais,
          status_laudo, data_geracao
        ) VALUES (
          ${id}, ${agendaId}, ${osId || null}, ${maquinaId || null}, ${maquinaNome || null},
          ${manutentorId || null}, ${manutentorNome || null}, ${tipoManutencao || null},
          NOW(), ${JSON.stringify(itensChecklist)}, ${totalItens},
          ${itensOk}, ${itensNaoOk}, ${observacoesGerais || null},
          'pendente_aprovacao', NOW()
        )
      `;

      // Atualizar agenda como concluída
      await sql`
        UPDATE agenda_preventiva
        SET status = 'concluido', data_conclusao = NOW()
        WHERE id = ${agendaId}
      `;

      return res.status(201).json({
        sucesso: true,
        laudo: {
          id,
          agendaId,
          totalItens,
          itensOk,
          itensNaoOk,
          statusLaudo: 'pendente_aprovacao'
        }
      });
    }

    // PUT - Aprovar ou rejeitar laudo (PCM)
    if (req.method === 'PUT') {
      const { id, statusLaudo, aprovadoPor } = req.body;

      if (!id || !statusLaudo) {
        return res.status(400).json({ erro: 'ID e statusLaudo são obrigatórios.' });
      }

      await sql`
        UPDATE laudos
        SET status_laudo = ${statusLaudo},
            aprovado_por = ${aprovadoPor || null},
            data_aprovacao = NOW()
        WHERE id = ${id}
      `;

      return res.status(200).json({ sucesso: true });
    }

    return res.status(405).json({ erro: 'Método não permitido.' });

  } catch (error) {
    console.error('Erro na API de laudos:', error);
    return res.status(500).json({ erro: 'Erro interno do servidor.', detalhe: error.message });
  }
};

function formatarLaudo(l) {
  return {
    id: l.id,
    agendaId: l.agenda_id,
    osId: l.os_id,
    maquinaId: l.maquina_id,
    maquinaNome: l.maquina_nome,
    manutentorId: l.manutentor_id,
    manutentorNome: l.manutentor_nome,
    tipoManutencao: l.tipo_manutencao,
    dataExecucao: l.data_execucao ? l.data_execucao.toISOString() : null,
    itensChecklist: l.itens_checklist || [],
    totalItens: l.total_itens,
    itensOk: l.itens_ok,
    itensNaoOk: l.itens_nao_ok,
    observacoesGerais: l.observacoes_gerais,
    statusLaudo: l.status_laudo,
    aprovadoPor: l.aprovado_por,
    dataAprovacao: l.data_aprovacao ? l.data_aprovacao.toISOString() : null,
    dataGeracao: l.data_geracao ? l.data_geracao.toISOString() : null
  };
}
