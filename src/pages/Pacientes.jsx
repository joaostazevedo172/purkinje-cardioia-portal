import { useEffect, useMemo, useState } from 'react'
import { listarPacientes } from '../services/pacientesService'
import Badge from '../components/Badge'
import estilos from '../styles/Pacientes.module.css'

export default function Pacientes() {
  const [pacientes, setPacientes] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState(null)
  const [busca, setBusca] = useState('')
  const [filtroRisco, setFiltroRisco] = useState('todos')

  // useEffect com AbortController: se o usuário sair da página antes de a
  // requisição terminar, cancelamos. Sem isso, o React avisa sobre atualizar
  // estado de componente desmontado.
  useEffect(() => {
    const controlador = new AbortController()

    listarPacientes({ signal: controlador.signal })
      .then((dados) => {
        setPacientes(dados)
        setErro(null)
      })
      .catch((e) => {
        if (e.name !== 'AbortError') setErro(e.message)
      })
      .finally(() => setCarregando(false))

    return () => controlador.abort()
  }, [])

  // useMemo evita refiltrar a lista inteira a cada tecla digitada em outro campo.
  const filtrados = useMemo(() => {
    const termo = busca.trim().toLowerCase()
    return pacientes.filter((p) => {
      const casaBusca = !termo
        || p.nome.toLowerCase().includes(termo)
        || p.email.toLowerCase().includes(termo)
        || p.cidade.toLowerCase().includes(termo)
      const casaRisco = filtroRisco === 'todos' || p.risco === filtroRisco
      return casaBusca && casaRisco
    })
  }, [pacientes, busca, filtroRisco])

  if (carregando) {
    return <p className={estilos.estado} role="status">Carregando pacientes...</p>
  }

  return (
    <section>
      <header className={estilos.topo}>
        <div>
          <h2>Pacientes</h2>
          <p className={estilos.subtitulo}>
            {filtrados.length} de {pacientes.length} registros
            {pacientes[0] && <> · fonte: {pacientes[0].origem}</>}
          </p>
        </div>

        <div className={estilos.filtros}>
          <input
            type="search"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar por nome, e-mail ou cidade"
            className={estilos.busca}
            aria-label="Buscar pacientes"
          />
          <select
            value={filtroRisco}
            onChange={(e) => setFiltroRisco(e.target.value)}
            className={estilos.select}
            aria-label="Filtrar por risco"
          >
            <option value="todos">Todos os riscos</option>
            <option value="Alto">Alto</option>
            <option value="Intermediário">Intermediário</option>
            <option value="Baixo">Baixo</option>
          </select>
        </div>
      </header>

      {erro && <p className={estilos.erro} role="alert">Falha ao carregar: {erro}</p>}

      <div className={estilos.tabelaEnvolvente}>
        <table className={estilos.tabela}>
          <thead>
            <tr>
              <th>Paciente</th>
              <th>Idade</th>
              <th>Condição</th>
              <th>PA</th>
              <th>FC</th>
              <th>Risco</th>
              <th>Última consulta</th>
            </tr>
          </thead>
          <tbody>
            {filtrados.map((p) => (
              <tr key={p.id}>
                <td>
                  <strong>{p.nome}</strong>
                  <small>{p.email}</small>
                  <small>{p.cidade} · {p.telefone}</small>
                </td>
                <td>{p.idade}</td>
                <td>{p.condicao}</td>
                <td>{p.pressao}</td>
                <td>{p.frequencia} bpm</td>
                <td><Badge>{p.risco}</Badge></td>
                <td>{p.ultimaConsulta}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {filtrados.length === 0 && (
          <p className={estilos.estado}>Nenhum paciente encontrado com esses filtros.</p>
        )}
      </div>
    </section>
  )
}
