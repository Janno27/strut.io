"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/context/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasAuthCookie, setHasAuthCookie] = useState<boolean>(false);
  
  const { signIn, refreshSession } = useAuth();
  const router = useRouter();

  // Vérifier si le navigateur est basé sur Chromium (Chrome, Opera, Edge)
  const isChromiumBased = typeof window !== 'undefined' && 
    (navigator.userAgent.includes('Chrome') || 
     navigator.userAgent.includes('Opera') || 
     navigator.userAgent.includes('Edge'));
  
  // Vérifier si le cookie d'authentification est présent
  useEffect(() => {
    if (typeof document !== 'undefined') {
      const cookies = document.cookie;
      const hasCookie = cookies.includes('sb-auth');
      setHasAuthCookie(hasCookie);
    }
  }, []);
  
  // Pour les navigateurs Chromium en production, tentative de rafraîchissement auto
  useEffect(() => {
    if (isChromiumBased && process.env.NODE_ENV === 'production' && hasAuthCookie) {
      const attemptAutoRefresh = async () => {
        try {
          await refreshSession();
          // Vérifier à nouveau si l'utilisateur est authentifié après le rafraîchissement
          setTimeout(() => {
            router.push('/');
          }, 500);
        } catch (err) {
          console.error("Erreur lors du rafraîchissement automatique:", err);
        }
      };
      
      attemptAutoRefresh();
    }
  }, [isChromiumBased, hasAuthCookie, refreshSession, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const { error } = await signIn(email, password);
      
      if (error) {
        setError("Email ou mot de passe incorrect");
        return;
      }
      
      // Rediriger vers la page d'accueil après la connexion
      router.push("/");
    } catch (err) {
      setError("Une erreur est survenue lors de la connexion");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold">Connexion</h1>
        <p className="text-muted-foreground mt-2">
          Connectez-vous pour accéder à votre compte
        </p>
      </div>
      
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      {isChromiumBased && hasAuthCookie && process.env.NODE_ENV === 'production' && (
        <Alert>
          <AlertDescription>
            Vous semblez déjà avoir un cookie d'authentification. Tentative de reconnexion automatique...
          </AlertDescription>
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
            required
          />
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Mot de passe</Label>
            <a
              href="/reset-password"
              className="text-sm text-primary hover:underline"
            >
              Mot de passe oublié?
            </a>
          </div>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        
        <Button type="submit" className="w-full" disabled={isLoading || (hasAuthCookie && isChromiumBased)}>
          {isLoading ? "Connexion en cours..." : "Se connecter"}
        </Button>
      </form>
      
      <div className="text-center">
        <p className="text-sm text-muted-foreground">
          Vous n'avez pas de compte?{" "}
          <a href="/register" className="text-primary hover:underline">
            Créer un compte
          </a>
        </p>
      </div>
    </div>
  );
} 