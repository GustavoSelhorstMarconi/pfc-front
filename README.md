# PFC — Personal Finance Control (Frontend)

Interface web do sistema de controle financeiro pessoal, construída com Vue 3 e TypeScript.

## Tecnologias

- **Vue 3** + TypeScript
- **Vite** (bundler)
- **Pinia** (gerenciamento de estado)
- **Vue Router** (roteamento)
- **Axios** (HTTP client com interceptors JWT)
- **ApexCharts** (gráficos do dashboard)
- **Vue Sonner** (notificações toast)

## Pré-requisitos

- Node.js 18+
- npm ou pnpm

## Instalação e execução

```bash
# Clone o repositório
git clone <url-do-repositorio>
cd pfc-front

# Instale as dependências
npm install

# Configure as variáveis de ambiente
cp .env.example .env
# Edite o .env com a URL da API

# Inicie o servidor de desenvolvimento
npm run dev
```

A aplicação estará disponível em `http://localhost:5173`.

## Variáveis de ambiente

Crie um arquivo `.env` na raiz do projeto:

```env
VITE_API_BASE_URL=https://localhost:7014/api
```

## Scripts disponíveis

| Comando | Descrição |
|---------|-----------|
| `npm run dev` | Inicia o servidor de desenvolvimento |
| `npm run build` | Gera build de produção com type-check |
| `npm run build-only` | Gera build sem type-check |
| `npm run lint` | Executa linting com ESLint e Oxlint |
| `npm run format` | Formata o código com Prettier |

## Funcionalidades

- **Autenticação** — Login, registro e renovação automática de token JWT
- **Dashboard** — Resumo financeiro, histórico de receitas/despesas, evolução de investimentos e breakdown por categoria
- **Transações** — Listagem, criação, edição e importação via CSV/OFX
- **Contas** — Gerenciamento de contas bancárias e de investimento
- **Categorias** — Criação e edição de categorias de transação
- **Recorrências** — Transações recorrentes e geração automática de lançamentos
- **Metas** — Acompanhamento de metas financeiras
- **Dívidas** — Controle de dívidas

## Estrutura do projeto

```
src/
├── core/           # Axios, config de ambiente
├── modules/        # Módulos de funcionalidade (auth, transactions, etc.)
├── router/         # Configuração de rotas com guard de autenticação
├── shared/         # Componentes e utilitários compartilhados
├── stores/         # Stores Pinia (auth)
└── views/          # Layout principal
```
