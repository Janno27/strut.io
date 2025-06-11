import { Skeleton } from "@/components/ui/skeleton";

export function AgendaStatsSkeleton() {
  return (
    <div className="flex justify-center items-center">
      <div className="flex items-center space-x-8">
        {/* Statistique 1 */}
        <div className="flex items-center space-x-2">
          <Skeleton className="h-4 w-4" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-6 w-8" />
        </div>
        
        {/* Statistique 2 */}
        <div className="flex items-center space-x-2">
          <Skeleton className="h-4 w-4" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-6 w-8" />
        </div>

        {/* Statistique 3 */}
        <div className="flex items-center space-x-2">
          <Skeleton className="h-4 w-4" />
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-6 w-12" />
        </div>
      </div>
    </div>
  );
}

export function AgendaHeaderSkeleton() {
  return (
    <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
      <div className="flex items-center space-x-4">
        <Skeleton className="h-8 w-24" /> {/* Aujourd'hui */}
        <Skeleton className="h-8 w-32" /> {/* Dropdown vue */}
      </div>
      
      <div className="flex items-center space-x-2">
        <Skeleton className="h-8 w-8" /> {/* Prev button */}
        <Skeleton className="h-6 w-48" />  {/* Title */}
        <Skeleton className="h-8 w-8" /> {/* Next button */}
        <Skeleton className="h-8 w-8" /> {/* Calendar icon */}
      </div>
    </div>
  );
}

export function AgendaCalendarSkeleton() {
  return (
    <div className="border rounded-lg overflow-hidden">
      {/* Header avec les jours */}
      <div className="grid grid-cols-8">
        <Skeleton className="h-12 w-full border-b" />
        {Array.from({ length: 7 }, (_, i) => (
          <Skeleton key={i} className="h-12 w-full border-b border-l" />
        ))}
      </div>
      
      {/* Grille principale */}
      <div className="grid grid-cols-8" style={{ minHeight: "600px" }}>
        {/* Colonne des heures */}
        <div className="border-r bg-muted/30">
          {Array.from({ length: 12 }, (_, i) => (
            <div key={i} className="h-12 p-2">
              <Skeleton className="h-4 w-12" />
            </div>
          ))}
        </div>
        
        {/* Colonnes des jours */}
        {Array.from({ length: 7 }, (_, dayIndex) => {
          // Créneaux fixes pour éviter l'hydratation mismatch
          const daySlots = [
            { top: 100, height: 60 },
            { top: 220, height: 80 },
            { top: 350, height: 50 },
          ].slice(0, (dayIndex % 3) + 1); // Nombre variable mais déterministe

          return (
            <div key={dayIndex} className="border-l relative">
              {daySlots.map((slot, slotIndex) => (
                <div
                  key={slotIndex}
                  className="absolute left-1 right-1"
                  style={{
                    top: `${slot.top + (dayIndex * 10)}px`, // Léger décalage par jour
                    height: `${slot.height}px`,
                  }}
                >
                  <Skeleton className="h-full w-full" />
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function AgendaTabsSkeleton() {
  return (
    <div className="space-y-6">
      {/* Statistiques */}
      <AgendaStatsSkeleton />
      
      {/* Header du calendrier */}
      <AgendaHeaderSkeleton />
      
      {/* Calendrier */}
      <AgendaCalendarSkeleton />
    </div>
  );
} 