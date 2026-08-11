function pegarTokenSalvo() {
return localStorage.getItem("token");
}

function salvarToken(token) {
localStorage.setItem("token", token);
}

function removerToken() {
localStorage.removeItem("token");
}

async function chamarApi(caminho, opcoes = {}) {
const token = pegarTokenSalvo();

const cabecalhos = {
    Accept: "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...opcoes.headers,
};

if (!(opcoes.body instanceof FormData)) {
    cabecalhos["Content-Type"] = "application/json";
}

const resposta = await fetch(`${URL_BASE_DA_API}${caminho}`, {
    ...opcoes,
    headers: cabecalhos,
});

if (resposta.status === 204) {
    return null;
}

const texto = await resposta.text();

let dados = {};

try {
    dados = texto ? JSON.parse(texto) : {};
} catch {
    dados = { message: texto };
}

if (!resposta.ok) {
    throw new Error(dados.message || "Erro na requisição");
}

return dados;
}

async function registrar(nome, nomeDeUsuario, email, senha) {
return chamarApi("/register", {
method: "POST",
body: JSON.stringify({
name: nome,
username: nomeDeUsuario,
email,
password: senha,
}),
});
}

async function fazerLogin(email, senha) {
return chamarApi("/login", {
method: "POST",
body: JSON.stringify({
email,
password: senha,
}),
});
}

async function buscarFeed() {
return chamarApi("/posts");
}

async function curtirPost(idDoPost) {
return chamarApi(`/posts/${idDoPost}/like`, {
method: "POST",
});
}

async function comentarNoPost(idDoPost, texto) {
return chamarApi(`/posts/${idDoPost}/comments`, {
method: "POST",
body: JSON.stringify({
body: texto,
}),
});
}

async function buscarPost(idDoPost) {
return chamarApi(`/posts/${idDoPost}`);
}

async function listarComentarios(idDoPost) {
return chamarApi(`/posts/${idDoPost}/comments`);
}

async function deletarPost(idDoPost) {
return chamarApi(`/posts/${idDoPost}`, {
method: "DELETE",
});
}

async function seguirUsuario(idDoUsuario) {
return chamarApi(`/users/${idDoUsuario}/follow`, {
method: "POST",
});
}

async function deixarDeSeguirUsuario(idDoUsuario) {
return chamarApi(`/users/${idDoUsuario}/follow`, {
method: "DELETE",
});
}

async function buscarUsuario(idDoUsuario) {
return chamarApi(`/users/${idDoUsuario}`);
}

async function buscarUsuarios(termoDeBusca) {
return chamarApi(`/users?q=${encodeURIComponent(termoDeBusca || "")}`);
}

async function buscarMeuPerfil() {
return chamarApi("/me");
}

async function atualizarMeuPerfil(dados) {
return chamarApi("/me", {
method: "POST",
body: (() => {
if (dados instanceof FormData) {
dados.append("_method", "PUT");
return dados;
}

return JSON.stringify(dados);
})(),
});
}

async function criarPost(caption, arquivo) {
    const formData = new FormData();

    formData.append("caption", caption);
    formData.append("image", arquivo);

    return chamarApi("/posts", {
        method: "POST",
        body: formData
    });
}
async function sair() {
await chamarApi("/logout", {
method: "POST",
});

removerToken();
}