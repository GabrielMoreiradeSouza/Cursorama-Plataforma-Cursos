// js/cursos.js

const formCurso = document.getElementById("formCurso");
const formModulo = document.getElementById("formModulo");
const formAula = document.getElementById("formAula");

const listaCursos = document.getElementById("listaCursos");
const cursoSelect = document.getElementById("cursoSelect");
const moduloSelect = document.getElementById("moduloSelect");
const categoriaSelect = document.getElementById("categoriaSelect");

// Popular Select de Categorias
function popularCategorias() {
    if(!categoriaSelect) return;
    categoriaSelect.innerHTML = '<option value="">Selecione a Categoria</option>';
    DB.dados.categorias.forEach(cat => {
        categoriaSelect.innerHTML += `<option value="${cat.id}">${cat.nome}</option>`;
    });
}

if(formCurso) {
    formCurso.addEventListener("submit", function (event) {
        event.preventDefault();

        const titulo = document.getElementById("titulo").value;
        const idCategoria = Number(document.getElementById("categoriaSelect").value);
        const instrutor = document.getElementById("instrutor").value; // Na versão completa, seria o ID do usuário
        const nivel = document.getElementById("nivel").value;
        const horas = Number(document.getElementById("horas").value);
        const totalAulas = Number(document.getElementById("totalAulas").value);
        const descricao = document.getElementById("descricaoCurso").value;

        const novoCurso = new Curso(
            DB.dados.cursos.length + 1,
            titulo,
            descricao,
            instrutor,
            idCategoria,
            nivel,
            totalAulas,
            horas
        );

        DB.dados.cursos.push(novoCurso);
        DB.salvar();

        atualizarSelectCursos();
        renderizarCursos();
        formCurso.reset();
        alert("Curso cadastrado com sucesso!");
    });
}

if(formModulo) {
    formModulo.addEventListener("submit", function (event) {
        event.preventDefault();

        const cursoId = Number(document.getElementById("cursoSelect").value);
        const tituloModulo = document.getElementById("tituloModulo").value;
        const ordemModulo = Number(document.getElementById("ordemModulo").value);

        const novoModulo = new Modulo(
            DB.dados.modulos.length + 1,
            cursoId,
            tituloModulo,
            ordemModulo
        );

        DB.dados.modulos.push(novoModulo);
        DB.salvar();

        atualizarSelectModulos();
        renderizarCursos();
        formModulo.reset();
        alert("Módulo cadastrado com sucesso!");
    });
}

if(formAula) {
    formAula.addEventListener("submit", function (event) {
        event.preventDefault();

        const moduloId = Number(document.getElementById("moduloSelect").value);
        const tituloAula = document.getElementById("tituloAula").value;
        const tipoAula = document.getElementById("tipoAula").value;
        const urlAula = document.getElementById("urlAula").value;
        const duracaoAula = Number(document.getElementById("duracaoAula").value);
        const ordemAula = Number(document.getElementById("ordemAula").value);

        const novaAula = new Aula(
            DB.dados.aulas.length + 1,
            moduloId,
            tituloAula,
            tipoAula,
            urlAula,
            duracaoAula,
            ordemAula
        );

        DB.dados.aulas.push(novaAula);
        DB.salvar();

        renderizarCursos();
        formAula.reset();
        alert("Aula cadastrada com sucesso!");
    });
}

function atualizarSelectCursos() {
    if(!cursoSelect) return;
    cursoSelect.innerHTML = '<option value="">Selecione o Curso</option>';

    DB.dados.cursos.forEach(function (curso) {
        cursoSelect.innerHTML += `<option value="${curso.id}">${curso.titulo}</option>`;
    });
}

function atualizarSelectModulos() {
    if(!moduloSelect) return;
    moduloSelect.innerHTML = '<option value="">Selecione o Módulo</option>';

    DB.dados.modulos.forEach(function (modulo) {
        const curso = DB.dados.cursos.find(c => c.id === modulo.cursoId);
        moduloSelect.innerHTML += `
            <option value="${modulo.id}">
                ${curso ? curso.titulo : 'Curso Removido'} - Módulo ${modulo.ordem}: ${modulo.titulo}
            </option>
        `;
    });
}

function renderizarCursos() {
    if(!listaCursos) return;
    listaCursos.innerHTML = "";

    if (DB.dados.cursos.length === 0) {
        listaCursos.innerHTML = "<p class='text-muted'>Nenhum curso cadastrado ainda.</p>";
        return;
    }

    DB.dados.cursos.forEach(function (curso) {
        const cat = DB.dados.categorias.find(c => c.id === curso.idCategoria);
        
        const modulosDoCurso = DB.dados.modulos
            .filter(modulo => modulo.cursoId === curso.id)
            .sort((a, b) => a.ordem - b.ordem);

        let listaModulos = "";

        modulosDoCurso.forEach(function (modulo) {
            const aulasDoModulo = DB.dados.aulas
                .filter(aula => aula.moduloId === modulo.id)
                .sort((a, b) => a.ordem - b.ordem);

            let listaAulas = "";

            aulasDoModulo.forEach(function (aula) {
                listaAulas += `
                    <li>
                        Aula ${aula.ordem}: ${aula.titulo}
                        <br>
                        <small>Tipo: ${aula.tipo} | Duração: ${aula.duracao} min</small>
                    </li>
                `;
            });

            if (listaAulas === "") {
                listaAulas = "<li><small class='text-muted'>Nenhuma aula cadastrada.</small></li>";
            }

            listaModulos += `
                <li class="mb-2">
                    <strong>Módulo ${modulo.ordem}:</strong> ${modulo.titulo}
                    <ul>
                        ${listaAulas}
                    </ul>
                </li>
            `;
        });

        if (listaModulos === "") {
            listaModulos = "<li><small class='text-muted'>Nenhum módulo cadastrado.</small></li>";
        }

        listaCursos.innerHTML += `
            <div class="col-md-6">
                <div class="card curso-card shadow-sm h-100">
                    <div class="card-body">
                        <h5 class="card-title text-success">${curso.titulo}</h5>
                        <p class="card-text small text-muted">${curso.descricao}</p>
                        <p class="card-text mb-2">
                            <strong>Categoria:</strong> ${cat ? cat.nome : 'N/A'}<br>
                            <strong>Nível:</strong> <span class="badge bg-secondary">${curso.nivel}</span><br>
                            <strong>Total de horas:</strong> ${curso.totalHoras}h
                        </p>
                        <hr>
                        <h6 class="text-primary">Módulos e Aulas</h6>
                        <ul class="list-unstyled">
                            ${listaModulos}
                        </ul>
                    </div>
                </div>
            </div>
        `;
    });
}

// Inicializar a página
popularCategorias();
atualizarSelectCursos();
atualizarSelectModulos();
renderizarCursos();