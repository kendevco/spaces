import { useEffect, useState } from 'react'
import { spaceService } from '@/spaces/services/spaceService.client'
import type { Space } from '@/payload-types'

export const useSpaces = () => {
  const [spaces, setSpaces] = useState<Space[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userSpaces = await spaceService.getUserSpaces()
        setSpaces(userSpaces)
      } catch (error) {
        console.error('[USE_SPACES] Error fetching spaces:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  return { spaces, loading }
}
