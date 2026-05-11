'use client'

import React, { useState, useRef, useCallback } from 'react'
import { ImagePlus, X, Loader2, UploadCloud } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ImageUploadProps {
  value: string[]
  onChange: (value: string[]) => void
  maxImages?: number
  folder?: 'garden-listings' | 'garden-avatars' | string
}

export function ImageUpload({
  value,
  onChange,
  maxImages = 5,
  folder = 'garden-listings'
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const handleUpload = async (files: File[]) => {
    setIsUploading(true)
    setError('')
    
    const newUrls: string[] = []

    try {
      for (const file of files) {
        if (!file.type.startsWith('image/')) {
          throw new Error('Le fichier doit être une image.')
        }
        if (file.size > 5 * 1024 * 1024) {
          throw new Error(`L'image ${file.name} dépasse la taille limite de 5 Mo.`)
        }

        const formData = new FormData()
        formData.append('file', file)
        formData.append('folder', folder === 'garden-avatars' ? 'avatars' : 'listings')

        const res = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        })
        
        let json;
        try {
          json = await res.json()
        } catch (e) {
          throw new Error(`Erreur réseau lors de l'envoi de ${file.name}.`)
        }

        if (!res.ok || !json.success) {
          throw new Error(json.error || `Erreur lors de l'upload de ${file.name}`)
        }

        newUrls.push(json.url)
      }

      onChange([...value, ...newUrls].slice(0, maxImages))

    } catch (err: any) {
      setError(err.message || "Erreur d'upload.")
    } finally {
      setIsUploading(false)
      if (inputRef.current) {
        inputRef.current.value = ''
      }
    }
  }

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return
    const remainingSlots = maxImages - value.length
    if (remainingSlots <= 0) {
      setError(`Vous avez atteint la limite de ${maxImages} images.`)
      return
    }
    const filesToUpload = files.slice(0, remainingSlots)
    handleUpload(filesToUpload)
  }

  const removeImage = (indexToRemove: number) => {
    onChange(value.filter((_, index) => index !== indexToRemove))
  }

  return (
    <div className="space-y-4">
      {/* Upload Zone */}
      <div 
        className={`relative border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center transition-all duration-300
          ${isUploading ? 'border-blue-500/50 bg-blue-500/5' : 'border-white/20 hover:border-blue-400 hover:bg-white/5 cursor-pointer'}
        `}
        onClick={() => !isUploading && inputRef.current?.click()}
      >
        <input 
          type="file" 
          ref={inputRef} 
          className="hidden" 
          accept="image/*" 
          multiple 
          onChange={onFileChange}
          disabled={isUploading || value.length >= maxImages}
        />
        
        {isUploading ? (
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
            <p className="text-sm text-blue-300">Upload en cours...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 text-center">
            <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center mb-2">
              <UploadCloud className="w-6 h-6 text-slate-300" />
            </div>
            <p className="text-white font-medium">Cliquez pour uploader des images</p>
            <p className="text-slate-400 text-xs">Jusqu'à {maxImages} images. PNG, JPG max 5MB.</p>
          </div>
        )}
      </div>

      {error && <p className="text-red-400 text-sm">{error}</p>}

      {/* Gallery Preview */}
      {value.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
          {value.map((url, index) => (
            <div key={index} className="relative group aspect-square rounded-xl overflow-hidden bg-slate-800 border border-white/10">
              <img src={url} alt={`Preview ${index + 1}`} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Button 
                  type="button" 
                  variant="destructive" 
                  size="icon"
                  className="rounded-full w-8 h-8 bg-red-500 hover:bg-red-600"
                  onClick={() => removeImage(index)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
