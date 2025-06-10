import Link from 'next/link'
import { AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'

export default function AuthCodeError() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">
            Erreur d'authentification
          </h1>
          <p className="mt-2 text-gray-600">
            Une erreur est survenue lors de l'authentification
          </p>
        </div>

        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Le lien d'authentification est invalide ou a expiré. 
            Veuillez réessayer de vous connecter.
          </AlertDescription>
        </Alert>

        <div className="space-y-4">
          <Button asChild className="w-full">
            <Link href="/login">
              Retour à la connexion
            </Link>
          </Button>
          
          <Button variant="outline" asChild className="w-full">
            <Link href="/">
              Retour à l'accueil
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
} 