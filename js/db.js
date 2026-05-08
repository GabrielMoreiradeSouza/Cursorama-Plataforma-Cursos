// db.js - Camada de Dados e Modelos

class Usuario {
    constructor(id, nomeCompleto, email, senhaHash, isAdmin = false) {
        this.id = id;
        this.nomeCompleto = nomeCompleto;
        this.email = email;
        this.senhaHash = senhaHash;
        this.isAdmin = isAdmin;
        this.dataCadastro = new Date().toISOString();
    }
}

class Categoria {
    constructor(id, nome, descricao) {
        this.id = id;
        this.nome = nome;
        this.descricao = descricao;
    }
}

class Curso {
    constructor(id, titulo, descricao, idInstrutor, idCategoria, nivel, totalAulas, totalHoras) {
        this.id = id;
        this.titulo = titulo;
        this.descricao = descricao;
        this.idInstrutor = idInstrutor;
        this.idCategoria = idCategoria;
        this.nivel = nivel;
        this.dataPublicacao = new Date().toISOString();
        this.totalAulas = totalAulas;
        this.totalHoras = totalHoras;
    }
}

class Modulo {
    constructor(id, cursoId, titulo, ordem) {
        this.id = id;
        this.cursoId = cursoId;
        this.titulo = titulo;
        this.ordem = ordem;
    }
}

class Aula {
    constructor(id, moduloId, titulo, tipo, url, duracao, ordem) {
        this.id = id;
        this.moduloId = moduloId;
        this.titulo = titulo;
        this.tipo = tipo;
        this.url = url;
        this.duracao = duracao;
        this.ordem = ordem;
    }
}

class Matricula {
    constructor(id, idUsuario, idCurso) {
        this.id = id;
        this.idUsuario = idUsuario;
        this.idCurso = idCurso;
        this.dataMatricula = new Date().toISOString();
        this.dataConclusao = null;
    }
}

class ProgressoAula {
    constructor(idUsuario, idAula, status) {
        this.idUsuario = idUsuario;
        this.idAula = idAula;
        this.dataConclusao = status === 'Concluído' ? new Date().toISOString() : null;
        this.status = status;
    }
}

class Avaliacao {
    constructor(id, idUsuario, idCurso, nota, comentario) {
        this.id = id;
        this.idUsuario = idUsuario;
        this.idCurso = idCurso;
        this.nota = nota;
        this.comentario = comentario;
        this.dataAvaliacao = new Date().toISOString();
    }
}

class Trilha {
    constructor(id, titulo, descricao, idCategoria) {
        this.id = id;
        this.titulo = titulo;
        this.descricao = descricao;
        this.idCategoria = idCategoria;
    }
}

class TrilhaCurso {
    constructor(idTrilha, idCurso, ordem) {
        this.idTrilha = idTrilha;
        this.idCurso = idCurso;
        this.ordem = ordem;
    }
}

class Certificado {
    constructor(id, idUsuario, idCurso, idTrilha) {
        this.id = id;
        this.idUsuario = idUsuario;
        this.idCurso = idCurso;
        this.idTrilha = idTrilha;
        this.codigoVerificacao = this.gerarCodigo();
        this.dataEmissao = new Date().toLocaleDateString("pt-BR");
    }

    gerarCodigo() {
        const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        const bloco = n => Array.from({length: n}, () => chars[Math.floor(Math.random() * chars.length)]).join('');
        return "CERT-" + bloco(4) + "-" + bloco(4) + "-" + bloco(4);
    }
}

class Plano {
    constructor(id, nome, descricao, preco, duracaoMeses) {
        this.id = id;
        this.nome = nome;
        this.descricao = descricao;
        this.preco = preco;
        this.duracaoMeses = duracaoMeses;
    }
}

class Assinatura {
    constructor(id, idUsuario, idPlano, dataInicio, dataFim) {
        this.id = id;
        this.idUsuario = idUsuario;
        this.idPlano = idPlano;
        this.dataInicio = dataInicio;
        this.dataFim = dataFim;
    }
}

class Pagamento {
    constructor(id, idAssinatura, valorPago, metodoPagamento, idTransacaoGateway) {
        this.id = id;
        this.idAssinatura = idAssinatura;
        this.valorPago = valorPago;
        this.dataPagamento = new Date().toISOString();
        this.metodoPagamento = metodoPagamento;
        this.idTransacaoGateway = idTransacaoGateway;
    }
}

const DB = {
    adminPadrao: {
        nomeCompleto: "Administrador Geral",
        email: "admin@email.com",
        senha: "123456"
    },
    dados: {
        usuarios: [
            // Injetar Admin Padrão
            new Usuario(1, "Administrador Geral", "admin@email.com", btoa("123456"), true)
        ],
        categorias: [
            new Categoria(1, "Desenvolvimento Web", "Cursos sobre web dev"),
            new Categoria(2, "Ciência de Dados", "Análise de dados e IA"),
            new Categoria(3, "DevOps", "Infraestrutura e CI/CD"),
            new Categoria(4, "Mobile", "Apps Android e iOS")
        ],
        cursos: [],
        modulos: [],
        aulas: [],
        matriculas: [],
        progressoAulas: [],
        avaliacoes: [],
        trilhas: [],
        trilhasCursos: [],
        certificados: [],
        planos: [
            new Plano(1, "Básico", "Acesso a 1 curso por mês", 29.90, 1),
            new Plano(2, "Pro", "Acesso ilimitado", 79.90, 1),
            new Plano(3, "Anual", "Acesso ilimitado com desconto", 799.00, 12)
        ],
        assinaturas: [],
        pagamentos: []
    },

    usuarioLogado: null,

    salvar() {
        localStorage.setItem('cursorama_db', JSON.stringify(this.dados));
    },

    carregar() {
        const dadosSalvos = localStorage.getItem('cursorama_db');
        if (dadosSalvos) {
            const parsed = JSON.parse(dadosSalvos);
            for (let chave in parsed) {
                if (this.dados[chave] !== undefined) {
                    this.dados[chave] = parsed[chave];
                }
            }
        } else {
            this.salvar();
        }

        this.garantirAdminPadrao();

        // Carregar sessão
        const session = localStorage.getItem('cursorama_session');
        if(session) {
            const sessionUser = JSON.parse(session);
            const usuarioAtual = this.dados.usuarios.find(u => u.id === sessionUser.id);
            this.usuarioLogado = usuarioAtual || null;

            if (this.usuarioLogado) {
                localStorage.setItem('cursorama_session', JSON.stringify(this.usuarioLogado));
            } else {
                localStorage.removeItem('cursorama_session');
            }
        }
    },

    login(email, senha) {
        const hash = btoa(senha);
        const user = this.dados.usuarios.find(u => u.email === email && u.senhaHash === hash);
        if (user) {
            this.usuarioLogado = user;
            localStorage.setItem('cursorama_session', JSON.stringify(user));
            return true;
        }
        return false;
    },

    getUsuarioLogado() {
        return this.usuarioLogado;
    },

    logout() {
        this.usuarioLogado = null;
        localStorage.removeItem('cursorama_session');
        window.location.href = './login.html';
    },

    limpar() {
        localStorage.removeItem('cursorama_db');
        localStorage.removeItem('cursorama_session');
        location.reload();
    },

    isUserLogado() {
        return this.usuarioLogado !== null;
    },

    isUserAdmin() {
        return this.usuarioLogado !== null && this.usuarioLogado.isAdmin === true;
    },

    garantirAdminPadrao() {
        const adminEsperado = this.adminPadrao;
        const admins = this.dados.usuarios.filter(u => u.isAdmin === true);
        const adminComEmailPadrao = this.dados.usuarios.find(u => u.email === adminEsperado.email);

        if (!adminComEmailPadrao) {
            if (admins.length > 0) {
                const adminPrincipal = admins[0];
                adminPrincipal.nomeCompleto = adminEsperado.nomeCompleto;
                adminPrincipal.email = adminEsperado.email;
                adminPrincipal.senhaHash = btoa(adminEsperado.senha);
                adminPrincipal.isAdmin = true;
            } else {
                const novoId = this.dados.usuarios.length > 0
                    ? Math.max(...this.dados.usuarios.map(u => u.id || 0)) + 1
                    : 1;
                this.dados.usuarios.push(
                    new Usuario(novoId, adminEsperado.nomeCompleto, adminEsperado.email, btoa(adminEsperado.senha), true)
                );
            }
            this.salvar();
        }
    }
};

// Autenticação e Navbar Dinâmica
function verificarAcessoERenderizarNavbar() {
    DB.carregar();
    
    const navUl = document.querySelector(".navbar-nav");
    if (!navUl) return;

    // Páginas restritas
    const currentPage = window.location.pathname.split('/').pop();
    const adminPages = ['cursos.html', 'usuarios.html'];
    const loggedInPages = ['financeiro.html', 'progresso.html', 'cursos.html', 'trilhas.html', 'usuarios.html'];

    if (adminPages.includes(currentPage) && !DB.isUserAdmin()) {
        window.location.href = './index.html';
        return;
    }

    if (loggedInPages.includes(currentPage) && !DB.isUserLogado()) {
        window.location.href = './login.html';
        return;
    }

    // Renderizar Navbar Dinâmica
    let htmlNav = '';

    if (DB.isUserAdmin()) {
        htmlNav += `
            <li class="nav-item"><a href="./index.html" class="nav-link ${currentPage==='index.html'?'active':''}">Home</a></li>
            <li class="nav-item"><a href="./usuarios.html" class="nav-link ${currentPage==='usuarios.html'?'active':''}">Usuários</a></li>
            <li class="nav-item"><a href="./cursos.html" class="nav-link ${currentPage==='cursos.html'?'active':''}">Cursos</a></li>
            <li class="nav-item"><a href="./trilhas.html" class="nav-link ${currentPage==='trilhas.html'?'active':''}">Trilhas</a></li>
            <li class="nav-item"><a href="./financeiro.html" class="nav-link ${currentPage==='financeiro.html'?'active':''}">Relatório Financeiro</a></li>
        `;
    } else if (DB.isUserLogado()) {
        htmlNav += `
            <li class="nav-item"><a href="./index.html" class="nav-link ${currentPage==='index.html'?'active':''}">Home</a></li>
            <li class="nav-item"><a href="./progresso.html" class="nav-link ${currentPage==='progresso.html'?'active':''}">Meus Cursos</a></li>
            <li class="nav-item"><a href="./trilhas.html" class="nav-link ${currentPage==='trilhas.html'?'active':''}">Trilhas</a></li>
            <li class="nav-item"><a href="./financeiro.html" class="nav-link ${currentPage==='financeiro.html'?'active':''}">Comprar Plano</a></li>
        `;
    } else {
        htmlNav += `
            <li class="nav-item"><a href="./index.html" class="nav-link ${currentPage==='index.html'?'active':''}">Home</a></li>
        `;
    }

    htmlNav += `
        <li class="nav-item"><a href="./sobre.html" class="nav-link ${currentPage==='sobre.html'?'active':''}">Sobre</a></li>
        <li class="nav-item"><a href="./contato.html" class="nav-link ${currentPage==='contato.html'?'active':''}">Contato</a></li>
    `;

    if (DB.isUserLogado()) {
        htmlNav += `
            <li class="nav-item"><a href="#" onclick="DB.logout()" class="nav-link text-danger">Sair (${DB.usuarioLogado.nomeCompleto})</a></li>
        `;
    } else {
        htmlNav += `
            <li class="nav-item"><a href="./login.html" class="nav-link ${currentPage==='login.html'?'active':''}">Login</a></li>
            <li class="nav-item"><a href="./cadastro.html" class="nav-link ${currentPage==='cadastro.html'?'active':''}">Cadastrar</a></li>
        `;
    }

    navUl.innerHTML = htmlNav;
}

// Executar verificação assim que carregar
verificarAcessoERenderizarNavbar();
