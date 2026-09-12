/**
 * authService — autenticação simulada.
 *
 * Gera um JWT FALSO no próprio navegador. A estrutura é a real de um JWT
 * (header.payload.signature em base64url), mas a assinatura é uma string fixa:
 * qualquer back-end de verdade rejeitaria este token na hora.
 *
 * Isso é proposital. O objetivo aqui é exercitar o fluxo de sessão no front,
 * não implementar segurança — que só existe quando o servidor assina e valida.
 */

const USUARIOS = [
  { email: 'medico@cardioia.com', senha: 'cardio123', nome: 'Dra. Helena Prado', papel: 'Cardiologista', crm: 'CRM-SP 123456' },
  { email: 'admin@cardioia.com', senha: 'admin123', nome: 'João Pedro Azevedo', papel: 'Administrador', crm: '—' },
]

const DURACAO_SESSAO_MS = 1000 * 60 * 60 * 8 // 8 horas

/** Codifica em base64url, como manda a especificação do JWT. */
function base64url(objeto) {
  return btoa(JSON.stringify(objeto))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '')
}

function gerarTokenFake(usuario, expiraEm) {
  const header = { alg: 'HS256', typ: 'JWT' }
  const payload = {
    sub: usuario.email,
    nome: usuario.nome,
    papel: usuario.papel,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(expiraEm / 1000),
  }
  // Assinatura fixa: é o que torna este token explicitamente falso.
  return `${base64url(header)}.${base64url(payload)}.assinatura-simulada-cardioia`
}

/** Decodifica o payload de um JWT. Útil para inspecionar o token na interface. */
export function lerPayload(token) {
  try {
    const payload = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')
    return JSON.parse(atob(payload))
  } catch {
    return null
  }
}

/**
 * Simula a chamada de login. O atraso de 600 ms existe para que os estados de
 * carregamento da interface apareçam de verdade durante a demonstração.
 */
export function autenticar(email, senha) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const usuario = USUARIOS.find(
        (u) => u.email === email.trim().toLowerCase() && u.senha === senha,
      )
      if (!usuario) {
        return reject(new Error('E-mail ou senha inválidos.'))
      }
      const { senha: _descartada, ...dadosPublicos } = usuario
      const expiraEm = Date.now() + DURACAO_SESSAO_MS
      resolve({ token: gerarTokenFake(usuario, expiraEm), usuario: dadosPublicos, expiraEm })
    }, 600)
  })
}

export const CREDENCIAIS_DEMO = USUARIOS.map(({ email, senha, papel }) => ({ email, senha, papel }))
