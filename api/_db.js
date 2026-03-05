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
      fotos_evidencia JSONB DEFAULT '[]',
      data_confirmacao TIMESTAMP,
      data_pendencia TIMESTAMP,
      data_liberacao TIMESTAMP,
      laudo_gerado BOOLEAN DEFAULT FALSE,
      laudo_data TIMESTAMP
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

  // ============================================
  // TABELAS - CHECKLIST DINÂMICO
  // ============================================

  await sql`
    CREATE TABLE IF NOT EXISTS checklist_itens (
      id TEXT PRIMARY KEY,
      agenda_id TEXT NOT NULL,
      descricao TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'pendente',
      observacao TEXT,
      ordem INTEGER DEFAULT 0,
      respondido_por TEXT,
      criado_por TEXT,
      data_criacao TIMESTAMP DEFAULT NOW(),
      data_atualizacao TIMESTAMP DEFAULT NOW()
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS laudos (
      id TEXT PRIMARY KEY,
      agenda_id TEXT NOT NULL,
      os_id TEXT,
      maquina_id TEXT,
      maquina_nome TEXT,
      manutentor_id TEXT,
      manutentor_nome TEXT,
      tipo_manutencao TEXT,
      data_execucao TIMESTAMP,
      itens_checklist JSONB NOT NULL DEFAULT '[]',
      total_itens INTEGER DEFAULT 0,
      itens_ok INTEGER DEFAULT 0,
      itens_nao_ok INTEGER DEFAULT 0,
      observacoes_gerais TEXT,
      status_laudo TEXT DEFAULT 'pendente_aprovacao',
      aprovado_por TEXT,
      data_aprovacao TIMESTAMP,
      data_geracao TIMESTAMP DEFAULT NOW()
    )
  `;

  // ============================================
  // TABELAS - MANUAIS NA NUVEM
  // ============================================

  await sql`
    CREATE TABLE IF NOT EXISTS manuais (
      id TEXT PRIMARY KEY,
      titulo TEXT NOT NULL,
      maquina_id TEXT,
      descricao TEXT,
      nome_arquivo TEXT NOT NULL,
      tipo_arquivo TEXT,
      tamanho_arquivo BIGINT DEFAULT 0,
      conteudo_base64 TEXT,
      cadastrado_por TEXT,
      data_criacao TIMESTAMP DEFAULT NOW(),
      data_atualizacao TIMESTAMP DEFAULT NOW(),
      ativo BOOLEAN DEFAULT TRUE
    )
  `;

  // ============================================
  // TABELAS - RELATÓRIO DE FECHAMENTO
  // ============================================

  await sql`
    CREATE TABLE IF NOT EXISTS relatorios_fechamento (
      id TEXT PRIMARY KEY,
      os_id TEXT NOT NULL,
      maquina_id TEXT,
      maquina_nome TEXT,
      manutentor_id TEXT,
      manutentor_nome TEXT,
      status_final TEXT,
      descricao_execucao TEXT,
      assinatura_manutentor TEXT,
      fotos_evidencia JSONB DEFAULT '[]',
      apontamentos JSONB DEFAULT '[]',
      pecas_utilizadas JSONB DEFAULT '[]',
      laudo_checklist_id TEXT,
      data_inicio TIMESTAMP,
      data_fechamento TIMESTAMP,
      data_geracao TIMESTAMP DEFAULT NOW(),
      visualizado_pcm BOOLEAN DEFAULT FALSE,
      data_visualizacao_pcm TIMESTAMP
    )
  `;

  // Adicionar colunas novas em tabelas existentes (se não existirem)
  try {
    await sql`ALTER TABLE ordens_servico ADD COLUMN IF NOT EXISTS fotos_evidencia JSONB DEFAULT '[]'`;
  } catch(e) { /* coluna já existe */ }

  try {
    await sql`ALTER TABLE ordens_servico ADD COLUMN IF NOT EXISTS laudo_gerado BOOLEAN DEFAULT FALSE`;
  } catch(e) { /* coluna já existe */ }

  try {
    await sql`ALTER TABLE ordens_servico ADD COLUMN IF NOT EXISTS laudo_data TIMESTAMP`;
  } catch(e) { /* coluna já existe */ }

  try {
    await sql`ALTER TABLE checklist_itens ADD COLUMN IF NOT EXISTS respondido_por TEXT`;
  } catch(e) { /* coluna já existe */ }

  // Inserir usuário PCM padrão se não existir
  try {
    const pcmExistente = await sql`SELECT id FROM usuarios WHERE email = 'pcm@admin.com'`;
    if (pcmExistente.length === 0) {
      const bcrypt = require('bcryptjs');
      const senhaHash = await bcrypt.hash('123456', 10);
      await sql`
        INSERT INTO usuarios (id, nome, email, senha, role)
        VALUES ('PCM_ADMIN', 'Administrador PCM', 'pcm@admin.com', ${senhaHash}, 'pcm')
      `;
    }
  } catch(e) {
    console.warn('Aviso ao criar usuário PCM padrão:', e.message);
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
