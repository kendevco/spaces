"use client";

import { useCallback } from 'react'
import { MediaCategory } from '@/spaces/types'
import { Button } from '@/components/ui/button'
import { useUpload } from '@/spaces/hooks/use-upload'

interface FileUploadProps {
  endpoint: string
  value?: string
  onChange: (url?: string) => void
  category: MediaCategory
}

export function FileUpload({
  endpoint,
  value,
  onChange,
  category
}: FileUploadProps) {
  const { startUpload, isUploading } = useUpload()

  const onUpload = useCallback(async () => {
    try {
      const urls = await startUpload({
        endpoint,
        config: {
          category
        }
      })

      if (urls?.length) {
        onChange(urls[0])
      }
    } catch (error) {
      console.error('Upload failed:', error)
    }
  }, [endpoint, onChange, category, startUpload])

  return (
    <div className="space-y-4 w-full flex flex-col items-center justify-center">
      <Button
        onClick={onUpload}
        disabled={isUploading}
        variant="outline"
        className="w-full max-w-sm"
      >
        {isUploading ? 'Uploading...' : value ? 'Change Image' : 'Upload Image'}
      </Button>
    </div>
  )
}
