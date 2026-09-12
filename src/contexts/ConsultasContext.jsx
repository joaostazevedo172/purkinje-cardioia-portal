import { createContext, useContext, useMemo, useReducer } from 'react'

/**
 * ConsultasContext — agenda de consultas do portal.
 *
 * Vive em contexto porque dois lugares distantes da árvore precisam do mesmo
 * dado: o formulário de agendamento (que escreve) e o dashboard (que lê para
 * contar). Sem contexto, esse estado teria que subir até o App e descer por
 * props em duas ramificações diferentes.
 */

const ConsultasContext = createContext(null)

const AGENDA_INICIAL = [
  { id: 'CONS-001', paciente: 'Ana Ribeiro', pacienteId: 1, data: '2026-09-15', hora: '09:00', tipo: 'Eletrocardiograma', prioridade: 'Alta', status: 'agendada', observacao: 'Dor torácica aos esforços há 3 dias.' },
  { id: 'CONS-002', paciente: 'Carlos Meneses', pacienteId: 2, data: '2026-09-15', hora: '10:30', tipo: 'Consulta de retorno', prioridade: 'Normal', status: 'agendada', observacao: 'Ajuste de anti-hipertensivo.' },
  { id: 'CONS-003', paciente: 'Beatriz Lopes', pacienteId: 3, data: '2026-09-16', hora: '14:00', tipo: 'Ecocardiograma', prioridade: 'Normal', status: 'agendada', observacao: '' },
  { id: 'CONS-004', paciente: 'Daniel Ferraz', pacienteId: 4, data: '2026-09-17', hora: '08:15', tipo: 'Teste ergométrico', prioridade: 'Alta', status: 'agendada', observacao: 'Investigação de angina instável.' },
  { id: 'CONS-005', paciente: 'Elisa Tavares', pacienteId: 5, data: '2026-09-12', hora: '16:00', tipo: 'Consulta de retorno', prioridade: 'Baixa', status: 'realizada', observacao: 'Paciente estável.' },
]

function reducer(estado, acao) {
  switch (acao.tipo) {
    case 'AGENDAR': {
      const proximo = String(estado.length + 1).padStart(3, '0')
      return [{ id: `CONS-${proximo}`, status: 'agendada', ...acao.consulta }, ...estado]
    }
    case 'CANCELAR':
      return estado.map((c) => (c.id === acao.id ? { ...c, status: 'cancelada' } : c))
    case 'CONCLUIR':
      return estado.map((c) => (c.id === acao.id ? { ...c, status: 'realizada' } : c))
    default:
      throw new Error(`Ação de agenda desconhecida: ${acao.tipo}`)
  }
}

export function ConsultasProvider({ children }) {
  const [consultas, dispatch] = useReducer(reducer, AGENDA_INICIAL)

  const valor = useMemo(() => {
    const agendadas = consultas.filter((c) => c.status === 'agendada')
    return {
      consultas,
      agendar: (consulta) => dispatch({ tipo: 'AGENDAR', consulta }),
      cancelar: (id) => dispatch({ tipo: 'CANCELAR', id }),
      concluir: (id) => dispatch({ tipo: 'CONCLUIR', id }),
      metricas: {
        total: consultas.length,
        agendadas: agendadas.length,
        realizadas: consultas.filter((c) => c.status === 'realizada').length,
        canceladas: consultas.filter((c) => c.status === 'cancelada').length,
        prioridadeAlta: agendadas.filter((c) => c.prioridade === 'Alta').length,
      },
    }
  }, [consultas])

  return <ConsultasContext.Provider value={valor}>{children}</ConsultasContext.Provider>
}

export function useConsultas() {
  const ctx = useContext(ConsultasContext)
  if (!ctx) throw new Error('useConsultas precisa estar dentro de <ConsultasProvider>')
  return ctx
}
