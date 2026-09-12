import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import estilos from '../styles/Header.module.css'

const LINKS = [
  { para: '/', rotulo: 'Dashboard', fim: true },
  { para: '/pacientes', rotulo: 'Pacientes' },
  { para: '/agendamento', rotulo: 'Agendamento' },
]

export default function Header() {
  const { usuario, sair } = useAuth()
  const navegar = useNavigate()

  function encerrar() {
    sair()
    navegar('/login', { replace: true })
  }

  return (
    <header className={estilos.cabecalho}>
      <div className={estilos.marca}>
        <span className={estilos.coracao} aria-hidden="true">♥</span>
        <div>
          <strong>CardioIA</strong>
          <small>Portal Clínico</small>
        </div>
      </div>

      <nav className={estilos.navegacao} aria-label="Navegação principal">
        {LINKS.map(({ para, rotulo, fim }) => (
          <NavLink
            key={para}
            to={para}
            end={fim}
            className={({ isActive }) => (isActive ? `${estilos.link} ${estilos.ativo}` : estilos.link)}
          >
            {rotulo}
          </NavLink>
        ))}
      </nav>

      <div className={estilos.usuario}>
        <div className={estilos.identificacao}>
          <strong>{usuario?.nome}</strong>
          <small>{usuario?.papel}</small>
        </div>
        <button type="button" onClick={encerrar} className={estilos.sair}>
          Sair
        </button>
      </div>
    </header>
  )
}
