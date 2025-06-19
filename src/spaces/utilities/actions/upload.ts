'use server'

import { getPayloadClient } from '@/spaces/utilities/payload/getPayloadClient'
import type { Media, SpacesMedia } from '@/payload-types'

type MediaCategory = 'space' | 'profile' | 'message'

interface UploadOptions {
  file: File
  category: MediaCategory
  userId: string
  alt?: string
  caption?: string
}

interface UploadResponse {
  url: string
  id: string
  filename: string
  mimeType: string
  filesize: number
  alt: string
  category: MediaCategory
}

class UploadError extends Error {
  constructor(
    message: string,
    public code: string,
  ) {
    super(message)
    this.name = 'UploadError'
  }
}

export async function uploadFile({
  file,
  category,
  userId,
  alt,
  caption,
}: UploadOptions): Promise<UploadResponse> {
  if (!file) {
    throw new UploadError('No file provided', 'NO_FILE')
  }

  if (!userId) {
    throw new UploadError('User ID is required', 'NO_USER')
  }

  if (!category) {
    throw new UploadError('Category is required', 'NO_CATEGORY')
  }

  const payload = await getPayloadClient()

  try {
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    const media = (await payload.create({
      collection: 'spaces-media',
      data: {
        alt: alt || file.name,
        caption: caption
          ? {
              root: {
                type: 'root',
                children: [
                  {
                    type: 'paragraph',
                    version: 1,
                    children: [{ text: caption }],
                  },
                ],
                direction: 'ltr',
                format: '',
                indent: 0,
                version: 1,
              },
            }
          : null,
        category,
      },
      file: {
        data: buffer,
        mimetype: file.type,
        name: file.name,
        size: buffer.byteLength,
      },
    })) as SpacesMedia

    return {
      url: media.url || '',
      id: media.id,
      filename: media.filename || file.name,
      mimeType: media.mimeType || file.type,
      filesize: media.filesize || buffer.byteLength,
      alt: media.alt || file.name,
      category: media.category || category,
    }
  } catch (error) {
    console.error('Upload error:', error)
    throw new UploadError(error instanceof Error ? error.message : 'Upload failed', 'UPLOAD_FAILED')
  }
}
