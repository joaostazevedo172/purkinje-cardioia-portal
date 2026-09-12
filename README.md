# FIAP - Faculdade de Informática e Administração Paulista

<p align="center">
<a href= "https://www.fiap.com.br/"><img src="https://tse2.mm.bing.net/th/id/OIP.3xs_MSeNC0T1UOrJaCEqWAHaEK?cb=12&rs=1&pid=ImgDetMain&o=7&rm=3" alt="FIAP - Faculdade de Informática e Admnistração Paulista" border="0" width=40% height=40%></a>
</p>

<br>

# 💻 CardioIA — Ir Além 1: Portal Clínico

> **Grupo Purkinje** — portal responsivo em React + Vite que simula a rotina de um portal de diagnóstico em cardiologia, com autenticação simulada, rotas protegidas e gestão de estado por Context API.

<p align="center">
<a href="https://www.fiap.com.br/"><img src="https://avatars.githubusercontent.com/u/85091676?s=200" alt="FIAP" width="200"></a>
</p>

---

## 👨‍⚕️ Integrantes do Grupo
- Miriã Leal Mantovani (RM567811) — 2TIAOR-2026
- João Pedro Santos Azevedo (RM566701) — 2TIAOR-2026

## 👩‍🏫 Tutores
- Leonardo Ruiz Orabona

---

> ⚠️ **Aviso:** todos os dados exibidos são **simulados**. A autenticação é fictícia
> e não oferece segurança real. Nada aqui constitui orientação médica.

---

## 📑 Sumário
- [Vídeo de Demonstração](#-vídeo-de-demonstração)
- [Instalação e Execução](#-instalação-e-execução)
- [Credenciais de Acesso](#-credenciais-de-acesso)
- [O que o Portal Faz](#-o-que-o-portal-faz)
- [Arquitetura](#-arquitetura)
- [Decisões Técnicas](#-decisões-técnicas)
- [Estrutura de Pastas](#-estrutura-de-pastas)
- [Responsividade](#-responsividade-e-acessibilidade)
- [Limitações](#-limitações)

---

## 🎬 Vídeo de Demonstração

🎥 **Demo Ir Além 1 — Portal CardioIA** (até 4 min): `COLE_O_LINK_DO_YOUTUBE_AQUI`

---

## 🚀 Instalação e Execução

### Pré-requisitos

| Software | Versão mínima | Como verificar |
|---|---|---|
| **Node.js** | 18+ | `node -v` |
| **npm** | 9+ | `npm -v` |

### Passo a passo

```bash
git clone https://github.com/SEU_USUARIO/purkinje-cardioia-portal.git
cd purkinje-cardioia-portal

npm install      # ~1 a 3 minutos
npm run dev
```

O Vite abre o navegador automaticamente em **http://localhost:5173**.

### Outros comandos

```bash
npm run build     # gera a versão de produção em dist/
npm run preview   # serve a build localmente, para conferir antes de publicar
```

#### ✅ Verificação

O `npm run build` deve terminar com algo assim:

```
✓ 53 modules transformed.
dist/index.html                   0.53 kB │ gzip:  0.35 kB
dist/assets/index-*.css          12.51 kB │ gzip:  3.14 kB
dist/assets/index-*.js          189.21 kB │ gzip: 61.60 kB
✓ built in 3.11s
```

---

## 🔑 Credenciais de Acesso

A tela de login traz botões que preenchem os campos automaticamente — não é
preciso digitar nada durante a demonstração.

| Perfil | E-mail | Senha |
|---|---|---|
| Cardiologista | `medico@cardioia.com` | `cardio123` |
| Administrador | `admin@cardioia.com` | `admin123` |

---

## 🩺 O que o Portal Faz

### Login e sessão
Autenticação contra uma lista local de usuários, com atraso simulado de 600 ms
para que os estados de carregamento apareçam de verdade. Em caso de sucesso,
gera um **JWT falso** e o grava no `localStorage` com validade de 8 horas.

### Dashboard
Quatro indicadores no topo — pacientes cadastrados, consultas agendadas,
prioridade alta e consultas realizadas — mais a distribuição de pacientes por
risco cardiovascular e as próximas consultas da agenda. Traz também um painel
expansível que **decodifica o token da sessão**, mostrando o payload real do JWT.

### Pacientes
Lista consumida da API pública **JSONPlaceholder**, enriquecida com campos
clínicos derivados de forma determinística do `id` — assim o mesmo paciente
sempre tem os mesmos dados. Busca por nome, e-mail ou cidade, e filtro por nível
de risco.

### Agendamento
Formulário com validação de campos obrigatórios, bloqueio de datas passadas e
limite de caracteres na observação. A agenda ao lado atualiza na hora, e cada
consulta pode ser concluída ou cancelada.

### Proteção de rotas
Nenhuma página além do login renderiza sem sessão ativa. Tentar acessar
`/pacientes` deslogado redireciona para `/login` — e, após autenticar, o portal
leva de volta à página que você tentou abrir.

---

## 🏗️ Arquitetura

```
                        ┌──────────────┐
                        │ AuthProvider │  sessão, JWT, login/logout
                        └──────┬───────┘
                               │
                     ┌─────────▼──────────┐
                     │ ConsultasProvider  │  agenda compartilhada
                     └─────────┬──────────┘
                               │
          ┌────────────────────┼────────────────────┐
          │                    │                    │
    ┌─────▼─────┐      ┌───────▼───────┐    ┌───────▼───────┐
    │   Login   │      │ RotaProtegida │    │ RotaProtegida │
    │ (pública) │      │  → Dashboard  │    │  → Pacientes  │
    └───────────┘      └───────────────┘    └───────────────┘
```

### Por que dois contextos, e não um

| Contexto | Estado | Quem lê | Quem escreve |
|---|---|---|---|
| `AuthContext` | usuário, token, carregando, erro | Header, RotaProtegida, Dashboard, Login | Login, Header |
| `ConsultasContext` | lista de consultas e métricas derivadas | Dashboard, Agendamento | Agendamento |

São ciclos de vida diferentes. A sessão nasce no login e sobrevive ao recarregar
a página; a agenda vive só na memória da aplicação. Juntar os dois criaria um
contexto que renderiza consumidores de sessão toda vez que alguém agenda uma
consulta.

---

## 🧩 Decisões Técnicas

### `useReducer` no lugar de vários `useState`

Usado em três lugares — e em todos pelo mesmo motivo: **as transições envolvem
mais de um campo ao mesmo tempo**.

No `AuthContext`, entrar em "autenticando" precisa limpar o erro anterior;
"sucesso" precisa preencher usuário e token e zerar o erro; "sair" precisa
limpar tudo. Com quatro `useState` separados, é fácil esquecer um deles e deixar
um erro antigo na tela.

No formulário de agendamento, alterar um campo precisa apagar o erro **daquele
campo específico**, enviar precisa validar tudo junto e limpar precisa zerar o
formulário inteiro. O reducer concentra essas regras em um lugar só.

### `useMemo` nos valores de contexto

```jsx
const valor = useMemo(() => ({ ...estado, autenticado: Boolean(estado.token), entrar, sair }), [estado])
```

Sem isso, o objeto de contexto seria recriado a cada render do provider, e todo
componente que consome o contexto renderizaria de novo — mesmo sem nada ter
mudado de fato.

### `AbortController` nos efeitos de busca

```jsx
useEffect(() => {
  const controlador = new AbortController()
  listarPacientes({ signal: controlador.signal }).then(setPacientes)
  return () => controlador.abort()
}, [])
```

Se o usuário sair da página antes de a requisição terminar, o `fetch` é
cancelado. Sem isso, o React avisa sobre atualizar estado de componente
desmontado — e em `StrictMode`, que monta duas vezes em desenvolvimento, o aviso
aparece sempre.

### Estado de carregamento na rota protegida

`RotaProtegida` tem três estados, não dois. O terceiro — `carregando` — existe
porque ler o `localStorage` acontece dentro de um `useEffect`, ou seja, **depois**
do primeiro render. Sem esse estado, um usuário logado seria chutado para o login
a cada F5, no instante entre montar o provider e restaurar a sessão.

### JWT falso, e por que dizemos isso em voz alta

O token tem a estrutura correta de um JWT — `header.payload.signature` em
base64url — mas a assinatura é a string fixa `assinatura-simulada-cardioia`.
Qualquer back-end real rejeitaria na hora.

Isso é proposital, e o portal deixa explícito tanto na tela de login quanto no
painel de inspeção do token. Segurança de autenticação só existe quando o
servidor assina e valida; tudo que o front pode fazer é gerenciar a sessão.

### CSS Modules

Escolhemos CSS Modules em vez de Styled Components por dois motivos: zero
dependência adicional no bundle, e o escopo por arquivo já resolve o problema de
colisão de nomes. Os tokens de design — cores, raio de borda, sombra — ficam em
variáveis CSS no `global.css`, num ponto único de verdade.

---

## 📁 Estrutura de Pastas

```
purkinje-cardioia-portal/
│
├── index.html
├── package.json
├── vite.config.js
├── .gitignore
├── README.md
│
└── src/
    ├── main.jsx                      # ponto de entrada, BrowserRouter
    ├── App.jsx                       # providers, rotas e layout privado
    │
    ├── contexts/
    │   ├── AuthContext.jsx           # ⭐ sessão, JWT fake, login/logout
    │   └── ConsultasContext.jsx      # agenda compartilhada
    │
    ├── components/
    │   ├── RotaProtegida.jsx         # ⭐ guarda de rota
    │   ├── Header.jsx                # navegação e identificação
    │   ├── CardMetrica.jsx           # cartão de indicador
    │   └── Badge.jsx                 # etiqueta de risco/status
    │
    ├── pages/
    │   ├── Login.jsx                 # formulário de acesso
    │   ├── Dashboard.jsx             # métricas e visão geral
    │   ├── Pacientes.jsx             # listagem com busca e filtro
    │   └── Agendamento.jsx           # formulário + agenda
    │
    ├── services/
    │   ├── authService.js            # geração e leitura do JWT fake
    │   └── pacientesService.js       # consumo do JSONPlaceholder
    │
    └── styles/
        ├── global.css                # tokens de design
        └── *.module.css              # um módulo por componente
```

---

## 📱 Responsividade e Acessibilidade

**Responsividade** sem framework, só com CSS:

- Grades fluidas via `repeat(auto-fit, minmax(...))` — os cartões do dashboard se
  reorganizam sozinhos conforme a largura
- Em telas abaixo de 900 px, o agendamento passa de duas colunas para uma
- Abaixo de 720 px, a navegação quebra para uma linha própria e a identificação
  do usuário é ocultada
- A tabela de pacientes ganha rolagem horizontal em vez de espremer as colunas

**Acessibilidade:**

- `aria-label` nos campos de busca e filtro
- `role="alert"` nas mensagens de erro e `role="status"` nas de carregamento
- Foco visível para navegação por teclado (`:focus-visible`)
- `prefers-reduced-motion` desliga a animação de pulso do carregamento
- Contraste de texto acima de 4,5:1 em todas as combinações

---

## ⚠️ Limitações

- **A autenticação não protege nada.** É simulada por definição. Qualquer pessoa
  com o console do navegador pode gravar um token no `localStorage` e entrar.
- **Não há back-end.** As consultas agendadas vivem apenas na memória da
  aplicação e desaparecem ao recarregar a página. Persistir exigiria API real.
- **Os dados clínicos dos pacientes são derivados do `id`.** O JSONPlaceholder
  devolve usuários genéricos, sem informação médica; idade, pressão e risco são
  gerados de forma determinística para a demonstração.
- **Sem testes automatizados.** O escopo da atividade é a interface; uma suíte
  com Vitest e Testing Library seria o próximo passo natural.

---

## 🧰 Tecnologias Utilizadas

- **React 18** — biblioteca de interface
- **Vite 5** — bundler e servidor de desenvolvimento
- **React Router 6** — navegação e proteção de rotas
- **Context API + useReducer** — gestão de estado global
- **CSS Modules** — estilização com escopo por componente
- **JSONPlaceholder** — API pública de dados simulados

Nenhuma biblioteca de UI, de formulário ou de gerenciamento de estado externa.
Tudo o que aparece na tela foi escrito pelo grupo.

---

## 📜 Licença

<img style="height:22px!important;margin-left:3px;vertical-align:text-bottom;" src="https://mirrors.creativecommons.org/presskit/icons/cc.svg?ref=chooser-v1"><img style="height:22px!important;margin-left:3px;vertical-align:text-bottom;" src="https://mirrors.creativecommons.org/presskit/icons/by.svg?ref=chooser-v1"><p xmlns:cc="http://creativecommons.org/ns#" xmlns:dct="http://purl.org/dc/terms/"><a property="dct:title" rel="cc:attributionURL" href="https://github.com/agodoi/template">MODELO GIT FIAP</a> por <a rel="cc:attributionURL dct:creator" property="cc:attributionName" href="https://fiap.com.br">Fiap</a> está licenciado sob <a href="http://creativecommons.org/licenses/by/4.0/?ref=chooser-v1" target="_blank" rel="license noopener noreferrer" style="display:inline-block;">Attribution 4.0 International</a>.</p>

---

## 🙏 Agradecimentos

Ao tutor **Leonardo Ruiz Orabona**. O nome do grupo homenageia Jan Evangelista
Purkyně, que dá nome tanto às **fibras de Purkinje** — a rede de condução
elétrica do coração — quanto às **células de Purkinje**, neurônios do cerebelo.
