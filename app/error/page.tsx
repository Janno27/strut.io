"use client";

import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function ErrorPage() {
  const searchParams = useSearchParams();
  const message = searchParams.get("message") || "Une erreur est survenue";

  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <div className="mx-auto max-w-md space-y-8 p-8 bg-white dark:bg-gray-900 rounded-lg shadow-lg">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-red-600 dark:text-red-500">Erreur</h1>
          <p className="mt-4 text-lg text-gray-700 dark:text-gray-300">{message}</p>
        </div>
        <div className="flex justify-center">
          <Link href="/">
            <Button>Retour à l'accueil</Button>
          </Link>
        </div>
      </div>
    </div>
  );
} 