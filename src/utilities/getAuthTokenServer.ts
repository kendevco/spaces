import { cookies } from 'next/headers'

// Server-side auth token getter
export async function getAuthTokenServer(): Promise<string | null> {
  const cookieStore = await cookies()
  return cookieStore.get('payload-token')?.value || null
}

// Headers with auth token for server-side requests
export async function getAuthHeadersServer(token?: string | null): Promise<HeadersInit> {
  const authToken = token || (await getAuthTokenServer())
  return {
    'Content-Type': 'application/json',
    ...(authToken ? { Authorization: `JWT ${authToken}` } : {}),
  }
}
