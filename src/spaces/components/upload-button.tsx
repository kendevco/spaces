import { useCallback } from 'react'
import { MediaCategory } from '@/spaces/types'
import { Button } from '@/components/ui/button'
import { useUpload } from '@/spaces/hooks/use-upload'

interface UploadButtonProps {
  endpoint: string
  onUploadComplete: (urls: string[]) => void
  config?: {
    multiple?: boolean
    maxFiles?: number
    category?: MediaCategory
  }
}

export const UploadButton = ({
  endpoint,
  onUploadComplete,
  config = {}
}: UploadButtonProps) => {
  const { startUpload, isUploading } = useUpload()

  const onClick = useCallback(async () => {
    try {
      const urls = await startUpload({
        endpoint,
        config: {
          multiple: config.multiple,
          maxFiles: config.maxFiles,
          category: config.category
        }
      })
      
      if (urls?.length) {
        onUploadComplete(urls)
      }
    } catch (error) {
      console.error('Upload failed:', error)
    }
  }, [endpoint, config, onUploadComplete, startUpload])

  return (
    <Button 
      onClick={onClick}
      disabled={isUploading}
      className="w-full"
    >
      {isUploading ? 'Uploading...' : 'Upload Files'}
    </Button>
  )
} 