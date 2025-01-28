import { useState, useCallback } from 'react'
import { MediaCategory } from '@/spaces/types'

interface UploadConfig {
  multiple?: boolean
  maxFiles?: number
  category?: MediaCategory
}

interface UploadOptions {
  endpoint: string
  config?: UploadConfig
}

export const useUpload = () => {
  const [isUploading, setIsUploading] = useState(false)

  const startUpload = useCallback(async ({ endpoint, config }: UploadOptions) => {
    try {
      setIsUploading(true)
      
      // Open file picker
      const input = document.createElement('input')
      input.type = 'file'
      input.multiple = config?.multiple ?? false
      input.accept = 'image/*,video/*,audio/*,.pdf,.zip,.7z'
      
      const files = await new Promise<FileList | null>((resolve) => {
        input.onchange = () => resolve(input.files)
        input.click()
      })

      if (!files?.length) return

      // Upload files
      const formData = new FormData()
      Array.from(files).forEach(file => {
        formData.append('files', file)
      })

      if (config?.category) {
        formData.append('category', config.category)
      }

      const res = await fetch(`/api/${endpoint}`, {
        method: 'POST',
        body: formData
      })

      if (!res.ok) throw new Error('Upload failed')

      const data = await res.json()
      return data.urls as string[]

    } catch (error) {
      console.error('Upload error:', error)
      throw error
    } finally {
      setIsUploading(false)
    }
  }, [])

  return {
    startUpload,
    isUploading
  }
} 