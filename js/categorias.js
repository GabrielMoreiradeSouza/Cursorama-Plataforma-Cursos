// ============================================================
// CLASSE: Categoria
// ============================================================
class Categoria {
  static #contador = 1;

  constructor(nome, descricao) {
    this.id = Categoria.#contador++;
    this.nome = nome.trim();
    this.descricao = descricao ? descricao.trim() : "";
  }
}

// ============================================================
// GERENCIADOR
// ============================================================
class GerenciadorCategorias {
  constructor() {
    this.categorias = [];
    this.idParaExcluir = null;
    this.modoEdicao = false;

    this.form = document.getElementById("formCategoria");
    this.tbody = document.getElementById("tabelaCategorias");
    this.contador = document.getElementById("contadorCategorias");
    this.toast = document.getElementById("toastAlert");
    this.toastMsg = document.getElementById("toastMsg");
    this.btnSalvar = document.getElementById("btnSalvarCategoria");
    this.btnCancelar = document.getElementById("btnCancelarEdicao");
    this.tituloForm = document.getElementById("tituloFormCategoria");
    this.cardForm = document.getElementById("cardForm");
    this.modalExcluir = new bootstrap.Modal(
      document.getElementById("modalExcluirCategoria"),
    );

    this.#iniciarEventos();
  }

  #iniciarEventos() {
    this.form.addEventListener("submit", (e) => {
      e.preventDefault();
      this.modoEdicao ? this.#salvarEdicao() : this.#submeter();
    });
    this.btnCancelar.addEventListener("click", () => this.#cancelarEdicao());
    document
      .getElementById("btnConfirmarExclusaoCategoria")
      .addEventListener("click", () => {
        this.#excluir(this.idParaExcluir);
        this.modalExcluir.hide();
      });
  }

  #submeter() {
    const nome = document.getElementById("nomeCategoria").value.trim();
    const desc = document.getElementById("descricaoCategoria").value.trim();
    this.#limparErros();

    if (!nome) {
      this.#invalido("nomeCategoria");
      return;
    }
    if (this.#nomeExiste(nome)) {
      this.#invalido("nomeCategoria", "Já existe uma categoria com este nome.");
      return;
    }

    this.categorias.push(new Categoria(nome, desc));
    this.#render();
    this.form.reset();
    this.#toast("Categoria cadastrada!", "success");
  }

  iniciarEdicao(id) {
    const c = this.categorias.find((c) => c.id === id);
    if (!c) return;

    this.modoEdicao = true;
    document.getElementById("idEdicao").value = c.id;
    document.getElementById("nomeCategoria").value = c.nome;
    document.getElementById("descricaoCategoria").value = c.descricao;

    this.tituloForm.textContent = "Editar Categoria";
    this.btnSalvar.textContent = "Salvar Alterações";
    this.btnSalvar.className = "btn-edit-mode";
    this.btnCancelar.style.display = "block";
    this.cardForm.classList.add("editing");

    document.getElementById("nomeCategoria").focus();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  #salvarEdicao() {
    const id = parseInt(document.getElementById("idEdicao").value);
    const nome = document.getElementById("nomeCategoria").value.trim();
    const desc = document.getElementById("descricaoCategoria").value.trim();
    this.#limparErros();

    if (!nome) {
      this.#invalido("nomeCategoria");
      return;
    }
    if (this.#nomeExiste(nome, id)) {
      this.#invalido("nomeCategoria", "Já existe uma categoria com este nome.");
      return;
    }

    const c = this.categorias.find((c) => c.id === id);
    c.nome = nome;
    c.descricao = desc;

    this.#render();
    this.#cancelarEdicao();
    this.#toast("Categoria atualizada!", "success");
  }

  #cancelarEdicao() {
    this.modoEdicao = false;
    this.form.reset();
    document.getElementById("idEdicao").value = "";
    this.tituloForm.textContent = "Nova Categoria";
    this.btnSalvar.textContent = "Cadastrar Categoria";
    this.btnSalvar.className = "btn-brand";
    this.btnCancelar.style.display = "none";
    this.cardForm.classList.remove("editing");
    this.#limparErros();
  }

  solicitarExclusao(id) {
    const c = this.categorias.find((c) => c.id === id);
    if (!c) return;
    this.idParaExcluir = id;
    document.getElementById("nomeExcluirCategoria").textContent = c.nome;
    this.modalExcluir.show();
  }

  #excluir(id) {
    this.categorias = this.categorias.filter((c) => c.id !== id);
    this.#render();
    document.getElementById("cursosPainel").classList.remove("show");
    this.#toast("Categoria removida.", "danger");
  }

  verCursos(id) {
    const c = this.categorias.find((c) => c.id === id);
    if (!c) return;

    let cursos =
      typeof window.cursos !== "undefined"
        ? window.cursos.filter((x) => x.categoria === c.nome)
        : [];

    const painel = document.getElementById("cursosPainel");
    document.getElementById("nomeCategoriaSelecionada").textContent = c.nome;
    const lista = document.getElementById("listaCursosDaCategoria");

    lista.innerHTML =
      cursos.length === 0
        ? `<span style="color:var(--text-muted);font-size:.875rem">Nenhum curso nesta categoria ainda.</span>`
        : cursos
            .map(
              (x) =>
                `<span style="background:rgba(241,158,57,.12);color:var(--brand);border:1px solid rgba(241,158,57,.25);border-radius:20px;padding:3px 12px;font-size:.8rem;font-weight:600;display:inline-block;margin:2px">${this.#esc(x.titulo)}</span>`,
            )
            .join("");

    painel.classList.add("show");
    painel.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }

  #render() {
    const n = this.categorias.length;
    this.contador.textContent = `${n} categoria${n !== 1 ? "s" : ""}`;

    if (n === 0) {
      this.tbody.innerHTML = `<tr><td colspan="4"><div class="empty-state"><div class="icon">🗂️</div><p>Nenhuma categoria cadastrada ainda.</p></div></td></tr>`;
      return;
    }

    this.tbody.innerHTML = this.categorias
      .map(
        (c) => `
      <tr>
        <td style="color:var(--text-muted);font-size:.8rem">${c.id}</td>
        <td>
          <div class="cat-pill">
            <div class="cat-dot"></div>
            <strong>${this.#esc(c.nome)}</strong>
          </div>
        </td>
        <td style="color:var(--text-muted);font-size:.85rem">${c.descricao ? this.#esc(c.descricao) : "—"}</td>
        <td style="white-space:nowrap">
          <button class="btn-sm-view me-1" onclick="gerenciadorCat.verCursos(${c.id})">Cursos</button>
          <button class="btn-sm-edit me-1" onclick="gerenciadorCat.iniciarEdicao(${c.id})">Editar</button>
          <button class="btn-sm-del" onclick="gerenciadorCat.solicitarExclusao(${c.id})">Excluir</button>
        </td>
      </tr>`,
      )
      .join("");
  }

  #nomeExiste(nome, ignorarId = null) {
    return this.categorias.some(
      (c) => c.nome.toLowerCase() === nome.toLowerCase() && c.id !== ignorarId,
    );
  }

  #invalido(id, msg = null) {
    const el = document.getElementById(id);
    el.classList.add("is-invalid");
    if (msg) el.nextElementSibling.textContent = msg;
  }

  #limparErros() {
    this.form
      .querySelectorAll(".is-invalid")
      .forEach((el) => el.classList.remove("is-invalid"));
  }

  #toast(msg, tipo) {
    this.toastMsg.textContent = msg;
    this.toast.className = `toast-alert ${tipo} show`;
    clearTimeout(this._timer);
    this._timer = setTimeout(() => this.toast.classList.remove("show"), 3200);
  }

  #esc(s) {
    return s.replace(
      /[&<>"']/g,
      (c) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#39;",
        })[c],
    );
  }
}

const gerenciadorCat = new GerenciadorCategorias();
