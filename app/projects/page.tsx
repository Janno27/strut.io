"use client";

import { useState, useEffect } from "react";
import { Header } from "@/components/layout/header";
import { ProjectTabs } from "@/components/projects/project-tabs";
import { ProjectPageSkeleton } from "@/components/projects/skeletons/project-skeleton";
import { useAuth } from "@/lib/auth/auth-provider";

export default function ProjectsPage() {
  const { profile } = useAuth();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simuler un délai de chargement initial pour l'UI
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 600);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-black">
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto">
          <div className="mb-12">
            <Header showSearch={false} />
          </div>
          
          {isLoading ? <ProjectPageSkeleton /> : <ProjectTabs />}
        </div>
      </main>
    </div>
  );
} 