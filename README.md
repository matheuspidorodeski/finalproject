# Instagram Clone

Projeto final do curso — clone do Instagram com backend em Laravel (API REST, padrão MSC) e frontend em HTML/CSS/JS puro.

## Tecnologias

- **Backend**: Laravel 13, PHP 8.4, MySQL 8
- **Frontend**: HTML, CSS, JavaScript puro (sem framework)
- **Autenticação**: Laravel Sanctum (tokens)
- **Infraestrutura**: Docker + Docker Compose

## Estrutura do projeto

projeto-instagram/
├── backend/ # API Laravel (Models, Services, Controllers)
└── frontend/ # HTML/CSS/JS puro consumindo a API


## Como rodar

### 1. Backend

```bash
cd backend
cp .env.example .env
docker compose up -d --build
docker compose exec api php artisan key:generate
docker compose exec api php artisan migrate --seed
```

A API sobe em `http://localhost:8000/api`.

### 2. Frontend

```bash
cd frontend
docker compose up -d --build
```

A aplicação sobe em `http://localhost:5500`.

## Usuários de teste (populados pelos seeders)

| Email | Senha |
|---|---|
| maria@teste.com | 123456 |
| joao@teste.com | 123456 |
| ana@teste.com | 123456 |

Também é possível criar uma conta nova pela tela de registro.

## Funcionalidades implementadas

- Registro, login e logout (autenticação via token/Sanctum)
- Feed com posts, autor, legenda e curtidas
- Curtir e descurtir posts
- Comentar em posts
- Exclusão de posts (somente pelo autor)
- Perfil próprio e de outros usuários, com grade de posts
- Seguir e deixar de seguir usuários
- Busca de usuários por nome ou username
- Navegação entre Home, Search e Profile

## Arquitetura do backend (MSC)

- **Models** (`app/Models`): representam as tabelas e seus relacionamentos (User, Post, Comment, Like, Follow)
- **Services** (`app/Services`): concentram as regras de negócio — ex.: só o autor pode excluir seu próprio post, um usuário não pode seguir a si mesmo, um like é único por usuário/post
- **Controllers** (`app/Http/Controllers/Api`): recebem as requisições, delegam a lógica aos Services e devolvem as respostas HTTP

Autenticação: o login gera um token (Sanctum), que o frontend envia no header `Authorization: Bearer <token>` em toda requisição subsequente. Um middleware valida esse token antes de qualquer rota protegida ser executada — todas as rotas exigem autenticação, exceto registro e login.

## Principais relacionamentos

| Relação | Tipo |
|---|---|
| User → Post | 1:N |
| Post → Comment | 1:N |
| User ↔ Post (curtidas) | N:N, via tabela `likes` |
| User ↔ User (seguidores) | N:N autorreferente, via tabela `follows` |

## Rotas da API

POST /api/register
POST /api/login
POST /api/logout
GET /api/me
PUT /api/me
GET /api/users
GET /api/users/{id}
POST /api/users/{id}/follow
DELETE /api/users/{id}/follow
GET /api/posts
POST /api/posts
GET /api/posts/{id}
DELETE /api/posts/{id}
POST /api/posts/{id}/like
GET /api/posts/{id}/comments
POST /api/posts/{id}/comments