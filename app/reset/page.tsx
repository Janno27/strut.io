"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { resetSupabaseCookies } from "../lib/supabase/reset-cookies"
import { useRouter } from "next/navigation"

export default function ResetPage() {
  const [message, setMessage] = useState("")
  const router = useRouter()

  // Fonction pour réinitialiser les cookies
  const handleReset = () => {
    try {
      resetSupabaseCookies()
      setMessage("Cookies Supabase réinitialisés avec succès. Redirection dans 2 secondes...")
      
      // Rediriger vers la page d'accueil après un délai
      setTimeout(() => {
        router.push("/")
      }, 2000)
    } catch (error) {
      setMessage(`Erreur lors de la réinitialisation: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <h1 className="text-2xl font-bold mb-6">Réinitialisation des cookies Supabase</h1>
      <p className="mb-4 text-center max-w-lg">
        Cette page permet de résoudre les problèmes liés aux cookies Supabase en les supprimant.
        Cela peut aider à résoudre l'erreur "Failed to parse cookie string".
      </p>
      <Button 
        onClick={handleReset} 
        className="mb-4"
        variant="destructive"
      >
        Réinitialiser les cookies
      </Button>
      {message && <p className="text-center mt-4">{message}</p>}
    </div>
  )
} 