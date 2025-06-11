"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { SearchBar } from "@/components/ui/search-bar";
import { SlotWithAppointment } from "@/lib/types/agenda";
import { AddModelModal } from "../list/add-model-modal";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/lib/auth/auth-provider";
import { UserPlus, Search, Users } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

interface ConvertAppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  appointmentData: SlotWithAppointment | null;
  onSuccess?: () => void;
}

interface Model {
  id: string;
  first_name: string;
  last_name: string;
  gender: string;
  age?: number;
  height?: number;
  main_image?: string;
  instagram?: string;
}

export function ConvertAppointmentModal({
  isOpen,
  onClose,
  appointmentData,
  onSuccess
}: ConvertAppointmentModalProps) {
  const { user } = useAuth();
  const supabase = createClient();
  
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [models, setModels] = useState<Model[]>([]);
  const [filteredModels, setFilteredModels] = useState<Model[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Charger les mannequins existants
  useEffect(() => {
    if (isOpen && user) {
      loadModels();
    }
  }, [isOpen, user]);

  // Filtrer les mannequins selon la recherche
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredModels(models);
    } else {
      const filtered = models.filter(model => {
        const fullName = `${model.first_name} ${model.last_name}`.toLowerCase();
        const query = searchQuery.toLowerCase();
        return fullName.includes(query) || 
               model.instagram?.toLowerCase().includes(query);
      });
      setFilteredModels(filtered);
    }
  }, [searchQuery, models]);

  const loadModels = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('models')
        .select('id, first_name, last_name, gender, age, height, main_image, instagram')
        .eq('agent_id', user.id)
        .order('first_name', { ascending: true });

      if (error) throw error;
      
      setModels(data || []);
      setFilteredModels(data || []);
    } catch (error) {
      console.error('Erreur lors du chargement des mannequins:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateNew = () => {
    setShowCreateModal(true);
  };

  const handleLinkExisting = (model: Model) => {
    // TODO: Implementer la logique de liaison
    console.log('Lier le rendez-vous au mannequin:', model);
    if (onSuccess) onSuccess();
    onClose();
  };

  const handleModelCreated = () => {
    setShowCreateModal(false);
    if (onSuccess) onSuccess();
    onClose();
  };

  const handleToggleSearch = () => {
    setIsSearchOpen(!isSearchOpen);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName[0] || ''}${lastName[0] || ''}`.toUpperCase();
  };
  
  if (!appointmentData?.appointment) return null;

  return (
    <>
      <Dialog open={isOpen && !showCreateModal} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <UserPlus className="h-5 w-5 text-violet-600" />
              <span>Convertir le rendez-vous</span>
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            {/* Informations du rendez-vous */}
            <div className="p-4 bg-muted/30 rounded-lg">
              <h3 className="font-medium mb-2">Informations du rendez-vous</h3>
              <div className="space-y-1 text-sm text-muted-foreground">
                <p><span className="font-medium">Nom :</span> {appointmentData.appointment.model_name}</p>
                {appointmentData.appointment.model_email && (
                  <p><span className="font-medium">Email :</span> {appointmentData.appointment.model_email}</p>
                )}
                {appointmentData.appointment.model_phone && (
                  <p><span className="font-medium">Téléphone :</span> {appointmentData.appointment.model_phone}</p>
                )}
                {appointmentData.appointment.model_instagram && (
                  <p><span className="font-medium">Instagram :</span> {appointmentData.appointment.model_instagram}</p>
                )}
              </div>
            </div>

            {/* Options de conversion */}
            <div className="space-y-4">
              <h3 className="font-medium">Choisissez une option :</h3>
              
              {/* Créer un nouveau mannequin */}
              <Button
                onClick={handleCreateNew}
                className="w-full justify-start h-auto p-4 border-2 border-dashed hover:border-violet-300 hover:bg-violet-50/50"
                variant="outline"
              >
                <UserPlus className="mr-3 h-5 w-5 text-violet-600" />
                <div className="text-left">
                  <div className="font-medium">Créer un nouveau profil mannequin</div>
                  <div className="text-sm text-muted-foreground">
                    Utiliser les informations du rendez-vous pour créer un nouveau profil
                  </div>
                </div>
              </Button>

              {/* Lier à un mannequin existant */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Lier à un mannequin existant</span>
                  </div>
                  <SearchBar
                    isOpen={isSearchOpen}
                    onToggle={handleToggleSearch}
                    onSearch={handleSearch}
                    placeholder="Rechercher un mannequin..."
                  />
                </div>

                {isLoading ? (
                  <div className="text-center py-4 text-muted-foreground">
                    Chargement des mannequins...
                  </div>
                ) : filteredModels.length > 0 ? (
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {filteredModels.slice(0, 8).map((model) => (
                      <div
                        key={model.id}
                        className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                        onClick={() => handleLinkExisting(model)}
                      >
                        <Avatar className="h-10 w-10">
                          {model.main_image && (
                            <AvatarImage src={model.main_image} alt={`${model.first_name} ${model.last_name}`} />
                          )}
                          <AvatarFallback className="text-sm">
                            {getInitials(model.first_name, model.last_name)}
                          </AvatarFallback>
                        </Avatar>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2">
                            <span className="font-medium">{model.first_name} {model.last_name}</span>
                            <Badge variant="secondary" className="text-xs">
                              {model.gender === 'male' ? 'H' : 'F'}
                            </Badge>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {model.age && `${model.age} ans`}
                            {model.height && ` • ${model.height}cm`}
                            {model.instagram && ` • @${model.instagram}`}
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    {filteredModels.length > 8 && (
                      <div className="text-center text-sm text-muted-foreground py-2">
                        +{filteredModels.length - 8} autres mannequins...
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    {searchQuery ? "Aucun mannequin trouvé" : "Aucun mannequin dans votre base"}
                  </div>
                )}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de création de mannequin */}
      <AddModelModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onModelAdded={handleModelCreated}
        appointmentData={appointmentData}
      />
    </>
  );
} 