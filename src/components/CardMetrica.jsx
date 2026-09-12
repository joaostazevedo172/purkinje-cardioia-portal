import estilos from '../styles/Dashboard.module.css'

/** Cartão de indicador do dashboard. */
export default function CardMetrica({ rotulo, valor, detalhe, destaque = false }) {
  return (
    <article className={destaque ? `${estilos.card} ${estilos.cardDestaque}` : estilos.card}>
      <span className={estilos.cardRotulo}>{rotulo}</span>
      <strong className={estilos.cardValor}>{valor}</strong>
      {detalhe && <small className={estilos.cardDetalhe}>{detalhe}</small>}
    </article>
  )
}
