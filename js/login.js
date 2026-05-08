// js/login.js

const formLogin = document.getElementById("formLogin");

if(formLogin) {
    formLogin.addEventListener("submit", function(e) {
        e.preventDefault();

        const email = document.getElementById("email").value;
        const senha = document.getElementById("senha").value;

        const sucesso = DB.login(email, senha);

        if(sucesso) {
            if(DB.isUserAdmin()) {
                window.location.href = './cursos.html';
            } else {
                window.location.href = './progresso.html';
            }
        } else {
            alert("E-mail ou senha inválidos!");
        }
    });
}
