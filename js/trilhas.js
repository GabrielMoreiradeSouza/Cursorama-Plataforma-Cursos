// js/trilhas.js

const formTrilha = document.getElementById("formTrilha");
const formTrilhaCurso = document.getElementById("formTrilhaCurso");
const formCertificado = document.getElementById("formCertificado");

const selectCategoria = document.getElementById("selectCategoria");
const selectTrilhaAssoc = document.getElementById("selectTrilhaAssoc");
const selectCursoAssoc = document.getElementById("selectCursoAssoc");
const selectTrilhaCert = document.getElementById("selectTrilhaCert");
const selectCursoCert = document.getElementById("selectCursoCert");
const selectTipoCert = document.getElementById("selectTipoCert");

const listaTrilhas = document.getElementById("listaTrilhas");
const listaCertificados = document.getElementById("listaCertificados");
const certificadoVisual = document.getElementById("certificadoVisual");

// POPULAR SELECTS INICIAIS
function popularSelects() {
    if(selectCategoria) {
        selectCategoria.innerHTML = '<option value="">Selecione a Categoria</option>';
        DB.dados.categorias.forEach(function (cat) {
            selectCategoria.innerHTML += '<option value="' + cat.id + '">' + cat.nome + "</option>";
        });
    }

    if(selectCursoAssoc) {
        selectCursoAssoc.innerHTML = '<option value="">Selecione o Curso</option>';
        selectCursoCert.innerHTML = '<option value="">Selecione o Curso</option>';
        DB.dados.cursos.forEach(function (curso) {
            selectCursoAssoc.innerHTML += '<option value="' + curso.id + '">' + curso.titulo + "</option>";
            selectCursoCert.innerHTML += '<option value="' + curso.id + '">' + curso.titulo + "</option>";
        });
    }
}

// CADASTRAR TRILHA
if(formTrilha) {
    formTrilha.addEventListener("submit", function (event) {
        event.preventDefault();

        const titulo = document.getElementById("tituloTrilha").value;
        const descricao = document.getElementById("descricaoTrilha").value;
        const idCategoria = Number(selectCategoria.value);

        const novaTrilha = new Trilha(DB.dados.trilhas.length + 1, titulo, descricao, idCategoria);
        DB.dados.trilhas.push(novaTrilha);
        DB.salvar();

        atualizarSelectsTrilhas();
        renderizarTrilhas();
        formTrilha.reset();
        alert("Trilha cadastrada com sucesso!");
    });
}

// ASSOCIAR CURSO À TRILHA
if(formTrilhaCurso) {
    formTrilhaCurso.addEventListener("submit", function (event) {
        event.preventDefault();

        const idTrilha = Number(selectTrilhaAssoc.value);
        const idCurso = Number(selectCursoAssoc.value);
        const ordem = Number(document.getElementById("ordemCurso").value);

        const jaExiste = DB.dados.trilhasCursos.find(function (tc) {
            return tc.idTrilha === idTrilha && tc.idCurso === idCurso;
        });

        if (jaExiste) {
            alert("Este curso já está associado a esta trilha.");
            return;
        }

        const novaAssoc = new TrilhaCurso(idTrilha, idCurso, ordem);
        DB.dados.trilhasCursos.push(novaAssoc);
        DB.salvar();

        renderizarTrilhas();
        formTrilhaCurso.reset();
        alert("Curso associado à trilha com sucesso!");
    });
}

// TROCAR TIPO DO CERTIFICADO
if(selectTipoCert) {
    selectTipoCert.addEventListener("change", function () {
        const isTrilha = this.value === "trilha";
        document.getElementById("grupoCertTrilha").classList.toggle("d-none", !isTrilha);
        document.getElementById("grupoCertCurso").classList.toggle("d-none", isTrilha);
    });
}

// GERAR CERTIFICADO
if(formCertificado) {
    formCertificado.addEventListener("submit", function (event) {
        event.preventDefault();

        const nomeAluno = document.getElementById("nomeAluno").value;
        const tipo = selectTipoCert.value;
        let idTrilha = null;
        let idCurso = null;
        let nomeTitulo = "";

        if (tipo === "trilha") {
            idTrilha = Number(selectTrilhaCert.value);
            const t = DB.dados.trilhas.find(function (t) { return t.id === idTrilha; });
            if (!t) { alert("Selecione uma trilha."); return; }
            nomeTitulo = t.titulo;
        } else {
            idCurso = Number(selectCursoCert.value);
            const c = DB.dados.cursos.find(function (c) { return c.id === idCurso; });
            if (!c) { alert("Selecione um curso."); return; }
            nomeTitulo = c.titulo;
        }

        // Simula busca por id de usuário caso real (estamos aceitando nome direto para o visual)
        const idUsuarioMock = 1;

        const novoCert = new Certificado(DB.dados.certificados.length + 1, idUsuarioMock, idCurso, idTrilha);
        // Atribuir o nomeAluno pra exibição temporária
        novoCert.nomeAluno = nomeAluno;
        
        DB.dados.certificados.push(novoCert);
        DB.salvar();

        renderizarCertificadoVisual(novoCert, nomeTitulo, tipo);
        renderizarListaCertificados();
        formCertificado.reset();
        document.getElementById("grupoCertTrilha").classList.remove("d-none");
        document.getElementById("grupoCertCurso").classList.add("d-none");
    });
}

// ATUALIZAR SELECTS DE TRILHAS
function atualizarSelectsTrilhas() {
    if(!selectTrilhaAssoc) return;
    selectTrilhaAssoc.innerHTML = '<option value="">Selecione a Trilha</option>';
    selectTrilhaCert.innerHTML = '<option value="">Selecione a Trilha</option>';

    DB.dados.trilhas.forEach(function (trilha) {
        const opt = '<option value="' + trilha.id + '">' + trilha.titulo + "</option>";
        selectTrilhaAssoc.innerHTML += opt;
        selectTrilhaCert.innerHTML += opt;
    });
}

// RENDERIZAR TRILHAS
function renderizarTrilhas() {
    if(!listaTrilhas) return;
    listaTrilhas.innerHTML = "";

    if (DB.dados.trilhas.length === 0) {
        listaTrilhas.innerHTML = '<p class="text-muted fst-italic">Nenhuma trilha cadastrada ainda.</p>';
        return;
    }

    DB.dados.trilhas.forEach(function (trilha) {
        const cat = DB.dados.categorias.find(function (c) { return c.id === trilha.idCategoria; });

        const cursosNaTrilha = DB.dados.trilhasCursos
            .filter(function (tc) { return tc.idTrilha === trilha.id; })
            .sort(function (a, b) { return a.ordem - b.ordem; });

        let itensCursos = "";

        if (cursosNaTrilha.length === 0) {
            itensCursos = '<li class="list-group-item text-muted fst-italic small">Nenhum curso associado ainda.</li>';
        } else {
            cursosNaTrilha.forEach(function (tc) {
                const curso = DB.dados.cursos.find(function (c) { return c.id === tc.idCurso; });
                itensCursos += `
                    <li class="list-group-item d-flex align-items-center gap-2">
                        <span class="badge-ordem">${tc.ordem}</span>
                        ${curso ? curso.titulo : "Curso desconhecido"}
                    </li>`;
            });
        }

        listaTrilhas.innerHTML += `
            <div class="col-md-6">
                <div class="card h-100 shadow-sm border-warning">
                    <div class="card-header bg-warning text-dark d-flex justify-content-between align-items-center">
                        <strong class="mb-0 fs-5">${trilha.titulo}</strong>
                        <span class="badge bg-dark text-white">${cat ? cat.nome : ""}</span>
                    </div>
                    <div class="card-body">
                        <p class="card-text text-muted small">${trilha.descricao}</p>
                        <p class="fw-semibold mb-1 small text-secondary">Cursos da trilha (em sequência):</p>
                        <ul class="list-group list-group-flush">${itensCursos}</ul>
                    </div>
                </div>
            </div>`;
    });
}

// RENDERIZAR CERTIFICADO VISUAL
function renderizarCertificadoVisual(cert, nomeTitulo, tipo) {
    if(!certificadoVisual) return;
    certificadoVisual.classList.remove("d-none");
    certificadoVisual.innerHTML = `
        <div class="certificado-visual">
            <div class="cert-logo">Cursorama</div>
            <p class="text-muted mt-3 mb-0">Certificamos que</p>
            <div class="cert-nome">${cert.nomeAluno}</div>
            <p class="mb-1">concluiu com êxito ${tipo === "trilha" ? "a Trilha" : "o Curso"}</p>
            <div class="cert-titulo">${nomeTitulo}</div>
            <hr class="my-3 border-warning">
            <div id="qrcode" class="d-flex justify-content-center my-3"></div>
            <p class="mb-1 small"><strong>Data de Emissão:</strong> ${cert.dataEmissao}</p>
            <p class="cert-codigo">Código de Verificação: <strong>${cert.codigoVerificacao}</strong></p>
            <button class="btn btn-outline-warning btn-sm mt-2" onclick="window.print()">Imprimir Certificado</button>
        </div>`;

    new QRCode(document.getElementById("qrcode"), {
        text: cert.codigoVerificacao,
        width: 100,
        height: 100,
        colorDark : "#F19E39",
        colorLight : "#ffffff",
    });
}

// RENDERIZAR LISTA DE CERTIFICADOS
function renderizarListaCertificados() {
    if(!listaCertificados) return;
    if (DB.dados.certificados.length === 0) {
        listaCertificados.innerHTML = "";
        return;
    }

    let linhas = "";
    DB.dados.certificados.forEach(function (cert) {
        linhas += `
            <tr>
                <td>${cert.nomeAluno || 'Usuário ' + cert.idUsuario}</td>
                <td><code>${cert.codigoVerificacao}</code></td>
                <td>${cert.dataEmissao}</td>
            </tr>`;
    });

    listaCertificados.innerHTML = `
        <h5 class="mt-4 text-warning">Certificados Emitidos</h5>
        <div class="table-responsive">
            <table class="table table-sm table-bordered table-hover">
                <thead class="table-dark">
                    <tr>
                        <th>Aluno</th>
                        <th>Código de Verificação</th>
                        <th>Data</th>
                    </tr>
                </thead>
                <tbody>${linhas}</tbody>
            </table>
        </div>`;
}

// INICIALIZAR
popularSelects();
atualizarSelectsTrilhas();
renderizarTrilhas();
renderizarListaCertificados();
