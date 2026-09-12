# 🎬 Roteiro do Vídeo — Ir Além 1: Portal CardioIA

**Formato:** gravação de tela com voz em off
**Duração alvo:** 4 minutos (limite do enunciado) · ~560 palavras de fala
**Publicação:** YouTube como **"Não listado"** — link no README

---

## ✅ Antes de apertar REC

- [ ] `npm run dev` já rodando, navegador aberto em `http://localhost:5173`
- [ ] **Deslogado** — abra o DevTools, aba Application → Local Storage → apague `cardioia.sessao`
- [ ] VS Code aberto com `src/contexts/AuthContext.jsx` e `src/pages/Agendamento.jsx`
- [ ] Modo Não Perturbe ligado, notificações fechadas
- [ ] Zoom do navegador em 100%, gravação em 1920×1080
- [ ] Feche abas pessoais

> 💡 Deixe o DevTools aberto na aba **Application** desde o começo. Você vai
> precisar dele duas vezes, e abrir no meio da gravação atrapalha o ritmo.

---

## 🎙️ Roteiro

### 🕐 0:00 – 0:20 | Abertura

**🖥️ TELA:** tela de login do portal.

**🎙️ FALA:**

> "Oi! João Pedro e Miriã Leal, grupo Purkinje. Este é o Ir Além 1 do CardioIA:
> um portal clínico em React com Vite.
>
> Autenticação simulada por Context API, rotas protegidas, consumo de API e
> gestão de estado com Hooks. Vou mostrar funcionando e explicar as decisões
> por trás."

---

### 🕐 0:20 – 1:00 | Rotas protegidas — antes do login

**🖥️ TELA:** na barra de endereço, digite `localhost:5173/pacientes` e dê Enter.
O portal redireciona para `/login`. Depois clique no botão **Cardiologista** e em **Entrar**.

**🎙️ FALA:**

> "Primeiro a proteção de rota. Estou deslogado e vou tentar acessar a página de
> pacientes direto pela URL.
>
> Fui redirecionado para o login — e o portal guardou de onde eu vim. Repara agora:
> eu entro com o perfil de cardiologista... e ele me leva para a página de pacientes,
> não para a home. O destino original foi preservado no state da navegação.
>
> Essa guarda é um componente chamado RotaProtegida, que envolve todas as rotas
> privadas e consulta o AuthContext antes de renderizar qualquer coisa."

---

### 🕐 1:00 – 1:45 | Dashboard e o token de sessão

**🖥️ TELA:** dashboard carregado. Role até o final e expanda **"Inspecionar o token de sessão"**.
Depois abra o DevTools → Application → Local Storage → `cardioia.sessao`.

**🎙️ FALA:**

> "O dashboard agrega dados de dois contextos diferentes: pacientes, que vêm da
> API, e consultas, que vêm do contexto da agenda.
>
> E aqui embaixo eu decodifico o token da sessão. Esse é um JWT de verdade na
> estrutura — header, payload e assinatura em base64url — com o e-mail, o papel
> e a expiração.
>
> Mas repara na assinatura: 'assinatura-simulada-cardioia'. É uma string fixa.
> Qualquer back-end real rejeitaria esse token na hora, e isso é proposital.
> Segurança de autenticação só existe quando o servidor assina e valida — tudo
> que o front pode fazer é gerenciar a sessão. O portal deixa isso explícito em
> dois lugares da interface, porque achamos importante não fingir o que não é.
>
> Aqui no localStorage está a sessão persistida, com validade de oito horas."

---

### 🕐 1:45 – 2:20 | Pacientes — consumo de API

**🖥️ TELA:** vá para **Pacientes**. Digite algo na busca. Troque o filtro de risco.

**🎙️ FALA:**

> "A listagem consome o JSONPlaceholder, a API pública sugerida no enunciado.
> Como ela devolve usuários genéricos, sem nada clínico, eu enriqueço cada
> registro com idade, pressão, frequência e risco — derivados do id de forma
> determinística, então o mesmo paciente sempre tem os mesmos dados.
>
> A busca e o filtro rodam sobre a lista já carregada, com useMemo, para não
> refiltrar tudo a cada tecla digitada.
>
> E se a API cair, o serviço tem uma base local de fallback — a demonstração
> nunca quebra por falta de internet."

---

### 🕐 2:20 – 3:10 | Agendamento — useReducer na prática

**🖥️ TELA:** vá para **Agendamento**. Clique em **Agendar** com o formulário vazio
para mostrar os erros. Depois preencha e envie. Mostre a consulta aparecendo na
agenda ao lado. Alterne para o VS Code no `Agendamento.jsx`.

**🎙️ FALA:**

> "O formulário usa useReducer, e vale explicar por quê.
>
> Olha o que acontece se eu enviar vazio: três erros de uma vez. E quando eu
> preencho um campo, só o erro daquele campo some. Enviar valida tudo junto,
> limpar zera tudo de uma vez.
>
> São transições que envolvem mais de um pedaço do estado ao mesmo tempo. Com
> seis useState separados, isso viraria seis chamadas espalhadas pelo componente,
> fáceis de esquecer. O reducer concentra todas essas regras aqui, num lugar só.
>
> Agora eu agendo... e a consulta aparece na agenda imediatamente, porque as duas
> colunas leem do mesmo ConsultasContext. O dashboard também já contabilizou."

---

### 🕐 3:10 – 3:40 | Responsividade e organização

**🖥️ TELA:** abra o DevTools no modo dispositivo (Ctrl+Shift+M) e alterne para
largura de celular. Navegue entre duas páginas. Depois mostre a árvore de pastas no VS Code.

**🎙️ FALA:**

> "A responsividade é feita só com CSS Modules, sem framework. Em tela pequena o
> agendamento vira uma coluna só, a navegação quebra para uma linha própria e a
> tabela de pacientes ganha rolagem horizontal em vez de espremer as colunas.
>
> E a organização segue o que o enunciado pediu: contexts, components, services
> e pages. Os serviços isolam tudo que é externo — a API e a geração do token — 
> então trocar o JSONPlaceholder por um back-end real mexeria em um arquivo só."

---

### 🕐 3:40 – 4:00 | Fechamento

**🖥️ TELA:** clique em **Sair** e mostre o redirecionamento para o login.

**🎙️ FALA:**

> "Ao sair, o token é removido do localStorage e as rotas protegidas voltam a
> bloquear o acesso.
>
> Nenhuma biblioteca de UI, de formulário ou de estado externa: tudo que aparece
> na tela foi escrito pelo grupo, com React, Router e CSS Modules.
>
> Obrigado!"

---

## 🎞️ Depois de gravar

- [ ] Corte silêncios e erros de fala
- [ ] Confirme que o vídeo tem **no máximo 4 minutos**
- [ ] Verifique que nenhum dado pessoal aparece na tela
- [ ] Suba no YouTube como **"Não listado"**
- [ ] Título: `CardioIA — Ir Além 1: Portal Clínico em React | FIAP 2TIAOR-2026`
- [ ] Descrição:
  ```
  Ir Além 1 do projeto CardioIA — FIAP, Graduação em IA.
  Portal clínico em React + Vite com autenticação simulada via Context API,
  rotas protegidas, consumo de API e gestão de estado com useReducer.

  Grupo Purkinje
  Integrantes: Miriã Leal Mantovani (RM567811) e João Pedro Santos Azevedo (RM566701)
  Turma: 2TIAOR-2026 | Tutor: Leonardo Ruiz Orabona
  Repositório: https://github.com/SEU_USUARIO/purkinje-cardioia-portal

  00:00 Abertura
  00:20 Proteção de rotas
  01:00 Dashboard e inspeção do token JWT
  01:45 Consumo da API de pacientes
  02:20 Formulário com useReducer
  03:10 Responsividade e organização
  03:40 Fechamento

  Dados simulados. Autenticação fictícia, sem segurança real.
  ```
- [ ] Cole o link no README e dê `git push`

---

## 💡 Se estourar os 4 minutos

Corte nesta ordem:

1. O fallback da API no bloco 1:45
2. A parte da organização de pastas no bloco 3:10
3. A abertura — comece direto tentando acessar `/pacientes`

**Nunca corte** o bloco 0:20 (proteção de rota), o 1:00 (token JWT) nem o 2:20
(useReducer). São os três critérios de avaliação explícitos do enunciado.
