// ============================================
// API DE MANUAIS TÉCNICOS
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

    // GET - Listar manuais
    if (req.method === 'GET') {
      const { id } = req.query;

      if (id) {
        const manual = await sql`SELECT * FROM manuais WHERE id = ${id}`;
        if (manual.length === 0) return res.status(404).json({ erro: 'Manual não encontrado.' });
        return res.status(200).json(manual[0]);
      }

      const manuais = await sql`SELECT id, id_maquina, nome_maquina, nome_arquivo, tamanho_mb, data_upload FROM manuais ORDER BY data_upload DESC`;
      return res.status(200).json(manuais);
    }

    // POST - Salvar novo manual
    if (req.method === 'POST') {
      const { id_maquina, nome_maquina, nome_arquivo, arquivo_pdf, tamanho_mb } = req.body;

      if (!id_maquina || !nome_arquivo || !arquivo_pdf) {
        return res.status(400).json({ erro: 'Campos obrigatórios faltando.' });
      }

      // Validação de tamanho para evitar erro 500 por payload grande (limite Vercel ~4.5MB)
      if (typeof arquivo_pdf === 'string' && arquivo_pdf.length > 4500000) {
        return res.status(413).json({ erro: 'Arquivo muito grande. Limite de 3MB para Base64.' });
      }

      const id = 'MAN-' + Date.now();

      await sql`
        INSERT INTO manuais (id, id_maquina, nome_maquina, nome_arquivo, arquivo_pdf, tamanho_mb)
        VALUES (${id}, ${id_maquina}, ${nome_maquina || ''}, ${nome_arquivo}, ${arquivo_pdf}, ${tamanho_mb || 0})
        ON CONFLICT (id_maquina, nome_arquivo) 
        DO UPDATE SET arquivo_pdf = EXCLUDED.arquivo_pdf, tamanho_mb = EXCLUDED.tamanho_mb, data_upload = NOW()
      `;

      return res.status(201).json({ sucesso: true, id });
    }

    // DELETE - Remover manual
    if (req.method === 'DELETE') {
      const { id } = req.query;
      if (!id) return res.status(400).json({ erro: 'ID obrigatório.' });

      await sql`DELETE FROM manuais WHERE id = ${id}`;
      return res.status(200).json({ sucesso: true });
    }

    return res.status(405).json({ erro: 'Método não permitido.' });

  } catch (error) {
    console.error('Erro na API de manuais:', error);
    return res.status(500).json({ 
      erro: 'Erro interno do servidor.', 
      detalhe: error.message,
      stack: error.stack 
    });
  }
};
