// ============================================
// API DE MANUAIS DE MÁQUINAS
// ============================================

const { sql, initDB, corsHeaders } = require('./_db');

// Nota: A Vercel tem limite de 4.5MB para payloads em funções serverless
// Para arquivos maiores, considere usar S3 ou similar para armazenar PDFs
// e guardar apenas a URL no banco de dados Neon

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

    // GET - Listar manuais de uma máquina ou todos
    if (req.method === 'GET') {
      const { idMaquina } = req.query;

      let manuais;
      if (idMaquina) {
        manuais = await sql`
          SELECT * FROM manuais WHERE id_maquina = ${idMaquina} ORDER BY data_upload DESC
        `;
      } else {
        manuais = await sql`
          SELECT * FROM manuais ORDER BY data_upload DESC
        `;
      }

      return res.status(200).json(manuais.map(m => ({
        id: m.id,
        id_maquina: m.id_maquina,
        nome_maquina: m.nome_maquina,
        nome_arquivo: m.nome_arquivo,
        tamanho_mb: m.tamanho_mb,
        data_upload: m.data_upload ? m.data_upload.toISOString() : null,
        arquivo_pdf: m.arquivo_pdf
      })));
    }

    // POST - Adicionar novo manual
    if (req.method === 'POST') {
      const { id_maquina, nome_maquina, nome_arquivo, arquivo_pdf, tamanho_mb } = req.body;
      
      console.log('Recebendo novo manual:', { id_maquina, nome_arquivo, tamanho_mb, pdf_length: arquivo_pdf?.length });

      if (!id_maquina || !nome_arquivo || !arquivo_pdf) {
        return res.status(400).json({ erro: 'ID da máquina, nome do arquivo e PDF são obrigatórios.' });
      }

      // Verificar se o payload nao eh muito grande (limite da Vercel: ~4.5MB)
      if (arquivo_pdf.length > 4500000) {
        return res.status(413).json({ 
          erro: 'Arquivo PDF muito grande para upload direto. Maximo: 3MB em Base64.', 
          dica: 'Considere comprimir o PDF ou usar um servico de armazenamento em nuvem (S3, Azure Blob, etc)'
        });
      }



      // Verificar se já existe um manual com o mesmo nome para esta máquina
      const existente = await sql`
        SELECT id FROM manuais WHERE id_maquina = ${id_maquina} AND nome_arquivo = ${nome_arquivo}
      `;

      if (existente.length > 0) {
        return res.status(400).json({ erro: 'Já existe um manual com este nome para esta máquina.' });
      }

      const id = 'MAN-' + Date.now();

      await sql`
        INSERT INTO manuais (id, id_maquina, nome_maquina, nome_arquivo, arquivo_pdf, tamanho_mb)
        VALUES (${id}, ${id_maquina}, ${nome_maquina || ''}, ${nome_arquivo}, ${arquivo_pdf}, ${tamanho_mb || 0})
      `;

      return res.status(201).json({
        sucesso: true,
        manual: { id, id_maquina, nome_maquina, nome_arquivo, tamanho_mb, arquivo_pdf }
      });
    }

    // PUT - Atualizar manual (substituir arquivo)
    if (req.method === 'PUT') {
      const { id, arquivo_pdf, tamanho_mb } = req.body;

      if (!id || !arquivo_pdf) {
        return res.status(400).json({ erro: 'ID do manual e arquivo PDF são obrigatórios.' });
      }



      await sql`
        UPDATE manuais
        SET arquivo_pdf = ${arquivo_pdf}, tamanho_mb = ${tamanho_mb || 0}, data_upload = NOW()
        WHERE id = ${id}
      `;

      return res.status(200).json({ sucesso: true });
    }

    // DELETE - Remover manual
    if (req.method === 'DELETE') {
      const { id } = req.query;

      if (!id) {
        return res.status(400).json({ erro: 'ID do manual é obrigatório.' });
      }

      await sql`DELETE FROM manuais WHERE id = ${id}`;
      return res.status(200).json({ sucesso: true });
    }

    return res.status(405).json({ erro: 'Método não permitido.' });

  } catch (error) {
    console.error('Erro na API de manuais:', error);
    console.error('Stack:', error.stack);
    return res.status(500).json({ 
      erro: 'Erro interno do servidor.', 
      detalhe: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};
