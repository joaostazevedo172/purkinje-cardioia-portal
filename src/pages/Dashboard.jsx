import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useConsultas } from '../contexts/ConsultasContext'
import { listarPacientes } from '../services/pacientesService'
import { lerPayload } from '../services/authService'
import CardMetrica from '../components/CardMetrica'
import Badge from '../components/Badge'
import estilos from '../styles/Dashboard.module.css'

export default function Dashboard() {
  const { usuario, token } = useAuth()
  const { consultas, metricas } = useConsultas()
  const [pacientes, setPacientes] = useState([])
  const [carregando, setCarregando] = useState(true)

  useEffect(() => {
    const controlador = new AbortController()
    listarPacientes({ signal: controlador.signal })
      .then(setPacientes)
      .catch((e) => { if (e.name !== 'AbortError') console.error(e) })
      .finally(() => setCarregando(false))
    return () => controlador.abort()
  }, [])

  const porRisco = useMemo(() => {
    const conta = { Alto: 0, Intermediário: 0, Baixo: 0 }
    pacientes.forEach((p) => { conta[p.risco] += 1 })
    return conta
  }, [pacientes])

  const proximas = useMemo(
    () => consultas
      .filter((c) => c.status === 'agendada')
      .sort((a, b) => `${a.data}${a.hora}`.localeCompare(`${b.data}${b.hora}`))
      .slice(0, 4),
    [consultas],
  )

  const payload = useMemo(() => (token ? lerPayload(token) : null), [token])
  const total = pacientes.length || 1

  return (
    <section>
      <header className={estilos.saudacao}>
        <h2>Olá, {usuario?.nome?.split(' ').slice(0, 2).join(' ')}</h2>
        <p>Visão geral do atendimento — {new Date().toLocaleDateString('pt-BR', { dateStyle: 'long' })}</p>
      </header>

      <div className={estilos.grade}>
        <CardMetrica
          rotulo="Pacientes cadastrados"
          valor={carregando ? '—' : pacientes.length}
          detalhe={carregando ? 'carregando...' : `${porRisco.Alto} de risco alto`}
        />
        <CardMetrica rotulo="Consultas agendadas" valor={metricas.agendadas} detalhe={`${metricas.total} no total`} />
        <CardMetrica rotulo="Prioridade alta" valor={metricas.prioridadeAlta} detalhe="aguardando atendimento" destaque />
        <CardMetrica rotulo="Consultas realizadas" valor={metricas.realizadas} detalhe={`${metricas.canceladas} canceladas`} />
      </div>

      <div className={estilos.painel}>
        <article className={estilos.bloco}>
          <h3>Distribuição por risco cardiovascular</h3>
          {carregando ? (
            <p className={estilos.vazio}>Carregando...</p>
          ) : (
            <ul className={estilos.barras}>
              {Object.entries(porRisco).map(([nivel, qtd]) => (
                <li key={nivel}>
                  <div className={estilos.barraTopo}>
                    <Badge>{nivel}</Badge>
                    <span>{qtd} pacientes</span>
                  </div>
                  <div className={estilos.barraTrilho}>
                    <div
                      className={`${estilos.barraPreenchida} ${estilos[`risco${nivel.charAt(0)}`] ?? ''}`}
                      style={{ width: `${(qtd / total) * 100}%` }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          )}
          <Link to="/pacientes" className={estilos.link}>Ver todos os pacientes →</Link>
        </article>

        <article className={estilos.bloco}>
          <h3>Próximas consultas</h3>
          {proximas.length === 0 ? (
            <p className={estilos.vazio}>Nenhuma consulta agendada.</p>
          ) : (
            <ul className={estilos.consultas}>
              {proximas.map((c) => (
                <li key={c.id}>
                  <div>
                    <strong>{c.paciente}</strong>
                    <small>{c.data} às {c.hora} · {c.tipo}</small>
                  </div>
                  <Badge>{c.prioridade}</Badge>
                </li>
              ))}
            </ul>
          )}
          <Link to="/agendamento" className={estilos.link}>Ir para a agenda →</Link>
        </article>
      </div>

      {payload && (
        <details className={estilos.tokenBox}>
          <summary>Inspecionar o token de sessão</summary>
          <p className={estilos.tokenAviso}>
            Token <strong>simulado</strong>: gerado no navegador com assinatura fixa.
            Serve para demonstrar o fluxo, não para proteger nada.
          </p>
          <pre>{JSON.stringify(payload, null, 2)}</pre>
        </details>
      )}
    </section>
  )
}
