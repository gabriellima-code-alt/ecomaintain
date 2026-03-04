# 🌲 EcoMaintain — Guia Completo de Deploy (Neon + Vercel)

> **Tempo estimado:** 20 a 30 minutos  
> **Pré-requisitos:** Conta no GitHub, conta na Vercel (gratuita) e conta no Neon (gratuita)

---

## 📋 Visão Geral da Arquitetura

```
GitHub (código-fonte)
       ↓
   Vercel (hospedagem + funções serverless)
       ↓
  Neon (banco de dados PostgreSQL)
```

O sistema funciona da seguinte forma:
- **Frontend** (HTML/CSS/JS) → servido pela Vercel como arquivos estáticos
- **API** (pasta `/api`) → funções serverless Node.js executadas na Vercel
- **Banco de dados** → PostgreSQL hospedado no Neon (gratuito, serverless)

---

## PARTE 1 — Criar o Banco de Dados no Neon

### Passo 1.1 — Criar conta no Neon
1. Acesse [https://console.neon.tech](https://console.neon.tech)
2. Clique em **"Sign Up"** e crie uma conta gratuita (pode usar Google ou GitHub)

### Passo 1.2 — Criar um novo projeto
1. Após o login, clique em **"New Project"**
2. Preencha:
   - **Project name:** `ecomaintain`
   - **Database name:** `ecomaintain`
   - **Region:** Escolha a mais próxima (ex: `US East` ou `São Paulo` se disponível)
3. Clique em **"Create Project"**

### Passo 1.3 — Copiar a Connection String
1. Na tela do projeto, você verá a seção **"Connection Details"**
2. Selecione o modo **"Connection string"**
3. Copie a string que começa com `postgresql://...`

> ⚠️ **IMPORTANTE:** Guarde essa string em local seguro. Ela contém usuário e senha do banco.

**Exemplo de como a string se parece:**
```
postgresql://ecomaintain_user:AbCdEfGh123@ep-cool-name-123456.us-east-2.aws.neon.tech/ecomaintain?sslmode=require
```

---

## PARTE 2 — Publicar o Código no GitHub

### Passo 2.1 — Criar um repositório no GitHub
1. Acesse [https://github.com](https://github.com) e faça login
2. Clique no botão **"+"** no canto superior direito → **"New repository"**
3. Configure:
   - **Repository name:** `ecomaintain`
   - **Visibility:** Pode ser **Private** (recomendado) ou Public
   - **NÃO** marque "Add a README file"
4. Clique em **"Create repository"**

### Passo 2.2 — Fazer upload dos arquivos

Você tem duas opções:

#### Opção A — Upload direto pelo GitHub (mais fácil)
1. Na página do repositório recém-criado, clique em **"uploading an existing file"**
2. Arraste **todos os arquivos e pastas** do ZIP para a área de upload
3. Certifique-se de manter a estrutura de pastas:
   ```
   ecomaintain/
   ├── api/
   │   ├── _db.js
   │   ├── auth.js
   │   ├── manutentores.js
   │   ├── maquinas.js
   │   ├── pecas.js
   │   ├── ordens-servico.js
   │   ├── agenda-preventiva.js
   │   └── init-db.js
   ├── public/
   │   ├── index.html
   │   ├── style.css
   │   └── scripts.js
   ├── .gitignore
   ├── .env.example
   ├── package.json
   └── vercel.json
   ```
4. Adicione uma mensagem de commit (ex: "Deploy inicial EcoMaintain")
5. Clique em **"Commit changes"**

#### Opção B — Via terminal (Git)
```bash
# Na pasta do projeto (ecomaintain-vercel)
git init
git add .
git commit -m "Deploy inicial EcoMaintain"
git branch -M main
git remote add origin https://github.com/SEU_USUARIO/ecomaintain.git
git push -u origin main
```

> ⚠️ **ATENÇÃO:** Nunca envie o arquivo `.env` ou `.env.local` para o GitHub. O `.gitignore` já está configurado para ignorá-los.

---

## PARTE 3 — Configurar o Deploy na Vercel

### Passo 3.1 — Criar conta na Vercel
1. Acesse [https://vercel.com](https://vercel.com)
2. Clique em **"Sign Up"** e escolha **"Continue with GitHub"** (mais prático)
3. Autorize a Vercel a acessar seu GitHub

### Passo 3.2 — Importar o projeto
1. No dashboard da Vercel, clique em **"Add New..."** → **"Project"**
2. Encontre o repositório `ecomaintain` e clique em **"Import"**

### Passo 3.3 — Configurar as variáveis de ambiente (PASSO CRÍTICO)
Antes de clicar em "Deploy", role a página para baixo até encontrar **"Environment Variables"**:

1. Clique em **"Add"**
2. Preencha:
   - **Name:** `DATABASE_URL`
   - **Value:** Cole a string de conexão do Neon que você copiou no Passo 1.3
3. Clique em **"Add"** para confirmar

> 🔐 Essa variável é secreta e nunca ficará visível no código público.

### Passo 3.4 — Fazer o Deploy
1. Clique em **"Deploy"**
2. Aguarde 1 a 3 minutos enquanto a Vercel instala as dependências e publica o projeto
3. Quando aparecer **"Congratulations!"**, seu sistema está no ar!
4. Clique em **"Visit"** para acessar a URL do seu sistema

---

## PARTE 4 — Inicializar o Banco de Dados

Após o deploy, você precisa criar as tabelas no banco de dados Neon.

### Passo 4.1 — Acessar a rota de inicialização
1. Abra o navegador e acesse:
   ```
   https://SEU-PROJETO.vercel.app/api/init-db
   ```
   (Substitua `SEU-PROJETO` pela URL gerada pela Vercel)

2. Se tudo estiver correto, você verá uma resposta JSON como esta:
   ```json
   {
     "sucesso": true,
     "mensagem": "Banco de dados inicializado com sucesso!",
     "credenciais_pcm": {
       "email": "pcm@admin.com",
       "senha": "123456",
       "nota": "Altere a senha após o primeiro login!"
     }
   }
   ```

> ✅ Isso cria todas as tabelas e o usuário PCM padrão automaticamente.

---

## PARTE 5 — Primeiro Acesso ao Sistema

### Credenciais iniciais do PCM:
| Campo | Valor |
|-------|-------|
| **Email** | `pcm@admin.com` |
| **Senha** | `123456` |

> ⚠️ **IMPORTANTE:** Altere a senha do PCM imediatamente após o primeiro login!  
> Vá em **Dashboard PCM → Manutentores → Configurações do PCM**

---

## 📁 Estrutura dos Arquivos do Projeto

| Arquivo/Pasta | Descrição |
|---------------|-----------|
| `api/_db.js` | Configuração da conexão com o Neon e criação das tabelas |
| `api/auth.js` | Autenticação (login) |
| `api/manutentores.js` | CRUD de manutentores |
| `api/maquinas.js` | CRUD de máquinas |
| `api/pecas.js` | CRUD de peças/estoque |
| `api/ordens-servico.js` | CRUD de ordens de serviço + apontamentos |
| `api/agenda-preventiva.js` | CRUD de agenda preventiva |
| `api/init-db.js` | Inicialização do banco (usar apenas uma vez) |
| `public/index.html` | Página principal do sistema |
| `public/style.css` | Estilos visuais |
| `public/scripts.js` | Toda a lógica do frontend |
| `vercel.json` | Configuração de rotas da Vercel |
| `package.json` | Dependências Node.js |
| `.env.example` | Modelo das variáveis de ambiente |

---

## 🗄️ Estrutura do Banco de Dados (Neon)

As seguintes tabelas são criadas automaticamente:

| Tabela | Descrição |
|--------|-----------|
| `usuarios` | PCM e manutentores (com senha criptografada) |
| `maquinas` | Cadastro de máquinas da frota |
| `pecas` | Estoque de peças e insumos |
| `ordens_servico` | Ordens de serviço (abertura, execução, fechamento) |
| `apontamentos` | Registros de início/pausa por OS |
| `os_pecas` | Peças utilizadas em cada OS |
| `agenda_preventiva` | Agendamentos de manutenção preventiva |

---

## 🔄 Como Atualizar o Sistema no Futuro

Sempre que fizer alterações nos arquivos:

1. Faça upload dos arquivos alterados para o GitHub (ou use `git push`)
2. A Vercel detecta automaticamente e faz o redeploy em 1-2 minutos
3. Não é necessário reinicializar o banco de dados (as tabelas já existem)

---

## ❓ Solução de Problemas Comuns

### "Erro de conexão com o banco de dados"
- Verifique se a variável `DATABASE_URL` foi configurada corretamente na Vercel
- Confirme que a string de conexão está completa e inclui `?sslmode=require`

### "Usuário não encontrado" no login
- Certifique-se de ter acessado `/api/init-db` após o deploy
- Verifique se o banco foi inicializado com sucesso

### "Erro 500 - Erro interno do servidor"
- Acesse o painel da Vercel → seu projeto → aba **"Functions"** → clique na função com erro
- Leia os logs para identificar o problema

### O sistema não carrega
- Verifique se o arquivo `vercel.json` está na raiz do projeto
- Confirme que a pasta `public/` contém `index.html`, `style.css` e `scripts.js`

---

## 📞 Suporte

Em caso de dúvidas:
- **Neon:** [https://neon.tech/docs](https://neon.tech/docs)
- **Vercel:** [https://vercel.com/docs](https://vercel.com/docs)

---

*EcoMaintain — Sistema de Gestão de Manutenção Florestal*  
*Versão com integração Neon (PostgreSQL) + Vercel Serverless*
