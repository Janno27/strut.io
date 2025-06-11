import { Skeleton } from "@/components/ui/skeleton";

export function ClientSelectorSkeleton() {
  return (
    <div className="flex items-center space-x-4">
      <Skeleton className="h-10 w-64" /> {/* Client selector */}
      <Skeleton className="h-10 w-32" /> {/* New client button */}
    </div>
  );
}

export function ProjectTabsSkeleton() {
  return (
    <div className="sticky top-0 bg-white dark:bg-black z-10 py-2 border-b border-border/40">
      <div className="flex justify-between items-center">
        <div className="h-10 overflow-x-auto flex-1 justify-start flex items-center space-x-2 p-1 bg-muted rounded-md">
          {/* Tabs simulés */}
          <Skeleton className="h-8 w-24 rounded-sm" />
          <Skeleton className="h-8 w-32 rounded-sm" />
          <Skeleton className="h-8 w-28 rounded-sm" />
          <Skeleton className="h-8 w-8 rounded-sm" /> {/* Plus button */}
        </div>
      </div>
    </div>
  );
}

export function PackageCardSkeleton() {
  return (
    <div className="border rounded-lg p-4 space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-5 w-32" /> {/* Package name */}
          <Skeleton className="h-4 w-48" /> {/* Package description */}
        </div>
        <div className="flex items-center space-x-2">
          <Skeleton className="h-6 w-16" /> {/* Status badge */}
          <Skeleton className="h-8 w-8" /> {/* Menu button */}
        </div>
      </div>
      
      {/* Models section */}
      <div className="space-y-2">
        <Skeleton className="h-4 w-20" /> {/* "Mannequins" label */}
        <div className="flex flex-wrap gap-2">
          <Skeleton className="h-8 w-24" />
          <Skeleton className="h-8 w-28" />
          <Skeleton className="h-8 w-20" />
        </div>
      </div>
      
      {/* Actions */}
      <div className="flex items-center justify-between pt-2">
        <Skeleton className="h-4 w-32" /> {/* Creation date */}
        <div className="flex space-x-2">
          <Skeleton className="h-8 w-20" /> {/* Action button */}
          <Skeleton className="h-8 w-24" /> {/* Action button */}
        </div>
      </div>
    </div>
  );
}

export function PackageTableSkeleton() {
  return (
    <div className="space-y-4">
      {/* New package button placeholder */}
      <div className="flex justify-end">
        <Skeleton className="h-10 w-40" />
      </div>
      
      {/* Package cards grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <PackageCardSkeleton />
        <PackageCardSkeleton />
        <PackageCardSkeleton />
        <PackageCardSkeleton />
        <PackageCardSkeleton />
        <PackageCardSkeleton />
      </div>
    </div>
  );
}

export function ProjectTabsMainSkeleton() {
  return (
    <div>
      <div className="flex gap-6 mb-6">
        <div className="w-[70%]">
          <div className="flex justify-start items-center mb-6">
            <ClientSelectorSkeleton />
          </div>
          
          {/* Project tabs */}
          <ProjectTabsSkeleton />
        </div>
        
        <div className="flex-1 flex justify-end items-end">
          <Skeleton className="h-10 w-10 rounded-full" /> {/* Floating button */}
        </div>
      </div>
      
      {/* Package table content */}
      <PackageTableSkeleton />
    </div>
  );
}

export function EmptyProjectStateSkeleton() {
  return (
    <div className="text-center py-12 space-y-4">
      <Skeleton className="h-12 w-12 mx-auto rounded-full" />
      <Skeleton className="h-6 w-48 mx-auto" />
      <Skeleton className="h-4 w-64 mx-auto" />
      <Skeleton className="h-10 w-40 mx-auto" />
    </div>
  );
}

export function ProjectPageSkeleton() {
  return (
    <div>
      <div className="flex gap-6 mb-6">
        <div className="w-[70%]">
          <div className="flex justify-start items-center mb-6">
            <ClientSelectorSkeleton />
          </div>
          
          {/* Loading state or empty state */}
          <div className="space-y-6">
            <Skeleton className="h-4 w-48 mx-auto" /> {/* Loading text */}
            <EmptyProjectStateSkeleton />
          </div>
        </div>
        
        <div className="flex-1"></div>
      </div>
    </div>
  );
} 