// js/financeiro.js

const listaPlanos = document.getElementById("listaPlanos");
const checkoutUsuario = document.getElementById("checkoutUsuario");
const checkoutPlano = document.getElementById("checkoutPlano");
const checkoutMetodo = document.getElementById("checkoutMetodo");
const formCheckout = document.getElementById("formCheckout");
const listaTransacoes = document.getElementById("listaTransacoes");

// Renderizar Cards de Planos
function renderizarPlanos() {
    if(!listaPlanos) return;
    listaPlanos.innerHTML = "";

    DB.dados.planos.forEach(plano => {
        listaPlanos.innerHTML += `
            <div class="col-md-4">
                <div class="card h-100 text-center border-success shadow-sm">
                    <div class="card-header bg-success text-white fw-bold">
                        ${plano.nome}
                    </div>
                    <div class="card-body">
                        <h3 class="card-title text-success">R$ ${plano.preco.toFixed(2)}</h3>
                        <p class="card-text text-muted">${plano.descricao}</p>
                        <p class="small fw-semibold">Duração: ${plano.duracaoMeses} ${plano.duracaoMeses > 1 ? 'meses' : 'mês'}</p>
                    </div>
                </div>
            </div>
        `;
    });
}

// Popular selects do formulário
function popularSelects() {
    if(checkoutUsuario) {
        checkoutUsuario.innerHTML = '<option value="">Selecione o Usuário</option>';
        DB.dados.usuarios.forEach(u => {
            checkoutUsuario.innerHTML += `<option value="${u.id}">${u.nomeCompleto} (${u.email})</option>`;
        });
    }

    if(checkoutPlano) {
        checkoutPlano.innerHTML = '<option value="">Selecione o Plano</option>';
        DB.dados.planos.forEach(p => {
            checkoutPlano.innerHTML += `<option value="${p.id}">${p.nome} - R$ ${p.preco.toFixed(2)}</option>`;
        });
    }
}

// Processar Checkout
if(formCheckout) {
    formCheckout.addEventListener("submit", function(e) {
        e.preventDefault();

        const idUsuario = Number(checkoutUsuario.value);
        const idPlano = Number(checkoutPlano.value);
        const metodo = checkoutMetodo.value;

        const plano = DB.dados.planos.find(p => p.id === idPlano);
        
        // Simular a criação da assinatura
        const dataInicio = new Date();
        const dataFim = new Date();
        dataFim.setMonth(dataFim.getMonth() + plano.duracaoMeses);

        const novaAssinatura = new Assinatura(
            DB.dados.assinaturas.length + 1, 
            idUsuario, 
            idPlano, 
            dataInicio.toISOString(), 
            dataFim.toISOString()
        );
        DB.dados.assinaturas.push(novaAssinatura);

        // Simular a criação do pagamento
        const idTransacao = 'TX' + Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
        const novoPagamento = new Pagamento(
            DB.dados.pagamentos.length + 1,
            novaAssinatura.id,
            plano.preco,
            metodo,
            idTransacao
        );
        DB.dados.pagamentos.push(novoPagamento);

        DB.salvar();

        renderizarTransacoes();
        formCheckout.reset();
        alert("Pagamento confirmado! Assinatura ativada.");
    });
}

// Renderizar Tabela de Transações
function renderizarTransacoes() {
    if(!listaTransacoes) return;
    listaTransacoes.innerHTML = "";

    if(DB.dados.pagamentos.length === 0) {
        listaTransacoes.innerHTML = "<tr><td colspan='6' class='text-center text-muted'>Nenhuma transação registrada.</td></tr>";
        return;
    }

    // Mostrar os pagamentos em ordem decrescente (mais recentes primeiro)
    const pagamentosInvertidos = [...DB.dados.pagamentos].reverse();

    pagamentosInvertidos.forEach(pg => {
        const assinatura = DB.dados.assinaturas.find(a => a.id === pg.idAssinatura);
        const usuario = assinatura ? DB.dados.usuarios.find(u => u.id === assinatura.idUsuario) : null;
        const plano = assinatura ? DB.dados.planos.find(p => p.id === assinatura.idPlano) : null;
        
        const dataStr = new Date(pg.dataPagamento).toLocaleDateString('pt-BR') + ' ' + new Date(pg.dataPagamento).toLocaleTimeString('pt-BR');

        listaTransacoes.innerHTML += `
            <tr>
                <td><strong>${pg.idTransacaoGateway}</strong></td>
                <td>${usuario ? usuario.nomeCompleto : 'Usuário Removido'}</td>
                <td>${plano ? plano.nome : 'Plano Removido'}</td>
                <td>R$ ${pg.valorPago.toFixed(2)}</td>
                <td><span class="badge bg-secondary">${pg.metodoPagamento}</span></td>
                <td>${dataStr}</td>
            </tr>
        `;
    });
}

// Inicializar
renderizarPlanos();
popularSelects();
renderizarTransacoes();
