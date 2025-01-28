// Client-side auth utilities
export function getAuthTokenClient(): string | null {
  try {
    const cookies = document.cookie.split(';')
    const tokenCookie = cookies.find((cookie) => cookie.trim().startsWith('payload-token='))
    if (!tokenCookie) return null
    const token = tokenCookie.split('=')[1]
    if (!token) return null
    return decodeURIComponent(token)
  } catch (error) {
    console.error('Error getting auth token:', error)
    return null
  }
}

// Headers with auth token for client-side requests
export function getAuthHeaders(token?: string | null): HeadersInit {
  const authToken = token || getAuthTokenClient()
  return {
    'Content-Type': 'application/json',
    ...(authToken ? { Authorization: `JWT ${authToken}` } : {}),
  }
}
