import type { Payload, PayloadRequest } from 'payload'
import path from 'path'
import { getPayloadClient } from './getPayloadClient'

export const importMedia = async ({
  payload,
  file,
  collection = 'media',
}: {
  payload: any
  file: File | Blob
  collection?: string
}) => {
  try {
    // Use the file directly instead of reading from filesystem
    const formData = new FormData()
    formData.append('file', file)

    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    })

    if (!response.ok) {
      throw new Error('Upload failed')
    }

    return response.json()
  } catch (error) {
    console.error('Error importing media:', error)
    throw error
  }
}
