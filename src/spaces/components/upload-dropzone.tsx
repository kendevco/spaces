import React, { useState, useCallback, useRef } from 'react'
import { useDropzone } from 'react-dropzone'
import { MediaCategory } from '@/spaces/types'
import { Button } from '@/components/ui/button'
import { useUpload } from '@/spaces/hooks/use-upload'
import { Progress } from '@/components/ui/progress'
import { X, Upload, File, Image, FileText } from 'lucide-react'
import { toast } from 'sonner'

interface UploadDropzoneProps {
  endpoint: string
  onUploadComplete: (urls: string[]) => void
  config?: {
    multiple?: boolean
    maxFiles?: number
    category?: MediaCategory
    acceptedFileTypes?: string[]
  }
  disabled?: boolean
}

interface FilePreview {
  file: File
  preview: string
  id: string
  type: 'image' | 'document' | 'other'
}

export const UploadDropzone = ({
  endpoint,
  onUploadComplete,
  config = {},
  disabled = false,
}: UploadDropzoneProps) => {
  const [files, setFiles] = useState<FilePreview[]>([])
  const [uploadProgress, setUploadProgress] = useState<number>(0)
  const { startUpload, isUploading } = useUpload()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const {
    multiple = true,
    maxFiles = 10,
    category = MediaCategory.MESSAGE,
    acceptedFileTypes = ['image/*', '.pdf', '.doc', '.docx', '.txt', '.zip', '.7z'],
  } = config

  const getFileType = (file: File): 'image' | 'document' | 'other' => {
    if (file.type.startsWith('image/')) return 'image'
    if (file.type.includes('pdf') || file.type.includes('document') || file.type.includes('text'))
      return 'document'
    return 'other'
  }

  const getFileIcon = (type: 'image' | 'document' | 'other') => {
    switch (type) {
      case 'image':
        return <Image className="h-4 w-4" />
      case 'document':
        return <FileText className="h-4 w-4" />
      default:
        return <File className="h-4 w-4" />
    }
  }

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (disabled) return

      const totalFiles = files.length + acceptedFiles.length
      if (totalFiles > maxFiles) {
        toast.error(`Maximum ${maxFiles} files allowed`)
        return
      }

      const newFiles: FilePreview[] = acceptedFiles.map((file) => ({
        file,
        preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : '',
        id: Math.random().toString(36).substring(7),
        type: getFileType(file),
      }))

      setFiles((prev) => [...prev, ...newFiles])
    },
    [files.length, maxFiles, disabled],
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: acceptedFileTypes.reduce((acc, type) => ({ ...acc, [type]: [] }), {}),
    multiple,
    disabled: disabled || isUploading,
    maxFiles: maxFiles - files.length,
  })

  const removeFile = (id: string) => {
    setFiles((prev) => {
      const updated = prev.filter((f) => f.id !== id)
      // Revoke object URLs to prevent memory leaks
      prev.forEach((f) => {
        if (f.preview && f.id === id) {
          URL.revokeObjectURL(f.preview)
        }
      })
      return updated
    })
  }

  const handleUpload = async () => {
    if (files.length === 0) return

    try {
      setUploadProgress(0)

      // Create FormData with files
      const formData = new FormData()
      files.forEach(({ file }) => {
        formData.append('files', file)
      })

      if (category) {
        formData.append('category', category)
      }

      // Upload with progress tracking
      const xhr = new XMLHttpRequest()

      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable) {
          const progress = (event.loaded / event.total) * 100
          setUploadProgress(progress)
        }
      })

      const uploadPromise = new Promise<string[]>((resolve, reject) => {
        xhr.onload = () => {
          if (xhr.status === 200) {
            const response = JSON.parse(xhr.responseText)
            resolve(response.urls || [])
          } else {
            reject(new Error('Upload failed'))
          }
        }
        xhr.onerror = () => reject(new Error('Upload failed'))
      })

      xhr.open('POST', `/api/${endpoint}`)
      xhr.send(formData)

      const urls = await uploadPromise

      if (urls.length > 0) {
        onUploadComplete(urls)
        setFiles([])
        setUploadProgress(0)
        toast.success(`${urls.length} file(s) uploaded successfully`)
      }
    } catch (error) {
      console.error('Upload failed:', error)
      toast.error('Upload failed. Please try again.')
      setUploadProgress(0)
    }
  }

  const openFileDialog = () => {
    fileInputRef.current?.click()
  }

  // Clean up object URLs on unmount
  React.useEffect(() => {
    return () => {
      files.forEach((f) => {
        if (f.preview) {
          URL.revokeObjectURL(f.preview)
        }
      })
    }
  }, [])

  return (
    <div className="w-full">
      {/* Dropzone */}
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
          ${
            isDragActive
              ? 'border-[#7364c0] bg-[#7364c0]/10'
              : 'border-zinc-600 hover:border-zinc-500'
          }
          ${disabled || isUploading ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        <input {...getInputProps()} ref={fileInputRef} />
        <Upload className="mx-auto h-12 w-12 text-zinc-400 mb-4" />
        <div className="text-lg font-medium text-zinc-200 mb-2">
          {isDragActive ? 'Drop files here...' : 'Drop files or click to browse'}
        </div>
        <div className="text-sm text-zinc-400">
          {multiple
            ? `Up to ${maxFiles} files, ${acceptedFileTypes.join(', ')}`
            : `Single file, ${acceptedFileTypes.join(', ')}`}
        </div>
      </div>

      {/* File Previews */}
      {files.length > 0 && (
        <div className="mt-4 space-y-2">
          <div className="text-sm font-medium text-zinc-200">
            Selected Files ({files.length}/{maxFiles})
          </div>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {files.map(({ file, preview, id, type }) => (
              <div key={id} className="flex items-center gap-3 p-2 bg-zinc-800/50 rounded">
                {preview ? (
                  <img src={preview} alt={file.name} className="w-8 h-8 object-cover rounded" />
                ) : (
                  <div className="w-8 h-8 flex items-center justify-center bg-zinc-700 rounded">
                    {getFileIcon(type)}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-zinc-200 truncate">{file.name}</div>
                  <div className="text-xs text-zinc-400">{(file.size / 1024).toFixed(1)} KB</div>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => removeFile(id)}
                  className="text-zinc-400 hover:text-zinc-200 h-8 w-8 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upload Progress */}
      {isUploading && (
        <div className="mt-4">
          <div className="flex items-center justify-between text-sm text-zinc-300 mb-2">
            <span>Uploading...</span>
            <span>{Math.round(uploadProgress)}%</span>
          </div>
          <Progress value={uploadProgress} className="h-2" />
        </div>
      )}

      {/* Upload Button */}
      {files.length > 0 && !isUploading && (
        <div className="mt-4 flex gap-2">
          <Button
            onClick={handleUpload}
            className="flex-1 bg-[#7364c0] hover:bg-[#6356a8] text-white"
            disabled={disabled}
          >
            Upload {files.length} file{files.length > 1 ? 's' : ''}
          </Button>
          <Button
            onClick={() => setFiles([])}
            variant="outline"
            className="text-zinc-400 border-zinc-600 hover:bg-zinc-800"
          >
            Clear
          </Button>
        </div>
      )}
    </div>
  )
}
