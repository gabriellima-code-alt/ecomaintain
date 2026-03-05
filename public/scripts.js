/* ============================================
   ECOMAINTAIN - SISTEMA DE GESTÃO DE MANUTENÇÃO
   Versão 2.0 - Com Checklist Dinâmico, Laudos, Manuais Cloud e Relatórios de Fechamento
   ============================================ */

// ============================================
// CONFIGURAÇÃO DA API
// ============================================

const API_BASE = window.location.origin + '/api';

// ============================================
// GERENCIAMENTO DE DADOS (API Neon via Vercel)
// ============================================

const DB = {
    _cache: {
        currentUser: null,
        currentUserRole: null
    },

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

    setCurrentUser(user, role) {
        this._cache.currentUser = user;
        this._cache.currentUserRole = role;
        sessionStorage.setItem('ecomaintain_sessao', JSON.stringify({
            currentUser: user,
            currentUserRole: role
        }));
    },

    getCurrentUser() { return this._cache.currentUser; },
    getCurrentUserRole() { return this._cache.currentUserRole; },

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
        } catch(e) { console.error(e); return []; }
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
        if (!resp.ok) { const data = await resp.json(); throw new Error(data.erro || 'Erro ao remover manutentor'); }
    },

    async atualizarManutentor(id, email, senha) {
        const resp = await fetch(`${API_BASE}/manutentores`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id, email, senha })
        });
        if (!resp.ok) { const data = await resp.json(); throw new Error(data.erro || 'Erro ao atualizar'); }
    },

    // ---- MÁQUINAS ----
    async obterMaquinas() {
        try {
            const resp = await fetch(`${API_BASE}/maquinas`);
            if (!resp.ok) throw new Error('Erro ao buscar máquinas');
            return await resp.json();
        } catch(e) { console.error(e); return []; }
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
        if (!resp.ok) { const data = await resp.json(); throw new Error(data.erro || 'Erro ao remover máquina'); }
    },

    // ---- PEÇAS ----
    async obterPecas() {
        try {
            const resp = await fetch(`${API_BASE}/pecas`);
            if (!resp.ok) throw new Error('Erro ao buscar peças');
            return await resp.json();
        } catch(e) { console.error(e); return []; }
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
        if (!resp.ok) { const data = await resp.json(); throw new Error(data.erro || 'Erro ao remover peça'); }
    },

    async atualizarPeca(id, quantidade) {
        const resp = await fetch(`${API_BASE}/pecas`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id, quantidade })
        });
        if (!resp.ok) { const data = await resp.json(); throw new Error(data.erro || 'Erro ao atualizar peça'); }
    },

    // ---- ORDENS DE SERVIÇO ----
    async obterOS() {
        try {
            const resp = await fetch(`${API_BASE}/ordens-servico`);
            if (!resp.ok) throw new Error('Erro ao buscar ordens de serviço');
            return await resp.json();
        } catch(e) { console.error(e); return []; }
    },

    async obterOSAtivas() {
        try {
            const resp = await fetch(`${API_BASE}/ordens-servico?status=ativa`);
            if (!resp.ok) throw new Error('Erro ao buscar OS ativas');
            return await resp.json();
        } catch(e) { console.error(e); return []; }
    },

    async obterOSPendentes() {
        try {
            const resp = await fetch(`${API_BASE}/ordens-servico?status=pendente`);
            if (!resp.ok) throw new Error('Erro ao buscar OS pendentes');
            return await resp.json();
        } catch(e) { console.error(e); return []; }
    },

    async obterOSPorId(id) {
        try {
            const resp = await fetch(`${API_BASE}/ordens-servico?id=${id}`);
            if (!resp.ok) throw new Error('Erro ao buscar OS');
            return await resp.json();
        } catch(e) { console.error(e); return null; }
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
        if (!resp.ok) { const data = await resp.json(); throw new Error(data.erro || 'Erro ao atualizar OS'); }
    },

    async adicionarApontamento(osId, apontamento) {
        const resp = await fetch(`${API_BASE}/ordens-servico`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: osId, apontamento })
        });
        if (!resp.ok) { const data = await resp.json(); throw new Error(data.erro || 'Erro ao adicionar apontamento'); }
    },

    async adicionarPecasOS(osId, pecas) {
        const resp = await fetch(`${API_BASE}/ordens-servico`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: osId, pecas })
        });
        if (!resp.ok) { const data = await resp.json(); throw new Error(data.erro || 'Erro ao registrar peças na OS'); }
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
        } catch(e) { console.error(e); return []; }
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

    async atualizarAgendamento(id, status) {
        const resp = await fetch(`${API_BASE}/agenda-preventiva`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id, status })
        });
        if (!resp.ok) { const data = await resp.json(); throw new Error(data.erro || 'Erro ao atualizar agendamento'); }
    },

    async removerAgendamento(id) {
        const resp = await fetch(`${API_BASE}/agenda-preventiva?id=${id}`, { method: 'DELETE' });
        if (!resp.ok) { const data = await resp.json(); throw new Error(data.erro || 'Erro ao remover agendamento'); }
    },

    // ---- CHECKLIST DINÂMICO ----
    async obterChecklistItens(agendaId) {
        try {
            const resp = await fetch(`${API_BASE}/checklist?agendaId=${agendaId}`);
            if (!resp.ok) throw new Error('Erro ao buscar checklist');
            return await resp.json();
        } catch(e) { console.error(e); return []; }
    },

    async adicionarChecklistItem(agendaId, descricao, criadoPor) {
        const resp = await fetch(`${API_BASE}/checklist`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ agendaId, descricao, criadoPor })
        });
        const data = await resp.json();
        if (!resp.ok) throw new Error(data.erro || 'Erro ao adicionar item');
        return data.item;
    },

    async atualizarChecklistItem(id, updates) {
        const resp = await fetch(`${API_BASE}/checklist`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id, ...updates })
        });
        if (!resp.ok) { const data = await resp.json(); throw new Error(data.erro || 'Erro ao atualizar item'); }
    },

    async removerChecklistItem(id) {
        const resp = await fetch(`${API_BASE}/checklist?id=${id}`, { method: 'DELETE' });
        if (!resp.ok) { const data = await resp.json(); throw new Error(data.erro || 'Erro ao remover item'); }
    },

    // ---- LAUDOS ----
    async obterLaudos(filtros = {}) {
        try {
            let url = `${API_BASE}/laudos`;
            const params = new URLSearchParams();
            if (filtros.agendaId) params.append('agendaId', filtros.agendaId);
            if (filtros.status) params.append('status', filtros.status);
            if (params.toString()) url += '?' + params.toString();
            const resp = await fetch(url);
            if (!resp.ok) throw new Error('Erro ao buscar laudos');
            return await resp.json();
        } catch(e) { console.error(e); return []; }
    },

    async obterLaudoPorId(id) {
        try {
            const resp = await fetch(`${API_BASE}/laudos?id=${id}`);
            if (!resp.ok) throw new Error('Erro ao buscar laudo');
            return await resp.json();
        } catch(e) { console.error(e); return null; }
    },

    async gerarLaudo(dados) {
        const resp = await fetch(`${API_BASE}/laudos`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dados)
        });
        const data = await resp.json();
        if (!resp.ok) throw new Error(data.erro || 'Erro ao gerar laudo');
        return data.laudo;
    },

    async aprovarLaudo(id, statusLaudo, aprovadoPor) {
        const resp = await fetch(`${API_BASE}/laudos`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id, statusLaudo, aprovadoPor })
        });
        if (!resp.ok) { const data = await resp.json(); throw new Error(data.erro || 'Erro ao aprovar laudo'); }
    },

    // ---- MANUAIS (CLOUD) ----
    async obterManuais(busca) {
        try {
            let url = `${API_BASE}/manuais`;
            if (busca) url += `?busca=${encodeURIComponent(busca)}`;
            const resp = await fetch(url);
            if (!resp.ok) throw new Error('Erro ao buscar manuais');
            return await resp.json();
        } catch(e) { console.error(e); return []; }
    },

    async obterManualComPDF(id) {
        try {
            const resp = await fetch(`${API_BASE}/manuais?id=${id}`);
            if (!resp.ok) throw new Error('Erro ao buscar manual');
            return await resp.json();
        } catch(e) { console.error(e); return null; }
    },

    async salvarManual(dados) {
        const resp = await fetch(`${API_BASE}/manuais`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dados)
        });
        const data = await resp.json();
        if (!resp.ok) throw new Error(data.erro || 'Erro ao salvar manual');
        return data;
    },

    async removerManual(id) {
        const resp = await fetch(`${API_BASE}/manuais?id=${id}`, { method: 'DELETE' });
        if (!resp.ok) { const data = await resp.json(); throw new Error(data.erro || 'Erro ao remover manual'); }
    },

    // ---- RELATÓRIOS DE FECHAMENTO ----
    async obterRelatoriosFechamento(filtros = {}) {
        try {
            let url = `${API_BASE}/relatorios-fechamento`;
            const params = new URLSearchParams();
            if (filtros.osId) params.append('osId', filtros.osId);
            if (filtros.naoVisualizados) params.append('naoVisualizados', 'true');
            if (params.toString()) url += '?' + params.toString();
            const resp = await fetch(url);
            if (!resp.ok) throw new Error('Erro ao buscar relatórios');
            return await resp.json();
        } catch(e) { console.error(e); return []; }
    },

    async obterRelatorioFechamentoPorId(id) {
        try {
            const resp = await fetch(`${API_BASE}/relatorios-fechamento?id=${id}`);
            if (!resp.ok) throw new Error('Erro ao buscar relatório');
            return await resp.json();
        } catch(e) { console.error(e); return null; }
    },

    async criarRelatorioFechamento(dados) {
        const resp = await fetch(`${API_BASE}/relatorios-fechamento`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dados)
        });
        const data = await resp.json();
        if (!resp.ok) throw new Error(data.erro || 'Erro ao criar relatório');
        return data.relatorio;
    }
};

// ============================================
// INTERFACE DO USUÁRIO
// ============================================

const UI = {
    renderLogin() {
        document.getElementById('app').innerHTML = `
            <div class="login-container">
                <div class="login-card">
                    <div class="logo-section" style="text-align: center; margin-bottom: 30px;">
                        <div class="logo-icon" style="font-size: 48px;">🌲</div>
                        <h1 style="color: #1f7e3d; margin: 10px 0 5px;">EcoMaintain</h1>
                        <p style="color: #757575; margin: 0;">Sistema de Gestão de Manutenção</p>
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
                        <input type="password" id="loginPassword" class="form-control" placeholder="Digite sua senha"
                            onkeypress="if(event.key==='Enter') AUTH.login()">
                    </div>

                    <button class="btn btn-primary btn-block btn-lg" onclick="AUTH.login()">Entrar</button>
                    <button class="btn btn-secondary btn-block" style="margin-top: 10px;" onclick="AUTH.showRecuperarSenha()">🔑 Esqueci minha Senha</button>
                </div>
            </div>
        `;
    },

    renderRecuperarSenha() {
        document.getElementById('app').innerHTML = `
            <div class="login-container">
                <div class="login-card">
                    <h2 style="color: #1f7e3d; text-align: center; margin-bottom: 20px;">🔑 Recuperar Senha</h2>
                    <div class="form-group">
                        <label class="form-label">Email:</label>
                        <input type="email" id="emailRecuperacao" class="form-control" placeholder="Digite seu email">
                    </div>
                    <button class="btn btn-primary btn-block" onclick="AUTH.enviarRecuperacao()">Enviar Código</button>
                    <button class="btn btn-secondary btn-block" style="margin-top: 10px;" onclick="AUTH.showLogin()">Voltar</button>
                </div>
            </div>
        `;
    },

    // ============================================
    // DASHBOARD MANUTENTOR
    // ============================================
    async renderDashboardManutentor() {
        const user = DB.getCurrentUser();
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
                                <span class="nav-icon">🏠</span><span>Início</span>
                            </a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link" onclick="UI.renderPainelOS()">
                                <span class="nav-icon">📋</span><span>Minhas O.S.</span>
                            </a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link" onclick="UI.renderChecklistPreventivo()">
                                <span class="nav-icon">✔️</span><span>Checklist</span>
                            </a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link" onclick="UI_MANUAIS_MANUTENTOR.renderConsultaManuais()">
                                <span class="nav-icon">📖</span><span>Manuais</span>
                            </a>
                        </li>
                    </ul>
                    <div style="padding: 20px; margin-top: auto;">
                        <div style="font-size: 0.85em; color: #a5d6a7; margin-bottom: 10px;">
                            👤 ${user ? user.nome : 'Manutentor'}<br>
                            <small>${user ? user.email : ''}</small>
                        </div>
                        <button class="btn btn-secondary btn-block" onclick="AUTH.logout()">Sair</button>
                    </div>
                </div>

                <div class="main-content">
                    <div class="header">
                        <div class="header-title">
                            <div class="header-logo">🌲</div>
                            <span>Dashboard Manutentor</span>
                        </div>
                        <div style="display: flex; align-items: center; gap: 15px;">
                            <span style="color: #555;">${user ? user.nome : ''}</span>
                            <button class="btn btn-secondary btn-sm" onclick="AUTH.logout()">Sair</button>
                        </div>
                    </div>

                    <div class="content">
                        <div class="dashboard-header">
                            <h1 class="dashboard-title">Bem-vindo, ${user ? user.nome : 'Manutentor'}!</h1>
                            <p class="dashboard-subtitle">Selecione uma ação para começar</p>
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

    // ============================================
    // NOVA O.S.
    // ============================================
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

    // ============================================
    // CONTROLE DE EXECUÇÃO
    // ============================================
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

    // ============================================
    // REGISTRO DE PEÇAS
    // ============================================
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
        window._pecasCache = pecas;
    },

    // ============================================
    // FECHAMENTO COM MÚLTIPLAS FOTOS
    // ============================================
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
                    <label class="form-label">Descrição do Serviço Executado <span style="color: red;">*</span></label>
                    <textarea id="descricaoServico" class="form-control" placeholder="Descreva detalhadamente o que foi feito, peças substituídas, ajustes realizados..." rows="4" minlength="10"></textarea>
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

                <!-- MÚLTIPLAS FOTOS DE EVIDÊNCIA -->
                <div class="form-group">
                    <label class="form-label">📸 Fotos de Evidência <span style="color: red;">*</span></label>
                    <div style="border: 2px dashed #1f7e3d; border-radius: 8px; padding: 20px; text-align: center; background: #f9fbe7; cursor: pointer;" onclick="document.getElementById('fotosEvidencia').click()">
                        <div style="font-size: 2em; margin-bottom: 10px;">📷</div>
                        <p style="margin: 0; color: #558b2f; font-weight: bold;">Clique para adicionar fotos</p>
                        <p style="margin: 5px 0 0; color: #757575; font-size: 0.85em;">Você pode selecionar múltiplas fotos (JPG, PNG)</p>
                    </div>
                    <input type="file" id="fotosEvidencia" class="form-control" accept="image/*" multiple style="display: none;" onchange="FECHAMENTO.previewFotos(this)">
                    <div id="previewFotos" style="display: flex; flex-wrap: wrap; gap: 10px; margin-top: 15px;"></div>
                    <small style="color: #757575;">Pelo menos 1 foto obrigatória para finalizar</small>
                </div>

                <!-- ASSINATURA DIGITAL -->
                <div class="form-group">
                    <label class="form-label">✍️ Assinatura Digital do Manutentor <span style="color: red;">*</span></label>
                    <canvas id="signatureCanvas" style="border: 2px solid #e0e0e0; border-radius: 6px; background-color: white; cursor: crosshair; display: block; margin: 10px 0; width: 100%; height: 150px; touch-action: none;"></canvas>
                    <small style="color: #757575;">Assine com o dedo ou mouse para confirmar</small>
                    <button type="button" class="btn btn-secondary btn-sm" onclick="ASSINATURA.limpar()" style="margin-top: 10px;">🗑️ Limpar Assinatura</button>
                </div>

                <!-- RESUMO DA EXECUÇÃO -->
                <div id="historicoExecucao" style="margin-top: 20px; padding: 15px; background-color: #f5f5f5; border-radius: 6px;">
                    <h4 style="color: #1f7e3d; margin-bottom: 10px;">📊 Resumo da Execução</h4>
                    <div id="resumoExecucao">Selecione uma O.S. para ver o resumo</div>
                </div>

                <div style="display: flex; gap: 10px; margin-top: 20px;">
                    <button type="button" class="btn btn-primary" onclick="FECHAMENTO.finalizar()">✅ Finalizar O.S. e Gerar Relatório</button>
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

    // ============================================
    // PAINEL DE O.S. DO MANUTENTOR
    // ============================================
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
                        ${os.laudoGerado ? '<span class="badge badge-success" style="margin-top: 5px;">📄 Laudo Gerado</span>' : ''}
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

    // ============================================
    // DASHBOARD PCM
    // ============================================
    async renderDashboardPCM() {
        const user = DB.getCurrentUser();
        document.getElementById('app').innerHTML = `
            <div class="app-container">
                <div class="content" style="display:flex;align-items:center;justify-content:center;">
                    <div style="text-align:center;"><div class="logo-icon" style="font-size:40px;">🌲</div><p>Carregando...</p></div>
                </div>
            </div>`;

        const [osAtivas, osPendentes, todasOS, manutentores, laudosPendentes, relatoriosNaoVistos] = await Promise.all([
            DB.obterOSAtivas(),
            DB.obterOSPendentes(),
            DB.obterOS(),
            DB.obterManutentores(),
            DB.obterLaudos({ status: 'pendente_aprovacao' }),
            DB.obterRelatoriosFechamento({ naoVisualizados: true })
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
                                <span class="nav-icon">📊</span><span>Dashboard</span>
                            </a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link" onclick="UI.renderGestaoOS()">
                                <span class="nav-icon">📋</span><span>Gestão de O.S.</span>
                            </a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link" onclick="UI.renderLaudosPCM()">
                                <span class="nav-icon">📄</span>
                                <span>Laudos de Checklist ${laudosPendentes.length > 0 ? `<span class="badge badge-danger" style="margin-left:5px;">${laudosPendentes.length}</span>` : ''}</span>
                            </a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link" onclick="UI.renderRelatoriosFechamentoPCM()">
                                <span class="nav-icon">📑</span>
                                <span>Relatórios O.S. ${relatoriosNaoVistos.length > 0 ? `<span class="badge badge-danger" style="margin-left:5px;">${relatoriosNaoVistos.length}</span>` : ''}</span>
                            </a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link" onclick="UI.renderEstoque()">
                                <span class="nav-icon">📦</span><span>Estoque</span>
                            </a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link" onclick="UI.renderManutentores()">
                                <span class="nav-icon">👥</span><span>Manutentores</span>
                            </a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link" onclick="UI.renderRelatorios()">
                                <span class="nav-icon">📈</span><span>Relatórios</span>
                            </a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link" onclick="UI.renderAgendaPreventiva()">
                                <span class="nav-icon">📅</span><span>Agenda Preventiva</span>
                            </a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link" onclick="UI_MANUAIS_PCM.renderGestaoManuais()">
                                <span class="nav-icon">🌲</span><span>Manuais</span>
                            </a>
                        </li>
                    </ul>
                    <div style="padding: 20px; margin-top: auto;">
                        <div style="font-size: 0.85em; color: #a5d6a7; margin-bottom: 10px;">
                            👤 ${user ? user.nome : 'PCM'}<br>
                            <small>${user ? user.email : ''}</small>
                        </div>
                        <button class="btn btn-secondary btn-block" onclick="AUTH.logout()">Sair</button>
                    </div>
                </div>

                <div class="main-content">
                    <div class="header">
                        <div class="header-title">
                            <div class="header-logo">🌲</div>
                            <span>Dashboard PCM</span>
                        </div>
                        <div style="display: flex; align-items: center; gap: 15px;">
                            <span style="color: #555;">${user ? user.nome : ''}</span>
                            <button class="btn btn-secondary btn-sm" onclick="AUTH.logout()">Sair</button>
                        </div>
                    </div>

                    <div class="content">
                        <div class="dashboard-header">
                            <h1 class="dashboard-title">Bem-vindo, ${user ? user.nome : 'Administrador PCM'}!</h1>
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
                                <div class="stat-label">Laudos p/ Aprovar</div>
                                <div class="stat-value" style="color: #e53935;">${laudosPendentes.length}</div>
                            </div>
                            <div class="stat-card">
                                <div class="stat-label">Relatórios Novos</div>
                                <div class="stat-value" style="color: #1565c0;">${relatoriosNaoVistos.length}</div>
                            </div>
                        </div>

                        <div class="card">
                            <h3 class="card-title">Ações Rápidas</h3>
                            <div class="grid grid-2">
                                <button class="btn btn-primary btn-lg" onclick="UI.renderGestaoOS()">
                                    📋 Gestão de O.S.
                                </button>
                                <button class="btn btn-lg" style="background-color: #e53935;" onclick="UI.renderLaudosPCM()">
                                    📄 Laudos ${laudosPendentes.length > 0 ? `(${laudosPendentes.length} pendentes)` : ''}
                                </button>
                                <button class="btn btn-lg" style="background-color: #1565c0;" onclick="UI.renderRelatoriosFechamentoPCM()">
                                    📑 Relatórios O.S. ${relatoriosNaoVistos.length > 0 ? `(${relatoriosNaoVistos.length} novos)` : ''}
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

    // ============================================
    // GESTÃO DE O.S. (PCM)
    // ============================================
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
                        <th>Laudo</th>
                        <th>Ações</th>
                    </tr>
                </thead>
                <tbody>
                    ${lista.map(os => `
                        <tr>
                            <td><strong>${os.id}</strong></td>
                            <td>${os.maquinaId}</td>
                            <td>${os.descricao.substring(0, 30)}...</td>
                            <td><span class="badge ${os.status === 'ativa' ? 'badge-success' : 'badge-warning'}">${os.status.toUpperCase()}</span></td>
                            <td>${os.dataCriacao ? os.dataCriacao.split('T')[0] : '--'}</td>
                            <td>${os.laudoGerado ? '<span class="badge badge-success">✓ Gerado</span>' : '<span style="color:#999;">--</span>'}</td>
                            <td>
                                <button class="btn btn-sm btn-secondary" onclick="UI.visualizarOSDetalhes('${os.id}')">Ver</button>
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

    async visualizarOSDetalhes(osId) {
        const [os, relatorios] = await Promise.all([
            DB.obterOSPorId(osId),
            DB.obterRelatoriosFechamento({ osId })
        ]);
        if (!os) return;

        const tempoTotal = os.dataFechamento
            ? new Date(os.dataFechamento) - new Date(os.dataCriacao)
            : new Date() - new Date(os.dataCriacao);
        const horas = Math.floor(tempoTotal / 3600000);
        const minutos = Math.floor((tempoTotal % 3600000) / 60000);

        const relatorio = relatorios.length > 0 ? relatorios[0] : null;

        document.querySelector('.content').innerHTML = `
            <div class="dashboard-header">
                <h1 class="dashboard-title">📋 Detalhes da O.S. ${os.id}</h1>
                <button class="btn btn-secondary" onclick="UI.renderGestaoOS()">← Voltar</button>
            </div>

            <div class="grid grid-2">
                <div class="card">
                    <h3 class="card-title">Informações Gerais</h3>
                    <p><strong>ID:</strong> ${os.id}</p>
                    <p><strong>Máquina:</strong> ${os.maquinaId}</p>
                    <p><strong>Manutentor:</strong> ${os.manutentor || '--'}</p>
                    <p><strong>Status:</strong> <span class="badge ${os.status === 'ativa' ? 'badge-success' : 'badge-warning'}">${os.status.toUpperCase()}</span></p>
                    <p><strong>Abertura:</strong> ${os.dataCriacao ? new Date(os.dataCriacao).toLocaleString('pt-BR') : '--'}</p>
                    <p><strong>Fechamento:</strong> ${os.dataFechamento ? new Date(os.dataFechamento).toLocaleString('pt-BR') : '--'}</p>
                    <p><strong>Tempo Total:</strong> ${horas}h ${minutos}m</p>
                    <p><strong>Laudo Gerado:</strong> ${os.laudoGerado ? '✅ Sim' : '❌ Não'}</p>
                </div>

                <div class="card">
                    <h3 class="card-title">Descrição</h3>
                    <p><strong>Problema:</strong> ${os.descricao}</p>
                    <p><strong>Solução:</strong> ${os.descricaoFinal || '--'}</p>
                    <p><strong>Apontamentos:</strong> ${os.apontamentos ? os.apontamentos.length : 0}</p>
                    <p><strong>Peças Utilizadas:</strong> ${os.pecas ? os.pecas.length : 0}</p>
                </div>
            </div>

            ${relatorio ? `
            <div class="card" style="margin-top: 20px; border-left: 4px solid #1f7e3d;">
                <h3 class="card-title">📑 Relatório de Fechamento</h3>
                <div class="grid grid-2">
                    <div>
                        <p><strong>Status Final:</strong> <span class="badge ${relatorio.statusFinal === 'finalizado' ? 'badge-success' : 'badge-warning'}">${relatorio.statusFinal === 'finalizado' ? 'Finalizado' : 'Pendente'}</span></p>
                        <p><strong>Gerado em:</strong> ${new Date(relatorio.dataGeracao).toLocaleString('pt-BR')}</p>
                        <p><strong>Fotos Anexadas:</strong> ${(relatorio.fotosEvidencia || []).length}</p>
                    </div>
                    <div>
                        <p><strong>Descrição:</strong> ${relatorio.descricaoExecucao || '--'}</p>
                    </div>
                </div>
                ${(relatorio.fotosEvidencia || []).length > 0 ? `
                <h4 style="margin-top: 15px;">Fotos de Evidência:</h4>
                <div style="display: flex; flex-wrap: wrap; gap: 10px; margin-top: 10px;">
                    ${relatorio.fotosEvidencia.map((foto, i) => `
                        <img src="${foto}" alt="Evidência ${i+1}"
                            style="width: 120px; height: 90px; object-fit: cover; border-radius: 6px; cursor: pointer; border: 2px solid #ddd;"
                            onclick="UI.ampliarFoto('${foto}')">
                    `).join('')}
                </div>
                ` : ''}
                ${relatorio.assinaturaManutentor ? `
                <h4 style="margin-top: 15px;">Assinatura do Manutentor:</h4>
                <img src="${relatorio.assinaturaManutentor}" alt="Assinatura" style="border: 1px solid #ddd; border-radius: 4px; max-width: 300px;">
                ` : ''}
                <div style="margin-top: 15px;">
                    <button class="btn btn-primary" onclick="RELATORIOS.exportarRelatorioFechamento('${relatorio.id}')">📥 Exportar PDF</button>
                </div>
            </div>
            ` : ''}

            ${os.apontamentos && os.apontamentos.length > 0 ? `
            <div class="card" style="margin-top: 20px;">
                <h3 class="card-title">Histórico de Apontamentos</h3>
                <table class="table">
                    <thead><tr><th>Tipo</th><th>Motivo</th><th>Data/Hora</th></tr></thead>
                    <tbody>
                        ${os.apontamentos.map(a => `
                            <tr>
                                <td><span class="badge ${a.tipo === 'inicio' ? 'badge-success' : 'badge-warning'}">${a.tipo}</span></td>
                                <td>${a.motivo || '--'}</td>
                                <td>${a.timestamp ? new Date(a.timestamp).toLocaleString('pt-BR') : '--'}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
            ` : ''}
        `;
    },

    ampliarFoto(src) {
        const modal = document.createElement('div');
        modal.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.9);z-index:9999;display:flex;align-items:center;justify-content:center;cursor:pointer;';
        modal.innerHTML = `<img src="${src}" style="max-width:90%;max-height:90%;border-radius:8px;">`;
        modal.onclick = () => modal.remove();
        document.body.appendChild(modal);
    },

    // ============================================
    // LAUDOS PCM
    // ============================================
    async renderLaudosPCM() {
        const laudos = await DB.obterLaudos();

        document.querySelector('.content').innerHTML = `
            <div class="dashboard-header">
                <h1 class="dashboard-title">📄 Laudos de Checklist Preventivo</h1>
                <p class="dashboard-subtitle">Revisão e aprovação dos checklists executados pelos manutentores</p>
            </div>

            <div class="filter-bar">
                <button class="filter-btn active" onclick="UI.filtrarLaudos('todos', this)">Todos (${laudos.length})</button>
                <button class="filter-btn" onclick="UI.filtrarLaudos('pendente_aprovacao', this)">Pendentes (${laudos.filter(l => l.statusLaudo === 'pendente_aprovacao').length})</button>
                <button class="filter-btn" onclick="UI.filtrarLaudos('aprovado', this)">Aprovados (${laudos.filter(l => l.statusLaudo === 'aprovado').length})</button>
            </div>

            <div id="listaLaudos">
                ${this.renderTabelaLaudos(laudos)}
            </div>
        `;
        window._laudosCache = laudos;
    },

    renderTabelaLaudos(lista) {
        if (lista.length === 0) {
            return '<div class="alert alert-info">Nenhum laudo encontrado.</div>';
        }

        return `
            <div class="grid grid-2">
                ${lista.map(l => `
                    <div class="card" style="border-left: 4px solid ${l.statusLaudo === 'aprovado' ? '#28a745' : l.statusLaudo === 'reprovado' ? '#dc3545' : '#ffc107'};">
                        <div style="display: flex; justify-content: space-between; align-items: start;">
                            <div>
                                <h3 class="card-title" style="margin: 0;">${l.id}</h3>
                                <p style="margin: 5px 0; color: #666;">${l.maquinaNome || l.maquinaId || '--'}</p>
                            </div>
                            <span class="badge ${l.statusLaudo === 'aprovado' ? 'badge-success' : l.statusLaudo === 'reprovado' ? 'badge-danger' : 'badge-warning'}">
                                ${l.statusLaudo === 'aprovado' ? '✓ Aprovado' : l.statusLaudo === 'reprovado' ? '✗ Reprovado' : '⏳ Pendente'}
                            </span>
                        </div>
                        <p style="margin: 5px 0;"><strong>Manutentor:</strong> ${l.manutentorNome || '--'}</p>
                        <p style="margin: 5px 0;"><strong>Tipo:</strong> ${l.tipoManutencao || '--'}</p>
                        <p style="margin: 5px 0;"><strong>Itens:</strong> ${l.totalItens} total | <span style="color: #28a745;">${l.itensOk} OK</span> | <span style="color: #dc3545;">${l.itensNaoOk} Não OK</span></p>
                        <p style="margin: 5px 0;"><strong>Gerado:</strong> ${l.dataGeracao ? new Date(l.dataGeracao).toLocaleString('pt-BR') : '--'}</p>
                        <div style="display: flex; gap: 8px; margin-top: 12px;">
                            <button class="btn btn-sm btn-secondary" onclick="UI.visualizarLaudo('${l.id}')">👁️ Visualizar</button>
                            ${l.statusLaudo === 'pendente_aprovacao' ? `
                                <button class="btn btn-sm btn-success" onclick="PCM.aprovarLaudo('${l.id}')">✓ Aprovar</button>
                                <button class="btn btn-sm btn-danger" onclick="PCM.reprovarLaudo('${l.id}')">✗ Reprovar</button>
                            ` : ''}
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    },

    filtrarLaudos(filtro, btn) {
        const laudos = window._laudosCache || [];
        let lista = filtro === 'todos' ? laudos : laudos.filter(l => l.statusLaudo === filtro);
        document.getElementById('listaLaudos').innerHTML = this.renderTabelaLaudos(lista);
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        if (btn) btn.classList.add('active');
    },

    async visualizarLaudo(laudoId) {
        const laudo = await DB.obterLaudoPorId(laudoId);
        if (!laudo) return;

        document.querySelector('.content').innerHTML = `
            <div class="dashboard-header">
                <h1 class="dashboard-title">📄 Laudo de Checklist - ${laudo.id}</h1>
                <button class="btn btn-secondary" onclick="UI.renderLaudosPCM()">← Voltar</button>
            </div>

            <div class="card">
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px;">
                    <div>
                        <h3 style="color: #1f7e3d;">Informações do Laudo</h3>
                        <p><strong>ID do Laudo:</strong> ${laudo.id}</p>
                        <p><strong>Máquina:</strong> ${laudo.maquinaNome || laudo.maquinaId || '--'}</p>
                        <p><strong>Manutentor:</strong> ${laudo.manutentorNome || '--'}</p>
                        <p><strong>Tipo:</strong> ${laudo.tipoManutencao || '--'}</p>
                        <p><strong>Data de Execução:</strong> ${laudo.dataExecucao ? new Date(laudo.dataExecucao).toLocaleString('pt-BR') : '--'}</p>
                        <p><strong>Data de Geração:</strong> ${laudo.dataGeracao ? new Date(laudo.dataGeracao).toLocaleString('pt-BR') : '--'}</p>
                    </div>
                    <div>
                        <h3 style="color: #1f7e3d;">Resumo</h3>
                        <div style="display: flex; gap: 15px; flex-wrap: wrap;">
                            <div style="background: #f5f5f5; padding: 15px; border-radius: 8px; text-align: center; flex: 1;">
                                <div style="font-size: 2em; font-weight: bold;">${laudo.totalItens}</div>
                                <div style="color: #666;">Total</div>
                            </div>
                            <div style="background: #e8f5e9; padding: 15px; border-radius: 8px; text-align: center; flex: 1;">
                                <div style="font-size: 2em; font-weight: bold; color: #28a745;">${laudo.itensOk}</div>
                                <div style="color: #666;">OK</div>
                            </div>
                            <div style="background: #ffebee; padding: 15px; border-radius: 8px; text-align: center; flex: 1;">
                                <div style="font-size: 2em; font-weight: bold; color: #dc3545;">${laudo.itensNaoOk}</div>
                                <div style="color: #666;">Não OK</div>
                            </div>
                        </div>
                        <div style="margin-top: 15px; padding: 10px; border-radius: 6px; background: ${laudo.statusLaudo === 'aprovado' ? '#e8f5e9' : laudo.statusLaudo === 'reprovado' ? '#ffebee' : '#fff8e1'};">
                            <strong>Status:</strong>
                            <span class="badge ${laudo.statusLaudo === 'aprovado' ? 'badge-success' : laudo.statusLaudo === 'reprovado' ? 'badge-danger' : 'badge-warning'}" style="margin-left: 8px;">
                                ${laudo.statusLaudo === 'aprovado' ? '✓ Aprovado' : laudo.statusLaudo === 'reprovado' ? '✗ Reprovado' : '⏳ Pendente Aprovação'}
                            </span>
                            ${laudo.aprovadoPor ? `<br><small style="color: #666;">Por: ${laudo.aprovadoPor} em ${new Date(laudo.dataAprovacao).toLocaleString('pt-BR')}</small>` : ''}
                        </div>
                    </div>
                </div>

                <h3 style="color: #1f7e3d; border-bottom: 2px solid #e0e0e0; padding-bottom: 10px;">Itens do Checklist</h3>
                <div style="margin-top: 15px;">
                    ${(laudo.itensChecklist || []).map((item, idx) => `
                        <div style="padding: 12px; border: 1px solid ${item.status === 'ok' ? '#c8e6c9' : item.status === 'nao_ok' ? '#ffcdd2' : '#e0e0e0'}; border-radius: 6px; margin-bottom: 8px; background: ${item.status === 'ok' ? '#f1f8e9' : item.status === 'nao_ok' ? '#fff5f5' : '#fafafa'};">
                            <div style="display: flex; align-items: center; gap: 10px;">
                                <span style="font-size: 1.3em;">${item.status === 'ok' ? '✅' : item.status === 'nao_ok' ? '❌' : '⏳'}</span>
                                <div style="flex: 1;">
                                    <strong>${idx + 1}. ${item.descricao}</strong>
                                    ${item.status === 'nao_ok' && item.observacao ? `
                                        <div style="margin-top: 5px; padding: 8px; background: #fff3e0; border-radius: 4px; border-left: 3px solid #ff9800;">
                                            <strong>⚠️ Observação:</strong> ${item.observacao}
                                        </div>
                                    ` : ''}
                                </div>
                                <span class="badge ${item.status === 'ok' ? 'badge-success' : item.status === 'nao_ok' ? 'badge-danger' : 'badge-warning'}">
                                    ${item.status === 'ok' ? 'OK' : item.status === 'nao_ok' ? 'NÃO OK' : 'Pendente'}
                                </span>
                            </div>
                        </div>
                    `).join('')}
                </div>

                ${laudo.observacoesGerais ? `
                <div style="margin-top: 20px; padding: 15px; background: #fff8e1; border-radius: 6px; border-left: 4px solid #ffc107;">
                    <h4>📝 Observações Gerais:</h4>
                    <p>${laudo.observacoesGerais}</p>
                </div>
                ` : ''}

                ${laudo.statusLaudo === 'pendente_aprovacao' ? `
                <div style="display: flex; gap: 10px; margin-top: 20px; padding-top: 20px; border-top: 1px solid #e0e0e0;">
                    <button class="btn btn-success" onclick="PCM.aprovarLaudo('${laudo.id}')">✓ Aprovar Laudo</button>
                    <button class="btn btn-danger" onclick="PCM.reprovarLaudo('${laudo.id}')">✗ Reprovar Laudo</button>
                    <button class="btn btn-secondary" onclick="UI.renderLaudosPCM()">Cancelar</button>
                </div>
                ` : `
                <div style="margin-top: 20px;">
                    <button class="btn btn-secondary" onclick="UI.renderLaudosPCM()">← Voltar à Lista</button>
                    <button class="btn btn-primary" style="margin-left: 10px;" onclick="RELATORIOS.exportarLaudo('${laudo.id}')">📥 Exportar PDF</button>
                </div>
                `}
            </div>
        `;
    },

    // ============================================
    // RELATÓRIOS DE FECHAMENTO PCM
    // ============================================
    async renderRelatoriosFechamentoPCM() {
        const relatorios = await DB.obterRelatoriosFechamento();

        document.querySelector('.content').innerHTML = `
            <div class="dashboard-header">
                <h1 class="dashboard-title">📑 Relatórios de Fechamento de O.S.</h1>
                <p class="dashboard-subtitle">Relatórios consolidados enviados pelos manutentores ao fechar ordens de serviço</p>
            </div>

            ${relatorios.length === 0 ? '<div class="alert alert-info">Nenhum relatório de fechamento encontrado.</div>' : `
            <div class="grid grid-2">
                ${relatorios.map(r => `
                    <div class="card" style="border-left: 4px solid ${r.statusFinal === 'finalizado' ? '#28a745' : '#ffc107'}; ${!r.visualizadoPcm ? 'box-shadow: 0 0 0 2px #1565c0;' : ''}">
                        ${!r.visualizadoPcm ? '<div style="background: #1565c0; color: white; padding: 4px 10px; border-radius: 4px; font-size: 0.8em; margin-bottom: 10px; display: inline-block;">🆕 NOVO</div>' : ''}
                        <div style="display: flex; justify-content: space-between; align-items: start;">
                            <div>
                                <h3 class="card-title" style="margin: 0;">${r.osId}</h3>
                                <p style="margin: 5px 0; color: #666;">${r.maquinaNome || r.maquinaId || '--'}</p>
                            </div>
                            <span class="badge ${r.statusFinal === 'finalizado' ? 'badge-success' : 'badge-warning'}">
                                ${r.statusFinal === 'finalizado' ? '✓ Finalizado' : '⚠️ Pendente'}
                            </span>
                        </div>
                        <p style="margin: 5px 0;"><strong>Manutentor:</strong> ${r.manutentorNome || '--'}</p>
                        <p style="margin: 5px 0;"><strong>Fechamento:</strong> ${r.dataFechamento ? new Date(r.dataFechamento).toLocaleString('pt-BR') : '--'}</p>
                        <p style="margin: 5px 0;"><strong>Fotos:</strong> ${(r.fotosEvidencia || []).length} anexadas</p>
                        <button class="btn btn-sm btn-primary" style="margin-top: 10px;" onclick="UI.visualizarRelatorioFechamento('${r.id}')">
                            👁️ Ver Relatório Completo
                        </button>
                    </div>
                `).join('')}
            </div>
            `}
        `;
    },

    async visualizarRelatorioFechamento(relatorioId) {
        const relatorio = await DB.obterRelatorioFechamentoPorId(relatorioId);
        if (!relatorio) return;

        document.querySelector('.content').innerHTML = `
            <div class="dashboard-header">
                <h1 class="dashboard-title">📑 Relatório de Fechamento</h1>
                <button class="btn btn-secondary" onclick="UI.renderRelatoriosFechamentoPCM()">← Voltar</button>
            </div>

            <div class="card" id="relatorioParaExportar">
                <div style="text-align: center; margin-bottom: 20px; padding-bottom: 20px; border-bottom: 2px solid #1f7e3d;">
                    <h2 style="color: #1f7e3d;">🌲 EcoMaintain - Relatório de Fechamento de O.S.</h2>
                    <p style="color: #666;">Gerado em: ${new Date(relatorio.dataGeracao).toLocaleString('pt-BR')}</p>
                </div>

                <div class="grid grid-2" style="margin-bottom: 20px;">
                    <div style="background: #f5f5f5; padding: 15px; border-radius: 8px;">
                        <h3 style="color: #1f7e3d; margin-top: 0;">📋 Dados da O.S.</h3>
                        <p><strong>O.S.:</strong> ${relatorio.osId}</p>
                        <p><strong>Máquina:</strong> ${relatorio.maquinaNome || relatorio.maquinaId || '--'}</p>
                        <p><strong>Manutentor:</strong> ${relatorio.manutentorNome || '--'}</p>
                        <p><strong>Status Final:</strong>
                            <span class="badge ${relatorio.statusFinal === 'finalizado' ? 'badge-success' : 'badge-warning'}">
                                ${relatorio.statusFinal === 'finalizado' ? '✓ Finalizado com Sucesso' : '⚠️ Pendente (Peça Externa)'}
                            </span>
                        </p>
                    </div>
                    <div style="background: #f5f5f5; padding: 15px; border-radius: 8px;">
                        <h3 style="color: #1f7e3d; margin-top: 0;">⏱️ Datas</h3>
                        <p><strong>Início:</strong> ${relatorio.dataInicio ? new Date(relatorio.dataInicio).toLocaleString('pt-BR') : '--'}</p>
                        <p><strong>Fechamento:</strong> ${relatorio.dataFechamento ? new Date(relatorio.dataFechamento).toLocaleString('pt-BR') : '--'}</p>
                        <p><strong>Apontamentos:</strong> ${(relatorio.apontamentos || []).length}</p>
                        <p><strong>Peças Utilizadas:</strong> ${(relatorio.pecasUtilizadas || []).length}</p>
                    </div>
                </div>

                <div style="background: #e8f5e9; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
                    <h3 style="color: #1f7e3d; margin-top: 0;">📝 Resumo da Execução</h3>
                    <p style="white-space: pre-wrap;">${relatorio.descricaoExecucao || '--'}</p>
                </div>

                ${(relatorio.fotosEvidencia || []).length > 0 ? `
                <div style="margin-bottom: 20px;">
                    <h3 style="color: #1f7e3d;">📸 Fotos de Evidência (${relatorio.fotosEvidencia.length})</h3>
                    <div style="display: flex; flex-wrap: wrap; gap: 10px;">
                        ${relatorio.fotosEvidencia.map((foto, i) => `
                            <div style="text-align: center;">
                                <img src="${foto}" alt="Evidência ${i+1}"
                                    style="width: 150px; height: 110px; object-fit: cover; border-radius: 6px; cursor: pointer; border: 2px solid #ddd;"
                                    onclick="UI.ampliarFoto('${foto}')">
                                <div style="font-size: 0.8em; color: #666; margin-top: 4px;">Foto ${i+1}</div>
                            </div>
                        `).join('')}
                    </div>
                </div>
                ` : ''}

                ${relatorio.assinaturaManutentor ? `
                <div style="margin-bottom: 20px; padding: 15px; background: #f5f5f5; border-radius: 8px;">
                    <h3 style="color: #1f7e3d; margin-top: 0;">✍️ Assinatura Digital do Manutentor</h3>
                    <img src="${relatorio.assinaturaManutentor}" alt="Assinatura do Manutentor"
                        style="border: 1px solid #ddd; border-radius: 4px; max-width: 350px; background: white; padding: 5px;">
                    <p style="margin-top: 5px; color: #666; font-size: 0.9em;">
                        ${relatorio.manutentorNome || 'Manutentor'} - ${relatorio.dataFechamento ? new Date(relatorio.dataFechamento).toLocaleDateString('pt-BR') : '--'}
                    </p>
                </div>
                ` : ''}

                ${(relatorio.apontamentos || []).length > 0 ? `
                <div style="margin-bottom: 20px;">
                    <h3 style="color: #1f7e3d;">📊 Histórico de Apontamentos</h3>
                    <table class="table">
                        <thead><tr><th>Tipo</th><th>Motivo</th><th>Data/Hora</th></tr></thead>
                        <tbody>
                            ${relatorio.apontamentos.map(a => `
                                <tr>
                                    <td><span class="badge ${a.tipo === 'inicio' ? 'badge-success' : 'badge-warning'}">${a.tipo}</span></td>
                                    <td>${a.motivo || '--'}</td>
                                    <td>${a.timestamp ? new Date(a.timestamp).toLocaleString('pt-BR') : '--'}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
                ` : ''}
            </div>

            <div style="margin-top: 20px; display: flex; gap: 10px;">
                <button class="btn btn-primary" onclick="RELATORIOS.exportarRelatorioFechamento('${relatorio.id}')">📥 Exportar PDF</button>
                <button class="btn btn-secondary" onclick="UI.renderRelatoriosFechamentoPCM()">← Voltar</button>
            </div>
        `;
    },

    // ============================================
    // ESTOQUE (PCM)
    // ============================================
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
                        <textarea id="historicoMaquina" class="form-control" placeholder="Histórico da Máquina" rows="3"></textarea>
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
                                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
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

    // ============================================
    // MANUTENTORES (PCM)
    // ============================================
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
                                <input type="text" id="nomeManutentor" class="form-control" placeholder="Nome completo" required>
                            </div>
                        </div>
                        <div class="col">
                            <div class="form-group">
                                <label class="form-label">Email <span style="color: red;">*</span></label>
                                <input type="email" id="emailManutentor" class="form-control" placeholder="email@empresa.com" required>
                            </div>
                        </div>
                    </div>

                    <div class="row">
                        <div class="col">
                            <div class="form-group">
                                <label class="form-label">Senha <span style="color: red;">*</span></label>
                                <input type="password" id="senhaManutentor" class="form-control" placeholder="Mínimo 4 caracteres" required>
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

    // ============================================
    // RELATÓRIOS (PCM)
    // ============================================
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
            </div>
        `;
    },

    // ============================================
    // MODO AUDITORIA
    // ============================================
    async renderModoAuditoria(osId) {
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
                    <canvas id="signatureCanvasOperador" style="border: 2px solid #e0e0e0; border-radius: 6px; background-color: white; cursor: crosshair; display: block; margin: 10px 0; width: 100%; height: 150px; touch-action: none;"></canvas>
                    <small style="color: #757575;">Operador deve assinar para confirmar</small>
                    <button type="button" class="btn btn-secondary btn-sm" onclick="AUDITORIA.limparAssinatura()" style="margin-top: 10px;">🗑️ Limpar Assinatura</button>
                </div>

                <div style="display: flex; gap: 10px; margin-top: 20px;">
                    <button type="button" class="btn btn-success" onclick="AUDITORIA.confirmar('${osId}')">✅ Confirmar e Finalizar</button>
                    <button type="button" class="btn btn-secondary" onclick="UI.renderDashboardManutentor()">Voltar</button>
                </div>
            </div>
        `;

        AUDITORIA.inicializarAssinatura();
    }
};

// ============================================
// CHECKLIST PREVENTIVO DINÂMICO
// ============================================

const CHECKLIST = {
    _itensLocais: [],
    _agendaAtual: null,

    async renderChecklistPreventivo() {
        const user = DB.getCurrentUser();
        const agendamentos = await DB.obterAgendaPreventiva(user ? user.id : null);

        document.querySelector('.content').innerHTML = `
            <div class="dashboard-header">
                <h1 class="dashboard-title">✔️ Checklist Preventivo</h1>
                <p class="dashboard-subtitle">Execute e registre checklists de manutenção preventiva</p>
            </div>

            <div class="card">
                <h3 class="card-title">Selecionar Agendamento</h3>
                <div class="form-group">
                    <label class="form-label">Agendamento Preventivo</label>
                    <select id="selectAgendamento" class="form-control" onchange="CHECKLIST.carregarChecklist(this.value)">
                        <option value="">-- Selecione um agendamento --</option>
                        ${agendamentos.map(a => `
                            <option value="${a.id}">${a.nomeMaquina || a.idMaquina} - ${a.tipoManutencao} (${a.dataProgramada ? a.dataProgramada.split('T')[0] : '--'})</option>
                        `).join('')}
                    </select>
                </div>
            </div>

            <div id="checklistContainer" style="display: none;">
                <div class="card">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                        <h3 class="card-title" style="margin: 0;">Itens do Checklist</h3>
                        <button class="btn btn-success btn-sm" onclick="CHECKLIST.adicionarItem()">➕ Adicionar Item</button>
                    </div>

                    <div id="listaItensChecklist"></div>

                    <div style="margin-top: 20px; padding: 15px; background: #f5f5f5; border-radius: 6px;">
                        <label class="form-label">📝 Observações Gerais (Opcional)</label>
                        <textarea id="observacoesGerais" class="form-control" placeholder="Observações gerais sobre a manutenção realizada..." rows="3"></textarea>
                    </div>

                    <div style="display: flex; gap: 10px; margin-top: 20px;">
                        <button class="btn btn-primary" onclick="CHECKLIST.finalizarChecklist()">✅ Finalizar e Gerar Laudo</button>
                        <button class="btn btn-secondary" onclick="UI.renderDashboardManutentor()">Cancelar</button>
                    </div>
                </div>
            </div>
        `;
    },

    async carregarChecklist(agendaId) {
        if (!agendaId) {
            document.getElementById('checklistContainer').style.display = 'none';
            return;
        }

        this._agendaAtual = agendaId;
        const itens = await DB.obterChecklistItens(agendaId);
        this._itensLocais = itens.length > 0 ? itens.map(i => ({...i, statusLocal: i.status, observacaoLocal: i.observacao})) : this._getItensDefault();

        document.getElementById('checklistContainer').style.display = 'block';
        this.renderItens();
    },

    _getItensDefault() {
        return [
            { id: 'local_1', descricao: 'Verificar nível de óleo', status: null, observacao: '', criadoLocalmente: true },
            { id: 'local_2', descricao: 'Verificar filtros de ar', status: null, observacao: '', criadoLocalmente: true },
            { id: 'local_3', descricao: 'Verificar sistema de arrefecimento', status: null, observacao: '', criadoLocalmente: true },
            { id: 'local_4', descricao: 'Verificar tensão das correias', status: null, observacao: '', criadoLocalmente: true },
            { id: 'local_5', descricao: 'Verificar sistema elétrico', status: null, observacao: '', criadoLocalmente: true },
            { id: 'local_6', descricao: 'Verificar freios e embreagem', status: null, observacao: '', criadoLocalmente: true },
            { id: 'local_7', descricao: 'Verificar pneus e rodas', status: null, observacao: '', criadoLocalmente: true },
            { id: 'local_8', descricao: 'Verificar sistema hidráulico', status: null, observacao: '', criadoLocalmente: true }
        ];
    },

    renderItens() {
        const container = document.getElementById('listaItensChecklist');
        if (!container) return;

        container.innerHTML = this._itensLocais.map((item, idx) => `
            <div class="checklist-item" id="item_${item.id}" style="
                padding: 15px;
                border: 2px solid ${item.status === 'ok' ? '#28a745' : item.status === 'nao_ok' ? '#dc3545' : '#e0e0e0'};
                border-radius: 8px;
                margin-bottom: 10px;
                background: ${item.status === 'ok' ? '#f1f8e9' : item.status === 'nao_ok' ? '#fff5f5' : '#fafafa'};
                transition: all 0.3s ease;
            ">
                <div style="display: flex; align-items: center; gap: 12px; flex-wrap: wrap;">
                    <span style="font-weight: bold; color: #666; min-width: 25px;">${idx + 1}.</span>
                    <span style="flex: 1; font-weight: 500;">${item.descricao}</span>

                    <div style="display: flex; gap: 8px; align-items: center;">
                        <label style="display: flex; align-items: center; gap: 5px; cursor: pointer; padding: 6px 12px; border-radius: 20px; border: 2px solid ${item.status === 'ok' ? '#28a745' : '#e0e0e0'}; background: ${item.status === 'ok' ? '#e8f5e9' : 'white'}; transition: all 0.2s;">
                            <input type="radio" name="status_${item.id}" value="ok"
                                ${item.status === 'ok' ? 'checked' : ''}
                                onchange="CHECKLIST.atualizarStatus('${item.id}', 'ok')"
                                style="accent-color: #28a745;">
                            <span style="color: #28a745; font-weight: bold;">✓ OK</span>
                        </label>

                        <label style="display: flex; align-items: center; gap: 5px; cursor: pointer; padding: 6px 12px; border-radius: 20px; border: 2px solid ${item.status === 'nao_ok' ? '#dc3545' : '#e0e0e0'}; background: ${item.status === 'nao_ok' ? '#ffebee' : 'white'}; transition: all 0.2s;">
                            <input type="radio" name="status_${item.id}" value="nao_ok"
                                ${item.status === 'nao_ok' ? 'checked' : ''}
                                onchange="CHECKLIST.atualizarStatus('${item.id}', 'nao_ok')"
                                style="accent-color: #dc3545;">
                            <span style="color: #dc3545; font-weight: bold;">✗ Não OK</span>
                        </label>

                        ${item.criadoLocalmente ? `
                            <button class="btn btn-sm btn-danger" onclick="CHECKLIST.removerItem('${item.id}')" title="Remover item">🗑️</button>
                        ` : ''}
                    </div>
                </div>

                <!-- Campo de observação condicional - aparece apenas quando "Não OK" -->
                <div id="obs_${item.id}" style="display: ${item.status === 'nao_ok' ? 'block' : 'none'}; margin-top: 12px; animation: fadeIn 0.3s ease;">
                    <div style="background: #fff3e0; border: 1px solid #ffcc02; border-radius: 6px; padding: 12px;">
                        <label style="font-weight: bold; color: #e65100; display: block; margin-bottom: 6px;">
                            ⚠️ Detalhe a falha/observação: <span style="color: red;">*</span>
                        </label>
                        <textarea
                            id="obsText_${item.id}"
                            class="form-control"
                            placeholder="Descreva o problema encontrado, causa provável, ação necessária..."
                            rows="2"
                            style="border-color: #ff9800;"
                            onchange="CHECKLIST.atualizarObservacao('${item.id}', this.value)"
                        >${item.observacao || ''}</textarea>
                    </div>
                </div>
            </div>
        `).join('');
    },

    atualizarStatus(itemId, status) {
        const item = this._itensLocais.find(i => i.id === itemId);
        if (!item) return;

        item.status = status;
        item.observacao = status === 'ok' ? '' : (item.observacao || '');

        // Atualizar visual do item
        const itemEl = document.getElementById(`item_${itemId}`);
        const obsEl = document.getElementById(`obs_${itemId}`);

        if (itemEl) {
            itemEl.style.borderColor = status === 'ok' ? '#28a745' : '#dc3545';
            itemEl.style.background = status === 'ok' ? '#f1f8e9' : '#fff5f5';
        }

        if (obsEl) {
            obsEl.style.display = status === 'nao_ok' ? 'block' : 'none';
            if (status === 'nao_ok') {
                const textarea = document.getElementById(`obsText_${itemId}`);
                if (textarea) textarea.focus();
            }
        }
    },

    atualizarObservacao(itemId, observacao) {
        const item = this._itensLocais.find(i => i.id === itemId);
        if (item) item.observacao = observacao;
    },

    adicionarItem() {
        const descricao = prompt('Descrição do novo item do checklist:');
        if (!descricao || !descricao.trim()) return;

        const novoItem = {
            id: 'local_' + Date.now(),
            descricao: descricao.trim(),
            status: null,
            observacao: '',
            criadoLocalmente: true
        };

        this._itensLocais.push(novoItem);
        this.renderItens();
        NOTIFICACOES.sucesso('Item adicionado ao checklist!');
    },

    removerItem(itemId) {
        if (!confirm('Remover este item do checklist?')) return;
        this._itensLocais = this._itensLocais.filter(i => i.id !== itemId);
        this.renderItens();
    },

    async finalizarChecklist() {
        const agendaId = this._agendaAtual;
        if (!agendaId) {
            NOTIFICACOES.erro('Selecione um agendamento!');
            return;
        }

        // Validar que todos os itens foram preenchidos
        const itensPendentes = this._itensLocais.filter(i => !i.status);
        if (itensPendentes.length > 0) {
            NOTIFICACOES.erro(`${itensPendentes.length} item(s) ainda não foram marcados como OK ou Não OK!`);
            return;
        }

        // Validar observações obrigatórias para itens "Não OK"
        const itensSemObs = this._itensLocais.filter(i => i.status === 'nao_ok' && !i.observacao?.trim());
        if (itensSemObs.length > 0) {
            NOTIFICACOES.erro(`${itensSemObs.length} item(s) marcados como "Não OK" precisam de observação!`);
            // Destacar os campos vazios
            itensSemObs.forEach(item => {
                const textarea = document.getElementById(`obsText_${item.id}`);
                if (textarea) {
                    textarea.style.borderColor = 'red';
                    textarea.style.boxShadow = '0 0 0 2px rgba(220,53,69,0.3)';
                    textarea.focus();
                }
            });
            return;
        }

        // Coletar observações atualizadas dos textareas
        this._itensLocais.forEach(item => {
            const textarea = document.getElementById(`obsText_${item.id}`);
            if (textarea) item.observacao = textarea.value;
        });

        const observacoesGerais = document.getElementById('observacoesGerais')?.value || '';
        const user = DB.getCurrentUser();

        NOTIFICACOES.info('Gerando laudo...');

        try {
            // Salvar itens novos no banco
            for (const item of this._itensLocais) {
                if (item.criadoLocalmente) {
                    try {
                        const novoItem = await DB.adicionarChecklistItem(agendaId, item.descricao, user?.nome);
                        // Atualizar com o ID real do banco
                        await DB.atualizarChecklistItem(novoItem.id, {
                            status: item.status,
                            observacao: item.observacao,
                            respondidoPor: user?.nome
                        });
                    } catch(e) { console.warn('Erro ao salvar item:', e); }
                } else {
                    try {
                        await DB.atualizarChecklistItem(item.id, {
                            status: item.status,
                            observacao: item.observacao,
                            respondidoPor: user?.nome
                        });
                    } catch(e) { console.warn('Erro ao atualizar item:', e); }
                }
            }

            // Gerar laudo
            const laudo = await DB.gerarLaudo({
                agendaId,
                manutentorId: user?.id,
                manutentorNome: user?.nome,
                itensChecklist: this._itensLocais.map(i => ({
                    descricao: i.descricao,
                    status: i.status,
                    observacao: i.observacao
                })),
                observacoesGerais,
                dataExecucao: new Date().toISOString()
            });

            NOTIFICACOES.sucesso('Laudo gerado com sucesso! O PCM será notificado para revisão.');

            // Mostrar confirmação com resumo
            setTimeout(() => {
                const itensOk = this._itensLocais.filter(i => i.status === 'ok').length;
                const itensNaoOk = this._itensLocais.filter(i => i.status === 'nao_ok').length;

                document.querySelector('.content').innerHTML = `
                    <div class="dashboard-header">
                        <h1 class="dashboard-title">✅ Checklist Finalizado!</h1>
                    </div>
                    <div class="card" style="text-align: center; padding: 40px;">
                        <div style="font-size: 4em; margin-bottom: 20px;">📄</div>
                        <h2 style="color: #1f7e3d;">Laudo Gerado com Sucesso</h2>
                        <p style="color: #666; margin: 10px 0;">ID do Laudo: <strong>${laudo.id}</strong></p>
                        <div style="display: flex; gap: 20px; justify-content: center; margin: 20px 0;">
                            <div style="background: #e8f5e9; padding: 15px 25px; border-radius: 8px;">
                                <div style="font-size: 2em; font-weight: bold; color: #28a745;">${itensOk}</div>
                                <div>Itens OK</div>
                            </div>
                            <div style="background: #ffebee; padding: 15px 25px; border-radius: 8px;">
                                <div style="font-size: 2em; font-weight: bold; color: #dc3545;">${itensNaoOk}</div>
                                <div>Itens Não OK</div>
                            </div>
                        </div>
                        <p style="color: #666;">O PCM receberá uma notificação para revisar e aprovar o laudo.</p>
                        <button class="btn btn-primary" style="margin-top: 20px;" onclick="UI.renderDashboardManutentor()">Voltar ao Início</button>
                    </div>
                `;
            }, 1500);

        } catch(e) {
            NOTIFICACOES.erro('Erro ao gerar laudo: ' + e.message);
        }
    }
};

// Expor no objeto UI
UI.renderChecklistPreventivo = function() {
    CHECKLIST.renderChecklistPreventivo();
};

// ============================================
// MANUAIS TÉCNICOS - PCM (UPLOAD E GESTÃO)
// ============================================

const UI_MANUAIS_PCM = {
    async renderGestaoManuais() {
        const manuais = await DB.obterManuais();

        document.querySelector('.content').innerHTML = `
            <div class="dashboard-header">
                <h1 class="dashboard-title">🌲 Gestão de Manuais Técnicos</h1>
                <p class="dashboard-subtitle">Faça upload de manuais para disponibilizá-los instantaneamente a todos os manutentores</p>
            </div>

            <!-- UPLOAD DE MANUAL -->
            <div class="card">
                <h3 class="card-title">📤 Adicionar Novo Manual</h3>

                <div class="row">
                    <div class="col">
                        <div class="form-group">
                            <label class="form-label">Título do Manual <span style="color: red;">*</span></label>
                            <input type="text" id="tituloManual" class="form-control" placeholder="Ex: Manual de Operação - Colheitadeira X1">
                        </div>
                    </div>
                    <div class="col">
                        <div class="form-group">
                            <label class="form-label">Máquina Relacionada</label>
                            <input type="text" id="maquinaManual" class="form-control" placeholder="Ex: HARV-01 ou deixe em branco para geral">
                        </div>
                    </div>
                </div>

                <div class="form-group">
                    <label class="form-label">Descrição</label>
                    <textarea id="descricaoManual" class="form-control" placeholder="Breve descrição do conteúdo do manual..." rows="2"></textarea>
                </div>

                <div class="form-group">
                    <label class="form-label">Arquivo do Manual <span style="color: red;">*</span></label>
                    <div style="border: 2px dashed #1f7e3d; border-radius: 8px; padding: 25px; text-align: center; background: #f9fbe7; cursor: pointer;" onclick="document.getElementById('arquivoManual').click()">
                        <div style="font-size: 2.5em; margin-bottom: 10px;">📄</div>
                        <p style="margin: 0; color: #558b2f; font-weight: bold;">Clique para selecionar o arquivo</p>
                        <p style="margin: 5px 0 0; color: #757575; font-size: 0.85em;">PDF, DOC, DOCX, XLS, XLSX, PNG, JPG (máx. 10MB)</p>
                    </div>
                    <input type="file" id="arquivoManual" style="display: none;"
                        accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg"
                        onchange="UI_MANUAIS_PCM.previewArquivo(this)">
                    <div id="previewArquivo" style="margin-top: 10px;"></div>
                </div>

                <button class="btn btn-success btn-block" onclick="UI_MANUAIS_PCM.uploadManual()">
                    ☁️ Publicar Manual na Nuvem
                </button>
            </div>

            <!-- LISTA DE MANUAIS -->
            <div class="card" style="margin-top: 20px;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                    <h3 class="card-title" style="margin: 0;">📚 Manuais Publicados (${manuais.length})</h3>
                    <div style="display: flex; gap: 10px;">
                        <input type="text" id="buscaManual" class="form-control" placeholder="🔍 Buscar manual..."
                            style="width: 200px;" oninput="UI_MANUAIS_PCM.filtrarManuais(this.value)">
                    </div>
                </div>

                <div id="listaManuaisPCM">
                    ${this.renderListaManuais(manuais)}
                </div>
            </div>
        `;
        window._manuaisCache = manuais;
    },

    renderListaManuais(lista) {
        if (lista.length === 0) {
            return '<div class="alert alert-info">Nenhum manual publicado ainda. Faça o upload acima.</div>';
        }

        const icones = { pdf: '📕', doc: '📘', docx: '📘', xls: '📗', xlsx: '📗', png: '🖼️', jpg: '🖼️', jpeg: '🖼️' };

        return `
            <table class="table">
                <thead>
                    <tr>
                        <th>Tipo</th>
                        <th>Título</th>
                        <th>Máquina</th>
                        <th>Tamanho</th>
                        <th>Publicado em</th>
                        <th>Ações</th>
                    </tr>
                </thead>
                <tbody>
                    ${lista.map(m => {
                        const ext = (m.nomeArquivo || '').split('.').pop().toLowerCase();
                        const icone = icones[ext] || '📄';
                        const tamanho = m.tamanhoArquivo ? (m.tamanhoArquivo / 1024 / 1024).toFixed(2) + ' MB' : '--';
                        return `
                            <tr>
                                <td style="font-size: 1.5em; text-align: center;">${icone}</td>
                                <td>
                                    <strong>${m.titulo}</strong>
                                    ${m.descricao ? `<br><small style="color: #666;">${m.descricao}</small>` : ''}
                                </td>
                                <td>${m.maquinaId || '<span style="color: #999;">Geral</span>'}</td>
                                <td>${tamanho}</td>
                                <td>${m.dataCriacao ? new Date(m.dataCriacao).toLocaleDateString('pt-BR') : '--'}</td>
                                <td>
                                    <button class="btn btn-sm btn-primary" onclick="UI_MANUAIS_PCM.visualizarManual('${m.id}')">👁️ Ver</button>
                                    <button class="btn btn-sm btn-danger" onclick="UI_MANUAIS_PCM.removerManual('${m.id}')">🗑️ Remover</button>
                                </td>
                            </tr>
                        `;
                    }).join('')}
                </tbody>
            </table>
        `;
    },

    filtrarManuais(busca) {
        const manuais = window._manuaisCache || [];
        const filtrados = busca
            ? manuais.filter(m =>
                m.titulo.toLowerCase().includes(busca.toLowerCase()) ||
                (m.maquinaId || '').toLowerCase().includes(busca.toLowerCase()) ||
                (m.descricao || '').toLowerCase().includes(busca.toLowerCase())
              )
            : manuais;
        document.getElementById('listaManuaisPCM').innerHTML = this.renderListaManuais(filtrados);
    },

    previewArquivo(input) {
        const file = input.files[0];
        if (!file) return;

        const preview = document.getElementById('previewArquivo');
        const tamanho = (file.size / 1024 / 1024).toFixed(2);

        if (file.size > 10 * 1024 * 1024) {
            preview.innerHTML = '<div class="alert alert-danger">Arquivo muito grande! Máximo 10MB.</div>';
            input.value = '';
            return;
        }

        preview.innerHTML = `
            <div style="display: flex; align-items: center; gap: 10px; padding: 10px; background: #e8f5e9; border-radius: 6px; border: 1px solid #28a745;">
                <span style="font-size: 1.5em;">📄</span>
                <div>
                    <strong>${file.name}</strong>
                    <div style="color: #666; font-size: 0.85em;">${tamanho} MB</div>
                </div>
                <span style="color: #28a745; margin-left: auto;">✓ Pronto para upload</span>
            </div>
        `;
    },

    async uploadManual() {
        const titulo = document.getElementById('tituloManual').value.trim();
        const maquinaId = document.getElementById('maquinaManual').value.trim();
        const descricao = document.getElementById('descricaoManual').value.trim();
        const fileInput = document.getElementById('arquivoManual');
        const file = fileInput.files[0];

        if (!titulo) { NOTIFICACOES.erro('Informe o título do manual!'); return; }
        if (!file) { NOTIFICACOES.erro('Selecione um arquivo!'); return; }

        NOTIFICACOES.info('Fazendo upload do manual...');

        try {
            // Converter arquivo para base64
            const base64 = await new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = () => resolve(reader.result);
                reader.onerror = reject;
                reader.readAsDataURL(file);
            });

            await DB.salvarManual({
                titulo,
                maquinaId: maquinaId || null,
                descricao,
                nomeArquivo: file.name,
                tipoArquivo: file.type,
                tamanhoArquivo: file.size,
                conteudoBase64: base64
            });

            NOTIFICACOES.sucesso('Manual publicado com sucesso! Disponível para todos os manutentores.');

            // Limpar formulário
            document.getElementById('tituloManual').value = '';
            document.getElementById('maquinaManual').value = '';
            document.getElementById('descricaoManual').value = '';
            fileInput.value = '';
            document.getElementById('previewArquivo').innerHTML = '';

            // Recarregar lista
            setTimeout(() => this.renderGestaoManuais(), 1500);

        } catch(e) {
            NOTIFICACOES.erro('Erro ao publicar manual: ' + e.message);
        }
    },

    async visualizarManual(id) {
        const manual = await DB.obterManualComPDF(id);
        if (!manual) { NOTIFICACOES.erro('Manual não encontrado.'); return; }

        if (manual.conteudoBase64) {
            // Abrir em nova aba
            const win = window.open();
            if (win) {
                win.document.write(`
                    <html>
                    <head><title>${manual.titulo}</title></head>
                    <body style="margin:0;padding:0;background:#333;display:flex;flex-direction:column;align-items:center;">
                        <div style="background:#1f7e3d;color:white;padding:10px 20px;width:100%;box-sizing:border-box;display:flex;justify-content:space-between;align-items:center;">
                            <strong>🌲 EcoMaintain - ${manual.titulo}</strong>
                            <a href="${manual.conteudoBase64}" download="${manual.nomeArquivo}" style="color:white;text-decoration:none;background:rgba(255,255,255,0.2);padding:5px 15px;border-radius:4px;">⬇️ Download</a>
                        </div>
                        ${manual.tipoArquivo && manual.tipoArquivo.startsWith('image/') ?
                            `<img src="${manual.conteudoBase64}" style="max-width:100%;margin-top:20px;">` :
                            `<iframe src="${manual.conteudoBase64}" style="width:100%;height:calc(100vh - 50px);border:none;"></iframe>`
                        }
                    </body>
                    </html>
                `);
            } else {
                // Fallback: download direto
                const link = document.createElement('a');
                link.href = manual.conteudoBase64;
                link.download = manual.nomeArquivo;
                link.click();
            }
        } else {
            NOTIFICACOES.erro('Arquivo não disponível.');
        }
    },

    async removerManual(id) {
        if (!confirm('Tem certeza que deseja remover este manual? Ele ficará indisponível para todos os manutentores.')) return;
        try {
            await DB.removerManual(id);
            NOTIFICACOES.sucesso('Manual removido com sucesso!');
            this.renderGestaoManuais();
        } catch(e) {
            NOTIFICACOES.erro('Erro ao remover manual: ' + e.message);
        }
    }
};

// ============================================
// MANUAIS TÉCNICOS - MANUTENTOR (CONSULTA)
// ============================================

const UI_MANUAIS_MANUTENTOR = {
    async renderConsultaManuais() {
        const manuais = await DB.obterManuais();

        document.querySelector('.content').innerHTML = `
            <div class="dashboard-header">
                <h1 class="dashboard-title">📖 Manuais Técnicos</h1>
                <p class="dashboard-subtitle">Consulte os manuais publicados pelo PCM</p>
            </div>

            <div class="card">
                <div style="display: flex; gap: 10px; margin-bottom: 20px;">
                    <input type="text" id="buscaManualManutentor" class="form-control" placeholder="🔍 Buscar por título ou máquina..."
                        oninput="UI_MANUAIS_MANUTENTOR.filtrar(this.value)">
                </div>

                <div id="listaManuaisManutentor">
                    ${this.renderLista(manuais)}
                </div>
            </div>
        `;
        window._manuaisManutentorCache = manuais;
    },

    renderLista(lista) {
        if (lista.length === 0) {
            return '<div class="alert alert-info">Nenhum manual disponível no momento. Aguarde o PCM publicar manuais.</div>';
        }

        const icones = { pdf: '📕', doc: '📘', docx: '📘', xls: '📗', xlsx: '📗', png: '🖼️', jpg: '🖼️', jpeg: '🖼️' };

        return `
            <div class="grid grid-2">
                ${lista.map(m => {
                    const ext = (m.nomeArquivo || '').split('.').pop().toLowerCase();
                    const icone = icones[ext] || '📄';
                    return `
                        <div class="card" style="cursor: pointer; transition: transform 0.2s; border: 1px solid #e0e0e0;"
                            onmouseover="this.style.transform='translateY(-2px)';this.style.boxShadow='0 4px 12px rgba(0,0,0,0.15)'"
                            onmouseout="this.style.transform='';this.style.boxShadow=''">
                            <div style="display: flex; gap: 15px; align-items: start;">
                                <div style="font-size: 2.5em;">${icone}</div>
                                <div style="flex: 1;">
                                    <h3 class="card-title" style="margin: 0 0 5px;">${m.titulo}</h3>
                                    ${m.maquinaId ? `<span class="badge badge-success" style="margin-bottom: 8px;">${m.maquinaId}</span>` : '<span class="badge" style="background:#e0e0e0;color:#666;margin-bottom:8px;">Geral</span>'}
                                    ${m.descricao ? `<p style="color: #666; font-size: 0.9em; margin: 5px 0;">${m.descricao}</p>` : ''}
                                    <p style="color: #999; font-size: 0.8em; margin: 5px 0;">
                                        Publicado em: ${m.dataCriacao ? new Date(m.dataCriacao).toLocaleDateString('pt-BR') : '--'}
                                    </p>
                                </div>
                            </div>
                            <button class="btn btn-primary btn-block" style="margin-top: 12px;"
                                onclick="UI_MANUAIS_PCM.visualizarManual('${m.id}')">
                                📖 Abrir Manual
                            </button>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
    },

    filtrar(busca) {
        const manuais = window._manuaisManutentorCache || [];
        const filtrados = busca
            ? manuais.filter(m =>
                m.titulo.toLowerCase().includes(busca.toLowerCase()) ||
                (m.maquinaId || '').toLowerCase().includes(busca.toLowerCase()) ||
                (m.descricao || '').toLowerCase().includes(busca.toLowerCase())
              )
            : manuais;
        document.getElementById('listaManuaisManutentor').innerHTML = this.renderLista(filtrados);
    }
};

// ============================================
// FECHAMENTO DE O.S. COM MÚLTIPLAS FOTOS
// ============================================

const FECHAMENTO = {
    _fotosBase64: [],

    previewFotos(input) {
        const files = Array.from(input.files);
        const preview = document.getElementById('previewFotos');

        files.forEach(file => {
            if (file.size > 5 * 1024 * 1024) {
                NOTIFICACOES.aviso(`Foto "${file.name}" é muito grande (máx. 5MB). Ignorada.`);
                return;
            }

            const reader = new FileReader();
            reader.onload = (e) => {
                const base64 = e.target.result;
                this._fotosBase64.push(base64);

                const div = document.createElement('div');
                div.style.cssText = 'position: relative; display: inline-block;';
                div.innerHTML = `
                    <img src="${base64}" style="width: 100px; height: 75px; object-fit: cover; border-radius: 6px; border: 2px solid #28a745;">
                    <button onclick="FECHAMENTO.removerFoto(this, '${base64.substring(0, 30)}')"
                        style="position: absolute; top: -5px; right: -5px; background: #dc3545; color: white; border: none; border-radius: 50%; width: 20px; height: 20px; cursor: pointer; font-size: 12px; display: flex; align-items: center; justify-content: center; padding: 0;">✕</button>
                `;
                preview.appendChild(div);
            };
            reader.readAsDataURL(file);
        });
    },

    removerFoto(btn, prefixo) {
        const idx = this._fotosBase64.findIndex(f => f.startsWith(prefixo));
        if (idx > -1) this._fotosBase64.splice(idx, 1);
        btn.parentElement.remove();
    },

    async atualizarResumo(osId) {
        if (!osId) {
            document.getElementById('resumoExecucao').innerHTML = 'Selecione uma O.S. para ver o resumo';
            return;
        }

        const os = await DB.obterOSPorId(osId);
        if (!os) return;

        const apontamentos = os.apontamentos || [];
        const inicio = apontamentos.find(a => a.tipo === 'inicio');
        const tempoTotal = inicio
            ? Math.floor((new Date() - new Date(inicio.timestamp)) / 60000)
            : 0;

        document.getElementById('resumoExecucao').innerHTML = `
            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px;">
                <div style="text-align: center; padding: 10px; background: white; border-radius: 6px;">
                    <div style="font-size: 1.5em; font-weight: bold; color: #1f7e3d;">${apontamentos.length}</div>
                    <div style="color: #666; font-size: 0.85em;">Apontamentos</div>
                </div>
                <div style="text-align: center; padding: 10px; background: white; border-radius: 6px;">
                    <div style="font-size: 1.5em; font-weight: bold; color: #1f7e3d;">${tempoTotal}min</div>
                    <div style="color: #666; font-size: 0.85em;">Tempo Estimado</div>
                </div>
                <div style="text-align: center; padding: 10px; background: white; border-radius: 6px;">
                    <div style="font-size: 1.5em; font-weight: bold; color: #1f7e3d;">${os.pecas ? os.pecas.length : 0}</div>
                    <div style="color: #666; font-size: 0.85em;">Peças Usadas</div>
                </div>
            </div>
            <p style="margin-top: 10px; color: #666;"><strong>Máquina:</strong> ${os.maquinaId}</p>
            <p style="color: #666;"><strong>Problema:</strong> ${os.descricao}</p>
        `;
    },

    async finalizar() {
        const osId = document.getElementById('selectOSFechamento').value;
        const statusFinal = document.getElementById('statusFinal').value;
        const descricaoServico = document.getElementById('descricaoServico').value.trim();

        if (!osId) { NOTIFICACOES.erro('Selecione uma O.S.!'); return; }
        if (!statusFinal) { NOTIFICACOES.erro('Selecione o status final!'); return; }
        if (!descricaoServico || descricaoServico.length < 10) {
            NOTIFICACOES.erro('Descreva o serviço executado (mínimo 10 caracteres)!');
            return;
        }
        if (this._fotosBase64.length === 0) {
            NOTIFICACOES.erro('Adicione pelo menos 1 foto de evidência!');
            return;
        }

        const assinatura = ASSINATURA.canvas ? ASSINATURA.canvas.toDataURL() : null;
        if (!assinatura || assinatura === 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==') {
            NOTIFICACOES.erro('Assine digitalmente para confirmar o fechamento!');
            return;
        }

        NOTIFICACOES.info('Gerando relatório de fechamento...');

        try {
            const user = DB.getCurrentUser();
            const os = await DB.obterOSPorId(osId);

            // Atualizar O.S. no banco
            const novoStatus = statusFinal === 'finalizado' ? 'finalizado' : 'pendente';
            await DB.atualizarOS(osId, {
                status: novoStatus,
                descricaoFinal: descricaoServico,
                dataFechamento: new Date().toISOString(),
                assinaturaManutentor: assinatura,
                fotosEvidencia: this._fotosBase64,
                laudoGerado: true,
                laudoData: new Date().toISOString()
            });

            // Criar relatório de fechamento
            await DB.criarRelatorioFechamento({
                osId,
                maquinaId: os?.maquinaId,
                maquinaNome: os?.maquinaId,
                manutentorId: user?.id,
                manutentorNome: user?.nome,
                statusFinal,
                descricaoExecucao: descricaoServico,
                assinaturaManutentor: assinatura,
                fotosEvidencia: this._fotosBase64,
                apontamentos: os?.apontamentos || [],
                pecasUtilizadas: os?.pecas || [],
                dataInicio: os?.dataCriacao,
                dataFechamento: new Date().toISOString()
            });

            this._fotosBase64 = [];
            NOTIFICACOES.sucesso('O.S. finalizada! Relatório enviado ao PCM.');

            setTimeout(() => {
                document.querySelector('.content').innerHTML = `
                    <div class="dashboard-header">
                        <h1 class="dashboard-title">✅ O.S. Encerrada com Sucesso!</h1>
                    </div>
                    <div class="card" style="text-align: center; padding: 40px;">
                        <div style="font-size: 4em; margin-bottom: 20px;">${statusFinal === 'finalizado' ? '✅' : '⚠️'}</div>
                        <h2 style="color: #1f7e3d;">
                            ${statusFinal === 'finalizado' ? 'Serviço Concluído!' : 'O.S. com Pendência Registrada'}
                        </h2>
                        <p style="color: #666; margin: 10px 0;">O.S.: <strong>${osId}</strong></p>
                        <p style="color: #666;">Um relatório consolidado foi enviado ao PCM com:</p>
                        <ul style="text-align: left; display: inline-block; margin: 15px 0; color: #555;">
                            <li>✅ Resumo da execução</li>
                            <li>✅ ${this._fotosBase64.length || 'Suas'} foto(s) de evidência</li>
                            <li>✅ Assinatura digital</li>
                            <li>✅ Status final da O.S.</li>
                        </ul>
                        <br>
                        <button class="btn btn-primary" style="margin-top: 10px;" onclick="UI.renderDashboardManutentor()">Voltar ao Início</button>
                    </div>
                `;
            }, 1500);

        } catch(e) {
            NOTIFICACOES.erro('Erro ao finalizar O.S.: ' + e.message);
        }
    }
};

// ============================================
// AUTENTICAÇÃO
// ============================================

const AUTH = {
    async login() {
        const email = document.getElementById('loginEmail').value.trim();
        const senha = document.getElementById('loginPassword').value;

        if (!email || !senha) {
            NOTIFICACOES.erro('Preencha email e senha!');
            return;
        }

        NOTIFICACOES.info('Autenticando...');

        try {
            const resp = await fetch(`${API_BASE}/auth`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, senha })
            });
            const data = await resp.json();

            if (!resp.ok) {
                NOTIFICACOES.erro(data.erro || 'Credenciais inválidas!');
                return;
            }

            DB.setCurrentUser(data.user, data.role);

            if (data.role === 'pcm') {
                await UI.renderDashboardPCM();
            } else {
                await UI.renderDashboardManutentor();
            }

        } catch(e) {
            NOTIFICACOES.erro('Erro de conexão. Tente novamente.');
        }
    },

    logout() {
        DB.logout();
        UI.renderLogin();
    },

    showLogin() {
        UI.renderLogin();
    },

    showRecuperarSenha() {
        UI.renderRecuperarSenha();
    },

    async enviarRecuperacao() {
        const email = document.getElementById('emailRecuperacao').value.trim();
        if (!email) { NOTIFICACOES.erro('Informe o email!'); return; }
        NOTIFICACOES.info('Funcionalidade em desenvolvimento. Entre em contato com o PCM.');
    }
};

// ============================================
// OPERAÇÕES DE O.S.
// ============================================

const OS = {
    async criar() {
        const maquinaId = document.getElementById('osIdMaquina').value.trim();
        const descricao = document.getElementById('osDescricao').value.trim();
        const data = document.getElementById('osData').value;
        const hora = document.getElementById('osHora').value;

        if (!maquinaId) { NOTIFICACOES.erro('Informe o ID da máquina!'); return; }
        if (!descricao || descricao.length < 10) {
            NOTIFICACOES.erro('Descreva o problema com pelo menos 10 caracteres!');
            return;
        }

        const user = DB.getCurrentUser();
        NOTIFICACOES.info('Registrando O.S...');

        try {
            const os = await DB.adicionarOS({
                maquinaId,
                descricao,
                manutentor: user?.nome || '',
                idManutentor: user?.id || null,
                dataCriacao: `${data}T${hora}:00.000Z`
            });

            NOTIFICACOES.sucesso(`O.S. ${os.id} criada com sucesso!`);
            setTimeout(() => UI.renderDashboardManutentor(), 1500);
        } catch(e) {
            NOTIFICACOES.erro(e.message || 'Erro ao criar O.S.');
        }
    }
};

// ============================================
// CONTROLE DE EXECUÇÃO
// ============================================

const EXECUCAO = {
    async iniciar() {
        const osId = document.getElementById('selectOS').value;
        if (!osId) { NOTIFICACOES.erro('Selecione uma O.S.!'); return; }

        const user = DB.getCurrentUser();
        try {
            await DB.adicionarApontamento(osId, {
                tipo: 'inicio',
                timestamp: new Date().toISOString()
            });
            NOTIFICACOES.sucesso('Execução iniciada!');
            this.atualizarHistorico(osId);
        } catch(e) {
            NOTIFICACOES.erro(e.message || 'Erro ao iniciar execução.');
        }
    },

    async pausar() {
        const osId = document.getElementById('selectOS').value;
        if (!osId) { NOTIFICACOES.erro('Selecione uma O.S.!'); return; }

        const motivo = prompt('Motivo da pausa (opcional):') || '';
        try {
            await DB.adicionarApontamento(osId, {
                tipo: 'pausa',
                motivo,
                timestamp: new Date().toISOString()
            });
            NOTIFICACOES.sucesso('Execução pausada!');
            this.atualizarHistorico(osId);
        } catch(e) {
            NOTIFICACOES.erro(e.message || 'Erro ao pausar execução.');
        }
    },

    async atualizarHistorico(osId) {
        const os = await DB.obterOSPorId(osId);
        if (!os) return;

        const container = document.getElementById('historicoApontamentos');
        if (!container) return;

        if (!os.apontamentos || os.apontamentos.length === 0) {
            container.innerHTML = '<p style="color: #999;">Nenhum apontamento registrado.</p>';
            return;
        }

        container.innerHTML = os.apontamentos.map(a => `
            <div style="padding: 10px; border-left: 3px solid ${a.tipo === 'inicio' ? '#28a745' : '#ffc107'}; margin-bottom: 8px; background: #f5f5f5; border-radius: 0 6px 6px 0;">
                <span class="badge ${a.tipo === 'inicio' ? 'badge-success' : 'badge-warning'}">${a.tipo}</span>
                ${a.motivo ? `<span style="margin-left: 10px; color: #666;">${a.motivo}</span>` : ''}
                <span style="float: right; color: #999; font-size: 0.85em;">${a.timestamp ? new Date(a.timestamp).toLocaleString('pt-BR') : '--'}</span>
            </div>
        `).join('');
    }
};

// ============================================
// GESTÃO DE PEÇAS
// ============================================

const PECAS = {
    adicionarLinha() {
        const pecas = window._pecasCache || [];
        const lista = document.getElementById('listaPecas');
        const div = document.createElement('div');
        div.className = 'row peca-item';
        div.style.marginBottom = '15px';
        div.innerHTML = `
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
        `;
        lista.appendChild(div);
    },

    removerLinha(btn) {
        btn.closest('.peca-item').remove();
    },

    async salvar() {
        const osId = document.getElementById('selectOSPecas').value;
        if (!osId) { NOTIFICACOES.erro('Selecione uma O.S.!'); return; }

        const itens = document.querySelectorAll('.peca-item');
        const pecas = [];

        for (const item of itens) {
            const pecaId = item.querySelector('.peca-select').value;
            const quantidade = parseInt(item.querySelector('.peca-quantidade').value);

            if (!pecaId || !quantidade || quantidade < 1) {
                NOTIFICACOES.erro('Preencha todos os campos de peças!');
                return;
            }
            pecas.push({ pecaId, quantidade });
        }

        if (pecas.length === 0) { NOTIFICACOES.erro('Adicione pelo menos uma peça!'); return; }

        try {
            await DB.adicionarPecasOS(osId, pecas);
            NOTIFICACOES.sucesso('Peças registradas com sucesso!');
            setTimeout(() => UI.renderDashboardManutentor(), 1500);
        } catch(e) {
            NOTIFICACOES.erro(e.message || 'Erro ao registrar peças.');
        }
    }
};

// ============================================
// OPERAÇÕES DO PCM
// ============================================

const PCM = {
    async liberarOS(osId) {
        try {
            await DB.atualizarOS(osId, { status: 'ativa' });
            NOTIFICACOES.sucesso('Ordem de Serviço liberada!');
            UI.renderGestaoOS();
        } catch(e) {
            NOTIFICACOES.erro(e.message || 'Erro ao liberar OS.');
        }
    },

    async aprovarLaudo(laudoId) {
        const user = DB.getCurrentUser();
        try {
            await DB.aprovarLaudo(laudoId, 'aprovado', user?.nome || 'PCM');
            NOTIFICACOES.sucesso('Laudo aprovado com sucesso!');
            UI.renderLaudosPCM();
        } catch(e) {
            NOTIFICACOES.erro(e.message || 'Erro ao aprovar laudo.');
        }
    },

    async reprovarLaudo(laudoId) {
        const user = DB.getCurrentUser();
        try {
            await DB.aprovarLaudo(laudoId, 'reprovado', user?.nome || 'PCM');
            NOTIFICACOES.sucesso('Laudo reprovado.');
            UI.renderLaudosPCM();
        } catch(e) {
            NOTIFICACOES.erro(e.message || 'Erro ao reprovar laudo.');
        }
    },

    async adicionarPeca() {
        const nome = document.getElementById('nomePeca').value.trim();
        const quantidade = parseInt(document.getElementById('quantidadePeca').value);
        const valor = parseFloat(document.getElementById('valorPeca').value);
        const minimoEstoque = parseInt(document.getElementById('minPeca').value);

        if (!nome || !quantidade || !valor || !minimoEstoque) {
            NOTIFICACOES.erro('Preencha todos os campos da peça!');
            return;
        }

        try {
            await DB.adicionarPeca({ nome, quantidade, valor, minimoEstoque });
            NOTIFICACOES.sucesso('Peça adicionada com sucesso!');
            document.getElementById('nomePeca').value = '';
            document.getElementById('quantidadePeca').value = '';
            document.getElementById('valorPeca').value = '';
            document.getElementById('minPeca').value = '';
            setTimeout(() => UI.renderEstoque(), 1500);
        } catch(e) {
            NOTIFICACOES.erro(e.message || 'Erro ao adicionar peça.');
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

    async cadastrarManutentor() {
        const nome = document.getElementById('nomeManutentor').value.trim();
        const email = document.getElementById('emailManutentor').value.trim();
        const senha = document.getElementById('senhaManutentor').value;
        const turnoInicio = document.getElementById('turnoInicio').value;
        const turnoFim = document.getElementById('turnoFim').value;
        const almocoInicio = document.getElementById('almocoInicio').value;
        const almocoFim = document.getElementById('almocoFim').value;

        if (!nome || !email || !senha || !turnoInicio || !turnoFim || !almocoInicio || !almocoFim) {
            NOTIFICACOES.erro('Preencha todos os campos obrigatórios!');
            return;
        }

        try {
            await DB.adicionarManutentor({ nome, email, senha, turnoInicio, turnoFim, almocoInicio, almocoFim });
            NOTIFICACOES.sucesso('Manutentor cadastrado com sucesso!');
            document.getElementById('formCadastroManutentor').reset();
            setTimeout(() => UI.renderManutentores(), 1500);
        } catch(e) {
            NOTIFICACOES.erro(e.message || 'Erro ao cadastrar manutentor.');
        }
    },

    async removerManutentor(id) {
        if (confirm('Tem certeza que deseja remover este manutentor?')) {
            try {
                await DB.removerManutentor(id);
                UI.renderManutentores();
            } catch(e) {
                NOTIFICACOES.erro(e.message || 'Erro ao remover manutentor.');
            }
        }
    },

    async cadastrarMaquina() {
        const id = document.getElementById('idMaquina').value.trim();
        const nome = document.getElementById('nomeMaquina').value.trim();
        const especificacoes = document.getElementById('especMaquina').value.trim();
        const historico = document.getElementById('historicoMaquina').value.trim();

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
        const novoEmail = document.getElementById('emailPCM').value.trim();
        const novaSenha = document.getElementById('senhaPCM').value;

        if (!novoEmail) { NOTIFICACOES.erro('Email não pode estar vazio!'); return; }

        const user = DB.getCurrentUser();
        try {
            await DB.atualizarManutentor(user.id, novoEmail, novaSenha);
            NOTIFICACOES.sucesso('Configurações atualizadas com sucesso!');
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
        this.canvas.width = this.canvas.offsetWidth || 600;
        this.canvas.height = this.canvas.offsetHeight || 150;

        this.canvas.addEventListener('mousedown', (e) => this.iniciarDesenho(e));
        this.canvas.addEventListener('mousemove', (e) => this.desenhar(e));
        this.canvas.addEventListener('mouseup', () => this.pararDesenho());
        this.canvas.addEventListener('mouseout', () => this.pararDesenho());

        this.canvas.addEventListener('touchstart', (e) => { e.preventDefault(); this.iniciarDesenho(e); }, { passive: false });
        this.canvas.addEventListener('touchmove', (e) => { e.preventDefault(); this.desenhar(e); }, { passive: false });
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

    pararDesenho() { this.isDrawing = false; },

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
    _canvas: null,
    _ctx: null,
    _isDrawing: false,

    inicializarAssinatura() {
        this._canvas = document.getElementById('signatureCanvasOperador');
        if (!this._canvas) return;

        this._ctx = this._canvas.getContext('2d');
        this._canvas.width = this._canvas.offsetWidth || 600;
        this._canvas.height = this._canvas.offsetHeight || 150;

        this._canvas.addEventListener('mousedown', (e) => this._iniciarDesenho(e));
        this._canvas.addEventListener('mousemove', (e) => this._desenhar(e));
        this._canvas.addEventListener('mouseup', () => { this._isDrawing = false; });
        this._canvas.addEventListener('mouseout', () => { this._isDrawing = false; });

        this._canvas.addEventListener('touchstart', (e) => { e.preventDefault(); this._iniciarDesenho(e); }, { passive: false });
        this._canvas.addEventListener('touchmove', (e) => { e.preventDefault(); this._desenhar(e); }, { passive: false });
        this._canvas.addEventListener('touchend', () => { this._isDrawing = false; });
    },

    _iniciarDesenho(e) {
        this._isDrawing = true;
        const rect = this._canvas.getBoundingClientRect();
        const x = (e.clientX || (e.touches && e.touches[0].clientX)) - rect.left;
        const y = (e.clientY || (e.touches && e.touches[0].clientY)) - rect.top;
        this._ctx.beginPath();
        this._ctx.moveTo(x, y);
    },

    _desenhar(e) {
        if (!this._isDrawing) return;
        const rect = this._canvas.getBoundingClientRect();
        const x = (e.clientX || (e.touches && e.touches[0].clientX)) - rect.left;
        const y = (e.clientY || (e.touches && e.touches[0].clientY)) - rect.top;
        this._ctx.lineWidth = 2;
        this._ctx.lineCap = 'round';
        this._ctx.strokeStyle = '#1f7e3d';
        this._ctx.lineTo(x, y);
        this._ctx.stroke();
    },

    limparAssinatura() {
        if (this._canvas) {
            this._ctx.clearRect(0, 0, this._canvas.width, this._canvas.height);
        }
    },

    async confirmar(osId) {
        const assinatura = this._canvas ? this._canvas.toDataURL() : null;
        if (!assinatura) {
            NOTIFICACOES.erro('Assinatura do operador é obrigatória!');
            return;
        }

        try {
            await DB.atualizarOS(osId, {
                assinaturaOperador: assinatura,
                dataConfirmacao: new Date().toISOString(),
                status: 'finalizado'
            });
            NOTIFICACOES.sucesso('Confirmação registrada com sucesso!');
            setTimeout(() => UI.renderDashboardManutentor(), 1500);
        } catch(e) {
            NOTIFICACOES.erro(e.message || 'Erro ao confirmar.');
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
        html += '<table class="table"><thead><tr><th>Manutentor</th><th>Total de O.S.</th><th>Finalizadas</th></tr></thead><tbody>';

        manutentores.forEach(m => {
            const osDoManutentor = os.filter(o => o.manutentor === m.nome);
            const finalizadas = osDoManutentor.filter(o => o.status === 'finalizado').length;
            html += `<tr><td>${m.nome}</td><td>${osDoManutentor.length}</td><td>${finalizadas}</td></tr>`;
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

        Object.entries(problemas).sort((a, b) => b[1] - a[1]).forEach(([problema, count]) => {
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
            html += `<h3>${m.id} - ${m.nome}</h3>`;
            html += '<table class="table"><thead><tr><th>O.S.</th><th>Problema</th><th>Data</th><th>Status</th></tr></thead><tbody>';
            osDoMaquina.forEach(o => {
                html += `<tr><td>${o.id}</td><td>${o.descricao}</td><td>${o.dataCriacao ? o.dataCriacao.split('T')[0] : '--'}</td><td>${o.status}</td></tr>`;
            });
            html += '</tbody></table>';
        });

        this.exportarPDF(html, 'HistoricoMaquinas');
    },

    async exportarLaudo(laudoId) {
        const laudo = await DB.obterLaudoPorId(laudoId);
        if (!laudo) return;

        const itensOk = (laudo.itensChecklist || []).filter(i => i.status === 'ok').length;
        const itensNaoOk = (laudo.itensChecklist || []).filter(i => i.status === 'nao_ok').length;

        let html = `
            <h2 style="color: #1f7e3d;">🌲 EcoMaintain - Laudo de Checklist Preventivo</h2>
            <hr>
            <h3>Informações</h3>
            <table class="table">
                <tr><td><strong>ID do Laudo</strong></td><td>${laudo.id}</td></tr>
                <tr><td><strong>Máquina</strong></td><td>${laudo.maquinaNome || laudo.maquinaId || '--'}</td></tr>
                <tr><td><strong>Manutentor</strong></td><td>${laudo.manutentorNome || '--'}</td></tr>
                <tr><td><strong>Tipo</strong></td><td>${laudo.tipoManutencao || '--'}</td></tr>
                <tr><td><strong>Data de Execução</strong></td><td>${laudo.dataExecucao ? new Date(laudo.dataExecucao).toLocaleString('pt-BR') : '--'}</td></tr>
                <tr><td><strong>Status</strong></td><td>${laudo.statusLaudo}</td></tr>
                <tr><td><strong>Resumo</strong></td><td>${itensOk} OK | ${itensNaoOk} Não OK | ${laudo.totalItens} Total</td></tr>
            </table>
            <h3>Itens do Checklist</h3>
            <table class="table">
                <thead><tr><th>#</th><th>Item</th><th>Status</th><th>Observação</th></tr></thead>
                <tbody>
                    ${(laudo.itensChecklist || []).map((item, i) => `
                        <tr>
                            <td>${i+1}</td>
                            <td>${item.descricao}</td>
                            <td>${item.status === 'ok' ? '✅ OK' : item.status === 'nao_ok' ? '❌ NÃO OK' : '⏳ Pendente'}</td>
                            <td>${item.observacao || '--'}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
            ${laudo.observacoesGerais ? `<h3>Observações Gerais</h3><p>${laudo.observacoesGerais}</p>` : ''}
        `;

        this.exportarPDF(html, `Laudo_${laudo.id}`);
    },

    async exportarRelatorioFechamento(relatorioId) {
        const relatorio = await DB.obterRelatorioFechamentoPorId(relatorioId);
        if (!relatorio) return;

        let html = `
            <h2 style="color: #1f7e3d;">🌲 EcoMaintain - Relatório de Fechamento de O.S.</h2>
            <hr>
            <h3>Dados da Ordem de Serviço</h3>
            <table class="table">
                <tr><td><strong>O.S.</strong></td><td>${relatorio.osId}</td></tr>
                <tr><td><strong>Máquina</strong></td><td>${relatorio.maquinaNome || relatorio.maquinaId || '--'}</td></tr>
                <tr><td><strong>Manutentor</strong></td><td>${relatorio.manutentorNome || '--'}</td></tr>
                <tr><td><strong>Status Final</strong></td><td>${relatorio.statusFinal === 'finalizado' ? '✅ Finalizado com Sucesso' : '⚠️ Pendente (Peça Externa)'}</td></tr>
                <tr><td><strong>Início</strong></td><td>${relatorio.dataInicio ? new Date(relatorio.dataInicio).toLocaleString('pt-BR') : '--'}</td></tr>
                <tr><td><strong>Fechamento</strong></td><td>${relatorio.dataFechamento ? new Date(relatorio.dataFechamento).toLocaleString('pt-BR') : '--'}</td></tr>
            </table>
            <h3>Resumo da Execução</h3>
            <p>${relatorio.descricaoExecucao || '--'}</p>
            <p><strong>Fotos de Evidência:</strong> ${(relatorio.fotosEvidencia || []).length} foto(s) anexada(s)</p>
            ${relatorio.assinaturaManutentor ? `
            <h3>Assinatura Digital do Manutentor</h3>
            <img src="${relatorio.assinaturaManutentor}" style="max-width: 300px; border: 1px solid #ddd; padding: 5px;">
            <p>${relatorio.manutentorNome || 'Manutentor'} - ${relatorio.dataFechamento ? new Date(relatorio.dataFechamento).toLocaleDateString('pt-BR') : '--'}</p>
            ` : ''}
        `;

        this.exportarPDF(html, `RelatorioFechamento_${relatorio.osId}`);
    },

    exportarPDF(html, nome) {
        const element = document.createElement('div');
        element.innerHTML = `
            <div style="font-family: Arial, sans-serif; padding: 20px;">
                ${html}
                <p style="margin-top: 40px; color: #757575; font-size: 12px;">
                    Gerado em: ${new Date().toLocaleString('pt-BR')} | EcoMaintain v2.0
                </p>
            </div>
        `;

        const opt = {
            margin: 10,
            filename: `${nome}_${Date.now()}.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2 },
            jsPDF: { orientation: 'portrait', unit: 'mm', format: 'a4' }
        };

        if (typeof html2pdf !== 'undefined') {
            html2pdf().set(opt).from(element).save();
        } else {
            const win = window.open('', '_blank');
            win.document.write('<html><head><title>' + nome + '</title></head><body>' + element.innerHTML + '</body></html>');
            win.print();
        }
    }
};

// ============================================
// AGENDA PREVENTIVA
// ============================================

UI.renderAgendaPreventiva = async function() {
    const role = DB.getCurrentUserRole();
    const user = DB.getCurrentUser();
    const agendamentos = await DB.obterAgendaPreventiva(role === 'manutentor' ? user?.id : null);
    const maquinas = await DB.obterMaquinas();
    const manutentores = role === 'pcm' ? await DB.obterManutentores() : [];

    document.querySelector('.content').innerHTML = `
        <div class="dashboard-header">
            <h1 class="dashboard-title">📅 Agenda Preventiva</h1>
        </div>

        ${role === 'pcm' ? `
        <div class="card">
            <h3 class="card-title">Novo Agendamento Preventivo</h3>
            <form id="form-novo-agendamento">
                <div class="row">
                    <div class="col">
                        <div class="form-group">
                            <label class="form-label">Máquina <span style="color: red;">*</span></label>
                            <select id="maquina-preventiva" class="form-control">
                                <option value="">-- Selecione --</option>
                                ${maquinas.map(m => `<option value="${m.id}">${m.id} - ${m.nome}</option>`).join('')}
                            </select>
                        </div>
                    </div>
                    <div class="col">
                        <div class="form-group">
                            <label class="form-label">Tipo de Manutenção <span style="color: red;">*</span></label>
                            <select id="tipo-preventiva" class="form-control">
                                <option value="">-- Selecione --</option>
                                <option value="Preventiva Geral">Preventiva Geral</option>
                                <option value="Troca de Óleo">Troca de Óleo</option>
                                <option value="Revisão de Freios">Revisão de Freios</option>
                                <option value="Inspeção Elétrica">Inspeção Elétrica</option>
                                <option value="Lubrificação">Lubrificação</option>
                                <option value="Calibração">Calibração</option>
                            </select>
                        </div>
                    </div>
                </div>
                <div class="row">
                    <div class="col">
                        <div class="form-group">
                            <label class="form-label">Manutentor <span style="color: red;">*</span></label>
                            <select id="manutentor-preventiva" class="form-control">
                                <option value="">-- Selecione --</option>
                                ${manutentores.map(m => `<option value="${m.id}">${m.nome}</option>`).join('')}
                            </select>
                        </div>
                    </div>
                    <div class="col">
                        <div class="form-group">
                            <label class="form-label">Data Programada <span style="color: red;">*</span></label>
                            <input type="date" id="data-preventiva" class="form-control">
                        </div>
                    </div>
                </div>
                <button type="button" class="btn btn-success btn-block" onclick="PCM.criarAgendamentoPreventivo()">+ Criar Agendamento</button>
            </form>
        </div>
        ` : ''}

        <div class="card" style="margin-top: 20px;">
            <h3 class="card-title">Agendamentos ${role === 'manutentor' ? 'Atribuídos a Mim' : 'Programados'}</h3>
            ${agendamentos.length === 0 ? '<div class="alert alert-info">Nenhum agendamento encontrado.</div>' : `
            <table class="table">
                <thead>
                    <tr>
                        <th>Máquina</th>
                        <th>Tipo</th>
                        <th>Manutentor</th>
                        <th>Data Programada</th>
                        <th>Status</th>
                        <th>Ações</th>
                    </tr>
                </thead>
                <tbody>
                    ${agendamentos.map(a => `
                        <tr>
                            <td>${a.nomeMaquina || a.idMaquina}</td>
                            <td>${a.tipoManutencao}</td>
                            <td>${a.nomeUsuario || '--'}</td>
                            <td>${a.dataProgramada ? a.dataProgramada.split('T')[0] : '--'}</td>
                            <td>
                                <span class="badge ${a.status === 'concluido' ? 'badge-success' : a.status === 'em_andamento' ? 'badge-warning' : 'badge-secondary'}">
                                    ${a.status || 'pendente'}
                                </span>
                            </td>
                            <td>
                                ${role === 'manutentor' ? `
                                    <button class="btn btn-sm btn-success" onclick="CHECKLIST.carregarChecklistDireto('${a.id}')">✔️ Executar Checklist</button>
                                ` : `
                                    <button class="btn btn-sm btn-danger" onclick="PCM.removerAgendamentoPreventivo('${a.id}')">Remover</button>
                                `}
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
            `}
        </div>
    `;
};

CHECKLIST.carregarChecklistDireto = async function(agendaId) {
    CHECKLIST._agendaAtual = agendaId;
    const itens = await DB.obterChecklistItens(agendaId);
    CHECKLIST._itensLocais = itens.length > 0
        ? itens.map(i => ({...i, criadoLocalmente: false}))
        : CHECKLIST._getItensDefault();

    document.querySelector('.content').innerHTML = `
        <div class="dashboard-header">
            <h1 class="dashboard-title">✔️ Executar Checklist</h1>
            <button class="btn btn-secondary" onclick="UI.renderAgendaPreventiva()">← Voltar</button>
        </div>

        <div class="card">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                <h3 class="card-title" style="margin: 0;">Itens do Checklist</h3>
                <button class="btn btn-success btn-sm" onclick="CHECKLIST.adicionarItem()">➕ Adicionar Item</button>
            </div>

            <div id="listaItensChecklist"></div>

            <div style="margin-top: 20px; padding: 15px; background: #f5f5f5; border-radius: 6px;">
                <label class="form-label">📝 Observações Gerais (Opcional)</label>
                <textarea id="observacoesGerais" class="form-control" placeholder="Observações gerais sobre a manutenção realizada..." rows="3"></textarea>
            </div>

            <div style="display: flex; gap: 10px; margin-top: 20px;">
                <button class="btn btn-primary" onclick="CHECKLIST.finalizarChecklist()">✅ Finalizar e Gerar Laudo</button>
                <button class="btn btn-secondary" onclick="UI.renderAgendaPreventiva()">Cancelar</button>
            </div>
        </div>
    `;

    CHECKLIST.renderItens();
};

// ============================================
// SCANNER QR CODE
// ============================================

const SCANNER = {
    iniciar() {
        const reader = document.getElementById('reader');
        if (!reader) return;
        reader.classList.add('active');

        if (typeof Html5Qrcode === 'undefined') {
            NOTIFICACOES.aviso('Scanner não disponível. Digite o ID manualmente.');
            reader.classList.remove('active');
            return;
        }

        const html5QrCode = new Html5Qrcode('reader');
        const config = { fps: 10, qrbox: { width: 250, height: 250 } };

        html5QrCode.start(
            { facingMode: 'environment' },
            config,
            (decodedText) => {
                const input = document.getElementById('osIdMaquina');
                if (input) input.value = decodedText;
                html5QrCode.stop();
                reader.classList.remove('active');
                NOTIFICACOES.sucesso('QR Code lido com sucesso!');
            },
            () => {}
        );
    }
};

// ============================================
// NOTIFICAÇÕES
// ============================================

const NOTIFICACOES = {
    _container: null,

    _getContainer() {
        if (!this._container) {
            this._container = document.getElementById('notificacoes');
            if (!this._container) {
                this._container = document.createElement('div');
                this._container.id = 'notificacoes';
                this._container.style.cssText = 'position: fixed; top: 20px; right: 20px; z-index: 9999; max-width: 350px;';
                document.body.appendChild(this._container);
            }
        }
        return this._container;
    },

    _mostrar(mensagem, tipo) {
        const container = this._getContainer();
        const cores = {
            sucesso: { bg: '#e8f5e9', border: '#28a745', text: '#155724', icon: '✅' },
            erro: { bg: '#ffebee', border: '#dc3545', text: '#721c24', icon: '❌' },
            aviso: { bg: '#fff8e1', border: '#ffc107', text: '#856404', icon: '⚠️' },
            info: { bg: '#e3f2fd', border: '#2196f3', text: '#0c5460', icon: 'ℹ️' }
        };
        const c = cores[tipo] || cores.info;

        const notif = document.createElement('div');
        notif.style.cssText = `
            background: ${c.bg}; border: 1px solid ${c.border}; border-left: 4px solid ${c.border};
            color: ${c.text}; padding: 12px 16px; border-radius: 6px; margin-bottom: 10px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.15); animation: slideIn 0.3s ease;
            display: flex; align-items: center; gap: 10px;
        `;
        notif.innerHTML = `<span>${c.icon}</span><span style="flex:1;">${mensagem}</span><button onclick="this.parentElement.remove()" style="background:none;border:none;cursor:pointer;color:${c.text};font-size:16px;padding:0;margin-left:5px;">×</button>`;
        container.appendChild(notif);

        setTimeout(() => { if (notif.parentElement) notif.remove(); }, 4000);
    },

    sucesso(msg) { this._mostrar(msg, 'sucesso'); },
    erro(msg) { this._mostrar(msg, 'erro'); },
    aviso(msg) { this._mostrar(msg, 'aviso'); },
    info(msg) { this._mostrar(msg, 'info'); }
};

// ============================================
// INICIALIZAÇÃO DO APP
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    DB.init();

    const user = DB.getCurrentUser();
    const role = DB.getCurrentUserRole();

    if (user && role) {
        if (role === 'pcm') {
            UI.renderDashboardPCM();
        } else {
            UI.renderDashboardManutentor();
        }
    } else {
        UI.renderLogin();
    }
});
