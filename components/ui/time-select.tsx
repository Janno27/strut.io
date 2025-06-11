"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Clock } from 'lucide-react';

interface TimeSelectProps {
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  id?: string;
  startHour?: number;
  endHour?: number;
  minuteStep?: number;
}

export function TimeSelect({
  value,
  onChange,
  placeholder = "Sélectionner l'heure",
  id,
  startHour = 6,
  endHour = 23,
  minuteStep = 30,
}: TimeSelectProps) {
  // Générer les options d'heure
  const generateTimeOptions = () => {
    const options = [];
    
    // Ajouter des heures communes en premier
    const commonTimes = [
      { value: '09:00', label: '09:00', isCommon: true },
      { value: '10:00', label: '10:00', isCommon: true },
      { value: '11:00', label: '11:00', isCommon: true },
      { value: '14:00', label: '14:00', isCommon: true },
      { value: '15:00', label: '15:00', isCommon: true },
      { value: '16:00', label: '16:00', isCommon: true },
    ];
    
    // Ajouter les heures communes si elles sont dans la plage
    commonTimes.forEach(time => {
      const [hour] = time.value.split(':').map(Number);
      if (hour >= startHour && hour <= endHour) {
        options.push(time);
      }
    });
    
    // Ajouter un séparateur
    if (options.length > 0) {
      options.push({ value: 'separator', label: '―――――――――――', isCommon: false });
    }
    
    // Ajouter toutes les autres heures
    for (let hour = startHour; hour <= endHour; hour++) {
      for (let minute = 0; minute < 60; minute += minuteStep) {
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        
        // Ne pas dupliquer les heures communes
        if (!commonTimes.some(common => common.value === timeString)) {
          const displayTime = new Date(`2000-01-01T${timeString}`).toLocaleTimeString('fr-FR', {
            hour: '2-digit',
            minute: '2-digit',
          });
          
          options.push({
            value: timeString,
            label: displayTime,
            isCommon: false,
          });
        }
      }
    }
    
    return options;
  };

  const timeOptions = generateTimeOptions();

  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger id={id} className="w-full">
        <div className="flex items-center">
          <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
          <SelectValue placeholder={placeholder} />
        </div>
      </SelectTrigger>
      <SelectContent className="max-h-60">
        {timeOptions.map((option) => (
          option.value === 'separator' ? (
            <div key="separator" className="px-2 py-1 text-xs text-muted-foreground text-center border-b">
              {option.label}
            </div>
          ) : (
            <SelectItem 
              key={option.value} 
              value={option.value}
              className={option.isCommon ? "font-medium" : ""}
            >
              {option.label}
              {option.isCommon && <span className="ml-2 text-xs text-muted-foreground">⭐</span>}
            </SelectItem>
          )
        ))}
      </SelectContent>
    </Select>
  );
} 