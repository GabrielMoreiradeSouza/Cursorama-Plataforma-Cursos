// js/progresso.js

const areaProgresso = document.getElementById("areaProgresso");
const areaAvaliacoesFeitas = document.getElementById("areaAvaliacoesFeitas");
const nomeAlunoLogado = document.getElementById("nomeAlunoLogado");

const listaAulasPendentes = document.getElementById("listaAulasPendentes");
const cursoAvaliacaoSelect = document.getElementById("cursoAvaliacaoSelect");
const formAvaliacao = document.getElementById("formAvaliacao");
const listaMinhasAvaliacoes = document.getElementById("listaMinhasAvaliacoes");
const listaCertificados = document.getElementById("listaCertificados");

const usuarioLogado = DB.getUsuarioLogado();
let usuarioLogadoId = usuarioLogado ? usuarioLogado.id : null;

function inicializarPainel() {
    if (!usuarioLogadoId) return;

    if (nomeAlunoLogado) {
        nomeAlunoLogado.textContent = `Olá, ${usuarioLogado.nomeCompleto}! Seu Progresso:`;
    }

    if (areaProgresso) areaProgresso.classList.remove("d-none");
    
    // As avaliações podem estar em areaAvaliacoesFeitas ou não, remova d-none se existir
    if (areaAvaliacoesFeitas) areaAvaliacoesFeitas.classList.remove("d-none");
    
    carregarDadosDoUsuario();
}

function carregarDadosDoUsuario() {
    const matriculasDoUsuario = DB.dados.matriculas.filter(m => m.idUsuario === usuarioLogadoId);
    
    if (cursoAvaliacaoSelect) {
        cursoAvaliacaoSelect.innerHTML = '<option value="">Selecione o Curso Matriculado</option>';
    }
    
    if (listaAulasPendentes) {
        listaAulasPendentes.innerHTML = "";
        
        if(matriculasDoUsuario.length === 0) {
            listaAulasPendentes.innerHTML = "<p class='text-muted'>Você não está matriculado em nenhum curso.</p>";
        } else {
            matriculasDoUsuario.forEach(m => {
                const curso = DB.dados.cursos.find(c => c.id === m.idCurso);
                if(curso) {
                    if (cursoAvaliacaoSelect) {
                        cursoAvaliacaoSelect.innerHTML += `<option value="${curso.id}">${curso.titulo}</option>`;
                    }
                    
                    const modulos = DB.dados.modulos.filter(mod => mod.cursoId === curso.id).sort((a,b) => a.ordem - b.ordem);
                    
                    let conteudoAulas = "";
                    modulos.forEach(mod => {
                        const aulas = DB.dados.aulas.filter(a => a.moduloId === mod.id).sort((a,b) => a.ordem - b.ordem);
                        
                        aulas.forEach(aula => {
                            const progresso = DB.dados.progressoAulas.find(p => p.idUsuario === usuarioLogadoId && p.idAula === aula.id);
                            const concluido = progresso && progresso.status === 'Concluído';
                            
                            conteudoAulas += `
                                <div class="form-check mb-2 border-bottom pb-2">
                                    <input class="form-check-input check-aula" type="checkbox" value="${aula.id}" id="aula_${aula.id}" ${concluido ? 'checked disabled' : ''}>
                                    <label class="form-check-label" for="aula_${aula.id}">
                                        ${mod.titulo} - Aula ${aula.ordem}: ${aula.titulo} (${aula.duracao} min)
                                    </label>
                                </div>
                            `;
                        });
                    });
                    
                    if(conteudoAulas === "") conteudoAulas = "<p class='small text-muted'>Nenhuma aula cadastrada neste curso.</p>";

                    listaAulasPendentes.innerHTML += `
                        <div class="mb-4">
                            <h6 class="text-primary">${curso.titulo}</h6>
                            ${conteudoAulas}
                        </div>
                    `;
                }
            });

            document.querySelectorAll('.check-aula').forEach(chk => {
                chk.addEventListener('change', function() {
                    if(this.checked) {
                        marcarAulaConcluida(Number(this.value));
                        this.disabled = true;
                    }
                });
            });
        }
    }

    atualizarCertificadosDoUsuario(matriculasDoUsuario);
    renderizarCertificados();
    renderizarMinhasAvaliacoes();
}

function marcarAulaConcluida(idAula) {
    const progressoExistente = DB.dados.progressoAulas.find(
        p => p.idUsuario === usuarioLogadoId && p.idAula === idAula
    );
    if (progressoExistente) {
        progressoExistente.status = "Concluído";
        progressoExistente.dataConclusao = new Date().toISOString();
    } else {
        const novoProgresso = new ProgressoAula(usuarioLogadoId, idAula, 'Concluído');
        DB.dados.progressoAulas.push(novoProgresso);
    }

    const matriculasDoUsuario = DB.dados.matriculas.filter(m => m.idUsuario === usuarioLogadoId);
    atualizarCertificadosDoUsuario(matriculasDoUsuario);
    DB.salvar();
    renderizarCertificados();
    alert("Progresso salvo!");
}

if(formAvaliacao) {
    formAvaliacao.addEventListener("submit", function(e) {
        e.preventDefault();
        
        const idCurso = Number(cursoAvaliacaoSelect.value);
        const nota = Number(document.getElementById("nota").value);
        const comentario = document.getElementById("comentario").value;

        const avaliacaoExistente = DB.dados.avaliacoes.find(a => a.idUsuario === usuarioLogadoId && a.idCurso === idCurso);
        if(avaliacaoExistente) {
            alert("Você já avaliou este curso!");
            return;
        }

        const novaAv = new Avaliacao(DB.dados.avaliacoes.length + 1, usuarioLogadoId, idCurso, nota, comentario);
        DB.dados.avaliacoes.push(novaAv);
        DB.salvar();

        renderizarMinhasAvaliacoes();
        formAvaliacao.reset();
        alert("Avaliação enviada com sucesso!");
    });
}

function renderizarMinhasAvaliacoes() {
    if(!listaMinhasAvaliacoes) return;
    listaMinhasAvaliacoes.innerHTML = "";

    const avaliacoesDoUsuario = DB.dados.avaliacoes.filter(a => a.idUsuario === usuarioLogadoId);

    if(avaliacoesDoUsuario.length === 0) {
        listaMinhasAvaliacoes.innerHTML = "<p class='text-muted'>Nenhuma avaliação realizada ainda.</p>";
    } else {
        avaliacoesDoUsuario.forEach(a => {
            const curso = DB.dados.cursos.find(c => c.id === a.idCurso);
            let estrelas = "";
            for(let i=1; i<=5; i++) {
                estrelas += i <= a.nota ? "⭐" : "☆";
            }
            
            listaMinhasAvaliacoes.innerHTML += `
                <div class="col-md-4">
                    <div class="card h-100 bg-light shadow-sm">
                        <div class="card-body">
                            <h6 class="card-title">${curso ? curso.titulo : 'Curso Removido'}</h6>
                            <p class="mb-1 text-warning">${estrelas}</p>
                            <p class="card-text small fst-italic">"${a.comentario}"</p>
                        </div>
                    </div>
                </div>
            `;
        });
    }
}

function atualizarCertificadosDoUsuario(matriculasDoUsuario) {
    matriculasDoUsuario.forEach(matricula => {
        const modulos = DB.dados.modulos.filter(mod => mod.cursoId === matricula.idCurso);
        const aulasDoCurso = modulos.flatMap(mod =>
            DB.dados.aulas.filter(aula => aula.moduloId === mod.id)
        );

        if (aulasDoCurso.length === 0) return;

        const aulasConcluidas = aulasDoCurso.filter(aula =>
            DB.dados.progressoAulas.some(
                p => p.idUsuario === usuarioLogadoId && p.idAula === aula.id && p.status === "Concluído"
            )
        );

        const cursoFinalizado = aulasConcluidas.length === aulasDoCurso.length;
        if (!cursoFinalizado) return;

        if (!matricula.dataConclusao) {
            matricula.dataConclusao = new Date().toISOString();
        }

        const certificadoExistente = DB.dados.certificados.find(
            c => c.idUsuario === usuarioLogadoId && c.idCurso === matricula.idCurso
        );
        if (!certificadoExistente) {
            const novoCertificado = new Certificado(
                DB.dados.certificados.length + 1,
                usuarioLogadoId,
                matricula.idCurso,
                null
            );
            DB.dados.certificados.push(novoCertificado);
        }
    });
}

function renderizarCertificados() {
    if (!listaCertificados) return;
    listaCertificados.innerHTML = "";

    const certificadosDoUsuario = DB.dados.certificados.filter(c => c.idUsuario === usuarioLogadoId);

    if (certificadosDoUsuario.length === 0) {
        listaCertificados.innerHTML = "<p class='text-muted'>Conclua cursos para gerar seus certificados.</p>";
        return;
    }

    certificadosDoUsuario.forEach(cert => {
        const curso = DB.dados.cursos.find(c => c.id === cert.idCurso);
        listaCertificados.innerHTML += `
            <div class="col-md-6">
                <div class="card border-success shadow-sm h-100">
                    <div class="card-body">
                        <h5 class="card-title text-success">Certificado Emitido</h5>
                        <p class="mb-1"><strong>Aluno:</strong> ${usuarioLogado?.nomeCompleto || "Aluno"}</p>
                        <p class="mb-1"><strong>Curso:</strong> ${curso ? curso.titulo : "Curso Removido"}</p>
                        <p class="mb-1"><strong>Emissão:</strong> ${cert.dataEmissao}</p>
                        <p class="mb-0"><strong>Código:</strong> <span class="font-monospace">${cert.codigoVerificacao}</span></p>
                    </div>
                </div>
            </div>
        `;
    });
}

// Inicializa a página
inicializarPainel();
