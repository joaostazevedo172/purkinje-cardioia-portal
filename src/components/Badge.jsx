import estilos from '../styles/Badge.module.css'

const MAPA = {
  Alto: estilos.alto, Alta: estilos.alto,
  Intermediário: estilos.medio, Normal: estilos.medio,
  Baixo: estilos.baixo, Baixa: estilos.baixo,
  agendada: estilos.medio, realizada: estilos.baixo, cancelada: estilos.neutro,
}

/** Etiqueta colorida para risco, prioridade ou status. */
export default function Badge({ children }) {
  const classe = MAPA[children] ?? estilos.neutro
  return <span className={`${estilos.badge} ${classe}`}>{children}</span>
}
