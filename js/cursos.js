class Curso {
    constructor(id, titulo, categoria, instrutor, nivel, horas, imagem) {
        this.id = id;
        this.titulo = titulo;
        this.categoria = categoria;
        this.instrutor = instrutor;
        this.nivel = nivel;
        this.horas = horas;
        this.imagem = imagem;
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

const cursos = [];
const modulos = [];
const aulas = [];

const formCurso = document.getElementById("formCurso");
const formModulo = document.getElementById("formModulo");
const formAula = document.getElementById("formAula");

const listaCursos = document.getElementById("listaCursos");
const cursoSelect = document.getElementById("cursoSelect");
const moduloSelect = document.getElementById("moduloSelect");

const modalTituloCurso = document.getElementById("modalTituloCurso");
const modalConteudoCurso = document.getElementById("modalConteudoCurso");

// CADASTRAR CURSO
formCurso.addEventListener("submit", function (event) {
    event.preventDefault();

    const titulo = document.getElementById("titulo").value;
    const categoria = document.getElementById("categoria").value;
    const instrutor = document.getElementById("instrutor").value;
    const nivel = document.getElementById("nivel").value;
    const horas = document.getElementById("horas").value;
    const imagem = document.getElementById("imagem").value || "./img/react.jpg";

    const novoCurso = new Curso(
        cursos.length + 1,
        titulo,
        categoria,
        instrutor,
        nivel,
        horas,
        imagem
    );

    cursos.push(novoCurso);

    atualizarSelectCursos();
    renderizarCursos();

    formCurso.reset();
});

// CADASTRAR MÓDULO
formModulo.addEventListener("submit", function (event) {
    event.preventDefault();

    const cursoId = Number(document.getElementById("cursoSelect").value);
    const tituloModulo = document.getElementById("tituloModulo").value;
    const ordemModulo = Number(document.getElementById("ordemModulo").value);

    const novoModulo = new Modulo(
        modulos.length + 1,
        cursoId,
        tituloModulo,
        ordemModulo
    );

    modulos.push(novoModulo);

    atualizarSelectModulos();
    renderizarCursos();

    formModulo.reset();
});

// CADASTRAR AULA
formAula.addEventListener("submit", function (event) {
    event.preventDefault();

    const moduloId = Number(document.getElementById("moduloSelect").value);
    const tituloAula = document.getElementById("tituloAula").value;
    const tipoAula = document.getElementById("tipoAula").value;
    const urlAula = document.getElementById("urlAula").value;
    const duracaoAula = Number(document.getElementById("duracaoAula").value);
    const ordemAula = Number(document.getElementById("ordemAula").value);

    const novaAula = new Aula(
        aulas.length + 1,
        moduloId,
        tituloAula,
        tipoAula,
        urlAula,
        duracaoAula,
        ordemAula
    );

    aulas.push(novaAula);

    renderizarCursos();

    formAula.reset();
});

// ATUALIZAR SELECT DE CURSOS
function atualizarSelectCursos() {
    cursoSelect.innerHTML = '<option value="">Selecione o Curso</option>';

    cursos.forEach(function (curso) {
        cursoSelect.innerHTML += `
            <option value="${curso.id}">
                ${curso.titulo}
            </option>
        `;
    });
}

// ATUALIZAR SELECT DE MÓDULOS
function atualizarSelectModulos() {
    moduloSelect.innerHTML = '<option value="">Selecione o Módulo</option>';

    modulos.forEach(function (modulo) {
        const curso = cursos.find(function (curso) {
            return curso.id === modulo.cursoId;
        });

        moduloSelect.innerHTML += `
            <option value="${modulo.id}">
                ${curso.titulo} - Módulo ${modulo.ordem}: ${modulo.titulo}
            </option>
        `;
    });
}

// GERAR HTML DOS MÓDULOS E AULAS
function gerarModulosEAulas(cursoId) {
    const modulosDoCurso = modulos
        .filter(function (modulo) {
            return modulo.cursoId === cursoId;
        })
        .sort(function (a, b) {
            return a.ordem - b.ordem;
        });

    let listaModulos = "";

    modulosDoCurso.forEach(function (modulo) {
        const aulasDoModulo = aulas
            .filter(function (aula) {
                return aula.moduloId === modulo.id;
            })
            .sort(function (a, b) {
                return a.ordem - b.ordem;
            });

        let listaAulas = "";

        aulasDoModulo.forEach(function (aula) {
            listaAulas += `
                <li>
                    <strong>Aula ${aula.ordem}:</strong> ${aula.titulo}<br>
                    <small>Tipo: ${aula.tipo} | Duração: ${aula.duracao} min</small>
                </li>
            `;
        });

        if (listaAulas === "") {
            listaAulas = "<li>Nenhuma aula cadastrada.</li>";
        }

        listaModulos += `
            <li>
                <strong>Módulo ${modulo.ordem}:</strong> ${modulo.titulo}
                <ul>${listaAulas}</ul>
            </li>
        `;
    });

    if (listaModulos === "") {
        listaModulos = "<li>Nenhum módulo cadastrado.</li>";
    }

    return listaModulos;
}

// RENDERIZAR CURSOS
function renderizarCursos() {
    listaCursos.innerHTML = "";

    cursos.forEach(function (curso) {
        const listaModulos = gerarModulosEAulas(curso.id);

        listaCursos.innerHTML += `
            <div class="col-md-4">
                <div class="card curso-card h-100">
                    <img src="${curso.imagem}" class="card-img-top" alt="${curso.titulo}">

                    <div class="card-body">
                        <h5 class="card-title">${curso.titulo}</h5>

                        <p class="card-text">
                            <strong>Categoria:</strong> ${curso.categoria}<br>
                            <strong>Instrutor:</strong> ${curso.instrutor}<br>
                            <strong>Nível:</strong> ${curso.nivel}<br>
                            <strong>Total de horas:</strong> ${curso.horas}h
                        </p>

                        <button class="btn btn-primary" onclick="abrirModalCurso(${curso.id})">
                            Ver curso
                        </button>
                    </div>
                </div>
            </div>
        `;
    });
}

// ABRIR MODAL DO CURSO
function abrirModalCurso(idCurso) {
    const curso = cursos.find(function (curso) {
        return curso.id === idCurso;
    });

    const listaModulos = gerarModulosEAulas(idCurso);

    modalTituloCurso.innerText = curso.titulo;

    modalConteudoCurso.innerHTML = `
        <img src="${curso.imagem}" class="img-fluid rounded mb-3" alt="${curso.titulo}">

        <p>
            <strong>Categoria:</strong> ${curso.categoria}<br>
            <strong>Instrutor:</strong> ${curso.instrutor}<br>
            <strong>Nível:</strong> ${curso.nivel}<br>
            <strong>Total de horas:</strong> ${curso.horas}h
        </p>

        <hr>

        <h6>Módulos e Aulas</h6>
        <ul>${listaModulos}</ul>
    `;

    const modal = new bootstrap.Modal(document.getElementById("modalCurso"));
    modal.show();
}