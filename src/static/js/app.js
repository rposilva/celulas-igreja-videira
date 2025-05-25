// Variáveis globais
let usuarioAtual = null;
let diasSemana = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'];
let tiposCelula = ['Jovens', 'Casais', 'Mulheres', 'Homens', 'Mista', 'Adolescentes', 'Crianças', 'Louvor', 'Oração'];

// Inicialização da aplicação
document.addEventListener('DOMContentLoaded', () => {
    // Verificar status de autenticação
    verificarAutenticacao();
    
    // Configurar rotas
    configurarRotas();
});

// Verificar status de autenticação do usuário
async function verificarAutenticacao() {
    try {
        const response = await fetch('/api/usuarios/status');
        const data = await response.json();
        
        if (data.autenticado) {
            usuarioAtual = data.usuario;
            document.getElementById('loginBtn').style.display = 'none';
            document.getElementById('logoutBtn').style.display = 'block';
            
            // Mostrar menu de administração apenas para admins
            if (usuarioAtual.admin) {
                document.getElementById('adminMenu').style.display = 'block';
            }
        } else {
            document.getElementById('loginBtn').style.display = 'block';
            document.getElementById('logoutBtn').style.display = 'none';
            document.getElementById('adminMenu').style.display = 'none';
        }
    } catch (error) {
        console.error('Erro ao verificar autenticação:', error);
    }
}

// Configurar rotas da aplicação
function configurarRotas() {
    const app = document.getElementById('app');
    const path = window.location.pathname;
    
    // Limpar conteúdo anterior
    app.innerHTML = '';
    
    // Roteamento baseado no caminho
    switch (path) {
        case '/':
            carregarPaginaInicial();
            break;
        case '/buscar':
            carregarPaginaBusca();
            break;
        case '/login':
            carregarPaginaLogin();
            break;
        case '/registro':
            carregarPaginaRegistro();
            break;
        case '/admin':
            verificarAdmin(() => carregarPaginaAdmin());
            break;
        case '/admin/nova-celula':
            verificarAdmin(() => carregarFormularioCelula());
            break;
        default:
            // Verificar se é uma página de detalhes de célula
            if (path.startsWith('/celula/')) {
                const celulaId = path.split('/').pop();
                carregarDetalhesCelula(celulaId);
            } else {
                carregarPaginaNaoEncontrada();
            }
    }
}

// Verificar se o usuário é administrador
function verificarAdmin(callback) {
    if (usuarioAtual && usuarioAtual.admin) {
        callback();
    } else {
        window.location.href = '/login';
    }
}

// Carregar página inicial
function carregarPaginaInicial() {
    const app = document.getElementById('app');
    
    app.innerHTML = `
        <div class="hero-section">
            <div class="container">
                <h1>Encontre sua Célula</h1>
                <p>Conecte-se com uma célula da Igreja Videira próxima de você e cresça na fé em comunidade.</p>
                <a href="/buscar" class="btn btn-primary btn-lg">Buscar Células</a>
            </div>
        </div>
        
        <div class="container">
            <div class="row mb-5">
                <div class="col-md-4">
                    <div class="card h-100">
                        <div class="card-body text-center">
                            <i class="fas fa-search fa-3x mb-3 text-primary"></i>
                            <h3>Encontre</h3>
                            <p>Busque células por bairro, dia da semana ou tipo que melhor se adeque à sua rotina.</p>
                        </div>
                    </div>
                </div>
                <div class="col-md-4">
                    <div class="card h-100">
                        <div class="card-body text-center">
                            <i class="fas fa-users fa-3x mb-3 text-primary"></i>
                            <h3>Conecte-se</h3>
                            <p>Entre em contato com o líder da célula e participe dos encontros semanais.</p>
                        </div>
                    </div>
                </div>
                <div class="col-md-4">
                    <div class="card h-100">
                        <div class="card-body text-center">
                            <i class="fas fa-heart fa-3x mb-3 text-primary"></i>
                            <h3>Cresça</h3>
                            <p>Desenvolva relacionamentos, aprenda mais sobre a Palavra e cresça na sua fé.</p>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="text-center">
                <h2 class="mb-4">O que são células?</h2>
                <p class="lead mb-4">As células são pequenos grupos que se reúnem semanalmente em casas para compartilhar a vida, estudar a Bíblia, orar uns pelos outros e alcançar pessoas para Cristo.</p>
                <a href="/buscar" class="btn btn-outline-primary">Encontre uma célula agora</a>
            </div>
        </div>
    `;
}

// Carregar página de busca
function carregarPaginaBusca() {
    const app = document.getElementById('app');
    
    app.innerHTML = `
        <div class="container py-5">
            <h1 class="mb-4">Buscar Células</h1>
            
            <div class="search-form">
                <form id="formBusca">
                    <div class="row">
                        <div class="col-md-6 mb-3">
                            <label for="bairro">Bairro/Região</label>
                            <input type="text" class="form-control" id="bairro" placeholder="Digite o bairro ou região">
                        </div>
                        <div class="col-md-6 mb-3">
                            <label for="dia">Dia da Semana</label>
                            <select class="form-select" id="dia">
                                <option value="">Todos os dias</option>
                                ${diasSemana.map(dia => `<option value="${dia}">${dia}</option>`).join('')}
                            </select>
                        </div>
                    </div>
                    <div class="row">
                        <div class="col-md-6 mb-3">
                            <label for="tipo">Tipo de Célula</label>
                            <select class="form-select" id="tipo">
                                <option value="">Todos os tipos</option>
                                ${tiposCelula.map(tipo => `<option value="${tipo}">${tipo}</option>`).join('')}
                            </select>
                        </div>
                        <div class="col-md-6 mb-3">
                            <label for="responsavel">Nome do Responsável</label>
                            <input type="text" class="form-control" id="responsavel" placeholder="Digite o nome do responsável">
                        </div>
                    </div>
                    <div class="text-center mt-3">
                        <button type="submit" class="btn btn-primary">Buscar</button>
                    </div>
                </form>
            </div>
            
            <div id="resultados" class="search-results">
                <div class="text-center py-5">
                    <i class="fas fa-search fa-3x mb-3 text-secondary"></i>
                    <p class="lead">Use os filtros acima para buscar células</p>
                </div>
            </div>
        </div>
    `;
    
    // Adicionar evento de submit ao formulário
    document.getElementById('formBusca').addEventListener('submit', async (e) => {
        e.preventDefault();
        await buscarCelulas();
    });
}

// Função para buscar células com os filtros aplicados
async function buscarCelulas() {
    const bairro = document.getElementById('bairro').value;
    const dia = document.getElementById('dia').value;
    const tipo = document.getElementById('tipo').value;
    const responsavel = document.getElementById('responsavel').value;
    
    // Construir URL com parâmetros de busca
    let url = '/api/celulas/buscar?';
    if (bairro) url += `bairro=${encodeURIComponent(bairro)}&`;
    if (dia) url += `dia=${encodeURIComponent(dia)}&`;
    if (tipo) url += `tipo=${encodeURIComponent(tipo)}&`;
    if (responsavel) url += `responsavel=${encodeURIComponent(responsavel)}&`;
    
    try {
        const response = await fetch(url);
        const celulas = await response.json();
        
        exibirResultadosBusca(celulas);
    } catch (error) {
        console.error('Erro ao buscar células:', error);
        document.getElementById('resultados').innerHTML = `
            <div class="alert alert-danger">
                Ocorreu um erro ao buscar células. Por favor, tente novamente.
            </div>
        `;
    }
}

// Exibir resultados da busca
function exibirResultadosBusca(celulas) {
    const resultadosDiv = document.getElementById('resultados');
    
    if (celulas.length === 0) {
        resultadosDiv.innerHTML = `
            <div class="text-center py-5">
                <i class="fas fa-exclamation-circle fa-3x mb-3 text-warning"></i>
                <p class="lead">Nenhuma célula encontrada com os filtros selecionados.</p>
            </div>
        `;
        return;
    }
    
    let html = `
        <h2 class="mb-4">Resultados da Busca</h2>
        <p>${celulas.length} célula(s) encontrada(s)</p>
        <div class="row">
    `;
    
    celulas.forEach(celula => {
        html += `
            <div class="col-md-6 mb-4">
                <div class="card celula-card h-100">
                    <div class="card-header d-flex justify-content-between align-items-center">
                        <h5 class="mb-0">${celula.nome}</h5>
                        <span class="badge bg-primary">${celula.tipo || 'Geral'}</span>
                    </div>
                    <div class="card-body">
                        <div class="celula-info">
                            <i class="fas fa-user"></i> ${celula.responsavel}
                        </div>
                        <div class="celula-info">
                            <i class="fas fa-phone"></i> ${celula.telefone}
                        </div>
                        <div class="celula-info">
                            <i class="fas fa-map-marker-alt"></i> ${celula.bairro}, ${celula.cidade}
                        </div>
                        <div class="celula-info">
                            <i class="fas fa-calendar"></i> ${celula.dias_funcionamento}
                        </div>
                        <div class="celula-info">
                            <i class="fas fa-clock"></i> ${celula.horario}
                        </div>
                        <div class="mt-3">
                            <a href="/celula/${celula.id}" class="btn btn-outline-primary btn-sm">Ver Detalhes</a>
                        </div>
                    </div>
                </div>
            </div>
        `;
    });
    
    html += `</div>`;
    resultadosDiv.innerHTML = html;
}

// Carregar página de detalhes da célula
async function carregarDetalhesCelula(id) {
    const app = document.getElementById('app');
    
    try {
        const response = await fetch(`/api/celulas/${id}`);
        
        if (!response.ok) {
            throw new Error('Célula não encontrada');
        }
        
        const celula = await response.json();
        
        app.innerHTML = `
            <div class="container py-5">
                <nav aria-label="breadcrumb">
                    <ol class="breadcrumb">
                        <li class="breadcrumb-item"><a href="/">Início</a></li>
                        <li class="breadcrumb-item"><a href="/buscar">Buscar</a></li>
                        <li class="breadcrumb-item active" aria-current="page">${celula.nome}</li>
                    </ol>
                </nav>
                
                <div class="card mb-4">
                    <div class="card-header bg-primary text-white">
                        <h2 class="mb-0">${celula.nome}</h2>
                    </div>
                    <div class="card-body">
                        <div class="row">
                            <div class="col-md-6">
                                <h4>Informações da Célula</h4>
                                <ul class="list-group list-group-flush mb-4">
                                    <li class="list-group-item">
                                        <i class="fas fa-user me-2 text-primary"></i> <strong>Responsável:</strong> ${celula.responsavel}
                                    </li>
                                    <li class="list-group-item">
                                        <i class="fas fa-phone me-2 text-primary"></i> <strong>Telefone:</strong> ${celula.telefone}
                                    </li>
                                    <li class="list-group-item">
                                        <i class="fas fa-tag me-2 text-primary"></i> <strong>Tipo:</strong> ${celula.tipo || 'Geral'}
                                    </li>
                                    <li class="list-group-item">
                                        <i class="fas fa-calendar me-2 text-primary"></i> <strong>Dias:</strong> ${celula.dias_funcionamento}
                                    </li>
                                    <li class="list-group-item">
                                        <i class="fas fa-clock me-2 text-primary"></i> <strong>Horário:</strong> ${celula.horario}
                                    </li>
                                </ul>
                            </div>
                            <div class="col-md-6">
                                <h4>Localização</h4>
                                <ul class="list-group list-group-flush mb-4">
                                    <li class="list-group-item">
                                        <i class="fas fa-map-marker-alt me-2 text-primary"></i> <strong>Endereço:</strong> ${celula.endereco}
                                    </li>
                                    <li class="list-group-item">
                                        <i class="fas fa-map me-2 text-primary"></i> <strong>Bairro:</strong> ${celula.bairro}
                                    </li>
                                    <li class="list-group-item">
                                        <i class="fas fa-city me-2 text-primary"></i> <strong>Cidade:</strong> ${celula.cidade}
                                    </li>
                                </ul>
                                
                                ${celula.observacoes ? `
                                <h4>Observações</h4>
                                <div class="card">
                                    <div class="card-body">
                                        ${celula.observacoes}
                                    </div>
                                </div>
                                ` : ''}
                            </div>
                        </div>
                        
                        <div class="text-center mt-4">
                            <a href="https://wa.me/${celula.telefone.replace(/\D/g, '')}" target="_blank" class="btn btn-success">
                                <i class="fab fa-whatsapp me-2"></i> Contatar via WhatsApp
                            </a>
                        </div>
                    </div>
                </div>
                
                <div class="text-center">
                    <a href="/buscar" class="btn btn-outline-primary">Voltar para Busca</a>
                </div>
            </div>
        `;
    } catch (error) {
        console.error('Erro ao carregar detalhes da célula:', error);
        carregarPaginaNaoEncontrada();
    }
}

// Carregar página de login
function carregarPaginaLogin() {
    const app = document.getElementById('app');
    
    app.innerHTML = `
        <div class="container py-5">
            <div class="form-container">
                <h2 class="form-title text-center">Login</h2>
                
                <div id="loginAlert" class="alert alert-danger" style="display: none;"></div>
                
                <form id="formLogin">
                    <div class="mb-3">
                        <label for="email" class="form-label">E-mail</label>
                        <input type="email" class="form-control" id="email" required>
                    </div>
                    <div class="mb-3">
                        <label for="senha" class="form-label">Senha</label>
                        <input type="password" class="form-control" id="senha" required>
                    </div>
                    <div class="d-grid gap-2">
                        <button type="submit" class="btn btn-primary">Entrar</button>
                    </div>
                </form>
                
                <div class="text-center mt-4">
                    <p>Não tem uma conta? <a href="/registro">Registre-se</a></p>
                </div>
            </div>
        </div>
    `;
    
    // Adicionar evento de submit ao formulário
    document.getElementById('formLogin').addEventListener('submit', async (e) => {
        e.preventDefault();
        await realizarLogin();
    });
}

// Função para realizar login
async function realizarLogin() {
    const email = document.getElementById('email').value;
    const senha = document.getElementById('senha').value;
    const alertDiv = document.getElementById('loginAlert');
    
    try {
        const response = await fetch('/api/usuarios/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, senha })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            // Login bem-sucedido
            usuarioAtual = data.usuario;
            window.location.href = usuarioAtual.admin ? '/admin' : '/';
        } else {
            // Exibir mensagem de erro
            alertDiv.textContent = data.erro || 'Erro ao fazer login. Verifique suas credenciais.';
            alertDiv.style.display = 'block';
        }
    } catch (error) {
        console.error('Erro ao fazer login:', error);
        alertDiv.textContent = 'Erro ao conectar com o servidor. Tente novamente mais tarde.';
        alertDiv.style.display = 'block';
    }
}

// Carregar página de registro
function carregarPaginaRegistro() {
    const app = document.getElementById('app');
    
    app.innerHTML = `
        <div class="container py-5">
            <div class="form-container">
                <h2 class="form-title text-center">Registro</h2>
                
                <div id="registroAlert" class="alert" style="display: none;"></div>
                
                <form id="formRegistro">
                    <div class="mb-3">
                        <label for="nome" class="form-label">Nome Completo</label>
                        <input type="text" class="form-control" id="nome" required>
                    </div>
                    <div class="mb-3">
                        <label for="email" class="form-label">E-mail</label>
                        <input type="email" class="form-control" id="email" required>
                    </div>
                    <div class="mb-3">
                        <label for="senha" class="form-label">Senha</label>
                        <input type="password" class="form-control" id="senha" required>
                    </div>
                    <div class="mb-3">
                        <label for="confirmarSenha" class="form-label">Confirmar Senha</label>
                        <input type="password" class="form-control" id="confirmarSenha" required>
                    </div>
                    <div class="d-grid gap-2">
                        <button type="submit" class="btn btn-primary">Registrar</button>
                    </div>
                </form>
                
                <div class="text-center mt-4">
                    <p>Já tem uma conta? <a href="/login">Faça login</a></p>
                </div>
            </div>
        </div>
    `;
    
    // Adicionar evento de submit ao formulário
    document.getElementById('formRegistro').addEventListener('submit', async (e) => {
        e.preventDefault();
        await realizarRegistro();
    });
}

// Função para realizar registro
async function realizarRegistro() {
    const nome = document.getElementById('nome').value;
    const email = document.getElementById('email').value;
    const senha = document.getElementById('senha').value;
    const confirmarSenha = document.getElementById('confirmarSenha').value;
    const alertDiv = document.getElementById('registroAlert');
    
    // Verificar se as senhas coincidem
    if (senha !== confirmarSenha) {
        alertDiv.className = 'alert alert-danger';
        alertDiv.textContent = 'As senhas não coincidem.';
        alertDiv.style.display = 'block';
        return;
    }
    
    try {
        const response = await fetch('/api/usuarios/registro', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ nome, email, senha })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            // Registro bem-sucedido
            alertDiv.className = 'alert alert-success';
            alertDiv.textContent = 'Registro realizado com sucesso! Redirecionando para o login...';
            alertDiv.style.display = 'block';
            
            // Redirecionar para a página de login após 2 segundos
            setTimeout(() => {
                window.location.href = '/login';
            }, 2000);
        } else {
            // Exibir mensagem de erro
            alertDiv.className = 'alert alert-danger';
            alertDiv.textContent = data.erro || 'Erro ao registrar. Verifique os dados e tente novamente.';
            alertDiv.style.display = 'block';
        }
    } catch (error) {
        console.error('Erro ao registrar:', error);
        alertDiv.className = 'alert alert-danger';
        alertDiv.textContent = 'Erro ao conectar com o servidor. Tente novamente mais tarde.';
        alertDiv.style.display = 'block';
    }
}

// Carregar página de administração
async function carregarPaginaAdmin() {
    const app = document.getElementById('app');
    
    app.innerHTML = `
        <div class="container py-5">
            <h1 class="mb-4">Painel de Administração</h1>
            
            <div class="row mb-4">
                <div class="col-md-6">
                    <div class="card">
                        <div class="card-body">
                            <h5 class="card-title">Gerenciar Células</h5>
                            <p class="card-text">Adicione, edite ou remova células do sistema.</p>
                            <a href="/admin/nova-celula" class="btn btn-primary">Nova Célula</a>
                        </div>
                    </div>
                </div>
            </div>
            
            <h2 class="mb-3">Células Cadastradas</h2>
            <div id="listaCelulas" class="table-responsive">
                <p class="text-center py-3">Carregando células...</p>
            </div>
        </div>
    `;
    
    // Carregar lista de células
    await carregarListaCelulas();
}

// Carregar lista de células para administração
async function carregarListaCelulas() {
    const listaCelulasDiv = document.getElementById('listaCelulas');
    
    try {
        const response = await fetch('/api/celulas/');
        const celulas = await response.json();
        
        if (celulas.length === 0) {
            listaCelulasDiv.innerHTML = `
                <div class="alert alert-info">
                    Nenhuma célula cadastrada. Clique em "Nova Célula" para adicionar.
                </div>
            `;
            return;
        }
        
        let html = `
            <table class="table table-striped table-hover">
                <thead>
                    <tr>
                        <th>Nome</th>
                        <th>Responsável</th>
                        <th>Bairro</th>
                        <th>Dias</th>
                        <th>Tipo</th>
                        <th>Ações</th>
                    </tr>
                </thead>
                <tbody>
        `;
        
        celulas.forEach(celula => {
            html += `
                <tr>
                    <td>${celula.nome}</td>
                    <td>${celula.responsavel}</td>
                    <td>${celula.bairro}</td>
                    <td>${celula.dias_funcionamento}</td>
                    <td>${celula.tipo || 'Geral'}</td>
                    <td>
                        <button class="btn btn-sm btn-outline-primary me-1" onclick="editarCelula(${celula.id})">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-danger" onclick="excluirCelula(${celula.id})">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                </tr>
            `;
        });
        
        html += `
                </tbody>
            </table>
        `;
        
        listaCelulasDiv.innerHTML = html;
    } catch (error) {
        console.error('Erro ao carregar lista de células:', error);
        listaCelulasDiv.innerHTML = `
            <div class="alert alert-danger">
                Ocorreu um erro ao carregar as células. Por favor, tente novamente.
            </div>
        `;
    }
}

// Carregar formulário de cadastro/edição de célula
function carregarFormularioCelula(celulaId = null) {
    const app = document.getElementById('app');
    const titulo = celulaId ? 'Editar Célula' : 'Nova Célula';
    
    app.innerHTML = `
        <div class="container py-5">
            <nav aria-label="breadcrumb">
                <ol class="breadcrumb">
                    <li class="breadcrumb-item"><a href="/admin">Administração</a></li>
                    <li class="breadcrumb-item active" aria-current="page">${titulo}</li>
                </ol>
            </nav>
            
            <div class="form-container">
                <h2 class="form-title">${titulo}</h2>
                
                <div id="celulaAlert" class="alert" style="display: none;"></div>
                
                <form id="formCelula">
                    <div class="row">
                        <div class="col-md-6 mb-3">
                            <label for="nome" class="form-label">Nome da Célula</label>
                            <input type="text" class="form-control" id="nome" required>
                        </div>
                        <div class="col-md-6 mb-3">
                            <label for="tipo" class="form-label">Tipo de Célula</label>
                            <select class="form-select" id="tipo">
                                <option value="">Selecione um tipo</option>
                                ${tiposCelula.map(tipo => `<option value="${tipo}">${tipo}</option>`).join('')}
                            </select>
                        </div>
                    </div>
                    
                    <div class="row">
                        <div class="col-md-6 mb-3">
                            <label for="responsavel" class="form-label">Nome do Responsável</label>
                            <input type="text" class="form-control" id="responsavel" required>
                        </div>
                        <div class="col-md-6 mb-3">
                            <label for="telefone" class="form-label">Telefone do Responsável</label>
                            <input type="text" class="form-control" id="telefone" required>
                        </div>
                    </div>
                    
                    <div class="row">
                        <div class="col-md-6 mb-3">
                            <label class="form-label">Dias de Funcionamento</label>
                            <div class="d-flex flex-wrap">
                                ${diasSemana.map(dia => `
                                    <div class="form-check me-3 mb-2">
                                        <input class="form-check-input dia-checkbox" type="checkbox" value="${dia}" id="dia${dia}">
                                        <label class="form-check-label" for="dia${dia}">${dia}</label>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                        <div class="col-md-6 mb-3">
                            <label for="horario" class="form-label">Horário de Funcionamento</label>
                            <input type="text" class="form-control" id="horario" placeholder="Ex: 19:30" required>
                        </div>
                    </div>
                    
                    <div class="mb-3">
                        <label for="endereco" class="form-label">Endereço</label>
                        <input type="text" class="form-control" id="endereco" required>
                    </div>
                    
                    <div class="row">
                        <div class="col-md-6 mb-3">
                            <label for="bairro" class="form-label">Bairro</label>
                            <input type="text" class="form-control" id="bairro" required>
                        </div>
                        <div class="col-md-6 mb-3">
                            <label for="cidade" class="form-label">Cidade</label>
                            <input type="text" class="form-control" id="cidade" required>
                        </div>
                    </div>
                    
                    <div class="mb-3">
                        <label for="observacoes" class="form-label">Observações (opcional)</label>
                        <textarea class="form-control" id="observacoes" rows="3"></textarea>
                    </div>
                    
                    <div class="d-flex justify-content-between">
                        <a href="/admin" class="btn btn-outline-secondary">Cancelar</a>
                        <button type="submit" class="btn btn-primary">Salvar</button>
                    </div>
                </form>
            </div>
        </div>
    `;
    
    // Se for edição, carregar dados da célula
    if (celulaId) {
        carregarDadosCelula(celulaId);
    }
    
    // Adicionar evento de submit ao formulário
    document.getElementById('formCelula').addEventListener('submit', async (e) => {
        e.preventDefault();
        await salvarCelula(celulaId);
    });
}

// Carregar dados da célula para edição
async function carregarDadosCelula(celulaId) {
    try {
        const response = await fetch(`/api/celulas/${celulaId}`);
        const celula = await response.json();
        
        // Preencher campos do formulário
        document.getElementById('nome').value = celula.nome;
        document.getElementById('tipo').value = celula.tipo || '';
        document.getElementById('responsavel').value = celula.responsavel;
        document.getElementById('telefone').value = celula.telefone;
        document.getElementById('horario').value = celula.horario;
        document.getElementById('endereco').value = celula.endereco;
        document.getElementById('bairro').value = celula.bairro;
        document.getElementById('cidade').value = celula.cidade;
        document.getElementById('observacoes').value = celula.observacoes || '';
        
        // Marcar dias de funcionamento
        const diasFuncionamento = celula.dias_funcionamento.split(',').map(dia => dia.trim());
        diasFuncionamento.forEach(dia => {
            const checkbox = document.getElementById(`dia${dia}`);
            if (checkbox) checkbox.checked = true;
        });
    } catch (error) {
        console.error('Erro ao carregar dados da célula:', error);
        const alertDiv = document.getElementById('celulaAlert');
        alertDiv.className = 'alert alert-danger';
        alertDiv.textContent = 'Erro ao carregar dados da célula. Tente novamente.';
        alertDiv.style.display = 'block';
    }
}

// Salvar célula (criar nova ou atualizar existente)
async function salvarCelula(celulaId) {
    // Obter valores do formulário
    const nome = document.getElementById('nome').value;
    const tipo = document.getElementById('tipo').value;
    const responsavel = document.getElementById('responsavel').value;
    const telefone = document.getElementById('telefone').value;
    const horario = document.getElementById('horario').value;
    const endereco = document.getElementById('endereco').value;
    const bairro = document.getElementById('bairro').value;
    const cidade = document.getElementById('cidade').value;
    const observacoes = document.getElementById('observacoes').value;
    
    // Obter dias selecionados
    const diasSelecionados = [];
    document.querySelectorAll('.dia-checkbox:checked').forEach(checkbox => {
        diasSelecionados.push(checkbox.value);
    });
    
    if (diasSelecionados.length === 0) {
        const alertDiv = document.getElementById('celulaAlert');
        alertDiv.className = 'alert alert-danger';
        alertDiv.textContent = 'Selecione pelo menos um dia de funcionamento.';
        alertDiv.style.display = 'block';
        return;
    }
    
    const dias_funcionamento = diasSelecionados.join(', ');
    
    // Dados da célula
    const dadosCelula = {
        nome,
        tipo,
        responsavel,
        telefone,
        dias_funcionamento,
        horario,
        endereco,
        bairro,
        cidade,
        observacoes
    };
    
    try {
        let url = '/api/celulas/';
        let method = 'POST';
        
        if (celulaId) {
            url += celulaId;
            method = 'PUT';
        }
        
        const response = await fetch(url, {
            method,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(dadosCelula)
        });
        
        const data = await response.json();
        
        if (response.ok) {
            // Redirecionar para a página de administração
            window.location.href = '/admin';
        } else {
            // Exibir mensagem de erro
            const alertDiv = document.getElementById('celulaAlert');
            alertDiv.className = 'alert alert-danger';
            alertDiv.textContent = data.erro || 'Erro ao salvar célula. Verifique os dados e tente novamente.';
            alertDiv.style.display = 'block';
        }
    } catch (error) {
        console.error('Erro ao salvar célula:', error);
        const alertDiv = document.getElementById('celulaAlert');
        alertDiv.className = 'alert alert-danger';
        alertDiv.textContent = 'Erro ao conectar com o servidor. Tente novamente mais tarde.';
        alertDiv.style.display = 'block';
    }
}

// Função para excluir célula
async function excluirCelula(celulaId) {
    if (!confirm('Tem certeza que deseja excluir esta célula?')) {
        return;
    }
    
    try {
        const response = await fetch(`/api/celulas/${celulaId}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            // Recarregar lista de células
            await carregarListaCelulas();
        } else {
            alert('Erro ao excluir célula. Tente novamente.');
        }
    } catch (error) {
        console.error('Erro ao excluir célula:', error);
        alert('Erro ao conectar com o servidor. Tente novamente mais tarde.');
    }
}

// Função para editar célula
function editarCelula(celulaId) {
    window.location.href = `/admin/editar-celula/${celulaId}`;
    // A função carregarFormularioCelula será chamada pelo roteamento
}

// Função para realizar logout
async function logout() {
    try {
        await fetch('/api/usuarios/logout', {
            method: 'POST'
        });
        
        // Limpar dados do usuário e redirecionar para a página inicial
        usuarioAtual = null;
        window.location.href = '/';
    } catch (error) {
        console.error('Erro ao fazer logout:', error);
    }
}

// Carregar página não encontrada
function carregarPaginaNaoEncontrada() {
    const app = document.getElementById('app');
    
    app.innerHTML = `
        <div class="container py-5 text-center">
            <i class="fas fa-exclamation-triangle fa-5x text-warning mb-4"></i>
            <h1>Página não encontrada</h1>
            <p class="lead">A página que você está procurando não existe ou foi removida.</p>
            <a href="/" class="btn btn-primary mt-3">Voltar para a página inicial</a>
        </div>
    `;
}

// Adicionar evento para navegação interna
window.addEventListener('popstate', () => {
    configurarRotas();
});

// Interceptar cliques em links internos
document.addEventListener('click', (e) => {
    if (e.target.tagName === 'A' && e.target.href.startsWith(window.location.origin) && !e.target.hasAttribute('download')) {
        e.preventDefault();
        const url = new URL(e.target.href);
        window.history.pushState({}, '', url.pathname);
        configurarRotas();
    }
});
