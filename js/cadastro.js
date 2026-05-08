// js/cadastro.js

const formCadastro = document.getElementById("formCadastro");

if(formCadastro) {
    formCadastro.addEventListener("submit", function(e) {
        e.preventDefault();

        const nome = document.getElementById("nomeCompleto").value;
        const email = document.getElementById("email").value;
        const senha = document.getElementById("senha").value;

        const emailExiste = DB.dados.usuarios.find(u => u.email === email);
        if(emailExiste) {
            alert("Este e-mail já está cadastrado!");
            return;
        }

        const hash = btoa(senha);
        const novoUsuario = new Usuario(DB.dados.usuarios.length + 1, nome, email, hash, false);
        
        DB.dados.usuarios.push(novoUsuario);
        DB.salvar();

        // Login automático
        DB.login(email, senha);
        window.location.href = './progresso.html';
    });
}
