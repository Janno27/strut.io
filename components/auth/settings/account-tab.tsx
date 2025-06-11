"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth/auth-provider";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Upload, Save, X } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface AccountTabProps {
  onSave?: () => void;
}

export function AccountTab({ onSave }: AccountTabProps) {
  const { user, profile, refreshProfile } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  
  const [accountForm, setAccountForm] = useState({
    full_name: profile?.full_name || "",
    email: user?.email || "",
    role: profile?.role || "",
    avatar_url: profile?.avatar_url || "",
  });

  const supabase = createClient();

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setAvatarPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadAvatar = async (file: File): Promise<string | null> => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user?.id}_${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('models')
        .upload(filePath, file);

      if (uploadError) {
        console.error('Erreur upload:', uploadError);
        return null;
      }

      const { data } = supabase.storage
        .from('models')
        .getPublicUrl(filePath);

      return data.publicUrl;
    } catch (error) {
      console.error('Erreur lors de l\'upload:', error);
      return null;
    }
  };

  const handleSaveAccount = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      let avatarUrl = accountForm.avatar_url;

      if (avatarFile) {
        const newAvatarUrl = await uploadAvatar(avatarFile);
        if (newAvatarUrl) {
          avatarUrl = newAvatarUrl;
        }
      }

      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: accountForm.full_name,
          avatar_url: avatarUrl,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (error) {
        throw error;
      }

      await refreshProfile();

      toast({
        title: "Profil mis à jour",
        description: "Vos informations ont été sauvegardées avec succès.",
      });

      setAvatarFile(null);
      setAvatarPreview(null);
      onSave?.();
    } catch (error) {
      console.error('Erreur:', error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la sauvegarde.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getInitials = () => {
    if (accountForm.full_name) {
      return accountForm.full_name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase();
    }
    return accountForm.email?.substring(0, 2).toUpperCase() || "U";
  };

  // Correction de l'erreur avatar src vide
  const avatarSrc = avatarPreview || (accountForm.avatar_url && accountForm.avatar_url.trim() !== "" ? accountForm.avatar_url : null);

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium mb-2">Informations personnelles</h3>
        <p className="text-sm text-muted-foreground">
          Gérez vos informations de compte et de profil
        </p>
      </div>

      {/* Avatar Section */}
      <div className="flex items-center space-x-4 p-4 border rounded-lg">
        <Avatar className="h-16 w-16">
          {avatarSrc && (
            <AvatarImage 
              src={avatarSrc} 
              alt={accountForm.full_name || "Avatar"} 
            />
          )}
          <AvatarFallback className="text-lg">
            {getInitials()}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <h4 className="font-medium">Photo de profil</h4>
            <Badge variant="secondary" className="text-xs">
              {accountForm.role}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mb-3">
            Formats acceptés : JPG, PNG, GIF. Taille max : 5MB
          </p>
          <div className="flex items-center space-x-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => document.getElementById('avatar-upload')?.click()}
            >
              <Upload className="h-4 w-4 mr-2" />
              Changer la photo
            </Button>
            {avatarSrc && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  setAvatarPreview(null);
                  setAvatarFile(null);
                  setAccountForm(prev => ({ ...prev, avatar_url: "" }));
                }}
              >
                <X className="h-4 w-4 mr-2" />
                Supprimer
              </Button>
            )}
          </div>
          <input
            id="avatar-upload"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleAvatarChange}
          />
        </div>
      </div>

      {/* Form Fields */}
      <div className="grid gap-4">
        <div className="grid gap-2">
          <Label htmlFor="full_name">Nom complet</Label>
          <Input
            id="full_name"
            type="text"
            value={accountForm.full_name}
            onChange={(e) => setAccountForm(prev => ({ 
              ...prev, 
              full_name: e.target.value 
            }))}
            placeholder="Votre nom complet"
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="email">Adresse email</Label>
          <Input
            id="email"
            type="email"
            value={accountForm.email}
            disabled
            className="bg-muted"
          />
          <p className="text-xs text-muted-foreground">
            L'email ne peut pas être modifié pour des raisons de sécurité
          </p>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="role">Rôle</Label>
          <Select value={accountForm.role} disabled>
            <SelectTrigger className="bg-muted">
              <SelectValue placeholder="Sélectionner un rôle" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="admin">Administrateur</SelectItem>
              <SelectItem value="agent">Agent</SelectItem>
              <SelectItem value="client">Client</SelectItem>
              <SelectItem value="model">Mannequin</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            Le rôle est défini par l'administrateur
          </p>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end pt-4 border-t">
        <Button 
          onClick={handleSaveAccount}
          disabled={isLoading}
          className="w-32"
        >
          <Save className="h-4 w-4 mr-2" />
          {isLoading ? "Sauvegarde..." : "Sauvegarder"}
        </Button>
      </div>
    </div>
  );
} 