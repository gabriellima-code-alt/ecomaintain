// ============================================
// API DE INICIALIZAÇÃO DO BANCO DE DADOS
// Chamar uma vez após configurar a DATABASE_URL
// ============================================

const { sql, initDB, corsHeaders } = require('./_db');

module.exports = async (req, res) => {
  if (req.method === 'OPTIONS') {
    return res.status(200)
      .setHeader('Access-Control-Allow-Origin', '*')
      .setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
      .setHeader('Access-Control-Allow-Headers', 'Content-Type')
      .end();
  }

  const headers = corsHeaders();
  Object.entries(headers).forEach(([k, v]) => res.setHeader(k, v));

  try {
    await initDB();
    return res.status(200).json({
      sucesso: true,
      mensagem: 'Banco de dados inicializado com sucesso! Tabelas criadas e usuário PCM padrão inserido.',
      credenciais_pcm: {
        email: 'pcm@admin.com',
        senha: '123456',
        nota: 'Altere a senha após o primeiro login!'
      }
    });
  } catch (error) {
    console.error('Erro ao inicializar banco de dados:', error);
    return res.status(500).json({ erro: 'Erro ao inicializar banco de dados.', detalhe: error.message });
  }
};
