"use client"

import { ToggleLeft, ToggleRight } from "lucide-react"
import { TooltipProvider, Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { ModelInfoProps } from "./types"
import { ModelBooksInfo } from "./components/model-books-info"
import { useUnitToggle } from "@/hooks/use-unit-toggle"

export function ModelInfo({ model, firstName, lastName }: ModelInfoProps) {
  const { unit, toggleUnit, formatMeasurement, formatMeasurementSimple, getUnitLabel } = useUnitToggle()

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
        {/* Afficher l'âge seulement s'il est renseigné */}
        {(model.age && model.age > 0) && (
          <div>
            <p className="text-sm text-muted-foreground">Âge</p>
            <p className="font-medium">{model.age} ans</p>
          </div>
        )}
        <div className={(model.age && model.age > 0) ? "" : "col-span-2"}>
          <p className="text-sm text-muted-foreground">Taille</p>
          <p className="font-medium">{formatMeasurement(model.height, true)}</p>
        </div>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
                             <div className={(model.age && model.age > 0) ? "col-span-2" : "col-span-1"}>
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-sm text-muted-foreground">Mensurations</p>
                  <button
                    onClick={toggleUnit}
                    className="flex items-center text-xs text-muted-foreground hover:text-foreground transition-colors"
                    title={`Basculer vers ${unit === 'cm' ? 'pouces' : 'cm'}`}
                  >
                    {unit === 'cm' ? (
                      <ToggleLeft className="w-3 h-3" />
                    ) : (
                      <ToggleRight className="w-3 h-3" />
                    )}
                    <span className="ml-1 text-[10px]">{unit === 'cm' ? 'cm' : '"'}</span>
                  </button>
                </div>
                <p className="font-medium cursor-help">
                  {formatMeasurementSimple(model.bust)}/{formatMeasurementSimple(model.waist)}/{formatMeasurementSimple(model.hips)}
                </p>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>Buste: {formatMeasurement(model.bust)}</p>
              <p>Taille: {formatMeasurement(model.waist)}</p>
              <p>Hanches: {formatMeasurement(model.hips)}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      
      {/* Liens sociaux et professionnels */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div>
          <p className="text-sm text-muted-foreground">Instagram</p>
          {model.instagram ? (
            <a 
              href={`https://instagram.com/${model.instagram}`}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-primary hover:underline"
            >
              @{model.instagram}
            </a>
          ) : (
            <p className="font-medium">-</p>
          )}
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Models.com</p>
          {model.models_com_link ? (
            <a 
              href={model.models_com_link}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-primary hover:underline"
            >
              Voir le profil
            </a>
          ) : (
            <p className="font-medium">-</p>
          )}
        </div>
      </div>
      
      {/* Caractéristiques physiques secondaires */}
      <div className="grid grid-cols-3 gap-4 mt-6">
        <div>
          <p className="text-sm text-muted-foreground">Pointure</p>
          <p className="font-medium">{model.shoe_size || "-"}</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Yeux</p>
          <p className="font-medium">{model.eye_color || "-"}</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Cheveux</p>
          <p className="font-medium">{model.hair_color || "-"}</p>
        </div>
      </div>

      {/* Books & Portfolios */}
      <ModelBooksInfo books={model.books || []} />
      
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