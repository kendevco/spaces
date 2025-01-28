export function normalizeUrl(url: string): string {
  // Remove duplicate protocol and host
  if (url.includes('http://localhost:3000http://localhost:3000')) {
    url = url.replace('http://localhost:3000http://localhost:3000', 'http://localhost:3000')
  }

  // Ensure URL starts with protocol or leading slash
  if (!url.startsWith('http') && !url.startsWith('/')) {
    url = `/${url}`
  }

  return url
}
