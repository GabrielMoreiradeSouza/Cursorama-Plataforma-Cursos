// ============================================================
// CLASSE: Usuario
// ============================================================
class Usuario {
  static #contador = 1;

  constructor(nomeCompleto, email, senha) {
    this.id = Usuario.#contador++;
    this.nomeCompleto = nomeCompleto;
    this.email = email.toLowerCase().trim();
    this.senhaHash = this.#hashSimples(senha);
    this.dataCadastro = new Date().toLocaleDateString("pt-BR");
  }

  get iniciais() {
    return this.nomeCompleto
      .split(" ")
      .slice(0, 2)
      .map((p) => p[0].toUpperCase())
      .join("");
  }

  #hashSimples(senha) {
    let hash = 0;
    for (let i = 0; i < senha.length; i++) {
      hash = (hash << 5) - hash + senha.charCodeAt(i);
      hash |= 0;
    }
    return Math.abs(hash).toString(16).padStart(8, "0");
  }
}

// ============================================================
// GERENCIADOR
// ============================================================
class GerenciadorUsuarios {
  constructor() {
    this.usuarios = [];
    this.idParaExcluir = null;

    this.form = document.getElementById("formUsuario");
    this.tbody = document.getElementById("tabelaUsuarios");
    this.contador = document.getElementById("contadorUsuarios");
    this.toast = document.getElementById("toastAlert");
    this.toastMsg = document.getElementById("toastMsg");
    this.modalExcluir = new bootstrap.Modal(
      document.getElementById("modalExcluir"),
    );

    this.#iniciarEventos();
  }

  #iniciarEventos() {
    this.form.addEventListener("submit", (e) => {
      e.preventDefault();
      this.#submeter();
    });
    document
      .getElementById("btnConfirmarExclusao")
      .addEventListener("click", () => {
        this.#excluir(this.idParaExcluir);
        this.modalExcluir.hide();
      });
  }

  #submeter() {
    const nome = document.getElementById("nomeCompleto").value.trim();
    const email = document.getElementById("email").value.trim();
    const senha = document.getElementById("senha").value;
    const conf = document.getElementById("confirmarSenha").value;

    this.#limparErros();
    let ok = true;

    if (!nome) {
      this.#invalido("nomeCompleto");
      ok = false;
    }
    if (!email || !this.#emailValido(email)) {
      this.#invalido("email");
      ok = false;
    }
    if (ok && this.#emailExiste(email)) {
      this.#invalido("email", "E-mail já cadastrado.");
      ok = false;
    }
    if (!senha || senha.length < 6) {
      this.#invalido("senha");
      ok = false;
    }
    if (!conf || conf !== senha) {
      this.#invalido("confirmarSenha");
      ok = false;
    }

    if (!ok) return;

    this.usuarios.push(new Usuario(nome, email, senha));
    this.#render();
    this.form.reset();
    this.#toast("Usuário cadastrado com sucesso!", "success");
  }

  solicitarExclusao(id) {
    const u = this.usuarios.find((u) => u.id === id);
    if (!u) return;
    this.idParaExcluir = id;
    document.getElementById("nomeExcluir").textContent = u.nomeCompleto;
    this.modalExcluir.show();
  }

  #excluir(id) {
    this.usuarios = this.usuarios.filter((u) => u.id !== id);
    this.#render();
    this.#toast("Usuário removido.", "warning");
  }

  #render() {
    const n = this.usuarios.length;
    this.contador.textContent = `${n} usuário${n !== 1 ? "s" : ""}`;

    if (n === 0) {
      this.tbody.innerHTML = `<tr><td colspan="5"><div class="empty-state"><div class="icon">👤</div><p>Nenhum usuário cadastrado ainda.</p></div></td></tr>`;
      return;
    }

    this.tbody.innerHTML = this.usuarios
      .map(
        (u) => `
      <tr>
        <td style="color:var(--text-muted);font-size:.8rem">${u.id}</td>
        <td>
          <div class="user-cell">
            <div class="avatar">${u.iniciais}</div>
            <span>${this.#esc(u.nomeCompleto)}</span>
          </div>
        </td>
        <td style="color:var(--text-muted)">${this.#esc(u.email)}</td>
        <td style="color:var(--text-muted)">${u.dataCadastro}</td>
        <td><button class="btn-del" onclick="gerenciador.solicitarExclusao(${u.id})">Excluir</button></td>
      </tr>`,
      )
      .join("");
  }

  #emailValido(e) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
  }
  #emailExiste(e) {
    return this.usuarios.some((u) => u.email === e.toLowerCase().trim());
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
    clearTimeout(this._toastTimer);
    this._toastTimer = setTimeout(
      () => this.toast.classList.remove("show"),
      3200,
    );
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

const gerenciador = new GerenciadorUsuarios();
