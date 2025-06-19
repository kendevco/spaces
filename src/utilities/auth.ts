export const PAYLOAD_TOKEN_NAME = 'payload-token'

export interface JWT {
  id: string
  collection: string
  email: string
  iat: number
  exp: number
}

export const getAuthJsToken = async (headers: Headers): Promise<JWT | null> => {
  try {
    const cookieString = headers.get('Cookie') || ''
    const cookies = parseCookie(cookieString)
    const token = cookies[PAYLOAD_TOKEN_NAME]

    if (!token) {
      console.log('[AUTH] No token found in cookies')
      return null
    }

    // Decode the JWT token
    const [, payloadBase64] = token.split('.')
    if (!payloadBase64) {
      console.log('[AUTH] Invalid token format')
      return null
    }

    try {
      const decodedPayload = Buffer.from(payloadBase64, 'base64').toString('utf-8')
      const payload = JSON.parse(decodedPayload) as JWT

      // Validate token structure
      if (!payload.exp || !payload.id || !payload.email) {
        console.log('[AUTH] Invalid token structure:', payload)
        return null
      }

      console.log('[AUTH] Valid token found:', {
        id: payload.id,
        email: payload.email,
        exp: new Date(payload.exp * 1000).toISOString(),
      })

      return payload
    } catch (decodeError) {
      console.error('[AUTH] Token decode error:', decodeError)
      return null
    }
  } catch (error) {
    console.error('[AUTH] Token parse error:', error)
    return null
  }
}

export const isWithinExpirationDate = (expirationDate: Date): boolean => {
  const now = Date.now()
  const exp = expirationDate.getTime()
  const isValid = exp > now
  console.log('[AUTH] Token expiration check:', { now, exp, isValid })
  return isValid
}

export const findAuthJsCookie = (cookies: Record<string, string>) => {
  const token = cookies[PAYLOAD_TOKEN_NAME]
  if (!token) {
    console.log('[AUTH] No auth cookie found')
    return null
  }

  return {
    name: PAYLOAD_TOKEN_NAME,
    value: token,
    secure: true,
  }
}

export const parseCookie = (cookie: string): Record<string, string> => {
  if (!cookie) return {}

  return cookie
    .split(';')
    .map((v) => v.split('='))
    .reduce(
      (acc, v) => {
        if (v[0] && v[1]) {
          acc[decodeURIComponent(v[0].trim())] = decodeURIComponent(v[1].trim())
        }
        return acc
      },
      {} as Record<string, string>,
    )
}
