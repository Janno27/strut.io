import { useState, useCallback } from 'react'

export type Unit = 'cm' | 'inch'

export function useUnitToggle(defaultUnit: Unit = 'cm') {
  const [unit, setUnit] = useState<Unit>(defaultUnit)

  const toggleUnit = useCallback(() => {
    setUnit(prev => prev === 'cm' ? 'inch' : 'cm')
  }, [])

  const cmToInch = useCallback((cm: number): number => {
    return Math.round(cm / 2.54 * 100) / 100
  }, [])

  const formatMeasurement = useCallback((value: number | undefined | null, isHeight: boolean = false): string => {
    if (!value) return "-"
    
    if (unit === 'inch') {
      const inches = cmToInch(value)
      if (isHeight) {
        // Pour la taille, on affiche en pieds et pouces (ex: 5'7")
        const feet = Math.floor(inches / 12)
        const remainingInches = Math.round((inches % 12) * 100) / 100
        return `${feet}'${remainingInches}"`
      } else {
        // Pour les autres mesures, juste en pouces (ex: 34.5")
        return `${inches}"`
      }
    }
    
    return `${value} cm`
  }, [unit, cmToInch])

  const formatMeasurementSimple = useCallback((value: number | undefined | null): string => {
    if (!value) return "-"
    
    if (unit === 'inch') {
      const inches = cmToInch(value)
      return inches.toString()
    }
    
    return value.toString()
  }, [unit, cmToInch])

  const getUnitLabel = useCallback((): string => {
    return unit === 'cm' ? 'cm' : '"'
  }, [unit])

  return {
    unit,
    toggleUnit,
    formatMeasurement,
    formatMeasurementSimple,
    getUnitLabel
  }
} 