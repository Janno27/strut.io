"use client"

import { Label } from "@/components/ui/label"
import { ImageGroupsManager } from "../../detail/components/image-groups-manager"
import { ImageGroups, FocalPoint } from "../../detail/types"

interface ModelImageGroupsSectionProps {
  imageGroups: ImageGroups
  focalPoints: Record<string, FocalPoint>
  onImageGroupsChange: (newGroups: ImageGroups) => void
  onImageAdd: (groupId: string, e: React.ChangeEvent<HTMLInputElement>) => void
  onImageRemove: (groupId: string, imageIndex: number) => void
  onImageReposition: (groupId: string, imageIndex: number) => void
  onImageClick?: (imageUrl: string, index: number) => void
}

export function ModelImageGroupsSection({
  imageGroups,
  focalPoints,
  onImageGroupsChange,
  onImageAdd,
  onImageRemove,
  onImageReposition,
  onImageClick
}: ModelImageGroupsSectionProps) {
  return (
    <div className="space-y-2">
      <ImageGroupsManager
        imageGroups={imageGroups}
        focalPoints={focalPoints}
        isEditing={true}
        onImageGroupsChange={onImageGroupsChange}
        onImageAdd={onImageAdd}
        onImageRemove={onImageRemove}
        onImageReposition={onImageReposition}
        onImageClick={onImageClick}
        showHeader={true}
        headerTitle="Photos supplémentaires"
        gridCols={4}
      />
    </div>
  )
} 