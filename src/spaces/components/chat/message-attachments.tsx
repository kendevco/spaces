'use client'

import React from 'react'
import { useModal } from '@/spaces/hooks/use-modal-store'
import { Media } from '@/payload-types'
import { ModalType } from '@/spaces/types'
import { Button } from '@/components/ui/button'
import {
  FileText,
  File,
  Download,
  Eye,
  Image as ImageIcon,
  Video,
  Music,
  Archive,
} from 'lucide-react'
import { toast } from 'sonner'

interface MessageAttachmentsProps {
  attachments: Media[]
  messageId: string
}

interface AttachmentItemProps {
  attachment: Media
  index: number
  total: number
  onImageClick: (index: number) => void
}

const getFileIcon = (mimeType: string = '') => {
  if (mimeType.startsWith('image/')) return <ImageIcon className="h-4 w-4" />
  if (mimeType.startsWith('video/')) return <Video className="h-4 w-4" />
  if (mimeType.startsWith('audio/')) return <Music className="h-4 w-4" />
  if (mimeType.includes('pdf')) return <FileText className="h-4 w-4" />
  if (mimeType.includes('zip') || mimeType.includes('rar') || mimeType.includes('7z')) {
    return <Archive className="h-4 w-4" />
  }
  return <File className="h-4 w-4" />
}

const getFileTypeColor = (mimeType: string = '') => {
  if (mimeType.startsWith('image/')) return 'text-green-400'
  if (mimeType.startsWith('video/')) return 'text-blue-400'
  if (mimeType.startsWith('audio/')) return 'text-purple-400'
  if (mimeType.includes('pdf')) return 'text-red-400'
  if (mimeType.includes('zip') || mimeType.includes('rar') || mimeType.includes('7z')) {
    return 'text-orange-400'
  }
  return 'text-gray-400'
}

const formatFileSize = (bytes: number = 0): string => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
}

const AttachmentItem: React.FC<AttachmentItemProps> = ({
  attachment,
  index,
  total,
  onImageClick,
}) => {
  const isImage = attachment.mimeType?.startsWith('image/')
  const fileUrl = typeof attachment === 'string' ? attachment : attachment.url
  const filename = typeof attachment === 'string' ? 'file' : attachment.filename || 'unknown'
  const mimeType = typeof attachment === 'string' ? '' : attachment.mimeType || ''
  const filesize = typeof attachment === 'string' ? 0 : attachment.filesize || 0

  const handleDownload = async () => {
    if (!fileUrl) {
      toast.error('File URL not available')
      return
    }

    try {
      const response = await fetch(fileUrl)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
      toast.success('File downloaded successfully')
    } catch (error) {
      console.error('Download failed:', error)
      toast.error('Failed to download file')
    }
  }

  if (isImage) {
    return (
      <div className="relative group">
        <div
          className="relative cursor-pointer rounded overflow-hidden bg-zinc-800/50 hover:bg-zinc-800/70 transition-colors"
          onClick={() => onImageClick(index)}
        >
          <img
            src={fileUrl || ''}
            alt={filename}
            className="max-w-[300px] max-h-[200px] object-cover rounded"
            onError={(e) => {
              const target = e.target as HTMLImageElement
              target.style.display = 'none'
            }}
          />
          <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <Eye className="h-6 w-6 text-white" />
          </div>
        </div>
        {filesize > 0 && (
          <div className="absolute bottom-1 right-1 bg-black/75 text-white text-xs px-1 rounded">
            {formatFileSize(filesize)}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="flex items-center gap-3 p-3 bg-zinc-800/50 rounded border border-zinc-700/50 hover:bg-zinc-800/70 transition-colors">
      <div className={`flex-shrink-0 ${getFileTypeColor(mimeType)}`}>{getFileIcon(mimeType)}</div>

      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-zinc-200 truncate">{filename}</div>
        {filesize > 0 && <div className="text-xs text-zinc-400">{formatFileSize(filesize)}</div>}
      </div>

      <div className="flex gap-2">
        <Button
          size="sm"
          variant="ghost"
          onClick={handleDownload}
          className="text-zinc-400 hover:text-zinc-200 h-8 w-8 p-0"
          title="Download"
        >
          <Download className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}

export const MessageAttachments: React.FC<MessageAttachmentsProps> = ({
  attachments,
  messageId,
}) => {
  const { onOpen } = useModal()

  if (!attachments || attachments.length === 0) {
    return null
  }

  const handleImageClick = (clickedIndex: number) => {
    const imageAttachments = attachments
      .map((attachment, index) => {
        const isImage =
          typeof attachment === 'string' ? true : attachment.mimeType?.startsWith('image/')

        if (!isImage) return null

        const url = typeof attachment === 'string' ? attachment : attachment.url
        const filename = typeof attachment === 'string' ? 'image' : attachment.filename || 'image'
        const width = typeof attachment === 'string' ? undefined : attachment.width
        const height = typeof attachment === 'string' ? undefined : attachment.height

        return {
          url,
          filename,
          alt: filename,
          originalSize: width && height ? { width, height } : undefined,
          originalIndex: index,
        }
      })
      .filter(Boolean)

    const imageIndex = imageAttachments.findIndex((img) => img?.originalIndex === clickedIndex)

    if (imageIndex >= 0) {
      onOpen(
        'imageViewer' as any,
        {
          images: imageAttachments,
          currentIndex: imageIndex,
        } as any,
      )
    }
  }

  // Group attachments by type for better layout
  const images = attachments.filter((attachment, index) => {
    const isImage =
      typeof attachment === 'string' ? true : attachment.mimeType?.startsWith('image/')
    return isImage
  })

  const files = attachments.filter((attachment, index) => {
    const isImage =
      typeof attachment === 'string' ? false : attachment.mimeType?.startsWith('image/')
    return !isImage
  })

  return (
    <div className="mt-2 space-y-2">
      {/* Image Attachments */}
      {images.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {images.map((attachment, index) => {
            const originalIndex = attachments.indexOf(attachment)
            return (
              <AttachmentItem
                key={`image-${originalIndex}`}
                attachment={attachment}
                index={originalIndex}
                total={attachments.length}
                onImageClick={handleImageClick}
              />
            )
          })}
        </div>
      )}

      {/* File Attachments */}
      {files.length > 0 && (
        <div className="space-y-2 max-w-md">
          {files.map((attachment, index) => {
            const originalIndex = attachments.indexOf(attachment)
            return (
              <AttachmentItem
                key={`file-${originalIndex}`}
                attachment={attachment}
                index={originalIndex}
                total={attachments.length}
                onImageClick={handleImageClick}
              />
            )
          })}
        </div>
      )}
    </div>
  )
}
