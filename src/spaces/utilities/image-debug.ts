import { Space } from '@/payload-types'

/**
 * Utility function to safely get space image URL with debugging
 * @param space - Space object that may contain an image
 * @returns Image URL string or default placeholder
 */
export function getSpaceImageUrl(space: Space): string {
  try {
    // Check if space has an image
    if (!space.image) {
      console.log(`[IMAGE_DEBUG] No image for space ${space.name}`)
      return '/images/avatar/default-space.png'
    }

    // Handle different image types
    if (typeof space.image === 'string') {
      console.log(`[IMAGE_DEBUG] String image for space ${space.name}: ${space.image}`)
      return space.image
    }

    // Handle image object
    if (typeof space.image === 'object' && space.image.url) {
      console.log(`[IMAGE_DEBUG] Object image for space ${space.name}: ${space.image.url}`)
      return space.image.url
    }

    console.log(`[IMAGE_DEBUG] Invalid image format for space ${space.name}:`, space.image)
    return '/images/avatar/default-space.png'
  } catch (error) {
    console.error(`[IMAGE_DEBUG] Error getting image URL for space ${space.name}:`, error)
    return '/images/avatar/default-space.png'
  }
}
