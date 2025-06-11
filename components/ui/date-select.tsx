"use client";

import { useState } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';

interface DateSelectProps {
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  id?: string;
  minDate?: string;
}

export function DateSelect({
  value,
  onChange,
  placeholder = "Sélectionner une date",
  id,
  minDate = new Date().toISOString().split('T')[0],
}: DateSelectProps) {
  const [showQuickSelect, setShowQuickSelect] = useState(true);

  // Générer les options de dates rapides (prochains 14 jours)
  const generateQuickDateOptions = () => {
    const options = [];
    const today = new Date();
    
    for (let i = 0; i < 14; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      
      const dateString = date.toISOString().split('T')[0];
      let label = '';
      
      if (i === 0) {
        label = "Aujourd'hui";
      } else if (i === 1) {
        label = "Demain";
      } else {
        label = date.toLocaleDateString('fr-FR', {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
        });
      }
      
      options.push({
        value: dateString,
        label,
        isToday: i === 0,
        isTomorrow: i === 1,
      });
    }
    
    return options;
  };

  const quickDateOptions = generateQuickDateOptions();

  const handleQuickSelect = (dateValue: string) => {
    onChange(dateValue);
  };

  const handleManualInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    onChange(event.target.value);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center space-x-2">
        <Button
          type="button"
          variant={showQuickSelect ? "default" : "outline"}
          size="sm"
          onClick={() => setShowQuickSelect(true)}
        >
          <Calendar className="h-4 w-4 mr-1" />
          Rapide
        </Button>
        <Button
          type="button"
          variant={!showQuickSelect ? "default" : "outline"}
          size="sm"
          onClick={() => setShowQuickSelect(false)}
        >
          Manuel
        </Button>
      </div>

      {showQuickSelect ? (
        <Select value={value} onValueChange={handleQuickSelect}>
          <SelectTrigger id={id} className="w-full">
            <div className="flex items-center">
              <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
              <SelectValue placeholder={placeholder} />
            </div>
          </SelectTrigger>
          <SelectContent className="max-h-60">
            {quickDateOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                <div className="flex items-center justify-between w-full">
                  <span className={option.isToday ? "font-semibold text-blue-600" : ""}>
                    {option.label}
                  </span>
                  {option.isToday && (
                    <span className="text-xs text-blue-600 ml-2">•</span>
                  )}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ) : (
        <div className="relative">
          <Input
            id={id}
            type="date"
            value={value}
            onChange={handleManualInput}
            min={minDate}
            className="pl-10"
          />
          <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        </div>
      )}
    </div>
  );
} 