"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/context/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function RegisterForm() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState<string>("client");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const { signUp } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    // Validation de base
    if (password !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas");
      return;
    }
    
    if (password.length < 8) {
      setError("Le mot de passe doit contenir au moins 8 caractères");
      return;
    }
    
    setIsLoading(true);

    try {
      const { error } = await signUp(email, password, role, fullName);
      
      if (error) {
        if (error.message.includes("email")) {
          setError("Cet email est déjà utilisé");
        } else {
          setError(error.message);
        }
        return;
      }
      
      // Forcer le rechargement complet de la page
      window.location.href = "/";
    } catch (err) {
      setError("Une erreur est survenue lors de l'inscription");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold">Créer un compte</h1>
        <p className="text-muted-foreground mt-2">
          Inscrivez-vous pour accéder à l'application
        </p>
      </div>
      
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="fullName">Nom complet</Label>
          <Input
            id="fullName"
            placeholder="Votre nom complet"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
          />
        </div>
        
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
          <Label htmlFor="role">Je suis</Label>
          <Select 
            value={role} 
            onValueChange={setRole}
          >
            <SelectTrigger>
              <SelectValue placeholder="Sélectionnez votre rôle" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="client">Un client</SelectItem>
              <SelectItem value="model">Un modèle</SelectItem>
              <SelectItem value="agent">Un agent</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="password">Mot de passe</Label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
          <Input
            id="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
        </div>
        
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "Inscription en cours..." : "Créer un compte"}
        </Button>
      </form>
      
      <div className="text-center">
        <p className="text-sm text-muted-foreground">
          Vous avez déjà un compte?{" "}
          <a href="/login" className="text-primary hover:underline">
            Se connecter
          </a>
        </p>
      </div>
    </div>
  );
} 