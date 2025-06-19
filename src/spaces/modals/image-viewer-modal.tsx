'use client'

import React, { useState, useEffect } from 'react'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { useModal } from '@/spaces/hooks/use-modal-store'
import { ModalType } from '@/spaces/types'
import {
  ZoomIn,
  ZoomOut,
  RotateCw,
  Download,
  X,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Minimize2,
} from 'lucide-react'
import { toast } from 'sonner'

interface ImageData {
  url: string
  alt?: string
  filename?: string
  originalSize?: { width: number; height: number }
}

interface ImageViewerModalData {
  images: ImageData[]
  currentIndex: number
}

export const ImageViewerModal = () => {
  const { isOpen, onClose, type, data } = useModal()
  const [currentIndex, setCurrentIndex] = useState(0)
  const [zoom, setZoom] = useState(1)
  const [rotation, setRotation] = useState(0)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)
  const [imageError, setImageError] = useState(false)

  const isModalOpen = isOpen && type === ('imageViewer' as any)
  const modalData = data as ImageViewerModalData
  const images = modalData?.images || []
  const currentImage = images[currentIndex] || null

  useEffect(() => {
    if (modalData?.currentIndex !== undefined) {
      setCurrentIndex(modalData.currentIndex)
    }
  }, [modalData?.currentIndex])

  useEffect(() => {
    if (isModalOpen) {
      setZoom(1)
      setRotation(0)
      setIsFullscreen(false)
      setImageLoaded(false)
      setImageError(false)
    }
  }, [isModalOpen, currentIndex])

  const handleClose = () => {
    setZoom(1)
    setRotation(0)
    setIsFullscreen(false)
    onClose()
  }

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1)
    }
  }

  const handleNext = () => {
    if (currentIndex < images.length - 1) {
      setCurrentIndex(currentIndex + 1)
    }
  }

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev * 1.5, 5))
  }

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev / 1.5, 0.1))
  }

  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360)
  }

  const handleResetZoom = () => {
    setZoom(1)
    setRotation(0)
  }

  const handleDownload = async () => {
    if (!currentImage?.url) return

    try {
      const response = await fetch(currentImage.url)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = currentImage.filename || 'image'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
      toast.success('Image downloaded successfully')
    } catch (error) {
      console.error('Download failed:', error)
      toast.error('Failed to download image')
    }
  }

  const handleKeyDown = (e: KeyboardEvent) => {
    if (!isModalOpen) return

    switch (e.key) {
      case 'Escape':
        handleClose()
        break
      case 'ArrowLeft':
        handlePrevious()
        break
      case 'ArrowRight':
        handleNext()
        break
      case '+':
      case '=':
        handleZoomIn()
        break
      case '-':
        handleZoomOut()
        break
      case 'r':
      case 'R':
        handleRotate()
        break
      case '0':
        handleResetZoom()
        break
    }
  }

  useEffect(() => {
    if (isModalOpen) {
      document.addEventListener('keydown', handleKeyDown)
    }
    return () => {
      if (isModalOpen) {
        document.removeEventListener('keydown', handleKeyDown)
      }
    }
  }, [isModalOpen, currentIndex])

  if (!currentImage) return null

  return (
    <Dialog open={isModalOpen} onOpenChange={handleClose}>
      <DialogContent
        className="max-w-[95vw] max-h-[95vh] p-0 bg-black/95 border-none"
        aria-describedby="image-viewer-description"
      >
        <div className="relative w-full h-full flex flex-col">
          {/* Header Controls */}
          <div className="absolute top-0 left-0 right-0 z-50 flex items-center justify-between p-4 bg-gradient-to-b from-black/80 to-transparent">
            <div className="flex items-center gap-2 text-white">
              <span className="text-sm font-medium">{currentImage.filename || 'Image'}</span>
              {images.length > 1 && (
                <span className="text-xs text-gray-300">
                  ({currentIndex + 1} of {images.length})
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="ghost"
                onClick={handleZoomOut}
                className="text-white hover:bg-white/20"
                title="Zoom Out (-)"
              >
                <ZoomOut className="h-4 w-4" />
              </Button>

              <Button
                size="sm"
                variant="ghost"
                onClick={handleResetZoom}
                className="text-white hover:bg-white/20 min-w-[60px]"
                title="Reset Zoom (0)"
              >
                {Math.round(zoom * 100)}%
              </Button>

              <Button
                size="sm"
                variant="ghost"
                onClick={handleZoomIn}
                className="text-white hover:bg-white/20"
                title="Zoom In (+)"
              >
                <ZoomIn className="h-4 w-4" />
              </Button>

              <Button
                size="sm"
                variant="ghost"
                onClick={handleRotate}
                className="text-white hover:bg-white/20"
                title="Rotate (R)"
              >
                <RotateCw className="h-4 w-4" />
              </Button>

              <Button
                size="sm"
                variant="ghost"
                onClick={handleDownload}
                className="text-white hover:bg-white/20"
                title="Download"
              >
                <Download className="h-4 w-4" />
              </Button>

              <Button
                size="sm"
                variant="ghost"
                onClick={handleClose}
                className="text-white hover:bg-white/20"
                title="Close (Esc)"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Image Container */}
          <div className="flex-1 flex items-center justify-center p-4 pt-16 relative overflow-hidden">
            {!imageLoaded && !imageError && <div className="text-white">Loading...</div>}

            {imageError && (
              <div className="text-red-400 text-center">
                <div className="text-lg font-medium mb-2">Failed to load image</div>
                <div className="text-sm opacity-75">The image could not be displayed</div>
              </div>
            )}

            <img
              src={currentImage.url}
              alt={currentImage.alt || 'Image'}
              className={`max-w-full max-h-full object-contain transition-transform duration-200 ${
                imageLoaded ? 'opacity-100' : 'opacity-0'
              }`}
              style={{
                transform: `scale(${zoom}) rotate(${rotation}deg)`,
                cursor: zoom > 1 ? 'grab' : 'zoom-in',
              }}
              onLoad={() => {
                setImageLoaded(true)
                setImageError(false)
              }}
              onError={() => {
                setImageLoaded(false)
                setImageError(true)
              }}
              onClick={() => (zoom === 1 ? handleZoomIn() : handleResetZoom())}
            />
          </div>

          {/* Navigation Controls */}
          {images.length > 1 && (
            <>
              <Button
                size="lg"
                variant="ghost"
                onClick={handlePrevious}
                disabled={currentIndex === 0}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20 disabled:opacity-50"
                title="Previous (Left Arrow)"
              >
                <ChevronLeft className="h-8 w-8" />
              </Button>

              <Button
                size="lg"
                variant="ghost"
                onClick={handleNext}
                disabled={currentIndex === images.length - 1}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20 disabled:opacity-50"
                title="Next (Right Arrow)"
              >
                <ChevronRight className="h-8 w-8" />
              </Button>
            </>
          )}

          {/* Footer Info */}
          {currentImage.originalSize && (
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
              <div className="text-xs text-gray-300 text-center">
                {currentImage.originalSize.width} × {currentImage.originalSize.height} pixels
              </div>
            </div>
          )}
        </div>

        {/* Hidden description for accessibility */}
        <div id="image-viewer-description" className="sr-only">
          Image viewer modal showing {currentImage.filename || 'an image'}. Use arrow keys to
          navigate, +/- to zoom, R to rotate, 0 to reset, and Esc to close.
        </div>
      </DialogContent>
    </Dialog>
  )
}
