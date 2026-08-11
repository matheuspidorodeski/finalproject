let usuarioLogadoId = null;
let telaAtual = null;
let parametroAtual = undefined;
let historicoAntesDoPost = null;

function urlDaImagem(caminho) {
    if (!caminho) {
        return "";
    }

    if (
        caminho.startsWith("http://") ||
        caminho.startsWith("https://")
    ) {
        return caminho;
    }

    return `${URL_BASE_DO_STORAGE}/storage/${caminho.replace(/^\/+/, "")}`;
}
function estaLogado() {
    return !!pegarTokenSalvo();
}

function irParaTela(nomeDaTela, parametro) {
    const conteudo = document.getElementById("conteudo-principal");
    conteudo.innerHTML = "";
    conteudo.classList.remove("tela-perfil-larga", "tela-criar-post");

    if (nomeDaTela === "post" && telaAtual !== "post") {
        historicoAntesDoPost = { tela: telaAtual || "feed", parametro: parametroAtual };
    }

    if (nomeDaTela === "login") renderizarLogin();
    else if (nomeDaTela === "registro") renderizarRegistro();
    else if (nomeDaTela === "feed") renderizarFeed();
    else if (nomeDaTela === "post") renderizarPost(parametro);
    else if (nomeDaTela === "perfil") renderizarPerfil(parametro);
    else if (nomeDaTela === "busca") renderizarBusca();
    else if (nomeDaTela === "criar-post") renderizarCriarPost();

    telaAtual = nomeDaTela;
    parametroAtual = parametro;

    renderizarNavegacao(nomeDaTela);
    renderizarBarraLateral();
}

function renderizarNavegacao(telaAtiva) {
    const navegacao = document.getElementById("navegacao");

    if (!estaLogado()) {
        navegacao.innerHTML = "";
        return;
    }

    navegacao.innerHTML = `
        <button data-tela="feed" class="${telaAtiva === "feed" ? "ativo" : ""}">🏠 <span>Home</span></button>
        <button data-tela="busca" class="${telaAtiva === "busca" ? "ativo" : ""}">🔍 <span>Search</span></button>
        <button data-tela="criar-post" class="botao-criar-post">＋ <span>Criar post</span></button>
        <button data-tela="perfil" class="${telaAtiva === "perfil" ? "ativo" : ""}">👤 <span>Profile</span></button>
    `;

    navegacao.querySelectorAll("button[data-tela]").forEach((botao) => {
        botao.addEventListener("click", () => {
            const parametro = botao.dataset.tela === "perfil" ? usuarioLogadoId : undefined;
            irParaTela(botao.dataset.tela, parametro);
        });
    });

    const botaoSair = document.getElementById("botao-sair");
    if (botaoSair) {
        botaoSair.addEventListener("click", async () => {
            await sair();
            usuarioLogadoId = null;
            irParaTela("login");
        });
    }
}

function renderizarLogin() {
    const conteudo = document.getElementById("conteudo-principal");
    conteudo.innerHTML = `
        <div class="tela-auth">
            <h1>Entrar</h1>
            <form id="formulario-login">
                <input type="email" id="campo-email" placeholder="Email" required>
                <input type="password" id="campo-senha" placeholder="Senha" required>
                <button type="submit">Entrar</button>
                <p id="mensagem-erro-login" class="erro"></p>
            </form>
            <p>Não tem conta? <a href="#" id="link-para-registro">Registre-se</a></p>
        </div>
    `;

    document.getElementById("link-para-registro").addEventListener("click", (evento) => {
        evento.preventDefault();
        irParaTela("registro");
    });

    document.getElementById("formulario-login").addEventListener("submit", async (evento) => {
        evento.preventDefault();

        const email = document.getElementById("campo-email").value;
        const senha = document.getElementById("campo-senha").value;

        try {
            const resposta = await fazerLogin(email, senha);
            salvarToken(resposta.token);
            usuarioLogadoId = resposta.user.id;
            irParaTela("feed");
        } catch (erro) {
            document.getElementById("mensagem-erro-login").textContent = erro.message;
        }
    });
}

function renderizarRegistro() {
    const conteudo = document.getElementById("conteudo-principal");
    conteudo.innerHTML = `
        <div class="tela-auth">
            <h1>Criar conta</h1>
            <form id="formulario-registro">
                <input type="text" id="campo-nome" placeholder="Nome" required>
                <input type="text" id="campo-nome-de-usuario" placeholder="Username" required>
                <input type="email" id="campo-email-registro" placeholder="Email" required>
                <input type="password" id="campo-senha-registro" placeholder="Senha" required>
                <button type="submit">Registrar</button>
                <p id="mensagem-erro-registro" class="erro"></p>
            </form>
            <p>Já tem conta? <a href="#" id="link-para-login">Entrar</a></p>
        </div>
    `;

    document.getElementById("link-para-login").addEventListener("click", (evento) => {
        evento.preventDefault();
        irParaTela("login");
    });

    document.getElementById("formulario-registro").addEventListener("submit", async (evento) => {
        evento.preventDefault();

        const nome = document.getElementById("campo-nome").value;
        const nomeDeUsuario = document.getElementById("campo-nome-de-usuario").value;
        const email = document.getElementById("campo-email-registro").value;
        const senha = document.getElementById("campo-senha-registro").value;

        try {
            const resposta = await registrar(nome, nomeDeUsuario, email, senha);
            salvarToken(resposta.token);
            usuarioLogadoId = resposta.user.id;
            irParaTela("feed");
        } catch (erro) {
            document.getElementById("mensagem-erro-registro").textContent = erro.message;
        }
    });
}

async function renderizarFeed() {
    const conteudo = document.getElementById("conteudo-principal");
    conteudo.innerHTML = "<p>Carregando...</p>";

    try {
        const posts = await buscarFeed();
        usuarioLogadoId = usuarioLogadoId || (await buscarMeuPerfil()).id;

        conteudo.innerHTML = `
            <div class="atalho-criar-post-feed">
                <div><strong>Compartilhe algo novo</strong><span>Crie uma publicação para o seu perfil.</span></div>
                <button type="button" id="atalho-criar-post-feed">＋ Criar post</button>
            </div>
            ${posts.map((post) => criarHtmlDoPost(post)).join("")}`;

        document.getElementById("atalho-criar-post-feed")?.addEventListener("click", () => irParaTela("criar-post"));

        ativarBotoesDoFeed(posts);
    } catch (erro) {
        conteudo.innerHTML = `<p class="erro">Erro ao carregar feed: ${erro.message}</p>`;
    }
}

function criarHtmlDoPost(post) {
    const jaCurtiu = (post.likes || []).some((like) => like.user_id === usuarioLogadoId);
    const inicial = (post.user?.username || "U").charAt(0).toUpperCase();

    return `
        <div class="post" data-post-id="${post.id}">
            <div class="post-cabecalho">
                <div class="avatar">${inicial}</div>
                <span class="post-username" data-user-id="${post.user.id}">${post.user.username}</span>
            </div>
            <img class="post-imagem" src="${urlDaImagem(post.image_path)}" alt="post">
            <div class="post-acoes">
                <button class="botao-curtir" data-post-id="${post.id}">
                    ${jaCurtiu ? "❤️" : "🤍"}
                </button>
                <button class="botao-comentarios" data-post-id="${post.id}">
                    💬
                </button>
            </div>
            <p class="post-likes-contagem">${(post.likes || []).length} curtidas</p>
            <p class="post-legenda"><strong>${post.user.username}</strong> ${post.caption || ""}</p>
        </div>
    `;
}

function ativarBotoesDoFeed(posts) {
   document.querySelectorAll(".botao-curtir").forEach((botao) => {
        botao.addEventListener("click", async () => {
            const idDoPost = botao.dataset.postId;

            try {
                await curtirPost(idDoPost);

                const jaEstavaCurtido = botao.textContent.includes("❤️");
                botao.textContent = jaEstavaCurtido ? "🤍" : "❤️";

                const contagem = botao.closest(".post").querySelector(".post-likes-contagem");
                const numeroAtual = parseInt(contagem.textContent) || 0;
                contagem.textContent = `${jaEstavaCurtido ? numeroAtual - 1 : numeroAtual + 1} curtidas`;
            } catch (erro) {
                console.error("Erro ao curtir post:", erro);
            }
        });
    });

    document.querySelectorAll(".botao-comentarios").forEach((botao) => {
        botao.addEventListener("click", () => {
            irParaTela("post", botao.dataset.postId);
        });
    });

    document.querySelectorAll(".post-username").forEach((elemento) => {
        elemento.addEventListener("click", () => {
            irParaTela("perfil", elemento.dataset.userId);
        });
    });
}

async function renderizarPost(idDoPost) {
    const conteudo = document.getElementById("conteudo-principal");
    conteudo.innerHTML = "<p>Carregando...</p>";

    try {
        const post = await buscarPost(idDoPost);
        const comentarios = await listarComentarios(idDoPost);
        usuarioLogadoId = usuarioLogadoId || (await buscarMeuPerfil()).id;

        const jaCurtiu = (post.likes || []).some((like) => like.user_id === usuarioLogadoId);
        const ehAutor = post.user.id === usuarioLogadoId;

        conteudo.innerHTML = `
            <div class="post-detalhe">
                <div class="post-detalhe-topo">
                    <span class="post-username" id="link-autor">${post.user.username}</span>
                    <button id="botao-fechar-post" class="botao-fechar">✕</button>
                </div>
                <img class="post-imagem" src="${urlDaImagem(post.image_path)}" alt="post">
                <p class="post-legenda"><strong>${post.user.username}</strong> ${post.caption || ""}</p>
                <div class="post-acoes">
                    <button id="botao-curtir-detalhe">
                        ${jaCurtiu ? "❤️ Descurtir" : "🤍 Curtir"} (${(post.likes || []).length})
                    </button>
                    ${ehAutor ? '<button id="botao-deletar-post">🗑️ Excluir post</button>' : ""}
                </div>

                <h3>Comentários</h3>
                <div id="lista-de-comentarios">
                    ${comentarios.map((comentario) => `
                        <p><strong>${comentario.user.username}</strong> ${comentario.body}</p>
                    `).join("")}
                </div>

                <form id="formulario-comentario">
                    <input type="text" id="campo-novo-comentario" placeholder="Adicione um comentário..." required>
                    <button type="submit">Enviar</button>
                </form>
            </div>
        `;

        document.getElementById("link-autor").addEventListener("click", () => {
            irParaTela("perfil", post.user.id);
        });

        document.getElementById("botao-fechar-post").addEventListener("click", () => {
            const destino = historicoAntesDoPost || { tela: "feed", parametro: undefined };
            irParaTela(destino.tela, destino.parametro);
        });

        document.getElementById("botao-curtir-detalhe").addEventListener("click", async () => {
            try {
                await curtirPost(idDoPost);
                renderizarPost(idDoPost);
            } catch (erro) {
                console.error("Erro ao curtir post:", erro);
            }
        });

        if (ehAutor) {
            document.getElementById("botao-deletar-post").addEventListener("click", async () => {
                if (confirm("Tem certeza que quer excluir esse post?")) {
                    try {
                        await deletarPost(idDoPost);
                        irParaTela("feed");
                    } catch (erro) {
                        alert(erro.message);
                    }
                }
            });
        }

        document.getElementById("formulario-comentario").addEventListener("submit", async (evento) => {
            evento.preventDefault();

            const texto = document.getElementById("campo-novo-comentario").value.trim();

            if (!texto) {
                return;
            }

            try {
                await comentarNoPost(idDoPost, texto);
                renderizarPost(idDoPost);
            } catch (erro) {
                alert(erro.message);
            }
        });
    } catch (erro) {
        conteudo.innerHTML = `<p class="erro">Erro ao carregar post: ${erro.message}</p>`;
    }
}

async function renderizarPerfil(idDoUsuario) {
    const conteudo = document.getElementById("conteudo-principal");
    conteudo.classList.add("tela-perfil-larga");
    conteudo.innerHTML = "<p>Carregando...</p>";

    try {
        usuarioLogadoId = usuarioLogadoId || (await buscarMeuPerfil()).id;

        const idAlvo = idDoUsuario || usuarioLogadoId;
        const usuario = await buscarUsuario(idAlvo);
        const ehMeuPerfil = usuario.id === usuarioLogadoId;

        const inicial = (usuario.username || usuario.name || "U").charAt(0).toUpperCase();

        const avatar = usuario.avatar_path
            ? `<img src="${urlDaImagem(usuario.avatar_path)}" alt="Avatar de ${usuario.username}">`
            : inicial;

        const seguidores = usuario.followers_count ?? 0;
        const seguindo = usuario.following_count ?? 0;

        conteudo.innerHTML = `
            <section class="perfil-moderno">
                <div class="perfil-topo">
                    <div class="perfil-avatar-grande">${avatar}</div>
                    <div class="perfil-dados">
                        <div class="perfil-linha-principal">
                            <h1>${usuario.username}</h1>
                            ${ehMeuPerfil
                                ? `<div class="perfil-botoes">
                                       <button id="botao-editar-perfil" class="botao-secundario">Editar perfil</button>
                                       <button id="botao-sair-perfil" class="botao-secundario">Sair</button>
                                   </div>`
                                : '<button id="botao-seguir-perfil" class="botao-seguir-perfil">Seguir</button>'}
                        </div>
                        <div class="perfil-estatisticas">
                            <span><strong>${(usuario.posts || []).length}</strong> posts</span>
                            <span><strong>${seguidores}</strong> seguidores</span>
                            <span><strong>${seguindo}</strong> seguindo</span>
                        </div>
                        <div class="perfil-identidade">
                            <strong>${usuario.name || ""}</strong>
                            <p>${usuario.bio || ""}</p>
                        </div>
                    </div>
                </div>

                ${ehMeuPerfil ? `
                    <div class="perfil-acao-post">
                        <button id="perfil-criar-post" class="botao-criar-post-grande">＋ Criar novo post</button>
                    </div>
                ` : ""}

                <div class="perfil-separador"></div>
                <div class="perfil-abas"><span class="perfil-aba ativa">▦ PUBLICAÇÕES</span></div>

                <div class="grade-posts perfil-grade">
                    ${usuario.posts?.length
                        ? usuario.posts.map((post) => `
                            <div class="perfil-post-item" data-post-id="${post.id}">
                                <img
                                    class="post-miniatura"
                                    src="${urlDaImagem(post.image_path)}"
                                    alt="Post de ${usuario.username}"
                                >
                            </div>
                        `).join("")
                        : '<div class="perfil-vazio"><div>▧</div><h3>Ainda não há publicações</h3><p>Crie seu primeiro post para começar.</p></div>'}
                </div>
            </section>
        `;

        document.querySelectorAll(".perfil-post-item").forEach((item) => {
            item.addEventListener("click", () => irParaTela("post", item.dataset.postId));
        });

        document.getElementById("perfil-criar-post")?.addEventListener("click", () => {
            irParaTela("criar-post");
        });

        document.getElementById("botao-seguir-perfil")?.addEventListener("click", async () => {
            const botao = document.getElementById("botao-seguir-perfil");

            try {
                await seguirUsuario(idAlvo);
                botao.textContent = "Seguindo";
                botao.disabled = true;
            } catch (erro) {
                try {
                    await deixarDeSeguirUsuario(idAlvo);
                    botao.textContent = "Seguir";
                    botao.disabled = false;
                } catch (erroSeguida) {
                    console.error("Erro ao seguir/deixar de seguir:", erroSeguida);
                }
            }

            renderizarPerfil(idAlvo);
        });

        document.getElementById("botao-editar-perfil")?.addEventListener("click", () => {
            abrirEditorDePerfil(usuario);
        });

        document.getElementById("botao-sair-perfil")?.addEventListener("click", async () => {
            await sair();
            usuarioLogadoId = null;
            irParaTela("login");
        });
    } catch (erro) {
        conteudo.innerHTML = `<p class="erro">Erro ao carregar perfil: ${erro.message}</p>`;
    }
}

function abrirEditorDePerfil(usuario) {
    const modal = document.createElement("div");
    modal.className = "modal-overlay";

    modal.innerHTML = `
        <div class="modal-card">
            <div class="modal-cabecalho">
                <h2>Editar perfil</h2>
                <button class="modal-fechar" type="button">×</button>
            </div>

            <form id="formulario-editar-perfil">
                <label>Nome</label>
                <input id="editar-nome" type="text" value="${usuario.name || ""}" required>

                <label>Username</label>
                <input id="editar-username" type="text" value="${usuario.username || ""}" required>

                <label>Bio</label>
                <textarea id="editar-bio" rows="4" maxlength="500" placeholder="Fale um pouco sobre você...">${usuario.bio || ""}</textarea>

                <label for="editar-avatar">Foto de perfil</label>
                <input
                    id="editar-avatar"
                    type="file"
                    accept="image/jpeg,image/png,image/webp">

                <span class="modal-ajuda">
                JPG, PNG ou WEBP — máximo 5 MB
                </span>

                <button class="modal-salvar" type="submit">Salvar alterações</button>

                <p id="mensagem-editar-perfil" class="erro"></p>
            </form>
        </div>
    `;

    document.body.appendChild(modal);

    const fechar = () => modal.remove();

    modal.querySelector(".modal-fechar").addEventListener("click", fechar);

    modal.addEventListener("click", (e) => {
        if (e.target === modal) {
            fechar();
        }
    });

    modal.querySelector("#formulario-editar-perfil").addEventListener("submit", async (e) => {
        e.preventDefault();

        const mensagem = modal.querySelector("#mensagem-editar-perfil");
        const botao = modal.querySelector(".modal-salvar");

        mensagem.textContent = "";
        botao.disabled = true;
        botao.textContent = "Salvando...";

        try {
            const formData = new FormData();

            formData.append(
                "name",
                modal.querySelector("#editar-nome").value.trim()
            );

            formData.append(
                "username",
                modal.querySelector("#editar-username").value.trim()
            );

            formData.append(
                "bio",
                modal.querySelector("#editar-bio").value.trim()
            );

            const arquivoAvatar = modal.querySelector("#editar-avatar").files[0];

            if (arquivoAvatar) {
                if (arquivoAvatar.size > 5 * 1024 * 1024) {
                    throw new Error("A imagem deve ter no máximo 5 MB.");
                }

                formData.append("avatar", arquivoAvatar);
            }

            await atualizarMeuPerfil(formData);

            fechar();
            renderizarPerfil(usuarioLogadoId);
        } catch (erro) {
            mensagem.textContent = erro.message;
            botao.disabled = false;
            botao.textContent = "Salvar alterações";
        }
    });
}

function renderizarCriarPost() {
    const conteudo = document.getElementById("conteudo-principal");
    conteudo.classList.add("tela-criar-post");

    conteudo.innerHTML = `
        <section class="criar-post-tela">
            <div class="criar-post-card">

                <div class="criar-post-cabecalho">
                    <div>
                        <span class="criar-post-kicker">NOVA PUBLICAÇÃO</span>
                        <h1>Criar post</h1>
                        <p>Compartilhe uma imagem com quem te segue.</p>
                    </div>

                    <button type="button" id="botao-fechar-criar-post" class="botao-fechar">✕</button>
                </div>

                <form id="formulario-criar-post" class="formulario-criar-post">

                    <label for="campo-imagem-post">
                        Foto da publicação
                    </label>

                    <input
                        id="campo-imagem-post"
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        required
                    >

                    <div id="preview-post" class="preview-post">
                        <span>A prévia da imagem aparecerá aqui</span>
                    </div>

                    <label for="campo-legenda-post">
                        Legenda
                    </label>

                    <textarea
                        id="campo-legenda-post"
                        rows="5"
                        maxlength="1000"
                        placeholder="Escreva uma legenda..."
                    ></textarea>

                    <div class="criar-post-acoes">
                        <button
                            type="button"
                            id="cancelar-criar-post"
                            class="botao-secundario"
                        >
                            Cancelar
                        </button>

                        <button
                            type="submit"
                            class="botao-publicar"
                        >
                            Publicar
                        </button>
                    </div>

                    <p id="mensagem-criar-post" class="erro"></p>

                </form>

            </div>
        </section>
    `;

    const campoImagem = document.getElementById("campo-imagem-post");
    const preview = document.getElementById("preview-post");

    campoImagem.addEventListener("change", () => {
    const arquivo = campoImagem.files[0];

    if (!arquivo) {
        preview.innerHTML = "<span>A prévia da imagem aparecerá aqui</span>";
        return;
    }

    const url = URL.createObjectURL(arquivo);

    preview.innerHTML = `<img src="${url}" alt="Prévia do post">`;
});

    document.getElementById("cancelar-criar-post").addEventListener("click", () => irParaTela("feed"));

    document.getElementById("botao-fechar-criar-post").addEventListener("click", () => irParaTela("feed"));

    document.getElementById("formulario-criar-post").addEventListener("submit", async (e) => {
        e.preventDefault();

        const mensagem = document.getElementById("mensagem-criar-post");
        mensagem.textContent = "";

        const botao = e.target.querySelector("button[type=submit]");
        botao.disabled = true;
        botao.textContent = "Publicando...";

        try {
            const arquivo = campoImagem.files[0];

            if (!arquivo) {
                throw new Error("Selecione uma imagem.");
            }

            await criarPost(
                document.getElementById("campo-legenda-post").value.trim(),
                arquivo
            );

            irParaTela("feed");
        } catch (erro) {
            mensagem.textContent = erro.message;
            botao.disabled = false;
            botao.textContent = "Publicar";
        }
    });
}

async function renderizarBusca() {
    const conteudo = document.getElementById("conteudo-principal");

    conteudo.innerHTML = `
        <div class="tela-busca">
            <input type="text" id="campo-busca" placeholder="Buscar por nome ou username...">
            <div id="resultados-busca"></div>
        </div>
    `;

    async function executarBusca() {
        const termo = document.getElementById("campo-busca").value;

        try {
            const usuarios = await buscarUsuarios(termo);
            const resultados = document.getElementById("resultados-busca");

            resultados.innerHTML = usuarios.map((usuario) => `
                <div class="resultado-usuario" data-user-id="${usuario.id}">
                    <strong>${usuario.username}</strong> — ${usuario.name || ""}
                </div>
            `).join("");

            resultados.querySelectorAll(".resultado-usuario").forEach((elemento) => {
                elemento.addEventListener("click", () => {
                    irParaTela("perfil", elemento.dataset.userId);
                });
            });
        } catch (erro) {
            document.getElementById("resultados-busca").innerHTML = `
                <p class="erro">Erro ao buscar usuários: ${erro.message}</p>
            `;
        }
    }

    document.getElementById("campo-busca").addEventListener("input", executarBusca);

    executarBusca();
}

async function renderizarBarraLateral() {
    const barraLateral = document.getElementById("barra-lateral");

    if (!barraLateral || !estaLogado()) {
        if (barraLateral) {
            barraLateral.innerHTML = "";
        }
        return;
    }

    try {
        if (!usuarioLogadoId) {
            usuarioLogadoId = (await buscarMeuPerfil()).id;
        }

        const meuPerfil = await buscarMeuPerfil();
        const usuarios = await buscarUsuarios("");

        const sugestoes = usuarios
            .filter((usuario) => usuario.id !== usuarioLogadoId)
            .slice(0, 5);

        const meuInicial = (meuPerfil.username || meuPerfil.name || "U").charAt(0).toUpperCase();

        const meuAvatar = meuPerfil.avatar_path
            ? `<img src="${urlDaImagem(meuPerfil.avatar_path)}" alt="Avatar de ${meuPerfil.username}">`
            : meuInicial;

        barraLateral.innerHTML = `
            <div class="sidebar-perfil">
                <div class="sidebar-perfil-avatar">${meuAvatar}</div>
                <div class="sidebar-perfil-info">
                    <span class="sidebar-perfil-username">${meuPerfil.username}</span>
                    <span class="sidebar-perfil-nome">${meuPerfil.name || "Usuário"}</span>
                    <span class="sidebar-ver-perfil" id="sidebar-ver-meu-perfil">Ver perfil</span>
                </div>
            </div>

            <div class="sidebar-card">
                <p class="sidebar-titulo">Sugestões para você</p>

                ${
                    sugestoes.length
                        ? sugestoes.map((usuario) => {
                            const inicial = usuario.username.charAt(0).toUpperCase();

                            const avatar = usuario.avatar_path
                                ? `<img src="${urlDaImagem(usuario.avatar_path)}" alt="Avatar de ${usuario.username}">`
                                : inicial;

                            return `
                                <div class="sidebar-usuario">
                                    <div class="sidebar-avatar">${avatar}</div>

                                    <div class="sidebar-info" data-user-id="${usuario.id}">
                                        <span class="sidebar-username">${usuario.username}</span>
                                        <span class="sidebar-nome">${usuario.name || "Usuário"}</span>
                                    </div>

                                    <button
                                        class="sidebar-seguir"
                                        data-user-id="${usuario.id}"
                                        type="button"
                                    >
                                        Seguir
                                    </button>
                                </div>
                            `;
                        }).join("")
                        : `<p class="sidebar-vazio">Não há novas sugestões no momento.</p>`
                }
            </div>
        `;

        document.getElementById("sidebar-ver-meu-perfil")?.addEventListener("click", () => {
            irParaTela("perfil", usuarioLogadoId);
        });

        barraLateral.querySelectorAll(".sidebar-info").forEach((elemento) => {
            elemento.addEventListener("click", () => {
                irParaTela("perfil", elemento.dataset.userId);
            });
        });

        barraLateral.querySelectorAll(".sidebar-seguir").forEach((botao) => {
            botao.addEventListener("click", async (evento) => {
                evento.stopPropagation();

                try {
                    await seguirUsuario(botao.dataset.userId);

                    botao.textContent = "Seguindo";
                    botao.disabled = true;
                    botao.style.color = "#8e8e8e";
                } catch (erro) {
                    console.error("Erro ao seguir usuário:", erro);
                }
            });
        });
    } catch (erro) {
        console.error("Erro ao carregar sugestões:", erro);
        barraLateral.innerHTML = "";
    }
}

if (estaLogado()) {
    irParaTela("feed");
} else {
    irParaTela("login");
}