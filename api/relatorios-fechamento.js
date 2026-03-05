// ============================================
// API DE RELATÓRIOS DE FECHAMENTO DE O.S.
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

    // GET - Buscar relatórios
    if (req.method === 'GET') {
      const { id, osId, naoVisualizados } = req.query;

      if (id) {
        const relatorios = await sql`SELECT * FROM relatorios_fechamento WHERE id = ${id}`;
        if (relatorios.length === 0) {
          return res.status(404).json({ erro: 'Relatório não encontrado.' });
        }

        // Marcar como visualizado pelo PCM
        await sql`
          UPDATE relatorios_fechamento
          SET visualizado_pcm = TRUE, data_visualizacao_pcm = NOW()
          WHERE id = ${id} AND visualizado_pcm = FALSE
        `;

        return res.status(200).json(formatarRelatorio(relatorios[0]));
      }

      if (osId) {
        const relatorios = await sql`
          SELECT * FROM relatorios_fechamento WHERE os_id = ${osId} ORDER BY data_geracao DESC
        `;
        return res.status(200).json(relatorios.map(formatarRelatorio));
      }

      if (naoVisualizados === 'true') {
        const relatorios = await sql`
          SELECT * FROM relatorios_fechamento
          WHERE visualizado_pcm = FALSE
          ORDER BY data_geracao DESC
        `;
        return res.status(200).json(relatorios.map(formatarRelatorio));
      }

      // Listar todos
      const relatorios = await sql`
        SELECT * FROM relatorios_fechamento ORDER BY data_geracao DESC
      `;
      return res.status(200).json(relatorios.map(formatarRelatorio));
    }

    // POST - Criar relatório de fechamento
    if (req.method === 'POST') {
      const {
        osId, maquinaId, maquinaNome,
        manutentorId, manutentorNome,
        statusFinal, descricaoExecucao,
        assinaturaManutentor, fotosEvidencia,
        apontamentos, pecasUtilizadas,
        laudoChecklistId, dataInicio, dataFechamento
      } = req.body;

      if (!osId) {
        return res.status(400).json({ erro: 'osId é obrigatório.' });
      }

      const id = 'REL-' + Date.now();

      await sql`
        INSERT INTO relatorios_fechamento (
          id, os_id, maquina_id, maquina_nome,
          manutentor_id, manutentor_nome,
          status_final, descricao_execucao,
          assinatura_manutentor, fotos_evidencia,
          apontamentos, pecas_utilizadas,
          laudo_checklist_id, data_inicio, data_fechamento,
          data_geracao
        ) VALUES (
          ${id}, ${osId}, ${maquinaId || null}, ${maquinaNome || null},
          ${manutentorId || null}, ${manutentorNome || null},
          ${statusFinal || null}, ${descricaoExecucao || null},
          ${assinaturaManutentor || null},
          ${JSON.stringify(fotosEvidencia || [])},
          ${JSON.stringify(apontamentos || [])},
          ${JSON.stringify(pecasUtilizadas || [])},
          ${laudoChecklistId || null},
          ${dataInicio ? new Date(dataInicio) : null},
          ${dataFechamento ? new Date(dataFechamento) : new Date()},
          NOW()
        )
      `;

      // Atualizar OS com laudo gerado
      await sql`
        UPDATE ordens_servico
        SET laudo_gerado = TRUE, laudo_data = NOW(),
            fotos_evidencia = ${JSON.stringify(fotosEvidencia || [])}
        WHERE id = ${osId}
      `;

      return res.status(201).json({
        sucesso: true,
        relatorio: { id, osId, statusFinal, dataGeracao: new Date().toISOString() }
      });
    }

    return res.status(405).json({ erro: 'Método não permitido.' });

  } catch (error) {
    console.error('Erro na API de relatórios de fechamento:', error);
    return res.status(500).json({ erro: 'Erro interno do servidor.', detalhe: error.message });
  }
};

function formatarRelatorio(r) {
  return {
    id: r.id,
    osId: r.os_id,
    maquinaId: r.maquina_id,
    maquinaNome: r.maquina_nome,
    manutentorId: r.manutentor_id,
    manutentorNome: r.manutentor_nome,
    statusFinal: r.status_final,
    descricaoExecucao: r.descricao_execucao,
    assinaturaManutentor: r.assinatura_manutentor,
    fotosEvidencia: r.fotos_evidencia || [],
    apontamentos: r.apontamentos || [],
    pecasUtilizadas: r.pecas_utilizadas || [],
    laudoChecklistId: r.laudo_checklist_id,
    dataInicio: r.data_inicio ? r.data_inicio.toISOString() : null,
    dataFechamento: r.data_fechamento ? r.data_fechamento.toISOString() : null,
    dataGeracao: r.data_geracao ? r.data_geracao.toISOString() : null,
    visualizadoPcm: r.visualizado_pcm,
    dataVisualizacaoPcm: r.data_visualizacao_pcm ? r.data_visualizacao_pcm.toISOString() : null
  };
}
