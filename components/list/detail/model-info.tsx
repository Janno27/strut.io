"use client"

import { TooltipProvider, Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { ModelInfoProps } from "./types"

export function ModelInfo({ model, firstName, lastName }: ModelInfoProps) {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">{firstName} {lastName}</h2>
      
      {/* Description */}
      {model.description && (
        <div className="mb-6">
          <p className="text-muted-foreground">{model.description}</p>
        </div>
      )}
      
      {/* Informations principales */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div>
          <p className="text-sm text-muted-foreground">Âge</p>
          <p className="font-medium">{model.age} ans</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Taille</p>
          <p className="font-medium">{model.height} cm</p>
        </div>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div>
                <p className="text-sm text-muted-foreground">Mensurations</p>
                <p className="font-medium cursor-help">{model.bust}/{model.waist}/{model.hips}</p>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>Buste: {model.bust} cm</p>
              <p>Taille: {model.waist} cm</p>
              <p>Hanches: {model.hips} cm</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      
      {/* Liens sociaux et professionnels */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        {model.instagram && (
          <div>
            <p className="text-sm text-muted-foreground">Instagram</p>
            <a 
              href={`https://instagram.com/${model.instagram}`}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-primary hover:underline"
            >
              @{model.instagram}
            </a>
          </div>
        )}
        {model.models_com_link && (
          <div>
            <p className="text-sm text-muted-foreground">Models.com</p>
            <a 
              href={model.models_com_link}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-primary hover:underline"
            >
              Voir le profil
            </a>
          </div>
        )}
      </div>
      
      {/* Caractéristiques physiques secondaires */}
      <div className="grid grid-cols-3 gap-4 mt-6">
        {model.shoe_size && (
          <div>
            <p className="text-sm text-muted-foreground">Pointure</p>
            <p className="font-medium">{model.shoe_size}</p>
          </div>
        )}
        {model.eye_color && (
          <div>
            <p className="text-sm text-muted-foreground">Yeux</p>
            <p className="font-medium">{model.eye_color}</p>
          </div>
        )}
        {model.hair_color && (
          <div>
            <p className="text-sm text-muted-foreground">Cheveux</p>
            <p className="font-medium">{model.hair_color}</p>
          </div>
        )}
      </div>
      
      {/* Expérience */}
      {model.experience && model.experience.length > 0 && (
        <div className="mt-6">
          <h3 className="text-lg font-medium mb-2">Expérience</h3>
          <ul className="list-disc list-inside text-muted-foreground">
            {model.experience.map((exp, index) => (
              <li key={index}>{exp}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}