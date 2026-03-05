// ============================================
// API DE MANUAIS TÉCNICOS (Neon Cloud)
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

    // GET - Buscar manuais
    if (req.method === 'GET') {
      const { id, busca } = req.query;

      // Buscar manual específico COM o conteúdo base64
      if (id) {
        const manuais = await sql`SELECT * FROM manuais WHERE id = ${id} AND ativo = TRUE`;
        if (manuais.length === 0) {
          return res.status(404).json({ erro: 'Manual não encontrado.' });
        }
        return res.status(200).json(formatarManual(manuais[0], true));
      }

      // Busca por texto
      if (busca) {
        const termoBusca = `%${busca}%`;
        const manuais = await sql`
          SELECT id, titulo, maquina_id, descricao, nome_arquivo, tipo_arquivo,
                 tamanho_arquivo, cadastrado_por, data_criacao, ativo
          FROM manuais
          WHERE ativo = TRUE AND (
            titulo ILIKE ${termoBusca} OR
            maquina_id ILIKE ${termoBusca} OR
            descricao ILIKE ${termoBusca}
          )
          ORDER BY data_criacao DESC
        `;
        return res.status(200).json(manuais.map(m => formatarManual(m, false)));
      }

      // Listar todos (sem o conteúdo base64 para performance)
      const manuais = await sql`
        SELECT id, titulo, maquina_id, descricao, nome_arquivo, tipo_arquivo,
               tamanho_arquivo, cadastrado_por, data_criacao, ativo
        FROM manuais
        WHERE ativo = TRUE
        ORDER BY data_criacao DESC
      `;

      return res.status(200).json(manuais.map(m => formatarManual(m, false)));
    }

    // POST - Cadastrar novo manual
    if (req.method === 'POST') {
      const {
        titulo, maquinaId, descricao,
        nomeArquivo, tipoArquivo, tamanhoArquivo,
        conteudoBase64, cadastradoPor
      } = req.body;

      if (!titulo || !nomeArquivo) {
        return res.status(400).json({ erro: 'Título e arquivo são obrigatórios.' });
      }

      const id = 'MAN-' + Date.now();

      await sql`
        INSERT INTO manuais (
          id, titulo, maquina_id, descricao,
          nome_arquivo, tipo_arquivo, tamanho_arquivo,
          conteudo_base64, cadastrado_por
        ) VALUES (
          ${id},
          ${titulo.trim()},
          ${maquinaId || null},
          ${descricao || null},
          ${nomeArquivo},
          ${tipoArquivo || null},
          ${tamanhoArquivo || 0},
          ${conteudoBase64 || null},
          ${cadastradoPor || null}
        )
      `;

      return res.status(201).json({
        sucesso: true,
        manual: {
          id,
          titulo: titulo.trim(),
          maquinaId: maquinaId || null,
          nomeArquivo,
          dataCriacao: new Date().toISOString()
        }
      });
    }

    // DELETE - Remover manual (soft delete)
    if (req.method === 'DELETE') {
      const { id } = req.query;

      if (!id) {
        return res.status(400).json({ erro: 'ID do manual é obrigatório.' });
      }

      await sql`UPDATE manuais SET ativo = FALSE WHERE id = ${id}`;
      return res.status(200).json({ sucesso: true });
    }

    return res.status(405).json({ erro: 'Método não permitido.' });

  } catch (error) {
    console.error('Erro na API de manuais:', error);
    return res.status(500).json({ erro: 'Erro interno do servidor.', detalhe: error.message });
  }
};

function formatarManual(m, incluirConteudo = false) {
  const resultado = {
    id: m.id,
    titulo: m.titulo,
    maquinaId: m.maquina_id,
    descricao: m.descricao,
    nomeArquivo: m.nome_arquivo,
    tipoArquivo: m.tipo_arquivo,
    tamanhoArquivo: m.tamanho_arquivo,
    cadastradoPor: m.cadastrado_por,
    dataCriacao: m.data_criacao ? m.data_criacao.toISOString() : null,
    ativo: m.ativo
  };

  if (incluirConteudo) {
    resultado.conteudoBase64 = m.conteudo_base64;
  }

  return resultado;
}
