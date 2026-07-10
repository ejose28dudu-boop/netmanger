// State Management
let plans = [];
let clients = [];

// Seed Data
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
        descricao: "Conexão de alta qualidade para áreas rurais e de difícil acesso. Antiga e roteador de última geração inclusos."
    }
];

const initialClients = [
    {
        id: "client-1",
        nome: "João de Sousa",
        cpf: "123.456.789-00",
        email: "joao.sousa@email.com",
        telefone: "(11) 98765-4321",
        planoId: "plan-2"
    },
    {
        id: "client-2",
        nome: "Maria Oliveira",
        cpf: "987.654.321-11",
        email: "maria.oli@email.com",
        telefone: "(21) 99888-7766",
        planoId: "plan-1"
    },
    {
        id: "client-3",
        nome: "Carlos Silva",
        cpf: "456.789.123-22",
        email: "carlos.silva@email.com",
        telefone: "(31) 97777-8888",
        planoId: "plan-2"
    },
    {
        id: "client-4",
        nome: "Ana Costa",
        cpf: "321.654.987-33",
        email: "ana.costa@email.com",
        telefone: "(81) 96666-5555",
        planoId: "plan-3"
    },
    {
        id: "client-5",
        nome: "Roberto Santos",
        cpf: "789.123.456-44",
        email: "roberto.s@email.com",
        telefone: "(85) 95555-4444",
        planoId: "plan-2"
    }
];

// Initialize Data
function initData() {
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

function saveData() {
    localStorage.setItem("netmanager_plans", JSON.stringify(plans));
    localStorage.setItem("netmanager_clients", JSON.stringify(clients));
    updateKPIs();
    updatePlanSelectOptions();
}

// Helpers
function formatCurrency(value) {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
}

function getClientsCountForPlan(planoId) {
    return clients.filter(c => c.planoId === planoId).length;
}

// Input Masks
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

// View Controller
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

            // Change Active Link
            navItems.forEach(i => i.classList.remove("active"));
            this.classList.add("active");

            // Change Active View
            viewSections.forEach(section => {
                section.classList.remove("active");
                if (section.id === `${view}-view`) {
                    section.classList.add("active");
                }
            });

            // Update Header Title
            viewTitle.textContent = headerDetails[view].title;
            viewSubtitle.textContent = headerDetails[view].subtitle;

            // Trigger Views Renderers
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

// KPIs
function updateKPIs() {
    const totalClientes = clients.length;
    const totalPlanos = plans.length;
    
    // Monthly revenue projection: for each client, find their plan's price and sum it up
    let totalRevenue = 0;
    clients.forEach(client => {
        const plan = plans.find(p => p.id === client.planoId);
        if (plan) {
            totalRevenue += parseFloat(plan.preco);
        }
    });

    document.getElementById("kpi-total-clientes").textContent = totalClientes;
    document.getElementById("kpi-total-planos").textContent = totalPlanos;
    document.getElementById("kpi-receita-total").textContent = formatCurrency(totalRevenue);
}

// Render Dashboard
function renderDashboard() {
    updateKPIs();

    const distList = document.getElementById("dashboard-dist-list");
    distList.innerHTML = "";

    const totalClientsCount = clients.length;

    // Sort plans by popularity (most subscribers first)
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
            const percent = totalClientsCount > 0 ? Math.round((count / totalClientsCount) * 100) : 0;
            
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

    // Render Recent Clients (Last 5 registered)
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
            const plan = plans.find(p => p.id === client.planoId);
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
                    <div style="font-size: 0.8rem; color: var(--text-secondary);">${client.email}</div>
                </div>
                <div>
                    <span class="badge badge-purple">${planName}</span>
                </div>
            `;
            recentClientsList.appendChild(clientItem);
        });
    }
}

// Render Clients View
function renderClients(filterText = '') {
    const tbody = document.getElementById("tbody-clientes");
    const emptyState = document.getElementById("empty-state-clientes");
    const tableElement = document.getElementById("table-clientes");
    
    tbody.innerHTML = "";

    const filteredClients = clients.filter(client => {
        const query = filterText.toLowerCase();
        return (
            client.nome.toLowerCase().includes(query) ||
            client.cpf.toLowerCase().includes(query) ||
            client.email.toLowerCase().includes(query)
        );
    });

    if (filteredClients.length === 0) {
        tableElement.style.display = "none";
        emptyState.style.display = "block";
    } else {
        tableElement.style.display = "table";
        emptyState.style.display = "none";

        filteredClients.forEach(client => {
            const plan = plans.find(p => p.id === client.planoId);
            const planName = plan ? `${plan.nome} (${plan.velocidade} ${plan.unidade})` : "Plano Indisponível";

            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td style="font-weight: 500;">${client.nome}</td>
                <td>${client.cpf}</td>
                <td>${client.email}</td>
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

// Render Plans View
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

// Update select options inside Client modal
function updatePlanSelectOptions() {
    const select = document.getElementById("cliente-plano");
    // Keep placeholder option
    select.innerHTML = '<option value="" disabled selected>Selecione um plano...</option>';

    plans.forEach(plan => {
        const option = document.createElement("option");
        option.value = plan.id;
        option.textContent = `${plan.nome} (${plan.velocidade} ${plan.unidade} - ${formatCurrency(plan.preco)})`;
        select.appendChild(option);
    });
}

// Modal Handlers
const clientOverlay = document.getElementById("modal-cliente-overlay");
const planOverlay = document.getElementById("modal-plano-overlay");

function showModal(overlay) {
    overlay.classList.add("active");
}

function closeModal(overlay) {
    overlay.classList.remove("active");
}

// Open modal for Creating Client
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

// Close Client Modal
document.getElementById("btn-close-modal-cliente").addEventListener("click", () => closeModal(clientOverlay));
document.getElementById("btn-cancel-modal-cliente").addEventListener("click", () => closeModal(clientOverlay));

// Open modal for Creating Plan
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

// Close Plan Modal
document.getElementById("btn-close-modal-plano").addEventListener("click", () => closeModal(planOverlay));
document.getElementById("btn-cancel-modal-plano").addEventListener("click", () => closeModal(planOverlay));

// Close modals when clicking outside
window.addEventListener("click", (e) => {
    if (e.target === clientOverlay) closeModal(clientOverlay);
    if (e.target === planOverlay) closeModal(planOverlay);
});

// Submit Forms
document.getElementById("form-cliente").addEventListener("submit", function(e) {
    e.preventDefault();
    
    const id = document.getElementById("cliente-id").value;
    const nome = document.getElementById("cliente-nome").value.trim();
    const cpf = document.getElementById("cliente-cpf").value;
    const email = document.getElementById("cliente-email").value.trim();
    const telefone = document.getElementById("cliente-telefone").value;
    const planoId = document.getElementById("cliente-plano").value;

    if (id) {
        // Edit Mode
        const clientIndex = clients.findIndex(c => c.id === id);
        if (clientIndex !== -1) {
            clients[clientIndex] = { ...clients[clientIndex], nome, cpf, email, telefone, planoId };
        }
    } else {
        // Add Mode
        const newClient = {
            id: 'client-' + Date.now(),
            nome,
            cpf,
            email,
            telefone,
            planoId
        };
        clients.push(newClient);
    }

    saveData();
    closeModal(clientOverlay);
    renderClients();
});

document.getElementById("form-plano").addEventListener("submit", function(e) {
    e.preventDefault();

    const id = document.getElementById("plano-id").value;
    const nome = document.getElementById("form-plano")["plano-nome"].value.trim();
    const velocidade = document.getElementById("form-plano")["plano-velocidade"].value.trim();
    const unidade = document.getElementById("form-plano")["plano-unidade"].value;
    const preco = parseFloat(document.getElementById("form-plano")["plano-preco"].value);
    const tipo = document.getElementById("form-plano")["plano-tipo"].value;
    const descricao = document.getElementById("form-plano")["plano-descricao"].value.trim();

    if (id) {
        // Edit Mode
        const planIndex = plans.findIndex(p => p.id === id);
        if (planIndex !== -1) {
            plans[planIndex] = { ...plans[planIndex], nome, velocidade, unidade, preco, tipo, descricao };
        }
    } else {
        // Add Mode
        const newPlan = {
            id: 'plan-' + Date.now(),
            nome,
            velocidade,
            unidade,
            preco,
            tipo,
            descricao
        };
        plans.push(newPlan);
    }

    saveData();
    closeModal(planOverlay);
    renderPlans();
});

// Edit & Delete Operations exposed globally for inline HTML clicks
window.openEditClientModal = function(id) {
    const client = clients.find(c => c.id === id);
    if (!client) return;

    document.getElementById("cliente-id").value = client.id;
    document.getElementById("cliente-nome").value = client.nome;
    document.getElementById("cliente-cpf").value = client.cpf;
    document.getElementById("cliente-email").value = client.email;
    document.getElementById("cliente-telefone").value = client.telefone;
    document.getElementById("cliente-plano").value = client.planoId;

    document.getElementById("modal-cliente-title").textContent = "Editar Cadastro de Cliente";
    showModal(clientOverlay);
};

window.deleteClient = function(id) {
    const client = clients.find(c => c.id === id);
    if (!client) return;

    if (confirm(`Tem certeza de que deseja remover o cliente ${client.nome}?`)) {
        clients = clients.filter(c => c.id !== id);
        saveData();
        renderClients();
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

window.deletePlan = function(id) {
    const plan = plans.find(p => p.id === id);
    if (!plan) return;

    // Security Check: is this plan currently in use by any customer?
    const customerCount = getClientsCountForPlan(id);
    if (customerCount > 0) {
        alert(`Não é possível excluir o plano "${plan.nome}" porque ele possui ${customerCount} cliente(s) ativo(s). Associe esses clientes a outros planos primeiro.`);
        return;
    }

    if (confirm(`Tem certeza de que deseja remover o plano ${plan.nome}?`)) {
        plans = plans.filter(p => p.id !== id);
        saveData();
        renderPlans();
    }
};

// Search filtering
document.getElementById("search-clientes").addEventListener("input", function(e) {
    renderClients(e.target.value);
});

document.getElementById("search-planos").addEventListener("input", function(e) {
    renderPlans(e.target.value);
});

// Main Init on load
document.addEventListener("DOMContentLoaded", () => {
    initData();
    setupMasks();
    setupNavigation();
    updatePlanSelectOptions();
    
    // Initial Render
    renderDashboard();
});
