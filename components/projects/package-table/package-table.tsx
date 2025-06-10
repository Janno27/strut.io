"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { createClient } from "@/lib/supabase/client";
import { PackageList } from "./package-list";
import { NewPackageButton } from "./new-package-button";
import { PackageDialog } from "./package-dialog";
import { useAuth } from "@/lib/auth/auth-provider";
import { useToast } from "@/components/ui/use-toast";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription, 
  DialogFooter 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export interface PackageTableProps {
  projectId: string;
}

export function PackageTable({ projectId }: PackageTableProps) {
  const [packages, setPackages] = useState<any[]>([]);
  const [models, setModels] = useState<any[]>([]);
  const [selectedModels, setSelectedModels] = useState<string[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [editingPackageId, setEditingPackageId] = useState<string | null>(null);
  const [newPackage, setNewPackage] = useState({
    name: "",
    description: "",
    status: "pending",
  });
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [shareLink, setShareLink] = useState("");
  const [sharePackageId, setSharePackageId] = useState<string | null>(null);
  
  const { user } = useAuth();
  const supabase = createClient();
  const { toast } = useToast();
  
  // Charger les packages du projet et les mannequins de l'agent
  useEffect(() => {
    loadData();
  }, [projectId, supabase, user]);

  const loadData = async () => {
    if (!projectId || !user) return;
    
    setIsLoading(true);
    
    try {
      // Charger les packages
      const { data: packagesData, error: packagesError } = await supabase
        .rpc('get_project_packages', { project_uuid: projectId });
        
      if (packagesError) throw packagesError;
      
      if (packagesData) {
        setPackages(packagesData);
      }
      
      // Charger les mannequins de l'agent connecté
      const { data: modelsData, error: modelsError } = await supabase
        .from('models')
        .select('id, first_name, last_name, gender, height, bust, waist, hips')
        .eq('agent_id', user.id) // Filtrer par l'agent connecté
        .order('first_name, last_name');
        
      if (modelsError) throw modelsError;
      
      if (modelsData) {
        setModels(modelsData);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Gérer la création ou modification d'un package
  const handleSavePackage = async (e?: React.MouseEvent<HTMLButtonElement>) => {
    if (e) {
      e.preventDefault();
    }
    
    if (!newPackage.name || !projectId) {
      console.log("Informations package incomplètes", { newPackage, projectId });
      return;
    }
    
    try {
      if (editingPackageId) {
        // Mode édition
        console.log("Modification du package", { packageId: editingPackageId, newPackage });
        
        const { error } = await supabase
          .from('packages')
          .update({
            name: newPackage.name,
            description: newPackage.description,
            status: newPackage.status
          })
          .eq('id', editingPackageId);
          
        if (error) throw error;
        
        // Gérer les mannequins du package
        // D'abord supprimer les associations existantes
        const { error: deleteError } = await supabase
          .from('package_models')
          .delete()
          .eq('package_id', editingPackageId);
          
        if (deleteError) throw deleteError;
        
        // Ensuite ajouter les nouvelles associations
        if (selectedModels.length > 0) {
          const packageModelInserts = selectedModels.map(modelId => ({
            package_id: editingPackageId,
            model_id: modelId
          }));
          
          const { error: insertError } = await supabase
            .from('package_models')
            .insert(packageModelInserts);
            
          if (insertError) throw insertError;
        }
        
        toast({
          title: "Package modifié",
          description: `Le package "${newPackage.name}" a été mis à jour avec succès.`
        });
      } else {
        // Mode création
        console.log("Création du package", { newPackage, projectId });
        
        // Créer le nouveau package
        const { data, error } = await supabase
          .from('packages')
          .insert({
            name: newPackage.name,
            description: newPackage.description,
            status: newPackage.status,
            project_id: projectId
          })
          .select();
          
        if (error) throw error;
        
        if (data && data[0] && selectedModels.length > 0) {
          console.log("Package créé avec succès:", data);
          
          // Ajouter les mannequins au package
          const packageModelInserts = selectedModels.map(modelId => ({
            package_id: data[0].id,
            model_id: modelId
          }));
          
          const { error: packageModelsError } = await supabase
            .from('package_models')
            .insert(packageModelInserts);
            
          if (packageModelsError) throw packageModelsError;
        }
        
        toast({
          title: "Package créé",
          description: `Le package "${newPackage.name}" a été créé avec succès.`
        });
      }
      
      // Recharger les packages
      await loadData();
      
      // Réinitialiser le formulaire
      resetForm();
    } catch (error) {
      console.error('Erreur lors de la sauvegarde du package:', error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la sauvegarde du package.",
        variant: "destructive"
      });
    }
  };

  // Gérer la suppression d'un package
  const handleDeletePackage = async (packageId: string) => {
    if (!packageId) return;
    
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce package ?")) {
      return;
    }
    
    try {
      // Supprimer d'abord les associations avec les mannequins
      const { error: deleteModelsError } = await supabase
        .from('package_models')
        .delete()
        .eq('package_id', packageId);
        
      if (deleteModelsError) throw deleteModelsError;
      
      // Ensuite supprimer le package lui-même
      const { error } = await supabase
        .from('packages')
        .delete()
        .eq('id', packageId);
        
      if (error) throw error;
      
      toast({
        title: "Package supprimé",
        description: "Le package a été supprimé avec succès."
      });
      
      // Recharger les packages
      await loadData();
    } catch (error) {
      console.error('Erreur lors de la suppression du package:', error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la suppression du package.",
        variant: "destructive"
      });
    }
  };

  // Gérer l'édition d'un package
  const handleEditPackage = async (packageId: string) => {
    if (!packageId) return;
    
    try {
      // Récupérer les détails du package
      const { data: packageData, error: packageError } = await supabase
        .from('packages')
        .select('*')
        .eq('id', packageId)
        .single();
        
      if (packageError) throw packageError;
      
      if (packageData) {
        // Récupérer les mannequins associés au package
        const { data: packageModelsData, error: modelsError } = await supabase
          .from('package_models')
          .select('model_id')
          .eq('package_id', packageId);
          
        if (modelsError) throw modelsError;
        
        // Mettre à jour le formulaire avec les données du package
        setNewPackage({
          name: packageData.name,
          description: packageData.description || "",
          status: packageData.status
        });
        
        // Mettre à jour la sélection des mannequins
        const modelIds = packageModelsData?.map((item: { model_id: string }) => item.model_id) || [];
        setSelectedModels(modelIds);
        
        // Définir l'ID du package en cours d'édition
        setEditingPackageId(packageId);
        
        // Ouvrir la boîte de dialogue
        setIsDialogOpen(true);
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des détails du package:', error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la récupération des détails du package.",
        variant: "destructive"
      });
    }
  };

  // Gérer le partage d'un package
  const handleSharePackage = async (packageId: string) => {
    if (!packageId || !user) return;
    
    try {
      // Récupérer les mannequins du package
      const { data: packageModels, error: modelsError } = await supabase
        .from('package_models')
        .select('model_id')
        .eq('package_id', packageId);
        
      if (modelsError) throw modelsError;
      
      if (packageModels && packageModels.length > 0) {
        // Générer un lien de partage
        const shareUrl = `${window.location.origin}/shared?agent=${user.id}&package=${packageId}`;
        
        // Copier directement dans le presse-papiers
        navigator.clipboard.writeText(shareUrl);
        
        toast({
          title: "Lien copié",
          description: "Le lien de partage a été copié dans le presse-papiers."
        });
      } else {
        toast({
          title: "Impossible de partager",
          description: "Ce package ne contient aucun mannequin à partager.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Erreur lors de la génération du lien de partage:', error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la génération du lien de partage.",
        variant: "destructive"
      });
    }
  };

  // Réinitialiser le formulaire
  const resetForm = () => {
    setNewPackage({
      name: "",
      description: "",
      status: "pending",
    });
    setSelectedModels([]);
    setEditingPackageId(null);
    setIsDialogOpen(false);
  };

  // Gérer la sélection/désélection d'un mannequin
  const handleModelSelection = (modelId: string) => {
    if (!modelId) return; // Vérifier que l'ID est valide
    
    setSelectedModels(prev => {
      if (prev.includes(modelId)) {
        return prev.filter(id => id !== modelId);
      } else {
        return [...prev, modelId];
      }
    });
  };

  // Ouvrir la boîte de dialogue pour un nouveau package
  const handleOpenDialog = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  return (
    <div>
      {isLoading ? (
        <div className="text-center py-8">Chargement des packages...</div>
      ) : (
        <PackageList 
          packages={packages} 
          onDeletePackage={handleDeletePackage}
          onEditPackage={handleEditPackage}
          onSharePackage={handleSharePackage}
        />
      )}
      
      {typeof window !== 'undefined' && document.getElementById('new-package-button-container') && createPortal(
        <NewPackageButton 
          isOpen={isDialogOpen} 
          setIsOpen={handleOpenDialog} 
        />,
        document.getElementById('new-package-button-container')!
      )}
      
      <PackageDialog
        isOpen={isDialogOpen}
        setIsOpen={(open) => {
          if (!open) resetForm();
          setIsDialogOpen(open);
        }}
        newPackage={newPackage}
        setNewPackage={setNewPackage}
        models={models}
        selectedModels={selectedModels}
        onModelSelection={handleModelSelection}
        onCreatePackage={handleSavePackage}
        isEditing={!!editingPackageId}
      />
    </div>
  );
} 