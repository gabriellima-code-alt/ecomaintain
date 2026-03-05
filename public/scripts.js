/* ============================================
   ECOMAINTAIN - SISTEMA DE GESTÃO DE MANUTENÇÃO
   Versão com integração Neon (PostgreSQL) + Vercel
   ============================================ */

// ============================================
// CONFIGURAÇÃO DA API
// ============================================

// Base URL da API - detecta automaticamente o ambiente
const API_BASE = window.location.origin + '/api';

// ============================================
// GERENCIAMENTO DE DADOS (API Neon via Vercel)
// ============================================

const DB = {
    // Cache local para sessão do usuário (não persiste dados de negócio)
    _cache: {
        currentUser: null,
        currentUserRole: null
    },

    // Inicializar (verificar sessão salva)
    init() {
        const sessao = sessionStorage.getItem('ecomaintain_sessao');
        if (sessao) {
            try {
                const dados = JSON.parse(sessao);
                this._cache.currentUser = dados.currentUser;
                this._cache.currentUserRole = dados.currentUserRole;
            } catch(e) {
                sessionStorage.removeItem('ecomaintain_sessao');
            }
        }
    },

    // ---- USUÁRIO / SESSÃO ----
    setCurrentUser(user, role) {
        this._cache.currentUser = user;
        this._cache.currentUserRole = role;
        sessionStorage.setItem('ecomaintain_sessao', JSON.stringify({
            currentUser: user,
            currentUserRole: role
        }));
    },

    getCurrentUser() {
        return this._cache.currentUser;
    },

    getCurrentUserRole() {
        return this._cache.currentUserRole;
    },

    logout() {
        this._cache.currentUser = null;
        this._cache.currentUserRole = null;
        sessionStorage.removeItem('ecomaintain_sessao');
    },

    // ---- MANUTENTORES ----
    async obterManutentores() {
        try {
            const resp = await fetch(`${API_BASE}/manutentores`);
            if (!resp.ok) throw new Error('Erro ao buscar manutentores');
            return await resp.json();
        } catch(e) {
            console.error(e);
            return [];
        }
    },

    async adicionarManutentor(manutentor) {
        const resp = await fetch(`${API_BASE}/manutentores`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(manutentor)
        });
        const data = await resp.json();
        if (!resp.ok) throw new Error(data.erro || 'Erro ao cadastrar manutentor');
        return data.manutentor;
    },

    async removerManutentor(id) {
        const resp = await fetch(`${API_BASE}/manutentores?id=${id}`, { method: 'DELETE' });
        if (!resp.ok) {
            const data = await resp.json();
            throw new Error(data.erro || 'Erro ao remover manutentor');
        }
    },

    async atualizarManutentor(id, email, senha) {
        const resp = await fetch(`${API_BASE}/manutentores`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id, email, senha })
        });
        if (!resp.ok) {
            const data = await resp.json();
            throw new Error(data.erro || 'Erro ao atualizar');
        }
    },

    // ---- MÁQUINAS ----
    async obterMaquinas() {
        try {
            const resp = await fetch(`${API_BASE}/maquinas`);
            if (!resp.ok) throw new Error('Erro ao buscar máquinas');
            return await resp.json();
        } catch(e) {
            console.error(e);
            return [];
        }
    },

    async adicionarMaquina(maquina) {
        const resp = await fetch(`${API_BASE}/maquinas`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(maquina)
        });
        const data = await resp.json();
        if (!resp.ok) throw new Error(data.erro || 'Erro ao cadastrar máquina');
        return data.maquina;
    },

    async removerMaquina(id) {
        const resp = await fetch(`${API_BASE}/maquinas?id=${id}`, { method: 'DELETE' });
        if (!resp.ok) {
            const data = await resp.json();
            throw new Error(data.erro || 'Erro ao remover máquina');
        }
    },

    // ---- PEÇAS ----
    async obterPecas() {
        try {
            const resp = await fetch(`${API_BASE}/pecas`);
            if (!resp.ok) throw new Error('Erro ao buscar peças');
            return await resp.json();
        } catch(e) {
            console.error(e);
            return [];
        }
    },

    async adicionarPeca(peca) {
        const resp = await fetch(`${API_BASE}/pecas`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(peca)
        });
        const data = await resp.json();
        if (!resp.ok) throw new Error(data.erro || 'Erro ao adicionar peça');
        return data.peca;
    },

    async removerPeca(id) {
        const resp = await fetch(`${API_BASE}/pecas?id=${id}`, { method: 'DELETE' });
        if (!resp.ok) {
            const data = await resp.json();
            throw new Error(data.erro || 'Erro ao remover peça');
        }
    },

    async atualizarPeca(id, quantidade) {
        const resp = await fetch(`${API_BASE}/pecas`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id, quantidade })
        });
        if (!resp.ok) {
            const data = await resp.json();
            throw new Error(data.erro || 'Erro ao atualizar peça');
        }
    },

    // ---- ORDENS DE SERVIÇO ----
    async obterOS() {
        try {
            const resp = await fetch(`${API_BASE}/ordens-servico`);
            if (!resp.ok) throw new Error('Erro ao buscar ordens de serviço');
            return await resp.json();
        } catch(e) {
            console.error(e);
            return [];
        }
    },

    async obterOSAtivas() {
        try {
            const resp = await fetch(`${API_BASE}/ordens-servico?status=ativa`);
            if (!resp.ok) throw new Error('Erro ao buscar OS ativas');
            return await resp.json();
        } catch(e) {
            console.error(e);
            return [];
        }
    },

    async obterOSPendentes() {
        try {
            const resp = await fetch(`${API_BASE}/ordens-servico?status=pendente`);
            if (!resp.ok) throw new Error('Erro ao buscar OS pendentes');
            return await resp.json();
        } catch(e) {
            console.error(e);
            return [];
        }
    },

    async obterOSPorId(id) {
        try {
            const resp = await fetch(`${API_BASE}/ordens-servico?id=${id}`);
            if (!resp.ok) throw new Error('Erro ao buscar OS');
            return await resp.json();
        } catch(e) {
            console.error(e);
            return null;
        }
    },

    async adicionarOS(os) {
        const resp = await fetch(`${API_BASE}/ordens-servico`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(os)
        });
        const data = await resp.json();
        if (!resp.ok) throw new Error(data.erro || 'Erro ao criar OS');
        return data.os;
    },

    async atualizarOS(id, updates) {
        const resp = await fetch(`${API_BASE}/ordens-servico`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id, ...updates })
        });
        if (!resp.ok) {
            const data = await resp.json();
            throw new Error(data.erro || 'Erro ao atualizar OS');
        }
    },

    async adicionarApontamento(osId, apontamento) {
        const resp = await fetch(`${API_BASE}/ordens-servico`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: osId, apontamento })
        });
        if (!resp.ok) {
            const data = await resp.json();
            throw new Error(data.erro || 'Erro ao adicionar apontamento');
        }
    },

    async adicionarPecasOS(osId, pecas) {
        const resp = await fetch(`${API_BASE}/ordens-servico`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: osId, pecas })
        });
        if (!resp.ok) {
            const data = await resp.json();
            throw new Error(data.erro || 'Erro ao registrar peças na OS');
        }
    },

    // ---- AGENDA PREVENTIVA ----
    async obterAgendaPreventiva(idUsuario) {
        try {
            const url = idUsuario
                ? `${API_BASE}/agenda-preventiva?idUsuario=${idUsuario}`
                : `${API_BASE}/agenda-preventiva`;
            const resp = await fetch(url);
            if (!resp.ok) throw new Error('Erro ao buscar agenda');
            return await resp.json();
        } catch(e) {
            console.error(e);
            return [];
        }
    },

    async adicionarAgendamento(agendamento) {
        const resp = await fetch(`${API_BASE}/agenda-preventiva`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(agendamento)
        });
        const data = await resp.json();
        if (!resp.ok) throw new Error(data.erro || 'Erro ao criar agendamento');
        return data.agendamento;
    },

    async atualizarAgendamento(id, status, checklistData = null) {
        const body = { id, status };
        if (checklistData) {
            body.checklist_itens = checklistData.itens || [];
            body.checklist_observacoes = checklistData.observacoes || null;
            body.laudo_gerado = checklistData.laudoGerado || false;
        }
        const resp = await fetch(`${API_BASE}/agenda-preventiva`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });
        if (!resp.ok) {
            const data = await resp.json();
            throw new Error(data.erro || 'Erro ao atualizar agendamento');
        }
    },

    async removerAgendamento(id) {
        const resp = await fetch(`${API_BASE}/agenda-preventiva?id=${id}`, { method: 'DELETE' });
        if (!resp.ok) {
            const data = await resp.json();
            throw new Error(data.erro || 'Erro ao remover agendamento');
        }
    }
};

// ============================================
// GERENCIAMENTO DE INTERFACE
// ============================================

const UI = {
    // Renderizar tela de login
    renderLogin() {
        document.getElementById('app').innerHTML = `
            <div class="app-container">
                <div class="content" style="display: flex; align-items: center; justify-content: center; background: linear-gradient(135deg, #1f7e3d 0%, #27a94d 100%);">
                    <div class="card" style="width: 100%; max-width: 400px; background-color: white;">
                        <div style="text-align: center; margin-bottom: 30px;">
                            <div class="logo-icon" style="width: 60px; height: 60px; font-size: 30px; margin: 0 auto;">🌲</div>
                            <h1 style="color: #1f7e3d; margin-top: 15px;">EcoMaintain</h1>
                            <p style="color: #757575; margin-top: 5px;">Sistema de Gestão de Manutenção</p>
                        </div>

                        <div class="alert alert-info" style="margin-bottom: 20px;">
                            <strong>ℹ️ Informação:</strong> Manutentores devem ser cadastrados pelo PCM. Faça login com as credenciais fornecidas.
                        </div>

                        <div class="form-group">
                            <label class="form-label">Email ou Usuário:</label>
                            <input type="text" id="loginEmail" class="form-control" placeholder="Digite seu email">
                        </div>

                        <div class="form-group">
                            <label class="form-label">Senha:</label>
                            <input type="password" id="loginPassword" class="form-control" placeholder="Digite sua senha">
                        </div>

                        <button class="btn btn-primary btn-block" onclick="AUTH.login()">Entrar</button>

                        <div style="text-align: center; margin-top: 15px;">
                            <button class="btn btn-secondary btn-block" onclick="AUTH.showRecuperarSenha()" style="background-color: #757575;">🔑 Esqueci minha Senha</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },

    // Renderizar tela de recuperação de senha
    renderRecuperarSenha() {
        document.getElementById('app').innerHTML = `
            <div class="app-container">
                <div class="content" style="display: flex; align-items: center; justify-content: center; background: linear-gradient(135deg, #1f7e3d 0%, #27a94d 100%);">
                    <div class="card" style="width: 100%; max-width: 400px; background-color: white;">
                        <h2 style="color: #1f7e3d; margin-bottom: 20px;">Recuperar Senha</h2>

                        <div class="form-group">
                            <label class="form-label">Email Cadastrado:</label>
                            <input type="email" id="emailRecuperacao" class="form-control" placeholder="seu@email.com">
                        </div>

                        <div class="alert alert-info">
                            <strong>ℹ️ Nota:</strong> Contate o PCM para recuperar sua senha. Um código de recuperação será enviado.
                        </div>

                        <div style="display: flex; gap: 10px;">
                            <button class="btn btn-primary btn-block" onclick="AUTH.enviarRecuperacao()">Enviar Código</button>
                            <button class="btn btn-secondary btn-block" onclick="AUTH.showLogin()">Voltar</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },

    // Renderizar Modo Auditoria
    renderModoAuditoria(osId) {
        AUDITORIA.renderizar(osId);
    },

    // Renderizar Dashboard do manutentor
    async renderDashboardManutentor() {
        const user = DB.getCurrentUser();
        // Mostrar loading
        document.getElementById('app').innerHTML = `
            <div class="app-container">
                <div class="content" style="display:flex;align-items:center;justify-content:center;">
                    <div style="text-align:center;"><div class="logo-icon" style="font-size:40px;">🌲</div><p>Carregando...</p></div>
                </div>
            </div>`;

        const [osAtivas, osPendentes, todasOS] = await Promise.all([
            DB.obterOSAtivas(),
            DB.obterOSPendentes(),
            DB.obterOS()
        ]);

        document.getElementById('app').innerHTML = `
            <div class="app-container">
                <div class="sidebar">
                    <div class="logo-section">
                        <div class="logo-icon">🌲</div>
                        <div class="logo-text">EcoMaintain</div>
                    </div>
                    <ul class="nav-menu">
                        <li class="nav-item">
                            <a class="nav-link active" onclick="UI.renderDashboardManutentor()">
                                <span class="nav-icon">📊</span>
                                <span>Dashboard</span>
                            </a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link" onclick="UI.renderNovaOS()">
                                <span class="nav-icon">➕</span>
                                <span>Nova O.S.</span>
                            </a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link" onclick="UI.renderControleExecucao()">
                                <span class="nav-icon">⏱️</span>
                                <span>Execução</span>
                            </a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link" onclick="UI.renderRegistroPecas()">
                                <span class="nav-icon">📦</span>
                                <span>Peças</span>
                            </a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link" onclick="UI.renderFechamento()">
                                <span class="nav-icon">✅</span>
                                <span>Fechamento</span>
                            </a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link" onclick="UI.renderPainelOS()">
                                <span class="nav-icon">📋</span>
                                <span>Minhas O.S.</span>
                            </a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link" onclick="UI.renderChecklistPreventivo()">
                                <span class="nav-icon">✔️</span>
                                <span>Checklist</span>
                            </a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link" onclick="UI_MANUAIS_MANUTENTOR.renderConsultaManuais()">
                                <span class="nav-icon">📖</span>
                                <span>Manuais</span>
                            </a>
                        </li>
                    </ul>
                </div>

                <div class="main-content">
                    <div class="header">
                        <div class="header-title">
                            <div class="header-logo">🌲</div>
                            <span>Dashboard Manutentor</span>
                        </div>
                        <div class="user-info">
                            <span>${user.nome}</span>
                            <div class="user-avatar">${user.nome.charAt(0)}</div>
                            <button class="logout-btn" onclick="AUTH.logout()">Sair</button>
                        </div>
                    </div>

                    <div class="content">
                        <div class="dashboard-header">
                            <h1 class="dashboard-title">Bem-vindo, ${user.nome}!</h1>
                            <p class="dashboard-subtitle">Turno: ${user.turnoInicio || '--'} - ${user.turnoFim || '--'} | Almoço: ${user.almocoInicio || '--'} - ${user.almocoFim || '--'}</p>
                        </div>

                        <div class="dashboard-grid">
                            <div class="stat-card">
                                <div class="stat-label">Ordens Ativas</div>
                                <div class="stat-value">${osAtivas.length}</div>
                            </div>
                            <div class="stat-card">
                                <div class="stat-label">Ordens Pendentes</div>
                                <div class="stat-value">${osPendentes.length}</div>
                            </div>
                            <div class="stat-card">
                                <div class="stat-label">Total de O.S.</div>
                                <div class="stat-value">${todasOS.length}</div>
                            </div>
                        </div>

                        <div class="card">
                            <h3 class="card-title">Ações Rápidas</h3>
                            <div class="grid grid-2">
                                <button class="btn btn-primary btn-lg" onclick="UI.renderNovaOS()">
                                    ➡️ Nova Abertura
                                </button>
                                <button class="btn btn-success btn-lg" onclick="UI.renderControleExecucao()">
                                    ⏱️ Controle de Execução
                                </button>
                                <button class="btn btn-warning btn-lg" onclick="UI.renderRegistroPecas()">
                                    📦 Registrar Peças
                                </button>
                                <button class="btn btn-danger btn-lg" onclick="UI.renderFechamento()">
                                    ✅ Fechamento
                                </button>
                                <button class="btn btn-lg" style="background-color: #2e7d32;" onclick="UI_MANUAIS_MANUTENTOR.renderConsultaManuais()">
                                    📖 Manuais Técnicos
                                </button>
                                <button class="btn btn-lg" style="background-color: #558b2f;" onclick="UI.renderChecklistPreventivo()">
                                    ✔️ Checklist Preventivo
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },

    // Renderizar Nova O.S.
    renderNovaOS() {
        document.querySelector('.content').innerHTML = `
            <div class="dashboard-header">
                <h1 class="dashboard-title">Nova Abertura de Ordem de Serviço</h1>
            </div>

            <div class="card">
                <form id="formNovaOS">
                    <div class="row">
                        <div class="col">
                            <div class="form-group">
                                <label class="form-label">ID da Máquina <span style="color: red;">*</span></label>
                                <div style="display: flex; gap: 10px;">
                                    <input type="text" id="osIdMaquina" class="form-control" placeholder="Digite o ID ou escaneie o QR">
                                    <button type="button" class="btn btn-secondary" onclick="SCANNER.iniciar()">📱 Escanear</button>
                                </div>
                            </div>
                        </div>
                        <div class="col">
                            <div class="form-group">
                                <label class="form-label">Descrição do Problema <span style="color: red;">*</span></label>
                                <textarea id="osDescricao" class="form-control" placeholder="Descreva o problema em detalhes" minlength="10"></textarea>
                                <small style="color: #757575;">Mínimo 10 caracteres</small>
                            </div>
                        </div>
                    </div>

                    <div class="form-group">
                        <label class="form-label">Anexar Foto (Opcional)</label>
                        <input type="file" id="osFoto" class="form-control" accept="image/*">
                    </div>

                    <div class="row">
                        <div class="col">
                            <div class="form-group">
                                <label class="form-label">Data</label>
                                <input type="date" id="osData" class="form-control" readonly>
                            </div>
                        </div>
                        <div class="col">
                            <div class="form-group">
                                <label class="form-label">Hora</label>
                                <input type="time" id="osHora" class="form-control" readonly>
                            </div>
                        </div>
                    </div>

                    <div id="reader" class="active"></div>

                    <div style="display: flex; gap: 10px; margin-top: 20px;">
                        <button type="button" class="btn btn-primary" onclick="OS.criar()">Registrar O.S.</button>
                        <button type="button" class="btn btn-secondary" onclick="UI.renderDashboardManutentor()">Cancelar</button>
                    </div>
                </form>
            </div>
        `;

        const agora = new Date();
        document.getElementById('osData').value = agora.toISOString().split('T')[0];
        document.getElementById('osHora').value = agora.toTimeString().slice(0, 5);
    },

    // Renderizar Controle de Execução
    async renderControleExecucao() {
        const osAtivas = await DB.obterOSAtivas();
        document.querySelector('.content').innerHTML = `
            <div class="dashboard-header">
                <h1 class="dashboard-title">Controle de Execução</h1>
            </div>

            <div class="card">
                <div class="form-group">
                    <label class="form-label">Selecione a O.S.</label>
                    <select id="selectOS" class="form-control">
                        <option value="">-- Escolha uma O.S. --</option>
                        ${osAtivas.map(os => `<option value="${os.id}">${os.id} - ${os.maquinaId}</option>`).join('')}
                    </select>
                </div>

                <div style="text-align: center; margin: 30px 0;">
                    <button class="btn btn-success btn-lg" onclick="EXECUCAO.iniciar()">▶️ Iniciar</button>
                    <button class="btn btn-warning btn-lg" onclick="EXECUCAO.pausar()">⏸️ Pausar</button>
                </div>

                <div>
                    <h3 class="card-title">Histórico de Apontamentos</h3>
                    <div id="historicoApontamentos" class="list-group"></div>
                </div>
            </div>
        `;
    },

    // Renderizar Registro de Peças
    async renderRegistroPecas() {
        const [osAtivas, pecas] = await Promise.all([DB.obterOSAtivas(), DB.obterPecas()]);
        document.querySelector('.content').innerHTML = `
            <div class="dashboard-header">
                <h1 class="dashboard-title">Registro de Peças e Insumos</h1>
            </div>

            <div class="card">
                <div class="form-group">
                    <label class="form-label">Selecione a O.S.</label>
                    <select id="selectOSPecas" class="form-control">
                        <option value="">-- Escolha uma O.S. --</option>
                        ${osAtivas.map(os => `<option value="${os.id}">${os.id} - ${os.maquinaId}</option>`).join('')}
                    </select>
                </div>

                <h3 class="card-title" style="margin-top: 20px;">Adicionar Peças</h3>
                <div id="listaPecas">
                    <div class="row peca-item" style="margin-bottom: 15px;">
                        <div class="col">
                            <select class="form-control peca-select">
                                <option value="">-- Selecione uma peça --</option>
                                ${pecas.map(p => `<option value="${p.id}">${p.nome} (${p.quantidade} em estoque)</option>`).join('')}
                            </select>
                        </div>
                        <div class="col" style="flex: 0 0 120px;">
                            <input type="number" class="form-control peca-quantidade" placeholder="Quantidade" min="1">
                        </div>
                        <div class="col" style="flex: 0 0 100px;">
                            <button type="button" class="btn btn-danger" onclick="PECAS.removerLinha(this)">🗑️ Remover</button>
                        </div>
                    </div>
                </div>

                <button type="button" class="btn btn-secondary" onclick="PECAS.adicionarLinha()">➕ Adicionar Outra Peça</button>

                <div style="display: flex; gap: 10px; margin-top: 20px;">
                    <button type="button" class="btn btn-primary" onclick="PECAS.salvar()">Salvar Peças</button>
                    <button type="button" class="btn btn-secondary" onclick="UI.renderDashboardManutentor()">Cancelar</button>
                </div>
            </div>
        `;
        // Guardar peças em cache para adicionarLinha
        window._pecasCache = pecas;
    },

    // Renderizar Fechamento
    async renderFechamento() {
        const osAtivas = await DB.obterOSAtivas();
        document.querySelector('.content').innerHTML = `
            <div class="dashboard-header">
                <h1 class="dashboard-title">Fechamento e Evidências</h1>
            </div>

            <div class="card">
                <div class="form-group">
                    <label class="form-label">Selecione a O.S. <span style="color: red;">*</span></label>
                    <select id="selectOSFechamento" class="form-control">
                        <option value="">-- Escolha uma O.S. --</option>
                        ${osAtivas.map(os => `<option value="${os.id}">${os.id} - ${os.maquinaId}</option>`).join('')}
                    </select>
                </div>

                <div class="form-group">
                    <label class="form-label">Status Final <span style="color: red;">*</span></label>
                    <select id="statusFinal" class="form-control">
                        <option value="">-- Selecione --</option>
                        <option value="finalizado">Finalizado com Sucesso</option>
                        <option value="pendente">Pendente (Peça Externa)</option>
                    </select>
                </div>

                <div class="form-group">
                    <label class="form-label">Descrição do Serviço <span style="color: red;">*</span></label>
                    <textarea id="descricaoServico" class="form-control" placeholder="Descreva o que foi feito" minlength="10"></textarea>
                    <small style="color: #757575;">Mínimo 10 caracteres</small>
                </div>

                <div class="row">
                    <div class="col">
                        <div class="form-group">
                            <label class="form-label">Data de Conclusão</label>
                            <input type="date" id="dataConclusao" class="form-control" readonly>
                        </div>
                    </div>
                    <div class="col">
                        <div class="form-group">
                            <label class="form-label">Hora de Conclusão</label>
                            <input type="time" id="horaConclusao" class="form-control" readonly>
                        </div>
                    </div>
                </div>

                <div class="form-group">
                    <label class="form-label">Anexar Evidências (Fotos) <span style="color: red;">*</span></label>
                    <input type="file" id="fotoEvidencia" class="form-control" accept="image/*" multiple>
                    <small style="color: #757575;">Selecione uma ou mais fotos (obrigatório)</small>
                    <div id="previewFotos" style="margin-top: 10px; display: grid; grid-template-columns: repeat(auto-fill, minmax(100px, 1fr)); gap: 10px;"></div>
                </div>

                <div class="form-group">
                    <label class="form-label">Assinatura Digital <span style="color: red;">*</span></label>
                    <canvas id="signatureCanvas" style="border: 2px solid #e0e0e0; border-radius: 6px; background-color: white; cursor: crosshair; display: block; margin: 10px 0; width: 100%; height: 150px;"></canvas>
                    <small style="color: #757575;">Assine com o dedo ou mouse para confirmar</small>
                    <button type="button" class="btn btn-secondary btn-sm" onclick="ASSINATURA.limpar()" style="margin-top: 10px;">🗑️ Limpar Assinatura</button>
                </div>

                <div id="historicoExecucao" style="margin-top: 20px; padding: 15px; background-color: #f5f5f5; border-radius: 6px;">
                    <h4 style="color: #1f7e3d; margin-bottom: 10px;">📊 Resumo da Execução</h4>
                    <div id="resumoExecucao">Selecione uma O.S. para ver o resumo</div>
                </div>

                <div style="display: flex; gap: 10px; margin-top: 20px;">
                    <button type="button" class="btn btn-primary" onclick="FECHAMENTO.finalizar()">✅ Finalizar O.S.</button>
                    <button type="button" class="btn btn-secondary" onclick="UI.renderDashboardManutentor()">Cancelar</button>
                </div>
            </div>
        `;

        const agora = new Date();
        document.getElementById('dataConclusao').value = agora.toISOString().split('T')[0];
        document.getElementById('horaConclusao').value = agora.toTimeString().slice(0, 5);

        ASSINATURA.inicializar();

        document.getElementById('selectOSFechamento').addEventListener('change', function() {
            FECHAMENTO.atualizarResumo(this.value);
        });
    },

    // Renderizar Painel de O.S.
    async renderPainelOS() {
        const [osAtivas, osPendentes] = await Promise.all([DB.obterOSAtivas(), DB.obterOSPendentes()]);
        document.querySelector('.content').innerHTML = `
            <div class="dashboard-header">
                <h1 class="dashboard-title">Minhas Ordens de Serviço</h1>
            </div>

            <div class="filter-bar">
                <button class="filter-btn active" onclick="UI.filtrarOS('todas', this)">Todas (${osAtivas.length + osPendentes.length})</button>
                <button class="filter-btn" onclick="UI.filtrarOS('ativas', this)">Ativas (${osAtivas.length})</button>
                <button class="filter-btn" onclick="UI.filtrarOS('pendentes', this)">Pendentes (${osPendentes.length})</button>
            </div>

            <div id="listaPainelOS">
                ${this.renderListaOS([...osAtivas, ...osPendentes])}
            </div>
        `;
        window._osAtivasCache = osAtivas;
        window._osPendentesCache = osPendentes;
    },

    renderListaOS(lista) {
        if (lista.length === 0) {
            return '<div class="alert alert-info">Nenhuma ordem de serviço encontrada.</div>';
        }

        return `
            <div class="grid grid-2">
                ${lista.map(os => `
                    <div class="card">
                        <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 15px;">
                            <div>
                                <h3 class="card-title">${os.id}</h3>
                                <p class="card-text">Máquina: ${os.maquinaId}</p>
                            </div>
                            <span class="badge ${os.status === 'ativa' ? 'badge-success' : 'badge-warning'}">${os.status}</span>
                        </div>
                        <p class="card-text"><strong>Problema:</strong> ${os.descricao}</p>
                        <p class="card-text"><strong>Data:</strong> ${os.dataCriacao ? os.dataCriacao.split('T')[0] : '--'}</p>
                        <p class="card-text"><strong>Apontamentos:</strong> ${os.apontamentos ? os.apontamentos.length : 0}</p>
                    </div>
                `).join('')}
            </div>
        `;
    },

    filtrarOS(filtro, btn) {
        const osAtivas = window._osAtivasCache || [];
        const osPendentes = window._osPendentesCache || [];
        let lista = [];

        if (filtro === 'todas') lista = [...osAtivas, ...osPendentes];
        else if (filtro === 'ativas') lista = osAtivas;
        else if (filtro === 'pendentes') lista = osPendentes;

        document.getElementById('listaPainelOS').innerHTML = this.renderListaOS(lista);

        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        if (btn) btn.classList.add('active');
    },

    // Renderizar Dashboard do PCM
    async renderDashboardPCM() {
        const user = DB.getCurrentUser();
        document.getElementById('app').innerHTML = `
            <div class="app-container">
                <div class="content" style="display:flex;align-items:center;justify-content:center;">
                    <div style="text-align:center;"><div class="logo-icon" style="font-size:40px;">🌲</div><p>Carregando...</p></div>
                </div>
            </div>`;

        const [osAtivas, osPendentes, todasOS, manutentores] = await Promise.all([
            DB.obterOSAtivas(),
            DB.obterOSPendentes(),
            DB.obterOS(),
            DB.obterManutentores()
        ]);

        document.getElementById('app').innerHTML = `
            <div class="app-container">
                <div class="sidebar">
                    <div class="logo-section">
                        <div class="logo-icon">🌲</div>
                        <div class="logo-text">EcoMaintain PCM</div>
                    </div>
                    <ul class="nav-menu">
                        <li class="nav-item">
                            <a class="nav-link active" onclick="UI.renderDashboardPCM()">
                                <span class="nav-icon">📊</span>
                                <span>Dashboard</span>
                            </a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link" onclick="UI.renderGestaoOS()">
                                <span class="nav-icon">📋</span>
                                <span>Gestão de O.S.</span>
                            </a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link" onclick="UI.renderEstoque()">
                                <span class="nav-icon">📦</span>
                                <span>Estoque</span>
                            </a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link" onclick="UI.renderManutentores()">
                                <span class="nav-icon">👥</span>
                                <span>Manutentores</span>
                            </a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link" onclick="UI.renderRelatorios()">
                                <span class="nav-icon">📈</span>
                                <span>Relatórios</span>
                            </a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link" onclick="UI.renderAgendaPreventiva()">
                                <span class="nav-icon">📅</span>
                                <span>Agenda Preventiva</span>
                            </a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link" onclick="UI_MANUAIS_PCM.renderGestaoManuais()">
                                <span class="nav-icon">🌲</span>
                                <span>Manuais</span>
                            </a>
                        </li>
                    </ul>
                </div>

                <div class="main-content">
                    <div class="header">
                        <div class="header-title">
                            <div class="header-logo">🌲</div>
                            <span>Dashboard PCM</span>
                        </div>
                        <div class="user-info">
                            <span>${user.nome}</span>
                            <div class="user-avatar">${user.nome.charAt(0)}</div>
                            <button class="logout-btn" onclick="AUTH.logout()">Sair</button>
                        </div>
                    </div>

                    <div class="content">
                        <div class="dashboard-header">
                            <h1 class="dashboard-title">Bem-vindo, ${user.nome}!</h1>
                            <p class="dashboard-subtitle">Planejamento e Controle de Manutenção</p>
                        </div>

                        <div class="dashboard-grid">
                            <div class="stat-card">
                                <div class="stat-label">O.S. Ativas</div>
                                <div class="stat-value">${osAtivas.length}</div>
                            </div>
                            <div class="stat-card">
                                <div class="stat-label">O.S. Pendentes</div>
                                <div class="stat-value" style="color: #ff9800;">${osPendentes.length}</div>
                            </div>
                            <div class="stat-card">
                                <div class="stat-label">Total de O.S.</div>
                                <div class="stat-value">${todasOS.length}</div>
                            </div>
                            <div class="stat-card">
                                <div class="stat-label">Manutentores</div>
                                <div class="stat-value">${manutentores.length}</div>
                            </div>
                        </div>

                        <div class="card">
                            <h3 class="card-title">Ações Rápidas</h3>
                            <div class="grid grid-2">
                                <button class="btn btn-primary btn-lg" onclick="UI.renderGestaoOS()">
                                    📋 Gestão de O.S.
                                </button>
                                <button class="btn btn-success btn-lg" onclick="UI.renderEstoque()">
                                    📦 Estoque
                                </button>
                                <button class="btn btn-warning btn-lg" onclick="UI.renderManutentores()">
                                    👥 Manutentores
                                </button>
                                <button class="btn btn-danger btn-lg" onclick="UI.renderRelatorios()">
                                    📈 Relatórios
                                </button>
                                <button class="btn btn-lg" style="background-color: #2e7d32;" onclick="UI_MANUAIS_PCM.renderGestaoManuais()">
                                    🌲 Manuais Técnicos
                                </button>
                                <button class="btn btn-lg" style="background-color: #558b2f;" onclick="UI.renderAgendaPreventiva()">
                                    📅 Agenda Preventiva
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },

    // Renderizar Gestão de O.S. (PCM)
    async renderGestaoOS() {
        const [osAtivas, osPendentes] = await Promise.all([DB.obterOSAtivas(), DB.obterOSPendentes()]);
        window._osAtivasPCM = osAtivas;
        window._osPendentesPCM = osPendentes;

        document.querySelector('.content').innerHTML = `
            <div class="dashboard-header">
                <h1 class="dashboard-title">Gestão de Ordens de Serviço</h1>
            </div>

            <div class="filter-bar">
                <button class="filter-btn active" onclick="UI.filtrarOSPCM('todas', this)">Todas (${osAtivas.length + osPendentes.length})</button>
                <button class="filter-btn" onclick="UI.filtrarOSPCM('ativas', this)">Ativas (${osAtivas.length})</button>
                <button class="filter-btn" onclick="UI.filtrarOSPCM('pendentes', this)">Pendentes (${osPendentes.length})</button>
            </div>

            <div id="listaGestaoOS">
                ${this.renderTabelaOS([...osAtivas, ...osPendentes])}
            </div>
        `;
    },

    renderTabelaOS(lista) {
        if (lista.length === 0) {
            return '<div class="alert alert-info">Nenhuma ordem de serviço encontrada.</div>';
        }

        return `
            <table class="table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Máquina</th>
                        <th>Problema</th>
                        <th>Status</th>
                        <th>Data</th>
                        <th>Ações</th>
                    </tr>
                </thead>
                <tbody>
                    ${lista.map(os => `
                        <tr>
                            <td><strong>${os.id}</strong></td>
                            <td>${os.maquinaId}</td>
                            <td>${os.descricao.substring(0, 30)}...</td>
                            <td><span class="badge ${os.status === 'ativa' ? 'badge-success' : 'badge-warning'}">${os.status}</span></td>
                            <td>${os.dataCriacao ? os.dataCriacao.split('T')[0] : '--'}</td>
                            <td>
                                <button class="btn btn-sm btn-secondary" onclick="UI.visualizarOS('${os.id}')">Ver</button>
                                ${os.status === 'pendente' ? `<button class="btn btn-sm btn-success" onclick="PCM.liberarOS('${os.id}')">Liberar</button>` : ''}
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    },

    filtrarOSPCM(filtro, btn) {
        const osAtivas = window._osAtivasPCM || [];
        const osPendentes = window._osPendentesPCM || [];
        let lista = [];

        if (filtro === 'todas') lista = [...osAtivas, ...osPendentes];
        else if (filtro === 'ativas') lista = osAtivas;
        else if (filtro === 'pendentes') lista = osPendentes;

        document.getElementById('listaGestaoOS').innerHTML = this.renderTabelaOS(lista);
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        if (btn) btn.classList.add('active');
    },

    async visualizarOS(osId) {
        const os = await DB.obterOSPorId(osId);
        if (!os) return;

        const tempoTotal = new Date(os.dataFechamento || new Date()) - new Date(os.dataCriacao);
        const horas = Math.floor(tempoTotal / 3600000);
        const minutos = Math.floor((tempoTotal % 3600000) / 60000);

        alert(`
Ordem de Serviço: ${os.id}
Máquina: ${os.maquinaId}
Problema: ${os.descricao}
Status: ${os.status}
Data Criação: ${os.dataCriacao}
Apontamentos: ${os.apontamentos ? os.apontamentos.length : 0}
Tempo Total: ${horas}h ${minutos}m
        `);
    },

    // Renderizar Estoque (PCM)
    async renderEstoque() {
        const [pecas, maquinas] = await Promise.all([DB.obterPecas(), DB.obterMaquinas()]);

        document.querySelector('.content').innerHTML = `
            <div class="dashboard-header">
                <h1 class="dashboard-title">Gestão de Estoque</h1>
            </div>

            <div class="card">
                <h3 class="card-title">Cadastrar Nova Máquina</h3>
                <div class="row">
                    <div class="col">
                        <input type="text" id="idMaquina" class="form-control" placeholder="ID da Máquina (ex: HARV-01)">
                    </div>
                    <div class="col">
                        <input type="text" id="nomeMaquina" class="form-control" placeholder="Nome da Máquina">
                    </div>
                </div>
                <div class="row" style="margin-top: 10px;">
                    <div class="col">
                        <input type="text" id="especMaquina" class="form-control" placeholder="Especificações Técnicas">
                    </div>
                </div>
                <div class="row" style="margin-top: 10px;">
                    <div class="col">
                        <textarea id="historicoMaquina" class="form-control" placeholder="Histórico da Máquina (defeitos antigos, observações, etc)" rows="3"></textarea>
                    </div>
                </div>
                <button type="button" class="btn btn-success btn-block" onclick="PCM.cadastrarMaquina()" style="margin-top: 10px;">+ Cadastrar Máquina</button>
            </div>

            <div class="card" style="margin-top: 20px;">
                <h3 class="card-title">Máquinas Cadastradas</h3>
                <div id="lista-maquinas">
                    ${maquinas.length === 0 ? '<p style="color: #999;">Nenhuma máquina cadastrada.</p>' :
                        maquinas.map(m => `
                            <div style="padding: 15px; border: 1px solid #ddd; border-radius: 5px; margin-bottom: 10px;">
                                <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px;">
                                    <div><strong>ID:</strong> ${m.id}</div>
                                    <div><strong>Nome:</strong> ${m.nome}</div>
                                </div>
                                <div style="margin-top: 10px;"><strong>Especificações:</strong> ${m.especificacoes || '--'}</div>
                                <div style="margin-top: 10px;"><strong>Histórico:</strong> ${m.historico || '--'}</div>
                                <button class="btn btn-sm btn-danger" onclick="PCM.removerMaquina('${m.id}')" style="margin-top: 10px;">Remover</button>
                            </div>
                        `).join('')
                    }
                </div>
            </div>

            <div class="card" style="margin-top: 20px;">
                <h3 class="card-title">Adicionar Nova Peça</h3>
                <div class="row">
                    <div class="col">
                        <input type="text" id="nomePeca" class="form-control" placeholder="Nome da peça">
                    </div>
                    <div class="col" style="flex: 0 0 150px;">
                        <input type="number" id="quantidadePeca" class="form-control" placeholder="Quantidade" min="1">
                    </div>
                    <div class="col" style="flex: 0 0 150px;">
                        <input type="number" id="valorPeca" class="form-control" placeholder="Valor (R$)" min="0" step="0.01">
                    </div>
                    <div class="col" style="flex: 0 0 150px;">
                        <input type="number" id="minPeca" class="form-control" placeholder="Estoque Mínimo" min="1">
                    </div>
                    <div class="col" style="flex: 0 0 120px;">
                        <button type="button" class="btn btn-primary btn-block" onclick="PCM.adicionarPeca()">Adicionar</button>
                    </div>
                </div>
            </div>

            <div class="card" style="margin-top: 20px;">
                <h3 class="card-title">Peças em Estoque</h3>
                <table class="table">
                    <thead>
                        <tr>
                            <th>Nome</th>
                            <th>Quantidade</th>
                            <th>Valor Unitário</th>
                            <th>Estoque Mínimo</th>
                            <th>Status</th>
                            <th>Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${pecas.map(p => `
                            <tr>
                                <td>${p.nome}</td>
                                <td>${p.quantidade}</td>
                                <td>R$ ${parseFloat(p.valor).toFixed(2)}</td>
                                <td>${p.minimoEstoque}</td>
                                <td>
                                    ${p.quantidade <= p.minimoEstoque ? '<span class="badge badge-danger">Baixo</span>' : '<span class="badge badge-success">OK</span>'}
                                </td>
                                <td>
                                    <button class="btn btn-sm btn-danger" onclick="PCM.removerPeca('${p.id}')">Remover</button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    },

    // Renderizar Manutentores (PCM)
    async renderManutentores() {
        const manutentores = await DB.obterManutentores();
        document.querySelector('.content').innerHTML = `
            <div class="dashboard-header">
                <h1 class="dashboard-title">Gestão de Manutentores</h1>
            </div>

            <div class="card">
                <h3 class="card-title">Cadastrar Novo Manutentor</h3>
                <form id="formCadastroManutentor">
                    <div class="row">
                        <div class="col">
                            <div class="form-group">
                                <label class="form-label">Nome Completo <span style="color: red;">*</span></label>
                                <input type="text" id="nomeManutentor" class="form-control" placeholder="Digite o nome" required>
                            </div>
                        </div>
                        <div class="col">
                            <div class="form-group">
                                <label class="form-label">Email <span style="color: red;">*</span></label>
                                <input type="email" id="emailManutentor" class="form-control" placeholder="email@example.com" required>
                            </div>
                        </div>
                    </div>

                    <div class="row">
                        <div class="col">
                            <div class="form-group">
                                <label class="form-label">Senha <span style="color: red;">*</span></label>
                                <input type="password" id="senhaManutentor" class="form-control" placeholder="Digite uma senha" required>
                            </div>
                        </div>
                    </div>

                    <div class="row">
                        <div class="col">
                            <div class="form-group">
                                <label class="form-label">Turno - Início <span style="color: red;">*</span></label>
                                <input type="time" id="turnoInicio" class="form-control" required>
                            </div>
                        </div>
                        <div class="col">
                            <div class="form-group">
                                <label class="form-label">Turno - Fim <span style="color: red;">*</span></label>
                                <input type="time" id="turnoFim" class="form-control" required>
                            </div>
                        </div>
                    </div>

                    <div class="row">
                        <div class="col">
                            <div class="form-group">
                                <label class="form-label">Almoço - Início <span style="color: red;">*</span></label>
                                <input type="time" id="almocoInicio" class="form-control" required>
                            </div>
                        </div>
                        <div class="col">
                            <div class="form-group">
                                <label class="form-label">Almoço - Fim <span style="color: red;">*</span></label>
                                <input type="time" id="almocoFim" class="form-control" required>
                            </div>
                        </div>
                    </div>

                    <button type="button" class="btn btn-success btn-block" onclick="PCM.cadastrarManutentor()">+ Cadastrar Manutentor</button>
                </form>
            </div>

            <div class="card" style="margin-top: 20px;">
                <h3 class="card-title">Manutentores Cadastrados</h3>
                ${manutentores.length === 0 ? '<p style="color: #999;">Nenhum manutentor cadastrado ainda.</p>' : `
                <table class="table">
                    <thead>
                        <tr>
                            <th>Nome</th>
                            <th>Email</th>
                            <th>Turno</th>
                            <th>Almoço</th>
                            <th>Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${manutentores.map(m => `
                            <tr>
                                <td>${m.nome}</td>
                                <td>${m.email}</td>
                                <td>${m.turnoInicio || '--'} - ${m.turnoFim || '--'}</td>
                                <td>${m.almocoInicio || '--'} - ${m.almocoFim || '--'}</td>
                                <td>
                                    <button class="btn btn-sm btn-danger" onclick="PCM.removerManutentor('${m.id}')">Remover</button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
                `}
            </div>

            <div class="card" style="margin-top: 20px;">
                <h3 class="card-title">Configurações do PCM</h3>
                <div class="form-group">
                    <label class="form-label">Novo Email do PCM</label>
                    <input type="email" id="emailPCM" class="form-control" placeholder="novo@email.com">
                </div>
                <div class="form-group">
                    <label class="form-label">Nova Senha do PCM</label>
                    <input type="password" id="senhaPCM" class="form-control" placeholder="Nova senha (mínimo 4 caracteres)">
                </div>
                <button class="btn btn-primary" onclick="PCM.atualizarConfiguracao()">Salvar Configurações</button>
            </div>
        `;
    },

    // Renderizar Relatórios (PCM)
    renderRelatorios() {
        document.querySelector('.content').innerHTML = `
            <div class="dashboard-header">
                <h1 class="dashboard-title">Relatórios</h1>
            </div>

            <div class="grid grid-2">
                <div class="card">
                    <h3 class="card-title">📊 Relatório de Produtividade</h3>
                    <p class="card-text">Análise de horas trabalhadas por manutentor</p>
                    <button class="btn btn-primary btn-block" onclick="RELATORIOS.gerarProdutividade()">Gerar Relatório</button>
                </div>

                <div class="card">
                    <h3 class="card-title">💰 Relatório de Custos</h3>
                    <p class="card-text">Custo total de peças por ordem de serviço</p>
                    <button class="btn btn-primary btn-block" onclick="RELATORIOS.gerarCustos()">Gerar Relatório</button>
                </div>

                <div class="card">
                    <h3 class="card-title">📈 Análise de Falhas</h3>
                    <p class="card-text">Problemas mais recorrentes na frota</p>
                    <button class="btn btn-primary btn-block" onclick="RELATORIOS.gerarFalhas()">Gerar Relatório</button>
                </div>

                <div class="card">
                    <h3 class="card-title">📋 Histórico de Máquinas</h3>
                    <p class="card-text">Todas as manutenções realizadas por máquina</p>
                    <button class="btn btn-primary btn-block" onclick="RELATORIOS.gerarHistoricoMaquinas()">Gerar Relatório</button>
                </div>

                <div class="card">
                    <h3 class="card-title">📸 Fechamento de O.S.</h3>
                    <p class="card-text">Relatórios com evidências fotográficas e assinaturas</p>
                    <button class="btn btn-primary btn-block" onclick="RELATORIOS.listarRelatoriosFechamento()">Visualizar Relatórios</button>
                </div>
            </div>
        `;
    }
};

// ============================================
// AUTENTICAÇÃO
// ============================================

const AUTH = {
    showLogin() {
        UI.renderLogin();
    },

    async login() {
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;

        if (!email || !password) {
            NOTIFICACOES.erro('Preencha todos os campos!');
            return;
        }

        // Mostrar loading
        const btn = document.querySelector('.btn-primary');
        if (btn) { btn.disabled = true; btn.textContent = 'Entrando...'; }

        try {
            const resp = await fetch(`${API_BASE}/auth`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'login', email, senha: password })
            });

            const data = await resp.json();

            if (!resp.ok) {
                NOTIFICACOES.erro(data.erro || 'Erro ao fazer login.');
                if (btn) { btn.disabled = false; btn.textContent = 'Entrar'; }
                return;
            }

            const usuario = data.usuario;
            DB.setCurrentUser(usuario, usuario.role);
            NOTIFICACOES.sucesso('Login realizado com sucesso!');

            setTimeout(() => {
                if (usuario.role === 'pcm') {
                    UI.renderDashboardPCM();
                } else {
                    UI.renderDashboardManutentor();
                }
            }, 1000);

        } catch(e) {
            NOTIFICACOES.erro('Erro de conexão. Verifique sua internet.');
            if (btn) { btn.disabled = false; btn.textContent = 'Entrar'; }
        }
    },

    showRecuperarSenha() {
        UI.renderRecuperarSenha();
    },

    enviarRecuperacao() {
        const email = document.getElementById('emailRecuperacao').value;
        if (!email) {
            NOTIFICACOES.erro('Digite seu email!');
            return;
        }
        NOTIFICACOES.sucesso('Código de recuperação enviado para ' + email + '. Contate o PCM.');
        setTimeout(() => AUTH.showLogin(), 2000);
    },

    logout() {
        DB.logout();
        NOTIFICACOES.info('Você foi desconectado.');
        setTimeout(() => UI.renderLogin(), 1000);
    }
};

// ============================================
// OPERAÇÕES COM ORDENS DE SERVIÇO
// ============================================

const OS = {
    async criar() {
        const maquinaId = document.getElementById('osIdMaquina').value;
        const descricao = document.getElementById('osDescricao').value;
        const data = document.getElementById('osData').value;
        const hora = document.getElementById('osHora').value;

        if (!maquinaId) {
            NOTIFICACOES.erro('Digite o ID da máquina!');
            return;
        }
        if (!descricao || descricao.length < 10) {
            NOTIFICACOES.erro('Descrição deve ter no mínimo 10 caracteres!');
            return;
        }

        const user = DB.getCurrentUser();
        const novaOS = {
            maquinaId,
            descricao,
            dataCriacao: `${data}T${hora}`,
            manutentor: user.nome,
            idManutentor: user.id,
            status: 'ativa'
        };

        try {
            await DB.adicionarOS(novaOS);
            NOTIFICACOES.sucesso('Ordem de Serviço criada com sucesso!');
            setTimeout(() => UI.renderDashboardManutentor(), 1500);
        } catch(e) {
            NOTIFICACOES.erro(e.message || 'Erro ao criar OS.');
        }
    }
};

// ============================================
// CONTROLE DE EXECUÇÃO
// ============================================

const EXECUCAO = {
    async iniciar() {
        const osId = document.getElementById('selectOS').value;
        if (!osId) {
            NOTIFICACOES.erro('Selecione uma O.S.!');
            return;
        }

        const apontamento = {
            tipo: 'inicio',
            timestamp: new Date().toISOString()
        };

        try {
            await DB.adicionarApontamento(osId, apontamento);
            NOTIFICACOES.sucesso('Trabalho iniciado!');
            setTimeout(() => UI.renderControleExecucao(), 1000);
        } catch(e) {
            NOTIFICACOES.erro(e.message || 'Erro ao iniciar.');
        }
    },

    async pausar() {
        const osId = document.getElementById('selectOS').value;
        if (!osId) {
            NOTIFICACOES.erro('Selecione uma O.S.!');
            return;
        }

        const motivo = prompt('Qual o motivo da pausa?');
        if (!motivo) return;

        const apontamento = {
            tipo: 'pausa',
            motivo,
            timestamp: new Date().toISOString()
        };

        try {
            await DB.adicionarApontamento(osId, apontamento);
            NOTIFICACOES.sucesso('Pausa registrada: ' + motivo);
            setTimeout(() => UI.renderControleExecucao(), 1000);
        } catch(e) {
            NOTIFICACOES.erro(e.message || 'Erro ao registrar pausa.');
        }
    }
};

// ============================================
// REGISTRO DE PEÇAS
// ============================================

const PECAS = {
    adicionarLinha() {
        const pecas = window._pecasCache || [];
        const novaLinha = `
            <div class="row peca-item" style="margin-bottom: 15px;">
                <div class="col">
                    <select class="form-control peca-select">
                        <option value="">-- Selecione uma peça --</option>
                        ${pecas.map(p => `<option value="${p.id}">${p.nome} (${p.quantidade} em estoque)</option>`).join('')}
                    </select>
                </div>
                <div class="col" style="flex: 0 0 120px;">
                    <input type="number" class="form-control peca-quantidade" placeholder="Quantidade" min="1">
                </div>
                <div class="col" style="flex: 0 0 100px;">
                    <button type="button" class="btn btn-danger" onclick="PECAS.removerLinha(this)">🗑️ Remover</button>
                </div>
            </div>
        `;
        document.getElementById('listaPecas').insertAdjacentHTML('beforeend', novaLinha);
    },

    removerLinha(btn) {
        btn.closest('.peca-item').remove();
    },

    async salvar() {
        const osId = document.getElementById('selectOSPecas').value;
        if (!osId) {
            NOTIFICACOES.erro('Selecione uma O.S.!');
            return;
        }

        const linhas = document.querySelectorAll('.peca-item');
        const pecasParaRegistrar = [];

        linhas.forEach(linha => {
            const pecaId = linha.querySelector('.peca-select').value;
            const quantidade = parseInt(linha.querySelector('.peca-quantidade').value) || 0;

            if (pecaId && quantidade > 0) {
                pecasParaRegistrar.push({ pecaId, quantidade });
            }
        });

        if (pecasParaRegistrar.length === 0) {
            NOTIFICACOES.aviso('Nenhuma peça foi registrada!');
            return;
        }

        try {
            await DB.adicionarPecasOS(osId, pecasParaRegistrar);
            NOTIFICACOES.sucesso(`${pecasParaRegistrar.length} peça(s) registrada(s) com sucesso!`);
            setTimeout(() => UI.renderDashboardManutentor(), 1500);
        } catch(e) {
            NOTIFICACOES.erro(e.message || 'Erro ao registrar peças.');
        }
    }
};

// ============================================
// FECHAMENTO
// ============================================

const FECHAMENTO = {
    async finalizar() {
        const osId = document.getElementById('selectOSFechamento').value;
        const status = document.getElementById('statusFinal').value;
        const descricao = document.getElementById('descricaoServico').value;
        const data = document.getElementById('dataConclusao').value;
        const hora = document.getElementById('horaConclusao').value;
        const fotosInput = document.getElementById('fotoEvidencia');
        const assinatura = document.getElementById('signatureCanvas').toDataURL();

        if (!osId) { NOTIFICACOES.erro('Selecione uma O.S.!'); return; }
        if (!status) { NOTIFICACOES.erro('Selecione o status final!'); return; }
        if (!descricao || descricao.length < 10) { NOTIFICACOES.erro('Descrição deve ter no mínimo 10 caracteres!'); return; }
        if (!fotosInput.files || fotosInput.files.length === 0) { NOTIFICACOES.erro('Anexe pelo menos uma foto de evidência!'); return; }
        if (assinatura === 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==') {
            NOTIFICACOES.erro('Assine o documento para confirmar!');
            return;
        }

        try {
            // Converter múltiplas fotos para base64
            const fotosBase64 = [];
            for (let i = 0; i < fotosInput.files.length; i++) {
                const foto = fotosInput.files[i];
                const base64 = await new Promise((resolve) => {
                    const reader = new FileReader();
                    reader.onload = () => resolve(reader.result);
                    reader.readAsDataURL(foto);
                });
                fotosBase64.push(base64);
            }

            // Preparar relatório de fechamento
            const relatorioFechamento = {
                statusFinal: status,
                descricaoExecucao: descricao,
                dataFechamento: `${data}T${hora}`,
                assinaturaManutentor: assinatura,
                fotosEvidencia: fotosBase64,
                totalFotos: fotosBase64.length
            };

            const updates = {
                status: status === 'finalizado' ? 'finalizada' : 'pendente',
                descricaoFinal: descricao,
                dataFechamento: `${data}T${hora}`,
                assinaturaManutentor: assinatura,
                fotosEvidencia: fotosBase64,
                relatorioFechamento: relatorioFechamento
            };

            await DB.atualizarOS(osId, updates);
            NOTIFICACOES.sucesso(`O.S. ${status === 'finalizado' ? 'finalizada' : 'marcada como pendente'} com sucesso! ${fotosBase64.length} foto(s) salva(s).`);

            if (status === 'finalizado') {
                setTimeout(() => UI.renderModoAuditoria(osId), 1500);
            } else {
                setTimeout(() => UI.renderDashboardManutentor(), 1500);
            }
        } catch(e) {
            NOTIFICACOES.erro(e.message || 'Erro ao finalizar OS.');
        }
    },

    async atualizarResumo(osId) {
        if (!osId) return;
        const os = await DB.obterOSPorId(osId);
        if (!os) return;

        const pausas = os.apontamentos ? os.apontamentos.filter(a => a.tipo === 'pausa').length : 0;

        document.getElementById('resumoExecucao').innerHTML = `
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 10px;">
                <div style="background: white; padding: 10px; border-radius: 4px;">
                    <strong>Máquina:</strong> ${os.maquinaId}
                </div>
                <div style="background: white; padding: 10px; border-radius: 4px;">
                    <strong>Apontamentos:</strong> ${os.apontamentos ? os.apontamentos.length : 0}
                </div>
                <div style="background: white; padding: 10px; border-radius: 4px;">
                    <strong>Pausas:</strong> ${pausas}
                </div>
                <div style="background: white; padding: 10px; border-radius: 4px;">
                    <strong>Peças Usadas:</strong> ${os.pecas ? os.pecas.length : 0}
                </div>
            </div>
        `;
    }
};

// ============================================
// OPERAÇÕES DO PCM
// ============================================

const PCM = {
    async adicionarPeca() {
        const nome = document.getElementById('nomePeca').value;
        const quantidade = parseInt(document.getElementById('quantidadePeca').value) || 0;
        const valor = parseFloat(document.getElementById('valorPeca').value) || 0;
        const minimoEstoque = parseInt(document.getElementById('minPeca').value) || 0;

        if (!nome || quantidade <= 0 || valor <= 0 || minimoEstoque <= 0) {
            alert('Preencha todos os campos corretamente!');
            return;
        }

        try {
            await DB.adicionarPeca({ nome, quantidade, valor, minimoEstoque });
            alert('Peça adicionada ao estoque!');
            UI.renderEstoque();
        } catch(e) {
            NOTIFICACOES.erro(e.message || 'Erro ao adicionar peça.');
        }
    },

    async cadastrarManutentor() {
        const nome = document.getElementById('nomeManutentor').value;
        const email = document.getElementById('emailManutentor').value;
        const senha = document.getElementById('senhaManutentor').value;
        const turnoInicio = document.getElementById('turnoInicio').value;
        const turnoFim = document.getElementById('turnoFim').value;
        const almocoInicio = document.getElementById('almocoInicio').value;
        const almocoFim = document.getElementById('almocoFim').value;

        if (!nome || !email || !senha || !turnoInicio || !turnoFim || !almocoInicio || !almocoFim) {
            NOTIFICACOES.erro('Preencha todos os campos obrigatórios!');
            return;
        }
        if (nome.length < 3) { NOTIFICACOES.erro('Nome deve ter no mínimo 3 caracteres!'); return; }
        if (senha.length < 4) { NOTIFICACOES.erro('Senha deve ter no mínimo 4 caracteres!'); return; }
        if (turnoInicio >= turnoFim) { NOTIFICACOES.erro('Horário de fim do turno deve ser maior que o início!'); return; }
        if (almocoInicio >= almocoFim) { NOTIFICACOES.erro('Horário de fim do almoço deve ser maior que o início!'); return; }

        try {
            await DB.adicionarManutentor({ nome, email, senha, turnoInicio, turnoFim, almocoInicio, almocoFim });
            NOTIFICACOES.sucesso('Manutentor cadastrado com sucesso!');
            document.getElementById('formCadastroManutentor').reset();
            setTimeout(() => UI.renderManutentores(), 1500);
        } catch(e) {
            NOTIFICACOES.erro(e.message || 'Erro ao cadastrar manutentor.');
        }
    },

    async removerPeca(pecaId) {
        if (confirm('Tem certeza que deseja remover esta peça?')) {
            try {
                await DB.removerPeca(pecaId);
                UI.renderEstoque();
            } catch(e) {
                NOTIFICACOES.erro(e.message || 'Erro ao remover peça.');
            }
        }
    },

    async removerManutentor(manutenorId) {
        if (confirm('Tem certeza que deseja remover este manutentor?')) {
            try {
                await DB.removerManutentor(manutenorId);
                UI.renderManutentores();
            } catch(e) {
                NOTIFICACOES.erro(e.message || 'Erro ao remover manutentor.');
            }
        }
    },

    async liberarOS(osId) {
        try {
            await DB.atualizarOS(osId, { status: 'ativa' });
            alert('Ordem de Serviço liberada!');
            UI.renderGestaoOS();
        } catch(e) {
            NOTIFICACOES.erro(e.message || 'Erro ao liberar OS.');
        }
    },

    async cadastrarMaquina() {
        const id = document.getElementById('idMaquina').value;
        const nome = document.getElementById('nomeMaquina').value;
        const especificacoes = document.getElementById('especMaquina').value;
        const historico = document.getElementById('historicoMaquina').value;

        if (!id || !nome || !especificacoes || !historico) {
            NOTIFICACOES.erro('Preencha todos os campos obrigatórios!');
            return;
        }

        try {
            await DB.adicionarMaquina({ id, nome, especificacoes, historico });
            NOTIFICACOES.sucesso('Máquina cadastrada com sucesso!');
            document.getElementById('idMaquina').value = '';
            document.getElementById('nomeMaquina').value = '';
            document.getElementById('especMaquina').value = '';
            document.getElementById('historicoMaquina').value = '';
            setTimeout(() => UI.renderEstoque(), 1500);
        } catch(e) {
            NOTIFICACOES.erro(e.message || 'Erro ao cadastrar máquina.');
        }
    },

    async removerMaquina(maquinaId) {
        if (confirm('Tem certeza que deseja remover esta máquina?')) {
            try {
                await DB.removerMaquina(maquinaId);
                NOTIFICACOES.sucesso('Máquina removida!');
                UI.renderEstoque();
            } catch(e) {
                NOTIFICACOES.erro(e.message || 'Erro ao remover máquina.');
            }
        }
    },

    async atualizarConfiguracao() {
        const novoEmail = document.getElementById('emailPCM').value;
        const novaSenha = document.getElementById('senhaPCM').value;

        if (!novoEmail) {
            NOTIFICACOES.erro('Email não pode estar vazio!');
            return;
        }

        const user = DB.getCurrentUser();
        try {
            await DB.atualizarManutentor(user.id, novoEmail, novaSenha);
            NOTIFICACOES.sucesso('Configurações atualizadas com sucesso!');
            setTimeout(() => UI.renderManutentores(), 1500);
        } catch(e) {
            NOTIFICACOES.erro(e.message || 'Erro ao atualizar configurações.');
        }
    },

    async criarAgendamentoPreventivo() {
        const maquinaId = document.getElementById('maquina-preventiva').value;
        const tipo = document.getElementById('tipo-preventiva').value;
        const manutenorId = document.getElementById('manutentor-preventiva').value;
        const dataProg = document.getElementById('data-preventiva').value;

        if (!maquinaId || !tipo || !manutenorId || !dataProg) {
            NOTIFICACOES.erro('Preencha todos os campos!');
            return;
        }

        const maquinas = await DB.obterMaquinas();
        const manutentores = await DB.obterManutentores();
        const maquina = maquinas.find(m => m.id === maquinaId);
        const manutentor = manutentores.find(m => m.id === manutenorId);

        try {
            await DB.adicionarAgendamento({
                id_maquina: maquinaId,
                nome_maquina: maquina?.nome || '',
                id_usuario: manutenorId,
                nome_usuario: manutentor?.nome || '',
                data_programada: dataProg,
                tipo_manutencao: tipo
            });
            NOTIFICACOES.sucesso('Agendamento criado com sucesso!');
            document.getElementById('form-novo-agendamento').reset();
            setTimeout(() => UI.renderAgendaPreventiva(), 1500);
        } catch(e) {
            NOTIFICACOES.erro(e.message || 'Erro ao criar agendamento.');
        }
    },

    async removerAgendamentoPreventivo(agendaId) {
        if (confirm('Tem certeza que deseja remover este agendamento?')) {
            try {
                await DB.removerAgendamento(agendaId);
                NOTIFICACOES.sucesso('Agendamento removido!');
                UI.renderAgendaPreventiva();
            } catch(e) {
                NOTIFICACOES.erro(e.message || 'Erro ao remover agendamento.');
            }
        }
    }
};

// ============================================
// RELATÓRIOS
// ============================================

const RELATORIOS = {
    async gerarProdutividade() {
        const [manutentores, os] = await Promise.all([DB.obterManutentores(), DB.obterOS()]);

        let html = '<h2>Relatório de Produtividade</h2>';
        html += `<p>Data: ${new Date().toLocaleDateString('pt-BR')}</p>`;
        html += '<table class="table"><thead><tr><th>Manutentor</th><th>Total de O.S.</th><th>Horas Trabalhadas</th></tr></thead><tbody>';

        manutentores.forEach(m => {
            const osDoManutentor = os.filter(o => o.manutentor === m.nome);
            html += `<tr><td>${m.nome}</td><td>${osDoManutentor.length}</td><td>--</td></tr>`;
        });

        html += '</tbody></table>';
        this.exportarPDF(html, 'Produtividade');
    },

    async gerarCustos() {
        const [os, pecas] = await Promise.all([DB.obterOS(), DB.obterPecas()]);

        let html = '<h2>Relatório de Custos</h2>';
        html += `<p>Data: ${new Date().toLocaleDateString('pt-BR')}</p>`;
        html += '<table class="table"><thead><tr><th>O.S.</th><th>Máquina</th><th>Custo Total</th></tr></thead><tbody>';

        os.forEach(o => {
            let custo = 0;
            if (o.pecas) {
                o.pecas.forEach(op => {
                    const peca = pecas.find(p => p.id === op.pecaId);
                    if (peca) custo += peca.valor * op.quantidade;
                });
            }
            html += `<tr><td>${o.id}</td><td>${o.maquinaId}</td><td>R$ ${custo.toFixed(2)}</td></tr>`;
        });

        html += '</tbody></table>';
        this.exportarPDF(html, 'Custos');
    },

    async gerarFalhas() {
        const os = await DB.obterOS();
        const problemas = {};

        os.forEach(o => {
            problemas[o.descricao] = (problemas[o.descricao] || 0) + 1;
        });

        let html = '<h2>Análise de Falhas</h2>';
        html += `<p>Data: ${new Date().toLocaleDateString('pt-BR')}</p>`;
        html += '<table class="table"><thead><tr><th>Problema</th><th>Ocorrências</th></tr></thead><tbody>';

        Object.entries(problemas).forEach(([problema, count]) => {
            html += `<tr><td>${problema}</td><td>${count}</td></tr>`;
        });

        html += '</tbody></table>';
        this.exportarPDF(html, 'Falhas');
    },

    async gerarHistoricoMaquinas() {
        const [os, maquinas] = await Promise.all([DB.obterOS(), DB.obterMaquinas()]);

        let html = '<h2>Histórico de Máquinas</h2>';
        html += `<p>Data: ${new Date().toLocaleDateString('pt-BR')}</p>`;

        maquinas.forEach(m => {
            const osDoMaquina = os.filter(o => o.maquinaId === m.id);
            html += `<h3>${m.id}</h3>`;
            html += '<table class="table"><thead><tr><th>O.S.</th><th>Problema</th><th>Data</th><th>Status</th></tr></thead><tbody>';

            osDoMaquina.forEach(o => {
                html += `<tr><td>${o.id}</td><td>${o.descricao}</td><td>${o.dataCriacao ? o.dataCriacao.split('T')[0] : '--'}</td><td>${o.status}</td></tr>`;
            });

            html += '</tbody></table>';
        });

        this.exportarPDF(html, 'HistoricoMaquinas');
    },

    async listarRelatoriosFechamento() {
        const os = await DB.obterOS();
        const osComRelatorio = os.filter(o => o.relatorioFechamento && o.relatorioFechamento.fotosEvidencia);

        let html = '<h2>Relatórios de Fechamento de O.S.</h2>';
        html += `<p>Data: ${new Date().toLocaleDateString('pt-BR')}</p>`;
        
        if (osComRelatorio.length === 0) {
            html += '<p style="color: #999;">Nenhum relatório de fechamento encontrado.</p>';
        } else {
            html += '<table class="table"><thead><tr><th>O.S.</th><th>Máquina</th><th>Status</th><th>Fotos</th><th>Data</th></tr></thead><tbody>';
            osComRelatorio.forEach(o => {
                html += `<tr><td>${o.id}</td><td>${o.maquinaId}</td><td>${o.relatorioFechamento.statusFinal}</td><td>${o.relatorioFechamento.totalFotos || 0}</td><td>${o.relatorioFechamento.dataFechamento ? new Date(o.relatorioFechamento.dataFechamento).toLocaleDateString('pt-BR') : '--'}</td></tr>`;
            });
            html += '</tbody></table>';
        }

        this.exportarPDF(html, 'RelatorioFechamento');
    },

    exportarPDF(html, nome) {
        const element = document.createElement('div');
        element.innerHTML = `
            <div style="font-family: Arial, sans-serif; padding: 20px;">
                <h1 style="color: #1f7e3d;">EcoMaintain - ${nome}</h1>
                ${html}
                <p style="margin-top: 40px; color: #757575; font-size: 12px;">
                    Gerado em: ${new Date().toLocaleString('pt-BR')}
                </p>
            </div>
        `;

        const opt = {
            margin: 10,
            filename: `relatorio_${nome}_${Date.now()}.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2 },
            jsPDF: { orientation: 'portrait', unit: 'mm', format: 'a4' }
        };

        html2pdf().set(opt).from(element).save();
    }
};

// ============================================
// SCANNER QR CODE
// ============================================

const SCANNER = {
    iniciar() {
        const reader = document.getElementById('reader');
        reader.classList.add('active');

        const html5QrCode = new Html5Qrcode('reader');
        const config = { fps: 10, qrbox: { width: 250, height: 250 } };

        html5QrCode.start(
            { facingMode: 'environment' },
            config,
            (decodedText) => {
                document.getElementById('osIdMaquina').value = decodedText;
                html5QrCode.stop();
                reader.classList.remove('active');
                NOTIFICACOES.sucesso('QR Code lido com sucesso!');
            },
            (errorMessage) => { /* Ignorar erros de leitura */ }
        );
    }
};

// ============================================
// ASSINATURA DIGITAL
// ============================================

const ASSINATURA = {
    canvas: null,
    ctx: null,
    isDrawing: false,

    inicializar() {
        this.canvas = document.getElementById('signatureCanvas');
        if (!this.canvas) return;

        this.ctx = this.canvas.getContext('2d');
        this.canvas.width = this.canvas.offsetWidth;
        this.canvas.height = this.canvas.offsetHeight;

        this.canvas.addEventListener('mousedown', (e) => this.iniciarDesenho(e));
        this.canvas.addEventListener('mousemove', (e) => this.desenhar(e));
        this.canvas.addEventListener('mouseup', () => this.pararDesenho());
        this.canvas.addEventListener('mouseout', () => this.pararDesenho());

        this.canvas.addEventListener('touchstart', (e) => { e.preventDefault(); this.iniciarDesenho(e); });
        this.canvas.addEventListener('touchmove', (e) => { e.preventDefault(); this.desenhar(e); });
        this.canvas.addEventListener('touchend', () => this.pararDesenho());
    },

    iniciarDesenho(e) {
        this.isDrawing = true;
        const rect = this.canvas.getBoundingClientRect();
        const x = (e.clientX || (e.touches && e.touches[0].clientX)) - rect.left;
        const y = (e.clientY || (e.touches && e.touches[0].clientY)) - rect.top;
        this.ctx.beginPath();
        this.ctx.moveTo(x, y);
    },

    desenhar(e) {
        if (!this.isDrawing) return;
        const rect = this.canvas.getBoundingClientRect();
        const x = (e.clientX || (e.touches && e.touches[0].clientX)) - rect.left;
        const y = (e.clientY || (e.touches && e.touches[0].clientY)) - rect.top;
        this.ctx.lineWidth = 2;
        this.ctx.lineCap = 'round';
        this.ctx.strokeStyle = '#1f7e3d';
        this.ctx.lineTo(x, y);
        this.ctx.stroke();
    },

    pararDesenho() {
        this.isDrawing = false;
    },

    limpar() {
        if (this.canvas) {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        }
    }
};

// ============================================
// MODO AUDITORIA
// ============================================

const AUDITORIA = {
    async renderizar(osId) {
        const os = await DB.obterOSPorId(osId);
        if (!os) return;

        document.querySelector('.content').innerHTML = `
            <div class="dashboard-header">
                <h1 class="dashboard-title">✅ Modo Auditoria - Confirmação do Operador</h1>
            </div>

            <div class="card">
                <div class="alert alert-success">
                    <strong>Serviço Concluído!</strong> Agora o operador da máquina deve confirmar o recebimento.
                </div>

                <div style="background: #f5f5f5; padding: 15px; border-radius: 6px; margin-bottom: 20px;">
                    <h4 style="color: #1f7e3d; margin-bottom: 10px;">📋 Resumo da O.S.</h4>
                    <p><strong>ID:</strong> ${os.id}</p>
                    <p><strong>Máquina:</strong> ${os.maquinaId}</p>
                    <p><strong>Problema:</strong> ${os.descricao}</p>
                    <p><strong>Solução:</strong> ${os.descricaoFinal || '--'}</p>
                </div>

                <div style="background: #fff3e0; padding: 15px; border-radius: 6px; margin-bottom: 20px;">
                    <h4 style="color: #e65100; margin-bottom: 10px;">⚠️ Confirmação Necessária</h4>
                    <p>O operador da máquina deve confirmar que:</p>
                    <ul style="margin: 10px 0; padding-left: 20px;">
                        <li>✅ A máquina está funcionando corretamente</li>
                        <li>✅ O problema foi resolvido</li>
                        <li>✅ Não há outros problemas aparentes</li>
                    </ul>
                </div>

                <div class="form-group">
                    <label class="form-label">Assinatura do Operador <span style="color: red;">*</span></label>
                    <canvas id="signatureCanvasOperador" style="border: 2px solid #e0e0e0; border-radius: 6px; background-color: white; cursor: crosshair; display: block; margin: 10px 0; width: 100%; height: 150px;"></canvas>
                    <small style="color: #757575;">Operador deve assinar para confirmar</small>
                    <button type="button" class="btn btn-secondary btn-sm" onclick="AUDITORIA.limparAssinatura()" style="margin-top: 10px;">🗑️ Limpar Assinatura</button>
                </div>

                <div style="display: flex; gap: 10px; margin-top: 20px;">
                    <button type="button" class="btn btn-success" onclick="AUDITORIA.confirmar('${osId}')">✅ Confirmar e Finalizar</button>
                    <button type="button" class="btn btn-secondary" onclick="UI.renderDashboardManutentor()">Voltar</button>
                </div>
            </div>
        `;

        this.inicializarAssinatura();
    },

    inicializarAssinatura() {
        const canvas = document.getElementById('signatureCanvasOperador');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;

        let isDrawing = false;

        canvas.addEventListener('mousedown', () => { isDrawing = true; ctx.beginPath(); });
        canvas.addEventListener('mousemove', (e) => {
            if (!isDrawing) return;
            const rect = canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            ctx.lineWidth = 2;
            ctx.lineCap = 'round';
            ctx.strokeStyle = '#1f7e3d';
            ctx.lineTo(x, y);
            ctx.stroke();
        });
        canvas.addEventListener('mouseup', () => { isDrawing = false; });
        canvas.addEventListener('mouseout', () => { isDrawing = false; });
    },

    limparAssinatura() {
        const canvas = document.getElementById('signatureCanvasOperador');
        if (canvas) {
            const ctx = canvas.getContext('2d');
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
    },

    async confirmar(osId) {
        const canvas = document.getElementById('signatureCanvasOperador');
        const assinatura = canvas.toDataURL();

        if (assinatura === 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==') {
            NOTIFICACOES.erro('O operador deve assinar para confirmar!');
            return;
        }

        try {
            await DB.atualizarOS(osId, {
                assinaturaOperador: assinatura,
                dataConfirmacao: new Date().toISOString()
            });
            NOTIFICACOES.sucesso('O.S. finalizada e confirmada com sucesso!');
            setTimeout(() => UI.renderDashboardManutentor(), 1500);
        } catch(e) {
            NOTIFICACOES.erro(e.message || 'Erro ao confirmar OS.');
        }
    }
};

// ============================================
// NOTIFICAÇÕES VISUAIS
// ============================================

const NOTIFICACOES = {
    mostrar(mensagem, tipo) {
        const notificacao = document.createElement('div');
        notificacao.className = `alert alert-${tipo}`;
        notificacao.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 9999;
            min-width: 300px;
            animation: slideDown 0.3s ease;
        `;
        notificacao.innerHTML = mensagem;
        document.body.appendChild(notificacao);

        setTimeout(() => {
            notificacao.style.animation = 'slideUp 0.3s ease';
            setTimeout(() => notificacao.remove(), 300);
        }, 3000);
    },

    sucesso(mensagem) { this.mostrar(`<strong>✅ Sucesso!</strong> ${mensagem}`, 'success'); },
    erro(mensagem) { this.mostrar(`<strong>❌ Erro!</strong> ${mensagem}`, 'danger'); },
    aviso(mensagem) { this.mostrar(`<strong>⚠️ Aviso!</strong> ${mensagem}`, 'warning'); },
    info(mensagem) { this.mostrar(`<strong>ℹ️ Informação:</strong> ${mensagem}`, 'info'); }
};

// ============================================
// MÓDULO CHECKLIST PREVENTIVO (Manutentor)
// ============================================

UI.renderChecklistPreventivo = async function() {
    const user = DB.getCurrentUser();
    document.querySelector('.content').innerHTML = `
        <div class="dashboard-header">
            <h1 class="dashboard-title">📋 Checklist Preventivo</h1>
            <p class="dashboard-subtitle">Manutenções preventivas agendadas</p>
        </div>
        <div class="card">
            <h3 class="card-title">Minhas Manutenções Preventivas</h3>
            <div id="agenda-preventiva-list" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 15px;">
                <p style="color: #999;">Carregando...</p>
            </div>
        </div>
    `;

    const agenda = await DB.obterAgendaPreventiva(user.id);
    const maquinas = await DB.obterMaquinas();

    const html = agenda.map(item => {
        const maquina = maquinas.find(m => m.id === item.id_maquina);
        return `
            <div class="card" style="padding: 15px; cursor: pointer;" onclick="UI.iniciarChecklistPreventivo('${item.id}')">
                <h4 style="margin: 0 0 10px 0; color: #1f7e3d;">${maquina?.nome || item.nome_maquina || 'Máquina'}</h4>
                <p style="margin: 5px 0; font-size: 0.9em; color: #666;"><strong>Tipo:</strong> ${item.tipo_manutencao}</p>
                <p style="margin: 5px 0; font-size: 0.9em; color: #666;"><strong>Data:</strong> ${item.data_programada}</p>
                <p style="margin: 5px 0; font-size: 0.9em; color: #666;">
                    <strong>Status:</strong> <span style="color: ${item.status === 'concluido' ? '#28a745' : '#ffc107'};">${item.status}</span>
                </p>
                <button class="btn btn-success" style="width: 100%; margin-top: 10px;">Iniciar Checklist</button>
            </div>
        `;
    }).join('');

    document.getElementById('agenda-preventiva-list').innerHTML = html || '<p style="color: #999;">Nenhuma manutenção preventiva agendada.</p>';
};

// Templates de checklist por tipo
const CHECKLIST_TEMPLATES = {
    'Operacional': ['Verificar nível de óleo', 'Checar pressão dos pneus', 'Testar freios', 'Verificar iluminação', 'Checar correntes e cabos'],
    'Mensal': ['Trocar filtro de óleo', 'Verificar sistema hidráulico', 'Checar rolamentos', 'Lubrificar pontos de engrenagem', 'Verificar correia dentada'],
    'Corretiva': ['Identificar falha', 'Substituir componente defeituoso', 'Testar funcionamento', 'Registrar peças utilizadas', 'Validar com operador'],
    'Preditiva': ['Análise de vibração', 'Termografia', 'Análise de óleo', 'Ultrassom', 'Verificar desgaste de componentes']
};

UI.iniciarChecklistPreventivo = function(agendaId) {
    // Buscar da agenda em cache ou API
    DB.obterAgendaPreventiva().then(agenda => {
        const item = agenda.find(a => a.id === agendaId);
        if (!item) return;

        const itens = CHECKLIST_TEMPLATES[item.tipo_manutencao] || [];

        document.querySelector('.content').innerHTML = `
            <div class="dashboard-header">
                <h1 class="dashboard-title">✔️ Executar Checklist</h1>
                <p class="dashboard-subtitle">${item.tipo_manutencao} - ${item.nome_maquina}</p>
            </div>
            <div class="card">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                    <h3 class="card-title" style="margin: 0;">Itens do Checklist</h3>
                    <button class="btn btn-sm btn-success" onclick="UI.adicionarItemChecklist()">➕ Adicionar Item</button>
                </div>
                <div id="checklist-items">
                    ${itens.map((it, idx) => `
                        <div style="padding: 10px; border-bottom: 1px solid #eee; display: flex; align-items: center;">
                            <input type="checkbox" id="item-${idx}" style="width: 20px; height: 20px; margin-right: 10px;">
                            <label for="item-${idx}" style="flex: 1; cursor: pointer;">${it}</label>
                        </div>
                    `).join('')}
                </div>
                <div style="margin-top: 15px; padding: 10px; background: #f5f5f5; border-radius: 6px;">
                    <label class="form-label">Observacoes Gerais (Opcional)</label>
                    <textarea id="checklistObservacoes" class="form-control" placeholder="Observacoes sobre a manutencao..." rows="2"></textarea>
                </div>
                <button class="btn btn-success btn-block" style="margin-top: 20px;" onclick="UI.finalizarChecklistPreventivo('${agendaId}')">✅ Finalizar Checklist</button>
            </div>
        `;
    });
};

UI.adicionarItemChecklist = function() {
    const descricao = prompt('Descreva o novo item do checklist:');
    if (!descricao || !descricao.trim()) return;

    const container = document.getElementById('checklist-items');
    const idx = container.querySelectorAll('input[type="checkbox"]').length;
    const div = document.createElement('div');
    div.style.cssText = 'padding: 10px; border-bottom: 1px solid #eee; display: flex; align-items: center;';
    div.innerHTML = `
        <input type="checkbox" id="item-${idx}" style="width: 20px; height: 20px; margin-right: 10px;">
        <label for="item-${idx}" style="flex: 1; cursor: pointer;">${descricao}</label>
    `;
    container.appendChild(div);
    NOTIFICACOES.sucesso('Item adicionado ao checklist!');
};

UI.finalizarChecklistPreventivo = async function(agendaId) {
    try {
        // Coletar todos os itens do checklist com status
        const itens = [];
        const checkboxes = document.querySelectorAll('#checklist-items input[type="checkbox"]');
        checkboxes.forEach((cb, idx) => {
            const label = cb.nextElementSibling?.textContent || '';
            itens.push({
                descricao: label,
                status: cb.checked ? 'ok' : 'pendente'
            });
        });

        // Coletar observacoes gerais se existirem
        const observacoes = document.getElementById('checklistObservacoes')?.value || '';

        // Salvar no banco com dados do checklist
        await DB.atualizarAgendamento(agendaId, 'concluido', {
            itens,
            observacoes,
            laudoGerado: true
        });

        NOTIFICACOES.sucesso('Checklist finalizado e salvo com sucesso!');
        setTimeout(() => UI.renderChecklistPreventivo(), 1500);
    } catch(e) {
        NOTIFICACOES.erro(e.message || 'Erro ao finalizar checklist.');
    }
};

// ============================================
// AGENDA PREVENTIVA (PCM)
// ============================================

UI.renderAgendaPreventiva = async function() {
    const [maquinas, manutentores, agenda] = await Promise.all([
        DB.obterMaquinas(),
        DB.obterManutentores(),
        DB.obterAgendaPreventiva()
    ]);

    document.querySelector('.content').innerHTML = `
        <div class="dashboard-header">
            <h1 class="dashboard-title">📅 Agenda Preventiva</h1>
            <p class="dashboard-subtitle">Planejamento de manutenções preventivas</p>
        </div>

        <div class="card">
            <h3 class="card-title">Criar Novo Agendamento</h3>
            <form id="form-novo-agendamento" style="display: grid; gap: 15px;">
                <div>
                    <label class="form-label">Máquina <span style="color: red;">*</span></label>
                    <select id="maquina-preventiva" class="form-control" required>
                        <option value="">Selecione uma máquina</option>
                        ${maquinas.map(m => `<option value="${m.id}">${m.nome} (${m.id})</option>`).join('')}
                    </select>
                </div>
                <div>
                    <label class="form-label">Tipo de Manutenção <span style="color: red;">*</span></label>
                    <select id="tipo-preventiva" class="form-control" required>
                        <option value="">Selecione o tipo</option>
                        <option value="Operacional">Operacional</option>
                        <option value="Mensal">Mensal</option>
                        <option value="Corretiva">Corretiva</option>
                        <option value="Preditiva">Preditiva</option>
                    </select>
                </div>
                <div>
                    <label class="form-label">Manutentor Responsável <span style="color: red;">*</span></label>
                    <select id="manutentor-preventiva" class="form-control" required>
                        <option value="">Selecione um manutentor</option>
                        ${manutentores.map(m => `<option value="${m.id}">${m.nome}</option>`).join('')}
                    </select>
                </div>
                <div>
                    <label class="form-label">Data <span style="color: red;">*</span></label>
                    <input type="date" id="data-preventiva" class="form-control" required>
                </div>
                <button type="button" class="btn btn-success btn-block" onclick="PCM.criarAgendamentoPreventivo()">+ Agendar Manutenção</button>
            </form>
        </div>

        <div class="card" style="margin-top: 20px;">
            <h3 class="card-title">Agendamentos</h3>
            ${agenda.length === 0 ? '<p style="color: #999;">Nenhum agendamento criado.</p>' : `
            <table class="table">
                <thead>
                    <tr><th>Máquina</th><th>Tipo</th><th>Manutentor</th><th>Data</th><th>Status</th><th>Ações</th></tr>
                </thead>
                <tbody>
                    ${agenda.map(a => `
                        <tr>
                            <td>${a.nome_maquina || a.id_maquina}</td>
                            <td>${a.tipo_manutencao}</td>
                            <td>${a.nome_usuario || a.id_usuario}</td>
                            <td>${a.data_programada}</td>
                            <td><span class="badge ${a.status === 'concluido' ? 'badge-success' : 'badge-warning'}">${a.status}</span></td>
                            <td>
                                <button class="btn btn-sm btn-danger" onclick="PCM.removerAgendamentoPreventivo('${a.id}')">Remover</button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
            `}
        </div>
    `;
};

// ============================================
// MÓDULO GESTÃO DE MANUAIS (IndexedDB - local)
// ============================================

const MANUAIS_DB = {
    DB_NAME: "EcoMaintainDB_Pro",
    STORE_NAME: "equipamentos",

    abrirDB() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.DB_NAME, 2);
            request.onupgradeneeded = (e) => {
                const db = e.target.result;
                if (!db.objectStoreNames.contains(this.STORE_NAME)) {
                    db.createObjectStore(this.STORE_NAME, { keyPath: "id" });
                }
            };
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject("Erro ao acessar banco de dados.");
        });
    },

    async adicionarEquipamento(id, modelo, pdfFile) {
        const db = await this.abrirDB();
        const tx = db.transaction(this.STORE_NAME, "readwrite");
        const store = tx.objectStore(this.STORE_NAME);

        const novoEquipamento = {
            id: id.toUpperCase().trim(),
            modelo: modelo.trim(),
            pdfFile: pdfFile,
            baixado: false,
            tamanho: (pdfFile.size / 1024 / 1024).toFixed(2) + " MB",
            dataCadastro: new Date().toISOString()
        };

        return new Promise((resolve, reject) => {
            const request = store.put(novoEquipamento);
            request.onsuccess = () => resolve(novoEquipamento);
            request.onerror = () => reject("Erro ao salvar equipamento.");
        });
    },

    async obterEquipamentos() {
        const db = await this.abrirDB();
        const tx = db.transaction(this.STORE_NAME, "readonly");
        const store = tx.objectStore(this.STORE_NAME);
        return new Promise((resolve, reject) => {
            const request = store.getAll();
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject("Erro ao obter equipamentos.");
        });
    },

    async obterEquipamento(id) {
        const db = await this.abrirDB();
        const tx = db.transaction(this.STORE_NAME, "readonly");
        const store = tx.objectStore(this.STORE_NAME);
        return new Promise((resolve, reject) => {
            const request = store.get(id);
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject("Erro ao obter equipamento.");
        });
    },

    async substituirPDF(id, novoFile) {
        const db = await this.abrirDB();
        const tx = db.transaction(this.STORE_NAME, "readwrite");
        const store = tx.objectStore(this.STORE_NAME);
        const req = store.get(id);
        return new Promise((resolve, reject) => {
            req.onsuccess = () => {
                const maq = req.result;
                if (maq) {
                    maq.pdfFile = novoFile;
                    maq.tamanho = (novoFile.size / 1024 / 1024).toFixed(2) + " MB";
                    maq.baixado = false;
                    store.put(maq).onsuccess = () => resolve(maq);
                }
            };
            req.onerror = () => reject("Erro ao substituir PDF.");
        });
    },

    async excluirEquipamento(id) {
        const db = await this.abrirDB();
        const tx = db.transaction(this.STORE_NAME, "readwrite");
        const store = tx.objectStore(this.STORE_NAME);
        return new Promise((resolve, reject) => {
            const request = store.delete(id);
            request.onsuccess = () => resolve();
            request.onerror = () => reject("Erro ao excluir equipamento.");
        });
    }
};

// Interface Gestão de Manuais (PCM)
const UI_MANUAIS_PCM = {
    renderGestaoManuais() {
        document.querySelector('.content').innerHTML = `
            <div class="dashboard-header">
                <h1 class="dashboard-title">Gestão de Manuais Técnicos - Águia Florestal</h1>
                <p class="dashboard-subtitle">Cadastro e gerenciamento de manuais de equipamentos</p>
            </div>

            <div class="card" style="margin-bottom: 30px;">
                <h3 class="card-title">Buscar Acervo</h3>
                <div style="display: flex; gap: 10px; margin-bottom: 15px;">
                    <input type="text" id="inputBuscaManuais" placeholder="ID ou Modelo da Máquina..."
                        class="form-control" style="flex: 1;" onkeyup="UI_MANUAIS_PCM.filtrarEquipamentos()">
                    <button class="btn btn-primary" onclick="UI_MANUAIS_PCM.renderListaManuais()">🔍 Buscar</button>
                </div>
                <div id="listaManuaisPCM" style="display: grid; gap: 10px;"></div>
            </div>

            <div class="card">
                <h3 class="card-title">Novo Equipamento</h3>
                <form id="formCadastroManuais" style="display: grid; gap: 15px;">
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                        <div class="form-group">
                            <label class="form-label">ID do Equipamento (Ex: HRV-10):</label>
                            <input type="text" id="idMaquinaManual" placeholder="ID" required class="form-control">
                        </div>
                        <div class="form-group">
                            <label class="form-label">Modelo / Marca:</label>
                            <input type="text" id="modeloMaquina" placeholder="Modelo" required class="form-control">
                        </div>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Anexar PDF do Manual:</label>
                        <input type="file" id="arquivoPDF" accept=".pdf" required class="form-control">
                    </div>
                    <button type="submit" class="btn btn-success btn-lg">💾 Salvar Equipamento</button>
                </form>
            </div>

            <div id="modalPDFManuais" style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.9); z-index: 1000; padding: 10px;">
                <div style="max-width: 90%; height: 100%; margin: 0 auto; display: flex; flex-direction: column;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                        <span id="nomeManualAtivo" style="color: white; font-weight: bold;"></span>
                        <button onclick="UI_MANUAIS_PCM.fecharPDF()" class="btn btn-danger">✕ Fechar</button>
                    </div>
                    <iframe id="framePDF" style="flex: 1; background: white; border-radius: 8px;"></iframe>
                </div>
            </div>
        `;

        document.getElementById('formCadastroManuais').onsubmit = async (e) => {
            e.preventDefault();
            await UI_MANUAIS_PCM.salvarEquipamento();
        };

        this.renderListaManuais();
    },

    async renderListaManuais() {
        const equipamentos = await MANUAIS_DB.obterEquipamentos();
        const container = document.getElementById('listaManuaisPCM');
        if (!container) return;

        if (equipamentos.length === 0) {
            container.innerHTML = '<div style="text-align: center; padding: 20px; color: #757575;">Nenhum manual cadastrado.</div>';
            return;
        }

        container.innerHTML = equipamentos.reverse().map(eq => `
            <div style="background: white; padding: 15px; border-radius: 8px; border: 1px solid #e0e0e0; display: flex; justify-content: space-between; align-items: center;">
                <div>
                    <p style="font-weight: bold; margin: 0;">${eq.id}</p>
                    <p style="font-size: 12px; color: #757575; margin: 5px 0 0 0;">${eq.modelo}</p>
                    <p style="font-size: 11px; color: #999; margin: 3px 0 0 0;">Tamanho: ${eq.tamanho}</p>
                </div>
                <div style="display: flex; gap: 10px;">
                    <button onclick="UI_MANUAIS_PCM.visualizarPDF('${eq.id}')" class="btn btn-primary btn-sm">👁️ Ver</button>
                    <button onclick="UI_MANUAIS_PCM.substituirPDF('${eq.id}')" class="btn btn-warning btn-sm">🔄 Atualizar</button>
                    <button onclick="UI_MANUAIS_PCM.excluirEquipamento('${eq.id}')" class="btn btn-danger btn-sm">🗑️ Excluir</button>
                </div>
            </div>
        `).join('');
    },

    async salvarEquipamento() {
        const idMaquina = document.getElementById('idMaquinaManual').value;
        const modeloMaquina = document.getElementById('modeloMaquina').value;
        const arquivoPDF = document.getElementById('arquivoPDF').files[0];

        if (!idMaquina || !modeloMaquina || !arquivoPDF) {
            alert('⚠️ Preencha todos os campos!');
            return;
        }

        try {
            const reader = new FileReader();
            reader.onload = async (e) => {
                const base64PDF = e.target.result;
                
                const resp = await fetch(`${API_BASE}/maquinas`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        id: idMaquina,
                        manual_pdf: base64PDF,
                        modelo: modeloMaquina
                    })
                });
                
                if (resp.ok) {
                    alert('✅ Manual salvo no banco de dados com sucesso!');
                    document.getElementById('formCadastroManuais').reset();
                    this.renderListaManuais();
                } else {
                    alert('❌ Erro ao salvar manual no banco.');
                }
            };
            reader.readAsDataURL(arquivoPDF);
        } catch (erro) {
            alert('❌ Erro ao salvar: ' + erro);
        }
    },

    async visualizarPDF(id) {
        try {
            const eq = await MANUAIS_DB.obterEquipamento(id);
            if (!eq) { alert('Equipamento não encontrado.'); return; }

            const frame = document.getElementById('framePDF');
            if (window.pdfUrlAtiva) URL.revokeObjectURL(window.pdfUrlAtiva);

            const url = URL.createObjectURL(eq.pdfFile);
            window.pdfUrlAtiva = url;

            document.getElementById('nomeManualAtivo').innerText = `Manual: ${eq.id} - ${eq.modelo}`;
            frame.src = url;
            document.getElementById('modalPDFManuais').style.display = 'block';
            document.body.style.overflow = 'hidden';
        } catch (erro) {
            alert('Erro ao visualizar: ' + erro);
        }
    },

    fecharPDF() {
        document.getElementById('modalPDFManuais').style.display = 'none';
        document.getElementById('framePDF').src = '';
        document.body.style.overflow = 'auto';
        if (window.pdfUrlAtiva) URL.revokeObjectURL(window.pdfUrlAtiva);
    },

    async substituirPDF(id) {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.pdf';
        input.onchange = async (e) => {
            const file = e.target.files[0];
            if (!file) return;
            try {
                await MANUAIS_DB.substituirPDF(id, file);
                alert('✅ PDF atualizado com sucesso!');
                this.renderListaManuais();
            } catch (erro) {
                alert('Erro ao atualizar: ' + erro);
            }
        };
        input.click();
    },

    async excluirEquipamento(id) {
        if (!confirm('Tem certeza que deseja excluir este manual?')) return;
        try {
            await MANUAIS_DB.excluirEquipamento(id);
            alert('✅ Manual excluído com sucesso!');
            this.renderListaManuais();
        } catch (erro) {
            alert('Erro ao excluir: ' + erro);
        }
    },

    async filtrarEquipamentos() {
        const termo = document.getElementById('inputBuscaManuais').value.toLowerCase();
        const equipamentos = await MANUAIS_DB.obterEquipamentos();
        const filtrados = equipamentos.filter(eq =>
            eq.id.toLowerCase().includes(termo) ||
            eq.modelo.toLowerCase().includes(termo)
        );

        const container = document.getElementById('listaManuaisPCM');
        if (filtrados.length === 0) {
            container.innerHTML = '<div style="text-align: center; padding: 20px; color: #757575;">Nenhum resultado encontrado.</div>';
            return;
        }

        container.innerHTML = filtrados.reverse().map(eq => `
            <div style="background: white; padding: 15px; border-radius: 8px; border: 1px solid #e0e0e0; display: flex; justify-content: space-between; align-items: center;">
                <div>
                    <p style="font-weight: bold; margin: 0;">${eq.id}</p>
                    <p style="font-size: 12px; color: #757575; margin: 5px 0 0 0;">${eq.modelo}</p>
                </div>
                <div style="display: flex; gap: 10px;">
                    <button onclick="UI_MANUAIS_PCM.visualizarPDF('${eq.id}')" class="btn btn-primary btn-sm">👁️ Ver</button>
                    <button onclick="UI_MANUAIS_PCM.substituirPDF('${eq.id}')" class="btn btn-warning btn-sm">🔄 Atualizar</button>
                    <button onclick="UI_MANUAIS_PCM.excluirEquipamento('${eq.id}')" class="btn btn-danger btn-sm">🗑️ Excluir</button>
                </div>
            </div>
        `).join('');
    }
};

// Interface Consulta de Manuais (Manutentor)
const UI_MANUAIS_MANUTENTOR = {
    renderConsultaManuais() {
        document.querySelector('.content').innerHTML = `
            <div class="dashboard-header">
                <h1 class="dashboard-title">Consulta de Manuais Técnicos - Águia Florestal</h1>
                <p class="dashboard-subtitle">Acesso aos manuais de equipamentos disponíveis</p>
            </div>

            <div class="card">
                <h3 class="card-title">Buscar Manual</h3>
                <div style="display: flex; gap: 10px; margin-bottom: 15px;">
                    <input type="text" id="inputBuscaManuaisManutentor" placeholder="ID ou Modelo da Máquina..."
                        class="form-control" style="flex: 1;" onkeyup="UI_MANUAIS_MANUTENTOR.filtrarEquipamentos()">
                    <button class="btn btn-primary" onclick="UI_MANUAIS_MANUTENTOR.renderListaManuais()">🔍 Buscar</button>
                </div>
                <div id="listaManuaisManutentor" style="display: grid; gap: 10px;"></div>
            </div>

            <div id="modalPDFManutentor" style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.9); z-index: 1000; padding: 10px;">
                <div style="max-width: 90%; height: 100%; margin: 0 auto; display: flex; flex-direction: column;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                        <span id="nomeManualAtivoManutentor" style="color: white; font-weight: bold;"></span>
                        <button onclick="UI_MANUAIS_MANUTENTOR.fecharPDF()" class="btn btn-danger">✕ Fechar</button>
                    </div>
                    <iframe id="framePDFManutentor" style="flex: 1; background: white; border-radius: 8px;"></iframe>
                </div>
            </div>
        `;

        this.renderListaManuais();
    },

    async renderListaManuais() {
        const equipamentos = await MANUAIS_DB.obterEquipamentos();
        const container = document.getElementById('listaManuaisManutentor');
        if (!container) return;

        if (equipamentos.length === 0) {
            container.innerHTML = '<div style="text-align: center; padding: 20px; color: #757575;">Nenhum manual disponível.</div>';
            return;
        }

        container.innerHTML = equipamentos.map(eq => `
            <div style="background: white; padding: 15px; border-radius: 8px; border: 1px solid #e0e0e0; display: flex; justify-content: space-between; align-items: center;">
                <div>
                    <p style="font-weight: bold; margin: 0;">${eq.id}</p>
                    <p style="font-size: 12px; color: #757575; margin: 5px 0 0 0;">${eq.modelo}</p>
                    <p style="font-size: 11px; color: #999; margin: 3px 0 0 0;">Tamanho: ${eq.tamanho}</p>
                </div>
                <button onclick="UI_MANUAIS_MANUTENTOR.visualizarPDF('${eq.id}')" class="btn btn-primary btn-sm">👁️ Visualizar</button>
            </div>
        `).join('');
    },

    async visualizarPDF(id) {
        try {
            const eq = await MANUAIS_DB.obterEquipamento(id);
            if (!eq) { alert('Manual não encontrado.'); return; }

            const frame = document.getElementById('framePDFManutentor');
            if (window.pdfUrlAtivaManutentor) URL.revokeObjectURL(window.pdfUrlAtivaManutentor);

            const url = URL.createObjectURL(eq.pdfFile);
            window.pdfUrlAtivaManutentor = url;

            document.getElementById('nomeManualAtivoManutentor').innerText = `Manual: ${eq.id} - ${eq.modelo}`;
            frame.src = url;
            document.getElementById('modalPDFManutentor').style.display = 'block';
            document.body.style.overflow = 'hidden';
        } catch (erro) {
            alert('Erro ao visualizar: ' + erro);
        }
    },

    fecharPDF() {
        document.getElementById('modalPDFManutentor').style.display = 'none';
        document.getElementById('framePDFManutentor').src = '';
        document.body.style.overflow = 'auto';
        if (window.pdfUrlAtivaManutentor) URL.revokeObjectURL(window.pdfUrlAtivaManutentor);
    },

    async filtrarEquipamentos() {
        const termo = document.getElementById('inputBuscaManuaisManutentor').value.toLowerCase();
        const equipamentos = await MANUAIS_DB.obterEquipamentos();
        const filtrados = equipamentos.filter(eq =>
            eq.id.toLowerCase().includes(termo) ||
            eq.modelo.toLowerCase().includes(termo)
        );

        const container = document.getElementById('listaManuaisManutentor');
        container.innerHTML = filtrados.length === 0
            ? '<div style="text-align: center; padding: 20px; color: #757575;">Nenhum resultado encontrado.</div>'
            : filtrados.map(eq => `
                <div style="background: white; padding: 15px; border-radius: 8px; border: 1px solid #e0e0e0; display: flex; justify-content: space-between; align-items: center;">
                    <div>
                        <p style="font-weight: bold; margin: 0;">${eq.id}</p>
                        <p style="font-size: 12px; color: #757575; margin: 5px 0 0 0;">${eq.modelo}</p>
                    </div>
                    <button onclick="UI_MANUAIS_MANUTENTOR.visualizarPDF('${eq.id}')" class="btn btn-primary btn-sm">👁️ Visualizar</button>
                </div>
            `).join('');
    }
};

// ============================================
// INICIALIZAÇÃO
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    DB.init();
    const user = DB.getCurrentUser();
    const role = DB.getCurrentUserRole();

    if (user && role) {
        // Usuário já logado - redirecionar para dashboard
        if (role === 'pcm') {
            UI.renderDashboardPCM();
        } else {
            UI.renderDashboardManutentor();
        }
    } else {
        UI.renderLogin();
    }
});
