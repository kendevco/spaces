import crypto from 'crypto'

export function generateGravatarUrl(email: string, size: number = 80): string {
  if (!email) return ''

  // Normalize email: trim and lowercase
  const normalizedEmail = email.trim().toLowerCase()

  // Generate MD5 hash
  const hash = crypto.createHash('md5').update(normalizedEmail).digest('hex')

  // Build Gravatar URL with default fallback
  const params = new URLSearchParams({
    s: size.toString(),
    d: 'identicon', // Default to identicon if no Gravatar exists
    r: 'g', // General audience rating
  })

  return `https://www.gravatar.com/avatar/${hash}?${params.toString()}`
}

export function getGravatarUrl(email: string, size: number = 80): string {
  return generateGravatarUrl(email, size)
}

// Alternative function that returns null if no valid email
export function getGravatarUrlOrNull(
  email: string | null | undefined,
  size: number = 80,
): string | null {
  if (!email) return null
  return generateGravatarUrl(email, size)
}
