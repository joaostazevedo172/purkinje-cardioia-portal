import { createContext, useContext, useEffect, useMemo, useReducer } from 'react'
import { autenticar } from '../services/authService'

/**
 * AuthContext — autenticação simulada do portal.
 *
 * O estado de sessão é global por natureza: o cabeçalho precisa saber quem está
 * logado, as rotas protegidas precisam saber se há sessão, e a página de login
 * precisa poder criá-la. Passar isso por props atravessaria a árvore inteira,
 * então Context API é a ferramenta certa aqui.
 *
 * A sessão é persistida no localStorage com um JWT FALSO — assinado com uma
 * string fixa, apenas para exercitar o fluxo. Em produção o token viria de um
 * back-end e jamais seria gerado no cliente.
 */

const AuthContext = createContext(null)

const CHAVE_STORAGE = 'cardioia.sessao'

const estadoInicial = {
  usuario: null,
  token: null,
  carregando: true, // true até terminarmos de ler o localStorage
  erro: null,
}

/**
 * useReducer em vez de vários useState porque as transições de autenticação são
 * uma máquina de estados: entrar em "autenticando" precisa limpar o erro
 * anterior; "sucesso" precisa preencher usuário e token e zerar o erro; "sair"
 * precisa limpar tudo. Com useState separados, é fácil esquecer um deles.
 */
function reducer(estado, acao) {
  switch (acao.tipo) {
    case 'RESTAURANDO':
      return { ...estado, carregando: true }
    case 'SESSAO_RESTAURADA':
      return { usuario: acao.usuario, token: acao.token, carregando: false, erro: null }
    case 'SEM_SESSAO':
      return { ...estadoInicial, carregando: false }
    case 'AUTENTICANDO':
      return { ...estado, carregando: true, erro: null }
    case 'LOGIN_OK':
      return { usuario: acao.usuario, token: acao.token, carregando: false, erro: null }
    case 'LOGIN_ERRO':
      return { ...estadoInicial, carregando: false, erro: acao.erro }
    case 'LOGOUT':
      return { ...estadoInicial, carregando: false }
    default:
      throw new Error(`Ação de autenticação desconhecida: ${acao.tipo}`)
  }
}

export function AuthProvider({ children }) {
  const [estado, dispatch] = useReducer(reducer, estadoInicial)

  // Restaura a sessão ao montar. Sem isso, um F5 derrubaria o usuário.
  useEffect(() => {
    try {
      const bruto = localStorage.getItem(CHAVE_STORAGE)
      if (!bruto) return dispatch({ tipo: 'SEM_SESSAO' })

      const { token, usuario, expiraEm } = JSON.parse(bruto)
      if (Date.now() > expiraEm) {
        localStorage.removeItem(CHAVE_STORAGE)
        return dispatch({ tipo: 'SEM_SESSAO' })
      }
      dispatch({ tipo: 'SESSAO_RESTAURADA', usuario, token })
    } catch {
      localStorage.removeItem(CHAVE_STORAGE)
      dispatch({ tipo: 'SEM_SESSAO' })
    }
  }, [])

  async function entrar(email, senha) {
    dispatch({ tipo: 'AUTENTICANDO' })
    try {
      const { token, usuario, expiraEm } = await autenticar(email, senha)
      localStorage.setItem(CHAVE_STORAGE, JSON.stringify({ token, usuario, expiraEm }))
      dispatch({ tipo: 'LOGIN_OK', usuario, token })
      return { ok: true }
    } catch (e) {
      dispatch({ tipo: 'LOGIN_ERRO', erro: e.message })
      return { ok: false, erro: e.message }
    }
  }

  function sair() {
    localStorage.removeItem(CHAVE_STORAGE)
    dispatch({ tipo: 'LOGOUT' })
  }

  // useMemo evita recriar o objeto de contexto a cada render do provider, o que
  // faria todos os componentes consumidores renderizarem de novo sem necessidade.
  const valor = useMemo(
    () => ({ ...estado, autenticado: Boolean(estado.token), entrar, sair }),
    [estado],
  )

  return <AuthContext.Provider value={valor}>{children}</AuthContext.Provider>
}

/** Hook de acesso ao contexto, com guarda contra uso fora do provider. */
export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth precisa estar dentro de <AuthProvider>')
  return ctx
}
