import { useState } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { CREDENCIAIS_DEMO } from '../services/authService'
import estilos from '../styles/Login.module.css'

export default function Login() {
  const { entrar, autenticado, carregando, erro } = useAuth()
  const navegar = useNavigate()
  const local = useLocation()

  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [enviando, setEnviando] = useState(false)

  // Quem já está logado não precisa ver o login. Volta para o destino original,
  // se veio de uma rota protegida.
  if (autenticado) return <Navigate to={local.state?.de ?? '/'} replace />

  async function aoEnviar(evento) {
    evento.preventDefault()
    setEnviando(true)
    const { ok } = await entrar(email, senha)
    setEnviando(false)
    if (ok) navegar(local.state?.de ?? '/', { replace: true })
  }

  function preencher(credencial) {
    setEmail(credencial.email)
    setSenha(credencial.senha)
  }

  return (
    <main className={estilos.pagina}>
      <section className={estilos.cartao}>
        <div className={estilos.marca}>
          <span className={estilos.coracao} aria-hidden="true">♥</span>
          <h1>CardioIA</h1>
          <p>Portal Clínico — acesso restrito à equipe assistencial</p>
        </div>

        <form onSubmit={aoEnviar} className={estilos.formulario}>
          <label className={estilos.campo}>
            <span>E-mail</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu.email@cardioia.com"
              autoComplete="username"
              required
            />
          </label>

          <label className={estilos.campo}>
            <span>Senha</span>
            <input
              type="password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              placeholder="••••••••"
              autoComplete="current-password"
              required
            />
          </label>

          {erro && (
            <p className={estilos.erro} role="alert">
              {erro}
            </p>
          )}

          <button type="submit" className={estilos.botao} disabled={enviando || carregando}>
            {enviando ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        <div className={estilos.demo}>
          <p className={estilos.demoTitulo}>Credenciais de demonstração</p>
          {CREDENCIAIS_DEMO.map((c) => (
            <button key={c.email} type="button" className={estilos.demoBotao} onClick={() => preencher(c)}>
              <strong>{c.papel}</strong>
              <code>{c.email} · {c.senha}</code>
            </button>
          ))}
          <p className={estilos.aviso}>
            Autenticação simulada. O token JWT é gerado no navegador com assinatura
            fixa e serve apenas para exercitar o fluxo de sessão.
          </p>
        </div>
      </section>
    </main>
  )
}
