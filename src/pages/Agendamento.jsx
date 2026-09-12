import { useEffect, useReducer, useState } from 'react'
import { useConsultas } from '../contexts/ConsultasContext'
import { listarPacientes } from '../services/pacientesService'
import Badge from '../components/Badge'
import estilos from '../styles/Agendamento.module.css'

/**
 * O formulário usa useReducer, e não vários useState, por um motivo concreto:
 * os campos não são independentes. Enviar precisa validar tudo junto, limpar
 * precisa zerar tudo de uma vez, e cada alteração precisa apagar o erro daquele
 * campo específico. Com seis useState separados isso viraria seis chamadas
 * espalhadas e fáceis de esquecer.
 */

const FORM_VAZIO = {
  paciente: '',
  pacienteId: null,
  data: '',
  hora: '',
  tipo: 'Consulta de retorno',
  prioridade: 'Normal',
  observacao: '',
}

const estadoInicial = { valores: FORM_VAZIO, erros: {}, enviado: false }

function reducer(estado, acao) {
  switch (acao.tipo) {
    case 'ALTERAR_CAMPO': {
      const { erros } = estado
      const { [acao.campo]: _removido, ...errosRestantes } = erros
      return {
        ...estado,
        valores: { ...estado.valores, [acao.campo]: acao.valor },
        erros: errosRestantes,
        enviado: false,
      }
    }
    case 'SELECIONAR_PACIENTE':
      return {
        ...estado,
        valores: { ...estado.valores, paciente: acao.nome, pacienteId: acao.id },
        erros: { ...estado.erros, paciente: undefined },
        enviado: false,
      }
    case 'ERROS':
      return { ...estado, erros: acao.erros, enviado: false }
    case 'SUCESSO':
      return { valores: FORM_VAZIO, erros: {}, enviado: true }
    case 'LIMPAR':
      return estadoInicial
    default:
      throw new Error(`Ação de formulário desconhecida: ${acao.tipo}`)
  }
}

function validar(v) {
  const erros = {}
  if (!v.paciente) erros.paciente = 'Selecione um paciente.'
  if (!v.data) erros.data = 'Informe a data.'
  else if (v.data < new Date().toISOString().slice(0, 10)) erros.data = 'A data não pode estar no passado.'
  if (!v.hora) erros.hora = 'Informe o horário.'
  if (v.observacao.length > 200) erros.observacao = 'Máximo de 200 caracteres.'
  return erros
}

export default function Agendamento() {
  const { consultas, agendar, cancelar, concluir, metricas } = useConsultas()
  const [estado, dispatch] = useReducer(reducer, estadoInicial)
  const [pacientes, setPacientes] = useState([])

  useEffect(() => {
    const controlador = new AbortController()
    listarPacientes({ signal: controlador.signal })
      .then(setPacientes)
      .catch((e) => { if (e.name !== 'AbortError') console.error(e) })
    return () => controlador.abort()
  }, [])

  function aoEnviar(evento) {
    evento.preventDefault()
    const erros = validar(estado.valores)
    if (Object.keys(erros).length > 0) return dispatch({ tipo: 'ERROS', erros })
    agendar({ ...estado.valores })
    dispatch({ tipo: 'SUCESSO' })
  }

  const campo = (nome) => ({
    value: estado.valores[nome],
    onChange: (e) => dispatch({ tipo: 'ALTERAR_CAMPO', campo: nome, valor: e.target.value }),
  })

  return (
    <section className={estilos.pagina}>
      <div className={estilos.coluna}>
        <h2>Agendar consulta</h2>
        <p className={estilos.subtitulo}>
          {metricas.agendadas} consultas agendadas · {metricas.prioridadeAlta} de prioridade alta
        </p>

        <form onSubmit={aoEnviar} className={estilos.formulario} noValidate>
          <label className={estilos.campo}>
            <span>Paciente *</span>
            <select
              value={estado.valores.pacienteId ?? ''}
              onChange={(e) => {
                const p = pacientes.find((x) => String(x.id) === e.target.value)
                dispatch({ tipo: 'SELECIONAR_PACIENTE', nome: p?.nome ?? '', id: p?.id ?? null })
              }}
            >
              <option value="">Selecione...</option>
              {pacientes.map((p) => (
                <option key={p.id} value={p.id}>{p.nome} — {p.condicao}</option>
              ))}
            </select>
            {estado.erros.paciente && <em className={estilos.erro}>{estado.erros.paciente}</em>}
          </label>

          <div className={estilos.linha}>
            <label className={estilos.campo}>
              <span>Data *</span>
              <input type="date" {...campo('data')} />
              {estado.erros.data && <em className={estilos.erro}>{estado.erros.data}</em>}
            </label>

            <label className={estilos.campo}>
              <span>Horário *</span>
              <input type="time" {...campo('hora')} />
              {estado.erros.hora && <em className={estilos.erro}>{estado.erros.hora}</em>}
            </label>
          </div>

          <div className={estilos.linha}>
            <label className={estilos.campo}>
              <span>Tipo</span>
              <select {...campo('tipo')}>
                <option>Consulta de retorno</option>
                <option>Primeira consulta</option>
                <option>Eletrocardiograma</option>
                <option>Ecocardiograma</option>
                <option>Teste ergométrico</option>
                <option>Holter 24h</option>
              </select>
            </label>

            <label className={estilos.campo}>
              <span>Prioridade</span>
              <select {...campo('prioridade')}>
                <option>Baixa</option>
                <option>Normal</option>
                <option>Alta</option>
              </select>
            </label>
          </div>

          <label className={estilos.campo}>
            <span>Observação clínica</span>
            <textarea rows="3" maxLength="200" placeholder="Queixa principal, contexto do encaminhamento..." {...campo('observacao')} />
            <small className={estilos.contador}>{estado.valores.observacao.length}/200</small>
            {estado.erros.observacao && <em className={estilos.erro}>{estado.erros.observacao}</em>}
          </label>

          {estado.enviado && (
            <p className={estilos.sucesso} role="status">Consulta agendada com sucesso.</p>
          )}

          <div className={estilos.acoes}>
            <button type="submit" className={estilos.primario}>Agendar</button>
            <button type="button" className={estilos.secundario} onClick={() => dispatch({ tipo: 'LIMPAR' })}>
              Limpar
            </button>
          </div>
        </form>
      </div>

      <div className={estilos.coluna}>
        <h2>Agenda</h2>
        <p className={estilos.subtitulo}>{consultas.length} consultas no total</p>

        <ul className={estilos.lista}>
          {consultas.map((c) => (
            <li key={c.id} className={c.status === 'cancelada' ? `${estilos.item} ${estilos.itemCancelado}` : estilos.item}>
              <div className={estilos.itemTopo}>
                <strong>{c.paciente}</strong>
                <Badge>{c.prioridade}</Badge>
              </div>
              <p className={estilos.itemInfo}>
                {c.data} às {c.hora} · {c.tipo}
              </p>
              {c.observacao && <p className={estilos.itemObs}>{c.observacao}</p>}
              <div className={estilos.itemRodape}>
                <Badge>{c.status}</Badge>
                {c.status === 'agendada' && (
                  <span className={estilos.itemAcoes}>
                    <button type="button" onClick={() => concluir(c.id)}>Concluir</button>
                    <button type="button" onClick={() => cancelar(c.id)}>Cancelar</button>
                  </span>
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
