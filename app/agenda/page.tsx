"use client";

import { useState, useEffect } from "react";
import { Header } from "@/components/layout/header";
import { AgendaTabs } from "@/components/agenda/agenda-tabs";
import { AgendaTabsSkeleton } from "@/components/agenda/skeletons/agenda-skeleton";
import { useAuth } from "@/lib/auth/auth-provider";

export default function AgendaPage() {
  const { profile } = useAuth();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simuler un délai de chargement initial pour l'UI
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 800);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-black">
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto">
          <div className="mb-12">
            <Header showSearch={false} />
          </div>
          
          {isLoading ? <AgendaTabsSkeleton /> : <AgendaTabs />}
        </div>
      </main>
    </div>
  );
} 