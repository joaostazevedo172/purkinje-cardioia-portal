import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import estilos from '../styles/Layout.module.css'

/**
 * RotaProtegida — envolve qualquer rota que exija sessão ativa.
 *
 * Três estados possíveis:
 *  - carregando: ainda lendo o localStorage. Precisa de um estado próprio,
 *    senão o usuário logado seria redirecionado para o login a cada F5, no
 *    instante entre montar o provider e restaurar a sessão.
 *  - sem sessão: redireciona para /login guardando de onde veio, para voltar
 *    ao destino original depois de autenticar.
 *  - autenticado: renderiza os filhos.
 */
export default function RotaProtegida({ children }) {
  const { autenticado, carregando } = useAuth()
  const local = useLocation()

  if (carregando) {
    return (
      <div className={estilos.carregando} role="status" aria-live="polite">
        <span className={estilos.pulso} aria-hidden="true" />
        Verificando sessão...
      </div>
    )
  }

  if (!autenticado) {
    return <Navigate to="/login" state={{ de: local.pathname }} replace />
  }

  return children
}
