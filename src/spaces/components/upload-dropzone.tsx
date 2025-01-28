import { UploadButton } from "@/spaces/components/upload-button"
import { MediaCategory } from "@/spaces/types"

interface UploadDropzoneProps {
  endpoint: string
  onUploadComplete: (urls: string[]) => void
  config?: {
    multiple?: boolean
    maxFiles?: number
    category?: MediaCategory
  }
}

export const UploadDropzone = ({
  endpoint,
  onUploadComplete,
  config
}: UploadDropzoneProps) => {
  return (
    <div className="p-4">
      <UploadButton
        endpoint={endpoint}
        onUploadComplete={onUploadComplete}
        config={config}
      />
    </div>
  )
} 