// ============================================
// API DE ORDENS DE SERVIÇO
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

    // GET - Listar ordens de serviço
    if (req.method === 'GET') {
      const { status, id } = req.query;

      // Buscar uma OS específica
      if (id) {
        const os = await sql`
          SELECT * FROM ordens_servico WHERE id = ${id}
        `;
        if (os.length === 0) {
          return res.status(404).json({ erro: 'Ordem de serviço não encontrada.' });
        }

        const apontamentos = await sql`
          SELECT * FROM apontamentos WHERE os_id = ${id} ORDER BY timestamp
        `;
        const pecas = await sql`
          SELECT * FROM os_pecas WHERE os_id = ${id}
        `;

        return res.status(200).json(formatarOS(os[0], apontamentos, pecas));
      }

      // Listar com filtro de status
      let ordensRaw;
      if (status && status !== 'todas') {
        ordensRaw = await sql`
          SELECT * FROM ordens_servico WHERE status = ${status} ORDER BY data_criacao DESC
        `;
      } else {
        ordensRaw = await sql`
          SELECT * FROM ordens_servico ORDER BY data_criacao DESC
        `;
      }

      // Buscar apontamentos e peças para cada OS
      const ordens = await Promise.all(ordensRaw.map(async (os) => {
        const apontamentos = await sql`
          SELECT * FROM apontamentos WHERE os_id = ${os.id} ORDER BY timestamp
        `;
        const pecas = await sql`
          SELECT * FROM os_pecas WHERE os_id = ${os.id}
        `;
        return formatarOS(os, apontamentos, pecas);
      }));

      return res.status(200).json(ordens);
    }

    // POST - Criar nova OS
    if (req.method === 'POST') {
      const { maquinaId, descricao, manutentor, idManutentor, dataCriacao } = req.body;

      if (!maquinaId || !descricao) {
        return res.status(400).json({ erro: 'ID da máquina e descrição são obrigatórios.' });
      }

      if (!descricao || descricao.length < 10) {
        return res.status(400).json({ erro: 'Descrição deve ter no mínimo 10 caracteres.' });
      }

      const id = 'OS_' + Date.now();

      await sql`
        INSERT INTO ordens_servico (id, maquina_id, descricao, status, manutentor, id_manutentor, data_criacao, fotos_evidencia)
        VALUES (${id}, ${maquinaId}, ${descricao}, 'ativa', ${manutentor || ''}, ${idManutentor || null},
                ${dataCriacao ? new Date(dataCriacao) : new Date()}, '[]')
      `;

      return res.status(201).json({
        sucesso: true,
        os: {
          id,
          maquinaId,
          descricao,
          status: 'ativa',
          manutentor,
          dataCriacao: dataCriacao || new Date().toISOString(),
          apontamentos: [],
          pecas: [],
          fotosEvidencia: []
        }
      });
    }

    // PUT - Atualizar OS (fechamento, status, auditoria)
    if (req.method === 'PUT') {
      const {
        id, status, descricaoFinal, dataFechamento,
        assinaturaManutentor, assinaturaOperador,
        fotoEvidencia, fotosEvidencia,
        dataConfirmacao,
        dataPendencia, dataLiberacao,
        laudoGerado, laudoData,
        // Para adicionar apontamento
        apontamento,
        // Para adicionar peças
        pecas
      } = req.body;

      if (!id) {
        return res.status(400).json({ erro: 'ID da OS é obrigatório.' });
      }

      // Adicionar apontamento
      if (apontamento) {
        await sql`
          INSERT INTO apontamentos (os_id, tipo, motivo, timestamp)
          VALUES (${id}, ${apontamento.tipo}, ${apontamento.motivo || null},
                  ${apontamento.timestamp ? new Date(apontamento.timestamp) : new Date()})
        `;
        return res.status(200).json({ sucesso: true });
      }

      // Adicionar peças à OS
      if (pecas && pecas.length > 0) {
        for (const peca of pecas) {
          await sql`
            INSERT INTO os_pecas (os_id, peca_id, quantidade)
            VALUES (${id}, ${peca.pecaId}, ${peca.quantidade})
          `;
          // Atualizar estoque
          await sql`
            UPDATE pecas SET quantidade = quantidade - ${peca.quantidade}
            WHERE id = ${peca.pecaId}
          `;
        }
        return res.status(200).json({ sucesso: true });
      }

      // Atualizar campos da OS
      if (status !== undefined) {
        await sql`UPDATE ordens_servico SET status = ${status} WHERE id = ${id}`;
      }
      if (descricaoFinal !== undefined) {
        await sql`UPDATE ordens_servico SET descricao_final = ${descricaoFinal} WHERE id = ${id}`;
      }
      if (dataFechamento !== undefined) {
        await sql`UPDATE ordens_servico SET data_fechamento = ${new Date(dataFechamento)} WHERE id = ${id}`;
      }
      if (assinaturaManutentor !== undefined) {
        await sql`UPDATE ordens_servico SET assinatura_manutentor = ${assinaturaManutentor} WHERE id = ${id}`;
      }
      if (assinaturaOperador !== undefined) {
        await sql`UPDATE ordens_servico SET assinatura_operador = ${assinaturaOperador} WHERE id = ${id}`;
      }
      if (fotoEvidencia !== undefined) {
        await sql`UPDATE ordens_servico SET foto_evidencia = ${fotoEvidencia} WHERE id = ${id}`;
      }
      if (fotosEvidencia !== undefined) {
        await sql`UPDATE ordens_servico SET fotos_evidencia = ${JSON.stringify(fotosEvidencia)} WHERE id = ${id}`;
      }
      if (dataConfirmacao !== undefined) {
        await sql`UPDATE ordens_servico SET data_confirmacao = ${new Date(dataConfirmacao)} WHERE id = ${id}`;
      }
      if (dataPendencia !== undefined) {
        await sql`UPDATE ordens_servico SET data_pendencia = ${new Date(dataPendencia)} WHERE id = ${id}`;
      }
      if (dataLiberacao !== undefined) {
        await sql`UPDATE ordens_servico SET data_liberacao = ${new Date(dataLiberacao)} WHERE id = ${id}`;
      }
      if (laudoGerado !== undefined) {
        await sql`UPDATE ordens_servico SET laudo_gerado = ${laudoGerado} WHERE id = ${id}`;
      }
      if (laudoData !== undefined) {
        await sql`UPDATE ordens_servico SET laudo_data = ${new Date(laudoData)} WHERE id = ${id}`;
      }

      return res.status(200).json({ sucesso: true });
    }

    return res.status(405).json({ erro: 'Método não permitido.' });

  } catch (error) {
    console.error('Erro na API de ordens de serviço:', error);
    return res.status(500).json({ erro: 'Erro interno do servidor.', detalhe: error.message });
  }
};

// Formatar OS para o formato esperado pelo frontend
function formatarOS(os, apontamentos, pecas) {
  return {
    id: os.id,
    maquinaId: os.maquina_id,
    descricao: os.descricao,
    status: os.status,
    manutentor: os.manutentor,
    idManutentor: os.id_manutentor,
    dataCriacao: os.data_criacao ? os.data_criacao.toISOString() : null,
    dataFechamento: os.data_fechamento ? os.data_fechamento.toISOString() : null,
    descricaoFinal: os.descricao_final,
    assinaturaManutentor: os.assinatura_manutentor,
    assinaturaOperador: os.assinatura_operador,
    fotoEvidencia: os.foto_evidencia,
    fotosEvidencia: os.fotos_evidencia || [],
    dataConfirmacao: os.data_confirmacao ? os.data_confirmacao.toISOString() : null,
    dataPendencia: os.data_pendencia ? os.data_pendencia.toISOString() : null,
    dataLiberacao: os.data_liberacao ? os.data_liberacao.toISOString() : null,
    laudoGerado: os.laudo_gerado || false,
    laudoData: os.laudo_data ? os.laudo_data.toISOString() : null,
    apontamentos: apontamentos.map(a => ({
      id: a.id,
      tipo: a.tipo,
      motivo: a.motivo,
      timestamp: a.timestamp ? a.timestamp.toISOString() : null
    })),
    pecas: pecas.map(p => ({
      pecaId: p.peca_id,
      quantidade: p.quantidade
    }))
  };
}
