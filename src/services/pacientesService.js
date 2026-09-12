/**
 * pacientesService — consumo da API fake de pacientes.
 *
 * Usamos o JSONPlaceholder como fonte de dados, conforme sugerido no enunciado.
 * Ele devolve "usuários" genéricos, então enriquecemos cada registro com campos
 * clínicos derivados de forma DETERMINÍSTICA a partir do id — assim a mesma
 * pessoa sempre tem os mesmos dados, e a lista não muda a cada recarga.
 *
 * Se a rede falhar, caímos em uma base local para que a demonstração nunca
 * quebre por falta de internet.
 */

const API = 'https://jsonplaceholder.typicode.com/users'

const CONDICOES = [
  'Hipertensão arterial',
  'Arritmia — fibrilação atrial',
  'Insuficiência cardíaca',
  'Doença arterial coronariana',
  'Acompanhamento pós-infarto',
  'Avaliação de rotina',
]

const RISCOS = ['Baixo', 'Intermediário', 'Alto']

/** Gerador determinístico: mesmo id, mesmo resultado, sempre. */
function derivarDadosClinicos(id) {
  return {
    idade: 34 + ((id * 7) % 48),
    condicao: CONDICOES[id % CONDICOES.length],
    risco: RISCOS[id % RISCOS.length],
    pressao: `${110 + ((id * 11) % 60)}x${70 + ((id * 5) % 30)}`,
    frequencia: 58 + ((id * 13) % 40),
    ultimaConsulta: new Date(2026, (id * 3) % 12, 1 + ((id * 5) % 28)).toISOString().slice(0, 10),
  }
}

const BASE_LOCAL = [
  { id: 1, name: 'Ana Ribeiro', email: 'ana.ribeiro@exemplo.com', phone: '(11) 98800-1001', address: { city: 'São Paulo' } },
  { id: 2, name: 'Carlos Meneses', email: 'carlos.meneses@exemplo.com', phone: '(11) 98800-1002', address: { city: 'Campinas' } },
  { id: 3, name: 'Beatriz Lopes', email: 'beatriz.lopes@exemplo.com', phone: '(21) 98800-1003', address: { city: 'Rio de Janeiro' } },
  { id: 4, name: 'Daniel Ferraz', email: 'daniel.ferraz@exemplo.com', phone: '(31) 98800-1004', address: { city: 'Belo Horizonte' } },
  { id: 5, name: 'Elisa Tavares', email: 'elisa.tavares@exemplo.com', phone: '(41) 98800-1005', address: { city: 'Curitiba' } },
  { id: 6, name: 'Fábio Nunes', email: 'fabio.nunes@exemplo.com', phone: '(51) 98800-1006', address: { city: 'Porto Alegre' } },
]

function normalizar(bruto, origem) {
  return {
    id: bruto.id,
    nome: bruto.name,
    email: bruto.email,
    telefone: bruto.phone,
    cidade: bruto.address?.city ?? '—',
    origem,
    ...derivarDadosClinicos(bruto.id),
  }
}

export async function listarPacientes({ signal } = {}) {
  try {
    const resposta = await fetch(API, { signal })
    if (!resposta.ok) throw new Error(`API respondeu ${resposta.status}`)
    const dados = await resposta.json()
    return dados.map((u) => normalizar(u, 'JSONPlaceholder'))
  } catch (e) {
    // AbortError acontece quando o componente desmonta durante o fetch.
    // Não é falha de rede: propagamos para o chamador ignorar.
    if (e.name === 'AbortError') throw e
    console.warn('API indisponível, usando base local:', e.message)
    return BASE_LOCAL.map((u) => normalizar(u, 'base local'))
  }
}
