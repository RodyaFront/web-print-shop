import { createHmac, timingSafeEqual } from 'node:crypto'

const COOKIE_NAME = 'admin_session'
const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 7

type SessionPayload = {
  role: 'admin'
  exp: number
}

function getSecrets() {
  const config = useRuntimeConfig()
  const password = String(config.adminPassword || '')
  const secret = String(config.sessionSecret || '')
  if (!password || !secret) {
    throw createError({
      statusCode: 500,
      message: 'NUXT_ADMIN_PASSWORD і NUXT_SESSION_SECRET мають бути задані в .env',
    })
  }
  return { password, secret }
}

function sign(value: string, secret: string) {
  return createHmac('sha256', secret).update(value).digest('base64url')
}

function encodeSession(payload: SessionPayload, secret: string) {
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url')
  const signature = sign(body, secret)
  return `${body}.${signature}`
}

function decodeSession(token: string, secret: string): SessionPayload | null {
  const [body, signature] = token.split('.')
  if (!body || !signature) return null
  const expected = sign(body, secret)
  const left = Buffer.from(signature)
  const right = Buffer.from(expected)
  if (left.length !== right.length || !timingSafeEqual(left, right)) return null
  try {
    const payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf8')) as SessionPayload
    if (payload.role !== 'admin' || typeof payload.exp !== 'number') return null
    if (Date.now() > payload.exp) return null
    return payload
  } catch {
    return null
  }
}

export function verifyAdminPassword(candidate: string) {
  const { password } = getSecrets()
  const left = Buffer.from(candidate)
  const right = Buffer.from(password)
  if (left.length !== right.length) return false
  return timingSafeEqual(left, right)
}

export function setAdminSessionCookie(event: Parameters<typeof setCookie>[0]) {
  const { secret } = getSecrets()
  const token = encodeSession(
    {
      role: 'admin',
      exp: Date.now() + SESSION_TTL_MS,
    },
    secret,
  )
  setCookie(event, COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_TTL_MS / 1000,
    secure: process.env.NODE_ENV === 'production',
  })
}

export function clearAdminSessionCookie(event: Parameters<typeof deleteCookie>[0]) {
  deleteCookie(event, COOKIE_NAME, { path: '/' })
}

export function isAdminAuthenticated(event: Parameters<typeof getCookie>[0]) {
  const { secret } = getSecrets()
  const token = getCookie(event, COOKIE_NAME)
  if (!token) return false
  return Boolean(decodeSession(token, secret))
}

export function requireAdmin(event: Parameters<typeof getCookie>[0]) {
  if (!isAdminAuthenticated(event)) {
    throw createError({ statusCode: 401, message: 'Потрібен вхід адміністратора' })
  }
}
