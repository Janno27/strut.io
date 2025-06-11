import { Skeleton } from "@/components/ui/skeleton";

export function SharedHeaderSkeleton() {
  return (
    <div className="text-center space-y-4">
      <Skeleton className="h-8 w-48 mx-auto" />
      <Skeleton className="h-4 w-64 mx-auto" />
    </div>
  );
}

export function MyAppointmentBannerSkeleton() {
  return (
    <div className="mb-8 p-4 border rounded-lg bg-muted/20">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-4 w-60" />
        </div>
        <Skeleton className="h-10 w-24" />
      </div>
    </div>
  );
}

export function PublicCalendarHeaderSkeleton() {
  return (
    <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg mb-6">
      <div className="flex items-center space-x-4">
        <Skeleton className="h-8 w-24" /> {/* Aujourd'hui */}
        <Skeleton className="h-8 w-32" /> {/* Vue selector */}
      </div>
      
      <div className="flex items-center space-x-2">
        <Skeleton className="h-8 w-8" /> {/* Prev */}
        <Skeleton className="h-6 w-48" /> {/* Title */}
        <Skeleton className="h-8 w-8" /> {/* Next */}
      </div>
    </div>
  );
}

export function PublicCalendarGridSkeleton() {
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
      <div className="grid grid-cols-8" style={{ minHeight: "500px" }}>
        {/* Colonne des heures */}
        <div className="border-r bg-muted/30">
          {Array.from({ length: 10 }, (_, i) => (
            <div key={i} className="h-12 p-2">
              <Skeleton className="h-4 w-12" />
            </div>
          ))}
        </div>
        
        {/* Colonnes des jours avec créneaux disponibles */}
        {Array.from({ length: 7 }, (_, dayIndex) => {
          // Créneaux fixes pour éviter l'hydratation mismatch
          const availableSlots = [
            { top: 120 },
            { top: 200 },
            { top: 280 },
          ].slice(0, (dayIndex % 2) + 1); // Nombre variable mais déterministe

          return (
            <div key={dayIndex} className="border-l relative">
              {availableSlots.map((slot, slotIndex) => (
                <div
                  key={slotIndex}
                  className="absolute left-1 right-1"
                  style={{
                    top: `${slot.top + (dayIndex * 5)}px`, // Léger décalage par jour
                    height: "40px",
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

export function PublicCalendarSkeleton() {
  return (
    <div className="space-y-6">
      <PublicCalendarHeaderSkeleton />
      <PublicCalendarGridSkeleton />
    </div>
  );
}

export function PublicAgendaSkeleton() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <div className="container mx-auto px-4 py-6">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-12">
            <SharedHeaderSkeleton />
          </div>
          
          {/* Bannière de rendez-vous */}
          <MyAppointmentBannerSkeleton />
          
          {/* Calendrier public */}
          <PublicCalendarSkeleton />
        </div>
      </div>
    </div>
  );
} 