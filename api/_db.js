// ============================================
// CONEXÃO COM BANCO DE DADOS NEON (PostgreSQL)
// ============================================

const { neon } = require('@neondatabase/serverless');

// A variável DATABASE_URL deve ser configurada no painel da Vercel
// Formato: postgresql://user:password@host/dbname?sslmode=require
const sql = neon(process.env.DATABASE_URL);

// ============================================
// INICIALIZAÇÃO DAS TABELAS
// ============================================

async function initDB() {
  await sql`
    CREATE TABLE IF NOT EXISTS usuarios (
      id TEXT PRIMARY KEY,
      nome TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      senha TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'manutentor',
      turno_inicio TEXT,
      turno_fim TEXT,
      almoco_inicio TEXT,
      almoco_fim TEXT,
      data_cadastro TIMESTAMP DEFAULT NOW()
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS maquinas (
      id TEXT PRIMARY KEY,
      nome TEXT NOT NULL,
      especificacoes TEXT,
      historico TEXT,
      data_cadastro TIMESTAMP DEFAULT NOW()
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS pecas (
      id TEXT PRIMARY KEY,
      nome TEXT NOT NULL,
      quantidade INTEGER NOT NULL DEFAULT 0,
      valor NUMERIC(10,2) DEFAULT 0,
      minimo_estoque INTEGER DEFAULT 0,
      data_cadastro TIMESTAMP DEFAULT NOW()
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS ordens_servico (
      id TEXT PRIMARY KEY,
      maquina_id TEXT,
      descricao TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'ativa',
      manutentor TEXT,
      id_manutentor TEXT,
      data_criacao TIMESTAMP DEFAULT NOW(),
      data_fechamento TIMESTAMP,
      descricao_final TEXT,
      assinatura_manutentor TEXT,
      assinatura_operador TEXT,
      foto_evidencia TEXT,
      data_confirmacao TIMESTAMP,
      data_pendencia TIMESTAMP,
      data_liberacao TIMESTAMP
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS apontamentos (
      id SERIAL PRIMARY KEY,
      os_id TEXT NOT NULL REFERENCES ordens_servico(id) ON DELETE CASCADE,
      tipo TEXT NOT NULL,
      motivo TEXT,
      timestamp TIMESTAMP DEFAULT NOW()
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS os_pecas (
      id SERIAL PRIMARY KEY,
      os_id TEXT NOT NULL REFERENCES ordens_servico(id) ON DELETE CASCADE,
      peca_id TEXT NOT NULL,
      quantidade INTEGER NOT NULL
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS agenda_preventiva (
      id TEXT PRIMARY KEY,
      id_maquina TEXT,
      nome_maquina TEXT,
      id_usuario TEXT,
      nome_usuario TEXT,
      data_programada DATE,
      tipo_manutencao TEXT,
      status TEXT DEFAULT 'pendente',
      data_conclusao TIMESTAMP,
      data_cadastro TIMESTAMP DEFAULT NOW()
    )
  `;

  // Inserir usuário PCM padrão se não existir
  const pcmExistente = await sql`SELECT id FROM usuarios WHERE email = 'pcm@admin.com'`;
  if (pcmExistente.length === 0) {
    const bcrypt = require('bcryptjs');
    const senhaHash = await bcrypt.hash('123456', 10);
    await sql`
      INSERT INTO usuarios (id, nome, email, senha, role)
      VALUES ('PCM_ADMIN', 'Administrador PCM', 'pcm@admin.com', ${senhaHash}, 'pcm')
    `;
  }
}

// Headers CORS para todas as respostas
function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Content-Type': 'application/json'
  };
}

module.exports = { sql, initDB, corsHeaders };
