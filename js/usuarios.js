// js/usuarios.js

const formUsuario = document.getElementById("formUsuario");
const formMatricula = document.getElementById("formMatricula");

const selectUsuarioMatricula = document.getElementById("selectUsuarioMatricula");
const selectCursoMatricula = document.getElementById("selectCursoMatricula");

const listaUsuarios = document.getElementById("listaUsuarios");
const listaMatriculas = document.getElementById("listaMatriculas");

// Popular Selects
function popularSelects() {
    if(selectUsuarioMatricula) {
        selectUsuarioMatricula.innerHTML = '<option value="">Selecione o Usuário</option>';
        DB.dados.usuarios.forEach(u => {
            selectUsuarioMatricula.innerHTML += `<option value="${u.id}">${u.nomeCompleto} (${u.email})</option>`;
        });
    }

    if(selectCursoMatricula) {
        selectCursoMatricula.innerHTML = '<option value="">Selecione o Curso</option>';
        DB.dados.cursos.forEach(c => {
            selectCursoMatricula.innerHTML += `<option value="${c.id}">${c.titulo}</option>`;
        });
    }
}

// Cadastrar Usuário
if(formUsuario) {
    formUsuario.addEventListener("submit", function(e) {
        e.preventDefault();

        const nome = document.getElementById("nomeCompleto").value;
        const email = document.getElementById("email").value;
        const senha = document.getElementById("senha").value;

        // Verifica se email já existe
        const existe = DB.dados.usuarios.find(u => u.email === email);
        if(existe) {
            alert("Este e-mail já está cadastrado.");
            return;
        }

        // Criar hash fictício
        const senhaHash = btoa(senha); 

        const novoUsuario = new Usuario(DB.dados.usuarios.length + 1, nome, email, senhaHash);
        DB.dados.usuarios.push(novoUsuario);
        DB.salvar();

        popularSelects();
        renderizarTabelas();
        formUsuario.reset();
        alert("Usuário cadastrado com sucesso!");
    });
}

// Efetuar Matrícula
if(formMatricula) {
    formMatricula.addEventListener("submit", function(e) {
        e.preventDefault();

        const idUsuario = Number(selectUsuarioMatricula.value);
        const idCurso = Number(selectCursoMatricula.value);

        // Verifica se já está matriculado
        const existe = DB.dados.matriculas.find(m => m.idUsuario === idUsuario && m.idCurso === idCurso);
        if(existe) {
            alert("Este usuário já está matriculado neste curso.");
            return;
        }

        const novaMatricula = new Matricula(DB.dados.matriculas.length + 1, idUsuario, idCurso);
        DB.dados.matriculas.push(novaMatricula);
        DB.salvar();

        renderizarTabelas();
        formMatricula.reset();
        alert("Matrícula efetuada com sucesso!");
    });
}

// Renderizar Tabelas
function renderizarTabelas() {
    if(listaUsuarios) {
        listaUsuarios.innerHTML = "";
        if(DB.dados.usuarios.length === 0) {
            listaUsuarios.innerHTML = "<tr><td colspan='4' class='text-center text-muted'>Nenhum usuário cadastrado.</td></tr>";
        } else {
            DB.dados.usuarios.forEach(u => {
                const d = new Date(u.dataCadastro).toLocaleDateString('pt-BR');
                listaUsuarios.innerHTML += `
                    <tr>
                        <td>${u.id}</td>
                        <td>${u.nomeCompleto}</td>
                        <td>${u.email}</td>
                        <td>${d}</td>
                    </tr>
                `;
            });
        }
    }

    if(listaMatriculas) {
        listaMatriculas.innerHTML = "";
        if(DB.dados.matriculas.length === 0) {
            listaMatriculas.innerHTML = "<tr><td colspan='3' class='text-center text-muted'>Nenhuma matrícula ativa.</td></tr>";
        } else {
            DB.dados.matriculas.forEach(m => {
                const u = DB.dados.usuarios.find(user => user.id === m.idUsuario);
                const c = DB.dados.cursos.find(curso => curso.id === m.idCurso);
                const d = new Date(m.dataMatricula).toLocaleDateString('pt-BR');
                
                listaMatriculas.innerHTML += `
                    <tr>
                        <td>${u ? u.nomeCompleto : 'Usuário Removido'}</td>
                        <td>${c ? c.titulo : 'Curso Removido'}</td>
                        <td>${d}</td>
                    </tr>
                `;
            });
        }
    }
}

popularSelects();
renderizarTabelas();
