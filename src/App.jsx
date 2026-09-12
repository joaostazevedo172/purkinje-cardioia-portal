import { Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { ConsultasProvider } from './contexts/ConsultasContext'
import RotaProtegida from './components/RotaProtegida'
import Header from './components/Header'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Pacientes from './pages/Pacientes'
import Agendamento from './pages/Agendamento'
import estilos from './styles/Layout.module.css'

/**
 * Layout das rotas autenticadas: cabeçalho fixo + conteúdo.
 * Fica dentro de <RotaProtegida>, então só renderiza com sessão ativa.
 */
function LayoutPrivado({ children }) {
  return (
    <div className={estilos.aplicacao}>
      <Header />
      <main className={estilos.conteudo}>{children}</main>
      <footer className={estilos.rodape}>
        CardioIA · Grupo Purkinje · FIAP 2TIAOR-2026 — dados simulados, sem valor clínico
      </footer>
    </div>
  )
}

const protegida = (pagina) => (
  <RotaProtegida>
    <LayoutPrivado>{pagina}</LayoutPrivado>
  </RotaProtegida>
)

export default function App() {
  return (
    <AuthProvider>
      <ConsultasProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={protegida(<Dashboard />)} />
          <Route path="/pacientes" element={protegida(<Pacientes />)} />
          <Route path="/agendamento" element={protegida(<Agendamento />)} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </ConsultasProvider>
    </AuthProvider>
  )
}
