"use client"

import Image from "next/image"
import { ImageGalleryProps } from "./types"

export function ImageGallery({ model, isEditing, onImageClick }: ImageGalleryProps) {
  const additionalImages = model.additionalImages || []

  return (
    <>
      {/* Image principale */}
      <div className="mb-4">
        <div className="flex flex-col">
          <div className="rounded-xl overflow-hidden">
            <div className="relative aspect-square">
              <Image
                src={model.imageUrl}
                alt={model.name}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 33vw"
                priority
              />
            </div>
          </div>
        </div>
      </div>

      {/* Images supplémentaires (masquées en mode édition) */}
      {!isEditing && additionalImages.map((imageUrl, index) => (
        <div key={index} className="mb-4">
          <div 
            className="rounded-xl overflow-hidden cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => onImageClick(imageUrl)}
          >
            <div className="relative aspect-square">
              <Image
                src={imageUrl}
                alt={`${model.name} - photo ${index + 1}`}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 33vw"
              />
            </div>
          </div>
        </div>
      ))}
    </>
  )
}