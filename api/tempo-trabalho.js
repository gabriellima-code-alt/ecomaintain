// ============================================
// API DE REGISTRO DE TEMPO DE TRABALHO EFETIVO
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

    // GET - Obter registros de tempo de trabalho
    if (req.method === 'GET') {
      const { idManutentor, dataInicio, dataFim } = req.query;

      if (!idManutentor) {
        return res.status(400).json({ erro: 'ID do manutentor é obrigatório.' });
      }

      let registros;
      if (dataInicio && dataFim) {
        registros = await sql`
          SELECT * FROM registros_tempo_trabalho 
          WHERE id_manutentor = ${idManutentor} 
          AND data_registro BETWEEN ${dataInicio} AND ${dataFim}
          ORDER BY data_registro DESC, hora_inicio DESC
        `;
      } else {
        registros = await sql`
          SELECT * FROM registros_tempo_trabalho 
          WHERE id_manutentor = ${idManutentor}
          ORDER BY data_registro DESC, hora_inicio DESC
        `;
      }
      return res.status(200).json(registros);
    }

    // POST - Registrar novo tempo de trabalho
    if (req.method === 'POST') {
      const { idManutentor, nomeManutentor, dataRegistro, horaInicio, horaFim, duracao, tipoRegistro, motivoPausa } = req.body;

      if (!idManutentor || !dataRegistro) {
        return res.status(400).json({ erro: 'ID do manutentor e data são obrigatórios.' });
      }

      await sql`
        INSERT INTO registros_tempo_trabalho (id_manutentor, nome_manutentor, data_registro, hora_inicio, hora_fim, duracao_minutos, tipo_registro, motivo_pausa)
        VALUES (${idManutentor}, ${nomeManutentor || ''}, ${dataRegistro}, ${horaInicio || null}, ${horaFim || null}, ${duracao || 0}, ${tipoRegistro || 'trabalho'}, ${motivoPausa || null})
      `;

      return res.status(201).json({ sucesso: true });
    }

    // GET - Obter resumo de horas por período
    if (req.method === 'GET' && req.query.resumo === 'true') {
      const { idManutentor, dataInicio, dataFim } = req.query;

      if (!idManutentor) {
        return res.status(400).json({ erro: 'ID do manutentor é obrigatório.' });
      }

      let resumo;
      if (dataInicio && dataFim) {
        resumo = await sql`
          SELECT 
            data_registro,
            SUM(CASE WHEN tipo_registro = 'trabalho' THEN duracao_minutos ELSE 0 END) as minutos_trabalhados,
            SUM(CASE WHEN tipo_registro = 'pausa' THEN duracao_minutos ELSE 0 END) as minutos_pausa
          FROM registros_tempo_trabalho 
          WHERE id_manutentor = ${idManutentor}
          AND data_registro BETWEEN ${dataInicio} AND ${dataFim}
          GROUP BY data_registro 
          ORDER BY data_registro DESC
        `;
      } else {
        resumo = await sql`
          SELECT 
            data_registro,
            SUM(CASE WHEN tipo_registro = 'trabalho' THEN duracao_minutos ELSE 0 END) as minutos_trabalhados,
            SUM(CASE WHEN tipo_registro = 'pausa' THEN duracao_minutos ELSE 0 END) as minutos_pausa
          FROM registros_tempo_trabalho 
          WHERE id_manutentor = ${idManutentor}
          GROUP BY data_registro 
          ORDER BY data_registro DESC
        `;
      }
      return res.status(200).json(resumo);
    }

    // GET - Obter sessões de trabalho
    if (req.method === 'GET' && req.query.sessoes === 'true') {
      const { idManutentor, dataInicio, dataFim } = req.query;

      if (!idManutentor) {
        return res.status(400).json({ erro: 'ID do manutentor é obrigatório.' });
      }

      let sessoes;
      if (dataInicio && dataFim) {
        sessoes = await sql`
          SELECT * FROM sessoes_trabalho 
          WHERE id_manutentor = ${idManutentor}
          AND data_sessao BETWEEN ${dataInicio} AND ${dataFim}
          ORDER BY data_sessao DESC
        `;
      } else {
        sessoes = await sql`
          SELECT * FROM sessoes_trabalho 
          WHERE id_manutentor = ${idManutentor}
          ORDER BY data_sessao DESC
        `;
      }
      return res.status(200).json(sessoes);
    }

    // POST - Criar nova sessão de trabalho
    if (req.method === 'POST' && req.body.criarSessao === true) {
      const { idManutentor, nomeManutentor, dataSessao, horaInicio, horaFim, pausas, totalMinutosTrabalhados, totalMinutosPausa } = req.body;

      if (!idManutentor || !dataSessao) {
        return res.status(400).json({ erro: 'ID do manutentor e data são obrigatórios.' });
      }

      await sql`
        INSERT INTO sessoes_trabalho (id_manutentor, nome_manutentor, data_sessao, hora_inicio, hora_fim, pausas, total_minutos_trabalhados, total_minutos_pausa)
        VALUES (${idManutentor}, ${nomeManutentor || ''}, ${dataSessao}, ${horaInicio || null}, ${horaFim || null}, ${JSON.stringify(pausas) || null}, ${totalMinutosTrabalhados || 0}, ${totalMinutosPausa || 0})
      `;

      return res.status(201).json({ sucesso: true });
    }

    return res.status(405).json({ erro: 'Método não permitido.' });

  } catch(e) {
    console.error(e);
    return res.status(500).json({ erro: e.message || 'Erro ao processar requisição.' });
  }
};
