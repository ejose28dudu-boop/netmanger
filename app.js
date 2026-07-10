// ==========================================
// CONFIGURAÇÃO DO BANCO DE DADOS EM NUVEM
// ==========================================
// Substitua os valores abaixo pelas credenciais do seu projeto no Supabase:
const SUPABASE_URL = "SUA_URL_DO_SUPABASE";
const SUPABASE_KEY = "SUA_KEY_ANON_DO_SUPABASE";

// Verifica se as credenciais foram devidamente preenchidas pelo usuário
const isCloudConfigured = 
    SUPABASE_URL !== "SUA_URL_DO_SUPABASE" && 
    SUPABASE_KEY !== "SUA_KEY_ANON_DO_SUPABASE" && 
    SUPABASE_URL.trim() !== "" && 
    SUPABASE_KEY.trim() !== "";

let supabase = null;
if (isCloudConfigured) {
    // Inicializa o cliente do Supabase
    supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
}

// State Management
let plans = [];
let clients = [];

// Seed Data (Dados Iniciais padrão)
const initialPlans = [
    {
        id: "plan-1",
        nome: "Fibra Essencial",
        velocidade: "100",
        unidade: "Mega",
        preco: 79.90,
        tipo: "Fibra Óptica",
        descricao: "Velocidade estável para o dia a dia. Ideal para navegação, redes sociais e estudos. Wi-Fi 5 incluso."
    },
    {
        id: "plan-2",
        nome: "Fibra Ultra",
        velocidade: "500",
        unidade: "Mega",
        preco: 119.90,
        tipo: "Fibra Óptica",
        descricao: "O plano mais vendido! Perfeito para streaming em 4K, jogos online e home office. Wi-Fi 6 de alta performance incluso."
    },
    {
        id: "plan-3",
        nome: "Fibra Premium Gigabit",
        velocidade: "1",
        unidade: "Giga",
        preco: 199.90,
        tipo: "Fibra Óptica",
        descricao: "Para usuários exigentes e famílias conectadas. Velocidade extrema e estabilidade incomparável. Roteador premium."
    },
    {
        id: "plan-4",
        nome: "Rural Satélite",
        velocidade: "50",
        unidade: "Mega",
        preco: 149.90,
        tipo: "Via Satélite",
        descricao: "Conexão de alta qualidade para áreas rurais e de difícil acesso. Antena e roteador de última geração inclusos."
    }
];

const initialClients = [
    {
        id: "client-1",
        nome: "João de Sousa",
        cpf: "123.456.789-00",
        telefone: "(11) 98765-4321",
        plano_id: "plan-2"
    },
    {
        id: "client-2",
        nome: "Maria Oliveira",
        cpf: "987.654.321-11",
        telefone: "(21) 99888-7766",
        plano_id: "plan-1"
    },
    {
        id: "client-3",
        nome: "Carlos Silva",
        cpf: "456.789.123-22",
        telefone: "(31) 97777-8888",
        plano_id: "plan-2"
    },
    {
        id: "client-4",
        nome: "Ana Costa",
        cpf: "321.654.987-33",
        telefone: "(81) 96666-5555",
        plano_id: "plan-3"
    },
    {
        id: "client-5",
        nome: "Roberto Santos",
        cpf: "789.123.456-44",
        telefone: "(85) 95555-4444",
        plano_id: "plan-2"
    }
];

// UI Load Indicator
function showLoading(text) {
    const overlay = document.getElementById("loading-overlay");
    const label = document.getElementById("loading-text");
    if (overlay && label) {
        label.textContent = text || "Processando requisição...";
        overlay.style.display = "flex";
    }
}

function hideLoading() {
    const overlay = document.getElementById("loading-overlay");
    if (overlay) {
        overlay.style.display = "none";
    }
}

// Fetch & Initialize Data
async function loadData() {
    showLoading("Carregando banco de dados...");
    
    if (isCloudConfigured) {
        try {
            // 1. Busca Planos
            let { data: dbPlans, error: plansErr } = await supabase.from('planos').select('*');
            if (plansErr) throw plansErr;

            // 2. Busca Clientes
            let { data: dbClients, error: clientsErr } = await supabase.from('clientes').select('*');
            if (clientsErr) throw clientsErr;

            // Se o banco remoto estiver totalmente vazio, insere os dados iniciais automaticamente (Seed)
            if (dbPlans.length === 0 && dbClients.length === 0) {
                showLoading("Semeando banco de dados remoto pela primeira vez...");
                
                const { error: seedPlansErr } = await supabase.from('planos').insert(initialPlans);
                if (seedPlansErr) throw seedPlansErr;

                const { error: seedClientsErr } = await supabase.from('clientes').insert(initialClients);
                if (seedClientsErr) throw seedClientsErr;

                // Re-busca após o seed
                let { data: newPlans } = await supabase.from('planos').select('*');
                let { data: newClients } = await supabase.from('clientes').select('*');
                plans = newPlans || [];
                clients = newClients || [];
            } else {
                plans = dbPlans || [];
                clients = dbClients || [];
            }
        } catch (err) {
            console.error("Erro ao conectar com o Supabase:", err);
            alert("Erro ao sincronizar dados com o Supabase. Verifique seu console do navegador ou as configurações de RLS.");
        }
    } else {
        // Fallback local: LocalStorage
        const savedPlans = localStorage.getItem("netmanager_plans");
        const savedClients = localStorage.getItem("netmanager_clients");

        if (savedPlans) {
            plans = JSON.parse(savedPlans);
        } else {
            plans = [...initialPlans];
            localStorage.setItem("netmanager_plans", JSON.stringify(plans));
        }

        if (savedClients) {
            clients = JSON.parse(savedClients);
        } else {
            clients = [...initialClients];
            localStorage.setItem("netmanager_clients", JSON.stringify(clients));
        }
    }

    // Oculta loading e atualiza a interface
    hideLoading();
    updatePlanSelectOptions();
    renderActiveView();
}

// Render active view based on selected tab
function renderActiveView() {
    const activeTab = document.querySelector(".nav-item.active");
    if (!activeTab) return;
    const viewName = activeTab.getAttribute("data-view");
    
    if (viewName === "dashboard") {
        renderDashboard();
    } else if (viewName === "clientes") {
        renderClients(document.getElementById("search-clientes").value);
    } else if (viewName === "planos") {
        renderPlans(document.getElementById("search-planos").value);
    }
}

// Helpers
function formatCurrency(value) {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
}

function getClientsCountForPlan(planoId) {
    return clients.filter(c => c.plano_id === planoId).length;
}

// Dynamic Input Masks (CPF and Phone)
function setupMasks() {
    const cpfInput = document.getElementById("cliente-cpf");
    const telInput = document.getElementById("cliente-telefone");

    cpfInput.addEventListener("input", function(e) {
        let value = e.target.value.replace(/\D/g, "");
        if (value.length > 11) value = value.slice(0, 11);
        
        let formatted = "";
        if (value.length > 0) {
            formatted += value.slice(0, 3);
            if (value.length > 3) formatted += "." + value.slice(3, 6);
            if (value.length > 6) formatted += "." + value.slice(6, 9);
            if (value.length > 9) formatted += "-" + value.slice(9, 11);
        }
        e.target.value = formatted;
    });

    telInput.addEventListener("input", function(e) {
        let value = e.target.value.replace(/\D/g, "");
        if (value.length > 11) value = value.slice(0, 11);
        
        let formatted = "";
        if (value.length > 0) {
            formatted += "(" + value.slice(0, 2);
            if (value.length > 2) {
                formatted += ") ";
                if (value.length > 7) {
                    formatted += value.slice(2, 7) + "-" + value.slice(7, 11);
                } else {
                    formatted += value.slice(2);
                }
            } else {
                formatted += value.slice(0);
            }
        }
        e.target.value = formatted;
    });
}

// Setup View Tabs Switching
function setupNavigation() {
    const navItems = document.querySelectorAll(".nav-item");
    const viewSections = document.querySelectorAll(".view-section");
    const viewTitle = document.getElementById("view-title");
    const viewSubtitle = document.getElementById("view-subtitle");

    const headerDetails = {
        dashboard: {
            title: "Dashboard",
            subtitle: "Bem-vindo de volta! Aqui está o resumo geral das operações."
        },
        clientes: {
            title: "Registro de Clientes",
            subtitle: "Visualize, adicione, edite ou remova assinantes do sistema."
        },
        planos: {
            title: "Planos de Internet",
            subtitle: "Gerencie as ofertas e velocidades disponíveis na rede."
        }
    };

    navItems.forEach(item => {
        item.addEventListener("click", function(e) {
            e.preventDefault();
            const view = this.getAttribute("data-view");

            navItems.forEach(i => i.classList.remove("active"));
            this.classList.add("active");

            viewSections.forEach(section => {
                section.classList.remove("active");
                if (section.id === `${view}-view`) {
                    section.classList.add("active");
                }
            });

            viewTitle.textContent = headerDetails[view].title;
            viewSubtitle.textContent = headerDetails[view].subtitle;

            if (view === "dashboard") {
                renderDashboard();
            } else if (view === "clientes") {
                renderClients();
            } else if (view === "planos") {
                renderPlans();
            }
        });
    });
}

// Render Dashboard View
function renderDashboard() {
    const totalClientes = clients.length;
    const totalPlanos = plans.length;
    
    // Calculate estimated monthly revenue
    let totalRevenue = 0;
    clients.forEach(client => {
        const plan = plans.find(p => p.id === client.plano_id);
        if (plan) {
            totalRevenue += parseFloat(plan.preco);
        }
    });

    document.getElementById("kpi-total-clientes").textContent = totalClientes;
    document.getElementById("kpi-total-planos").textContent = totalPlanos;
    document.getElementById("kpi-receita-total").textContent = formatCurrency(totalRevenue);

    // Render Distribution List (Popularity)
    const distList = document.getElementById("dashboard-dist-list");
    distList.innerHTML = "";

    const sortedPlans = [...plans].map(plan => {
        return {
            ...plan,
            subscribers: getClientsCountForPlan(plan.id)
        };
    }).sort((a, b) => b.subscribers - a.subscribers);

    if (sortedPlans.length === 0) {
        distList.innerHTML = `
            <div style="text-align: center; color: var(--text-muted); padding: 2rem 0;">
                Nenhum plano cadastrado.
            </div>
        `;
    } else {
        sortedPlans.forEach(plan => {
            const count = plan.subscribers;
            const percent = totalClientes > 0 ? Math.round((count / totalClientes) * 100) : 0;
            
            const distItem = document.createElement("div");
            distItem.className = "dist-item";
            distItem.innerHTML = `
                <div class="dist-header">
                    <span class="dist-name">${plan.nome} (${plan.velocidade} ${plan.unidade})</span>
                    <span class="dist-stats">${count} cliente${count !== 1 ? 's' : ''} (${percent}%)</span>
                </div>
                <div class="dist-bar-bg">
                    <div class="dist-bar-fill" style="width: ${percent}%"></div>
                </div>
            `;
            distList.appendChild(distItem);
        });
    }

    // Render Last 5 Registered Clients
    const recentClientsList = document.getElementById("dashboard-recent-clients");
    recentClientsList.innerHTML = "";

    const recentClients = [...clients].slice(-5).reverse();

    if (recentClients.length === 0) {
        recentClientsList.innerHTML = `
            <div style="text-align: center; color: var(--text-muted); padding: 2rem 0;">
                Nenhum cliente cadastrado ainda.
            </div>
        `;
    } else {
        recentClients.forEach(client => {
            const plan = plans.find(p => p.id === client.plano_id);
            const planName = plan ? plan.nome : "Plano Indisponível";

            const clientItem = document.createElement("div");
            clientItem.style.display = "flex";
            clientItem.style.justifyContent = "space-between";
            clientItem.style.alignItems = "center";
            clientItem.style.padding = "0.75rem 0";
            clientItem.style.borderBottom = "1px solid var(--border-glass)";
            
            clientItem.innerHTML = `
                <div>
                    <div style="font-weight: 500; font-size: 0.95rem;">${client.nome}</div>
                    <div style="font-size: 0.8rem; color: var(--text-secondary);">${client.telefone}</div>
                </div>
                <div>
                    <span class="badge badge-purple">${planName}</span>
                </div>
            `;
            recentClientsList.appendChild(clientItem);
        });
    }
}

// Render Clients View Table
function renderClients(filterText = '') {
    const tbody = document.getElementById("tbody-clientes");
    const emptyState = document.getElementById("empty-state-clientes");
    const tableElement = document.getElementById("table-clientes");
    
    tbody.innerHTML = "";

    const filteredClients = clients.filter(client => {
        const query = filterText.toLowerCase();
        return (
            client.nome.toLowerCase().includes(query) ||
            client.cpf.toLowerCase().includes(query)
        );
    });

    if (filteredClients.length === 0) {
        tableElement.style.display = "none";
        emptyState.style.display = "block";
    } else {
        tableElement.style.display = "table";
        emptyState.style.display = "none";

        filteredClients.forEach(client => {
            const plan = plans.find(p => p.id === client.plano_id);
            const planName = plan ? `${plan.nome} (${plan.velocidade} ${plan.unidade})` : "Plano Indisponível";

            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td style="font-weight: 500;">${client.nome}</td>
                <td>${client.cpf}</td>
                <td>${client.telefone}</td>
                <td><span class="badge ${plan ? 'badge-blue' : 'badge-pink'}">${planName}</span></td>
                <td style="text-align: right;">
                    <div style="display: inline-flex; gap: 4px;">
                        <button class="btn-icon-only edit" onclick="openEditClientModal('${client.id}')" title="Editar Cliente">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                <path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                            </svg>
                        </button>
                        <button class="btn-icon-only delete" onclick="deleteClient('${client.id}')" title="Excluir Cliente">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <polyline points="3 6 5 6 21 6" />
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                            </svg>
                        </button>
                    </div>
                </td>
            `;
            tbody.appendChild(tr);
        });
    }
}

// Render Plans View Cards
function renderPlans(filterText = '') {
    const container = document.getElementById("plans-container");
    const emptyState = document.getElementById("empty-state-planos");

    container.innerHTML = "";

    const filteredPlans = plans.filter(plan => {
        const query = filterText.toLowerCase();
        return (
            plan.nome.toLowerCase().includes(query) ||
            plan.tipo.toLowerCase().includes(query)
        );
    });

    if (filteredPlans.length === 0) {
        container.style.display = "none";
        emptyState.style.display = "block";
    } else {
        container.style.display = "grid";
        emptyState.style.display = "none";

        filteredPlans.forEach(plan => {
            const count = getClientsCountForPlan(plan.id);
            const priceFormatted = formatCurrency(plan.preco);

            const card = document.createElement("div");
            card.className = "plan-card";
            card.innerHTML = `
                <span class="badge badge-purple plan-badge">${plan.tipo}</span>
                <div style="font-weight: 600; font-size: 1.1rem; color: var(--text-primary);">${plan.nome}</div>
                <div class="plan-speed">${plan.velocidade} <span>${plan.unidade}</span></div>
                <div class="plan-price">${priceFormatted.split(',')[0]}<span style="font-size: 1.2rem; color: var(--accent-cyan);">,${priceFormatted.split(',')[1]}</span> <span>/mês</span></div>
                <div class="plan-customer-count">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                        <circle cx="9" cy="7" r="4" />
                    </svg>
                    <span>${count} cliente${count !== 1 ? 's' : ''} ativo${count !== 1 ? 's' : ''}</span>
                </div>
                <div class="plan-desc">${plan.descricao || 'Sem descrição cadastrada.'}</div>
                
                <div class="plan-actions">
                    <button class="btn-icon-only edit" onclick="openEditPlanModal('${plan.id}')" title="Editar Plano">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                            <path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                        </svg>
                    </button>
                    <button class="btn-icon-only delete" onclick="deletePlan('${plan.id}')" title="Excluir Plano">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="3 6 5 6 21 6" />
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                        </svg>
                    </button>
                </div>
            `;
            container.appendChild(card);
        });
    }
}

// Update drop-down list of available plans in Client Modal
function updatePlanSelectOptions() {
    const select = document.getElementById("cliente-plano");
    select.innerHTML = '<option value="" disabled selected>Selecione um plano...</option>';

    plans.forEach(plan => {
        const option = document.createElement("option");
        option.value = plan.id;
        option.textContent = `${plan.nome} (${plan.velocidade} ${plan.unidade} - ${formatCurrency(plan.preco)})`;
        select.appendChild(option);
    });
}

// Modals Toggle
const clientOverlay = document.getElementById("modal-cliente-overlay");
const planOverlay = document.getElementById("modal-plano-overlay");

function showModal(overlay) {
    overlay.classList.add("active");
}

function closeModal(overlay) {
    overlay.classList.remove("active");
}

// Trigger creation modais
document.getElementById("btn-novo-cliente").addEventListener("click", () => {
    document.getElementById("form-cliente").reset();
    document.getElementById("cliente-id").value = "";
    document.getElementById("modal-cliente-title").textContent = "Cadastrar Novo Cliente";
    showModal(clientOverlay);
});
document.getElementById("btn-empty-novo-cliente").addEventListener("click", () => {
    document.getElementById("form-cliente").reset();
    document.getElementById("cliente-id").value = "";
    document.getElementById("modal-cliente-title").textContent = "Cadastrar Novo Cliente";
    showModal(clientOverlay);
});
document.getElementById("btn-close-modal-cliente").addEventListener("click", () => closeModal(clientOverlay));
document.getElementById("btn-cancel-modal-cliente").addEventListener("click", () => closeModal(clientOverlay));

document.getElementById("btn-novo-plano").addEventListener("click", () => {
    document.getElementById("form-plano").reset();
    document.getElementById("plano-id").value = "";
    document.getElementById("modal-plano-title").textContent = "Criar Novo Plano";
    showModal(planOverlay);
});
document.getElementById("btn-empty-novo-plano").addEventListener("click", () => {
    document.getElementById("form-plano").reset();
    document.getElementById("plano-id").value = "";
    document.getElementById("modal-plano-title").textContent = "Criar Novo Plano";
    showModal(planOverlay);
});
document.getElementById("btn-close-modal-plano").addEventListener("click", () => closeModal(planOverlay));
document.getElementById("btn-cancel-modal-plano").addEventListener("click", () => closeModal(planOverlay));

window.addEventListener("click", (e) => {
    if (e.target === clientOverlay) closeModal(clientOverlay);
    if (e.target === planOverlay) closeModal(planOverlay);
});

// Submit forms and write to DB
document.getElementById("form-cliente").addEventListener("submit", async function(e) {
    e.preventDefault();
    
    const id = document.getElementById("cliente-id").value;
    const nome = document.getElementById("cliente-nome").value.trim();
    const cpf = document.getElementById("cliente-cpf").value;
    const telefone = document.getElementById("cliente-telefone").value;
    const plano_id = document.getElementById("cliente-plano").value;

    showLoading(id ? "Editando cadastro de cliente..." : "Cadastrando novo cliente...");

    const targetId = id || 'client-' + Date.now();
    const clientPayload = { id: targetId, nome, cpf, telefone, plano_id };

    if (isCloudConfigured) {
        try {
            if (id) {
                const { error } = await supabase.from('clientes').update(clientPayload).eq('id', id);
                if (error) throw error;
            } else {
                const { error } = await supabase.from('clientes').insert([clientPayload]);
                if (error) throw error;
            }
        } catch (err) {
            console.error(err);
            alert("Erro ao salvar cliente na nuvem.");
        }
    } else {
        // Localstorage
        if (id) {
            const index = clients.findIndex(c => c.id === id);
            if (index !== -1) clients[index] = clientPayload;
        } else {
            clients.push(clientPayload);
        }
        localStorage.setItem("netmanager_clients", JSON.stringify(clients));
    }

    closeModal(clientOverlay);
    await loadData();
});

document.getElementById("form-plano").addEventListener("submit", async function(e) {
    e.preventDefault();

    const id = document.getElementById("plano-id").value;
    const nome = document.getElementById("form-plano")["plano-nome"].value.trim();
    const velocidade = document.getElementById("form-plano")["plano-velocidade"].value.trim();
    const unidade = document.getElementById("form-plano")["plano-unidade"].value;
    const preco = parseFloat(document.getElementById("form-plano")["plano-preco"].value);
    const tipo = document.getElementById("form-plano")["plano-tipo"].value;
    const descricao = document.getElementById("form-plano")["plano-descricao"].value.trim();

    showLoading(id ? "Atualizando plano..." : "Criando novo plano...");

    const targetId = id || 'plan-' + Date.now();
    const planPayload = { id: targetId, nome, velocidade, unidade, preco, tipo, descricao };

    if (isCloudConfigured) {
        try {
            if (id) {
                const { error } = await supabase.from('planos').update(planPayload).eq('id', id);
                if (error) throw error;
            } else {
                const { error } = await supabase.from('planos').insert([planPayload]);
                if (error) throw error;
            }
        } catch (err) {
            console.error(err);
            alert("Erro ao salvar plano na nuvem.");
        }
    } else {
        // Localstorage
        if (id) {
            const index = plans.findIndex(p => p.id === id);
            if (index !== -1) plans[index] = planPayload;
        } else {
            plans.push(planPayload);
        }
        localStorage.setItem("netmanager_plans", JSON.stringify(plans));
    }

    closeModal(planOverlay);
    await loadData();
});

// Edit & Delete Window Handlers
window.openEditClientModal = function(id) {
    const client = clients.find(c => c.id === id);
    if (!client) return;

    document.getElementById("cliente-id").value = client.id;
    document.getElementById("cliente-nome").value = client.nome;
    document.getElementById("cliente-cpf").value = client.cpf;
    document.getElementById("cliente-telefone").value = client.telefone;
    document.getElementById("cliente-plano").value = client.plano_id;

    document.getElementById("modal-cliente-title").textContent = "Editar Cadastro de Cliente";
    showModal(clientOverlay);
};

window.deleteClient = async function(id) {
    const client = clients.find(c => c.id === id);
    if (!client) return;

    if (confirm(`Tem certeza de que deseja remover o cliente ${client.nome}?`)) {
        showLoading("Removendo cliente...");
        if (isCloudConfigured) {
            try {
                const { error } = await supabase.from('clientes').delete().eq('id', id);
                if (error) throw error;
            } catch (err) {
                console.error(err);
                alert("Erro ao remover cliente da nuvem.");
            }
        } else {
            clients = clients.filter(c => c.id !== id);
            localStorage.setItem("netmanager_clients", JSON.stringify(clients));
        }
        await loadData();
    }
};

window.openEditPlanModal = function(id) {
    const plan = plans.find(p => p.id === id);
    if (!plan) return;

    document.getElementById("plano-id").value = plan.id;
    document.getElementById("plano-nome").value = plan.nome;
    document.getElementById("plano-velocidade").value = plan.velocidade;
    document.getElementById("plano-unidade").value = plan.unidade;
    document.getElementById("plano-preco").value = plan.preco;
    document.getElementById("plano-tipo").value = plan.tipo;
    document.getElementById("plano-descricao").value = plan.descricao;

    document.getElementById("modal-plano-title").textContent = "Editar Plano de Internet";
    showModal(planOverlay);
};

window.deletePlan = async function(id) {
    const plan = plans.find(p => p.id === id);
    if (!plan) return;

    const customerCount = getClientsCountForPlan(id);
    if (customerCount > 0) {
        alert(`Não é possível excluir o plano "${plan.nome}" porque ele possui ${customerCount} cliente(s) ativo(s). Associe esses clientes a outros planos primeiro.`);
        return;
    }

    if (confirm(`Tem certeza de que deseja remover o plano ${plan.nome}?`)) {
        showLoading("Removendo plano...");
        if (isCloudConfigured) {
            try {
                const { error } = await supabase.from('planos').delete().eq('id', id);
                if (error) throw error;
            } catch (err) {
                console.error(err);
                alert("Erro ao remover plano da nuvem.");
            }
        } else {
            plans = plans.filter(p => p.id !== id);
            localStorage.setItem("netmanager_plans", JSON.stringify(plans));
        }
        await loadData();
    }
};

// Search listeners
document.getElementById("search-clientes").addEventListener("input", function(e) {
    renderClients(e.target.value);
});

document.getElementById("search-planos").addEventListener("input", function(e) {
    renderPlans(e.target.value);
});

// Bootstrap init
document.addEventListener("DOMContentLoaded", async () => {
    // Show configuration warning banner if credentials are placeholders
    const warningBanner = document.getElementById("setup-warning");
    if (warningBanner) {
        warningBanner.style.display = isCloudConfigured ? "none" : "block";
    }

    setupMasks();
    setupNavigation();
    
    // Initial fetch from cloud/local storage
    await loadData();
});
