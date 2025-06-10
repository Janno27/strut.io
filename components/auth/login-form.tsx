'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth/auth-provider'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle, Loader2 } from 'lucide-react'

export function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [redirecting, setRedirecting] = useState(false)
  const { signIn, user, loading, initialized } = useAuth()
  const router = useRouter()

  // Rediriger si l'utilisateur est déjà connecté
  useEffect(() => {
    if (initialized && !loading && user && !redirecting) {
      setRedirecting(true)
      // Utiliser router.replace pour éviter l'historique
      setTimeout(() => {
        router.replace('/')
      }, 100)
    }
  }, [user, loading, initialized, router, redirecting])

  // Afficher un loader pendant l'initialisation
  if (!initialized) {
    return (
      <div className="w-full max-w-md mx-auto text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
        <p className="text-muted-foreground">Initialisation...</p>
      </div>
    )
  }

  // Si l'utilisateur est connecté ou en cours de redirection
  if (user || redirecting) {
    return (
      <div className="w-full max-w-md mx-auto text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
        <p className="text-muted-foreground">Redirection en cours...</p>
      </div>
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsSubmitting(true)

    if (!email || !password) {
      setError('Veuillez remplir tous les champs')
      setIsSubmitting(false)
      return
    }

    try {
      const result = await signIn(email, password)
      
      if (result.success) {
        // Attendre que l'auth provider détecte la connexion
        setRedirecting(true)
        // Redirection via le middleware automatiquement
        setTimeout(() => {
          window.location.href = '/'
        }, 500)
      } else {
        setError(result.error || 'Erreur lors de la connexion')
        setIsSubmitting(false)
      }
    } catch (err) {
      console.error('Erreur de connexion:', err)
      setError('Une erreur inattendue est survenue')
      setIsSubmitting(false)
    }
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold">Connexion</h1>
        <p className="text-muted-foreground mt-2">
          Connectez-vous à votre compte
        </p>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="votre@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isSubmitting || redirecting}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Mot de passe</Label>
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isSubmitting || redirecting}
            required
          />
        </div>

        <Button 
          type="submit" 
          className="w-full" 
          disabled={isSubmitting || redirecting}
        >
          {isSubmitting || redirecting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {redirecting ? 'Redirection...' : 'Connexion...'}
            </>
          ) : (
            'Se connecter'
          )}
        </Button>
      </form>

      <div className="text-center mt-4">
        <p className="text-sm text-muted-foreground">
          Pas encore de compte ?{' '}
          <a href="/register" className="text-primary hover:underline">
            S&apos;inscrire
          </a>
        </p>
      </div>
    </div>
  )
} 