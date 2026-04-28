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
    constructor(id, nomeAluno, idCurso, idTrilha) {
        this.id = id;
        this.nomeAluno = nomeAluno;
        this.idCurso = idCurso;
        this.idTrilha = idTrilha;
        this.codigoVerificacao = this.gerarCodigo();
        this.dataEmissao = new Date().toLocaleDateString("pt-BR");
    }

    gerarCodigo() {
        const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        const bloco = function (n) {
            let resultado = "";
            for (let i = 0; i < n; i++) {
                resultado += chars[Math.floor(Math.random() * chars.length)];
            }
            return resultado;
        };
        return "CERT-" + bloco(4) + "-" + bloco(4) + "-" + bloco(4);
    }
}

const categorias = [
    { id: 1, nome: "Desenvolvimento Web" },
    { id: 2, nome: "Ciência de Dados" },
    { id: 3, nome: "DevOps" },
    { id: 4, nome: "Mobile" },
];

const cursosDisponiveis = [
    { id: 1, titulo: "Curso Big Data" },
    { id: 2, titulo: "Curso React" },
    { id: 3, titulo: "Curso TypeScript" },
];

const trilhas = [];
const trilhasCursos = [];
const certificados = [];

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
categorias.forEach(function (cat) {
    selectCategoria.innerHTML += '<option value="' + cat.id + '">' + cat.nome + "</option>";
});

cursosDisponiveis.forEach(function (curso) {
    selectCursoAssoc.innerHTML += '<option value="' + curso.id + '">' + curso.titulo + "</option>";
    selectCursoCert.innerHTML += '<option value="' + curso.id + '">' + curso.titulo + "</option>";
});

// CADASTRAR TRILHA
formTrilha.addEventListener("submit", function (event) {
    event.preventDefault();

    const titulo = document.getElementById("tituloTrilha").value;
    const descricao = document.getElementById("descricaoTrilha").value;
    const idCategoria = Number(selectCategoria.value);

    const novaTrilha = new Trilha(trilhas.length + 1, titulo, descricao, idCategoria);
    trilhas.push(novaTrilha);

    atualizarSelectsTrilhas();
    renderizarTrilhas();
    formTrilha.reset();
});

// ASSOCIAR CURSO À TRILHA
formTrilhaCurso.addEventListener("submit", function (event) {
    event.preventDefault();

    const idTrilha = Number(selectTrilhaAssoc.value);
    const idCurso = Number(selectCursoAssoc.value);
    const ordem = Number(document.getElementById("ordemCurso").value);

    const jaExiste = trilhasCursos.find(function (tc) {
        return tc.idTrilha === idTrilha && tc.idCurso === idCurso;
    });

    if (jaExiste) {
        alert("Este curso já está associado a esta trilha.");
        return;
    }

    const novaAssoc = new TrilhaCurso(idTrilha, idCurso, ordem);
    trilhasCursos.push(novaAssoc);

    renderizarTrilhas();
    formTrilhaCurso.reset();
});

// TROCAR TIPO DO CERTIFICADO
selectTipoCert.addEventListener("change", function () {
    const isTrilha = this.value === "trilha";
    document.getElementById("grupoCertTrilha").classList.toggle("d-none", !isTrilha);
    document.getElementById("grupoCertCurso").classList.toggle("d-none", isTrilha);
});

// GERAR CERTIFICADO
formCertificado.addEventListener("submit", function (event) {
    event.preventDefault();

    const nomeAluno = document.getElementById("nomeAluno").value;
    const tipo = selectTipoCert.value;
    let idTrilha = null;
    let idCurso = null;
    let nomeTitulo = "";

    if (tipo === "trilha") {
        idTrilha = Number(selectTrilhaCert.value);
        const t = trilhas.find(function (t) { return t.id === idTrilha; });
        if (!t) { alert("Selecione uma trilha."); return; }
        nomeTitulo = t.titulo;
    } else {
        idCurso = Number(selectCursoCert.value);
        const c = cursosDisponiveis.find(function (c) { return c.id === idCurso; });
        if (!c) { alert("Selecione um curso."); return; }
        nomeTitulo = c.titulo;
    }

    const novoCert = new Certificado(certificados.length + 1, nomeAluno, idCurso, idTrilha);
    certificados.push(novoCert);

    renderizarCertificadoVisual(novoCert, nomeTitulo, tipo);
    renderizarListaCertificados();
    formCertificado.reset();
    document.getElementById("grupoCertTrilha").classList.remove("d-none");
    document.getElementById("grupoCertCurso").classList.add("d-none");
});

// ATUALIZAR SELECTS DE TRILHAS
function atualizarSelectsTrilhas() {
    selectTrilhaAssoc.innerHTML = '<option value="">Selecione a Trilha</option>';
    selectTrilhaCert.innerHTML = '<option value="">Selecione a Trilha</option>';

    trilhas.forEach(function (trilha) {
        const opt = '<option value="' + trilha.id + '">' + trilha.titulo + "</option>";
        selectTrilhaAssoc.innerHTML += opt;
        selectTrilhaCert.innerHTML += opt;
    });
}

// RENDERIZAR TRILHAS
function renderizarTrilhas() {
    listaTrilhas.innerHTML = "";

    if (trilhas.length === 0) {
        listaTrilhas.innerHTML = '<p class="text-muted fst-italic">Nenhuma trilha cadastrada ainda.</p>';
        return;
    }

    trilhas.forEach(function (trilha) {
        const cat = categorias.find(function (c) { return c.id === trilha.idCategoria; });

        const cursosNaTrilha = trilhasCursos
            .filter(function (tc) { return tc.idTrilha === trilha.id; })
            .sort(function (a, b) { return a.ordem - b.ordem; });

        let itensCursos = "";

        if (cursosNaTrilha.length === 0) {
            itensCursos = '<li class="list-group-item text-muted fst-italic small">Nenhum curso associado ainda.</li>';
        } else {
            cursosNaTrilha.forEach(function (tc) {
                const curso = cursosDisponiveis.find(function (c) { return c.id === tc.idCurso; });
                itensCursos += `
                    <li class="list-group-item d-flex align-items-center gap-2">
                        <span class="badge-ordem">${tc.ordem}</span>
                        ${curso ? curso.titulo : "Curso desconhecido"}
                    </li>`;
            });
        }

        listaTrilhas.innerHTML += `
            <div class="col-md-6">
                <div class="card h-100">
                    <div class="card-header d-flex justify-content-between align-items-center">
                        <strong>${trilha.titulo}</strong>
                        <span class="badge bg-warning text-dark">${cat ? cat.nome : ""}</span>
                    </div>
                    <div class="card-body">
                        <p class="card-text text-muted small">${trilha.descricao}</p>
                        <p class="fw-semibold mb-1 small">Cursos da trilha (em sequência):</p>
                        <ul class="list-group list-group-flush">${itensCursos}</ul>
                    </div>
                </div>
            </div>`;
    });
}

// RENDERIZAR CERTIFICADO VISUAL
function renderizarCertificadoVisual(cert, nomeTitulo, tipo) {
    certificadoVisual.classList.remove("d-none");
    certificadoVisual.innerHTML = `
        <div class="certificado-visual">
            <div class="cert-logo">Cursorama</div>
            <p class="text-muted mt-3 mb-0">Certificamos que</p>
            <div class="cert-nome">${cert.nomeAluno}</div>
            <p class="mb-1">concluiu com êxito ${tipo === "trilha" ? "a Trilha" : "o Curso"}</p>
            <div class="cert-titulo">${nomeTitulo}</div>
            <hr class="my-3">
            <div id="qrcode" class="d-flex justify-content-center my-3"></div>
            <p class="mb-1 small"><strong>Data de Emissão:</strong> ${cert.dataEmissao}</p>
            <p class="cert-codigo">Código de Verificação: <strong>${cert.codigoVerificacao}</strong></p>
            <button class="btn btn-outline-warning btn-sm mt-2" onclick="window.print()">Imprimir Certificado</button>
        </div>`;

    new QRCode(document.getElementById("qrcode"), {
        text: cert.codigoVerificacao,
        width: 100,
        height: 100,
    });
}

// RENDERIZAR LISTA DE CERTIFICADOS
function renderizarListaCertificados() {
    if (certificados.length === 0) {
        listaCertificados.innerHTML = "";
        return;
    }

    let linhas = "";
    certificados.forEach(function (cert) {
        linhas += `
            <tr>
                <td>${cert.nomeAluno}</td>
                <td><code>${cert.codigoVerificacao}</code></td>
                <td>${cert.dataEmissao}</td>
            </tr>`;
    });

    listaCertificados.innerHTML = `
        <h5 class="mt-3">Certificados Emitidos</h5>
        <table class="table table-sm table-bordered">
            <thead class="table-dark">
                <tr>
                    <th>Aluno</th>
                    <th>Código de Verificação</th>
                    <th>Data</th>
                </tr>
            </thead>
            <tbody>${linhas}</tbody>
        </table>`;
}

renderizarTrilhas();
