// ============================================
// API DE AGENDA PREVENTIVA
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

    // GET - Listar agendamentos
    if (req.method === 'GET') {
      const { idUsuario } = req.query;

      let agendamentos;
      if (idUsuario) {
        agendamentos = await sql`
          SELECT * FROM agenda_preventiva WHERE id_usuario = ${idUsuario} ORDER BY data_programada
        `;
      } else {
        agendamentos = await sql`
          SELECT * FROM agenda_preventiva ORDER BY data_programada
        `;
      }

      return res.status(200).json(agendamentos.map(a => ({
        id: a.id,
        id_maquina: a.id_maquina,
        nome_maquina: a.nome_maquina,
        id_usuario: a.id_usuario,
        nome_usuario: a.nome_usuario,
        data_programada: a.data_programada,
        tipo_manutencao: a.tipo_manutencao,
        status: a.status,
        data_conclusao: a.data_conclusao ? a.data_conclusao.toISOString() : null,
        laudo_dados: a.laudo_dados,
        laudo_pdf: a.laudo_pdf
      })));
    }

    // POST - Criar novo agendamento
    if (req.method === 'POST') {
      const { id_maquina, nome_maquina, id_usuario, nome_usuario, data_programada, tipo_manutencao } = req.body;

      if (!id_maquina || !id_usuario || !data_programada || !tipo_manutencao) {
        return res.status(400).json({ erro: 'Todos os campos são obrigatórios.' });
      }

      const id = 'AGD-' + Date.now();

      await sql`
        INSERT INTO agenda_preventiva (id, id_maquina, nome_maquina, id_usuario, nome_usuario, data_programada, tipo_manutencao, status)
        VALUES (${id}, ${id_maquina}, ${nome_maquina || ''}, ${id_usuario}, ${nome_usuario || ''},
                ${data_programada}, ${tipo_manutencao}, 'pendente')
      `;

      return res.status(201).json({
        sucesso: true,
        agendamento: { id, id_maquina, nome_maquina, id_usuario, nome_usuario, data_programada, tipo_manutencao, status: 'pendente' }
      });
    }

    // PUT - Atualizar status do agendamento (concluir checklist)
    if (req.method === 'PUT') {
      const { id, status, laudo_dados, laudo_pdf } = req.body;
      
      console.log('Atualizando agendamento:', { id, status, pdf_length: laudo_pdf ? laudo_pdf.length : 0 });

      if (!id || !status) {
        return res.status(400).json({ erro: 'ID e status são obrigatórios.' });
      }

      // Verificar se o payload nao eh muito grande (limite da Vercel: ~4.5MB)
      if (laudo_pdf && typeof laudo_pdf === 'string' && laudo_pdf.length > 4500000) {
        return res.status(413).json({ 
          erro: 'Arquivo PDF do laudo muito grande para upload direto. Maximo: 3MB em Base64.', 
          dica: 'Considere comprimir o PDF ou usar um servico de armazenamento em nuvem (S3, Azure Blob, etc)'
        });
      }

      if (status === 'concluido') {
        // Validar que os dados do laudo não estão vazios
        if (!laudo_dados || !laudo_pdf) {
          return res.status(400).json({ erro: 'Dados do laudo e PDF são obrigatórios para conclusão.' });
        }



        await sql`
          UPDATE agenda_preventiva
          SET status = 'concluido', 
              data_conclusao = NOW(),
              laudo_dados = ${laudo_dados},
              laudo_pdf = ${laudo_pdf}
          WHERE id = ${id}
        `;
      } else {
        await sql`
          UPDATE agenda_preventiva SET status = ${status} WHERE id = ${id}
        `;
      }

      return res.status(200).json({ sucesso: true });
    }

    // DELETE - Remover agendamento
    if (req.method === 'DELETE') {
      const { id } = req.query;

      if (!id) {
        return res.status(400).json({ erro: 'ID do agendamento é obrigatório.' });
      }

      await sql`DELETE FROM agenda_preventiva WHERE id = ${id}`;
      return res.status(200).json({ sucesso: true });
    }

    return res.status(405).json({ erro: 'Método não permitido.' });

  } catch (error) {
    console.error('Erro na API de agenda preventiva:', error);
    console.error('Stack:', error.stack);
    return res.status(500).json({ 
      erro: 'Erro interno do servidor.', 
      detalhe: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};
