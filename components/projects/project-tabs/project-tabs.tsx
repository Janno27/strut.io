"use client";

import { useState, useEffect } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth/auth-provider";
import { createClient } from "@/lib/supabase/client";
import { ClientSelector } from "./client-selector";
import { ClientDialog } from "./client-dialog";
import { ProjectDialog } from "./project-dialog";
import { ProjectEditDialog } from "./project-edit-dialog";
import { Plus, MoreHorizontal, Pencil, Trash } from "lucide-react";
import { PackageTable } from "../package-table";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";

export function ProjectTabs() {
  const [clients, setClients] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [selectedClient, setSelectedClient] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isClientDialogOpen, setIsClientDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [hoveredTab, setHoveredTab] = useState<string | null>(null);
  const [editingProject, setEditingProject] = useState({
    id: "",
    name: "",
    description: "",
    clientId: "",
  });
  const [newProject, setNewProject] = useState({
    name: "",
    description: "",
    clientId: "",
  });
  const [newClient, setNewClient] = useState({
    name: "",
    contact: "",
    email: "",
    phone: "",
  });
  
  const { user } = useAuth();
  const supabase = createClient();

  // Charger les clients et projets
  const loadData = async () => {
    if (!user) return;
    
    setIsLoading(true);
    
    try {
      // Charger les clients de l'agent
      const { data: clientsData, error: clientsError } = await supabase
        .from('clients')
        .select('*')
        .order('name');
        
      if (clientsError) throw clientsError;
      
      if (clientsData && clientsData.length > 0) {
        setClients(clientsData);
        setSelectedClient({ id: 'all', name: 'Tous les clients' });
        
        // Charger les projets
        const { data: projectsData, error: projectsError } = await supabase
          .from('projects')
          .select(`
            *,
            clients (
              id,
              name
            )
          `)
          .order('updated_at', { ascending: false });
          
        if (projectsError) throw projectsError;
        
        if (projectsData && projectsData.length > 0) {
          setProjects(projectsData);
          setActiveTab(projectsData[0].id);
        }
      } else {
        setClients([]);
        setSelectedClient({ id: 'all', name: 'Tous les clients' });
      }
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    loadData();
  }, [user, supabase]);

  // Gérer la création d'un nouveau projet
  const handleCreateProject = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    
    if (!newProject.name) {
      console.log("Nom du projet manquant", { newProject });
      return;
    }
    
    if (!newProject.clientId) {
      console.log("Client non sélectionné", { newProject });
      return;
    }
    
    try {
      console.log("Création du projet", { newProject });
      
      const { data, error } = await supabase
        .from('projects')
        .insert({
          name: newProject.name,
          description: newProject.description,
          status: 'draft',
          client_id: newProject.clientId
        })
        .select();
        
      if (error) {
        console.error("Erreur Supabase:", error);
        throw error;
      }
      
      if (data) {
        console.log("Projet créé avec succès:", data);
        
        // Recharger les projets
        const { data: projectsData, error: projectsError } = await supabase
          .from('projects')
          .select(`
            *,
            clients (
              id,
              name
            )
          `)
          .order('updated_at', { ascending: false });
          
        if (projectsError) throw projectsError;
        
        if (projectsData) {
          setProjects(projectsData);
          setActiveTab(data[0].id);
        }
      }
      
      // Réinitialiser le formulaire
      setNewProject({
        name: "",
        description: "",
        clientId: "",
      });
      
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Erreur lors de la création du projet:', error);
    }
  };
  
  // Gérer la mise à jour d'un projet
  const handleUpdateProject = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    
    if (!editingProject.name) {
      console.log("Nom du projet manquant", { editingProject });
      return;
    }
    
    if (!editingProject.clientId) {
      console.log("Client non sélectionné", { editingProject });
      return;
    }
    
    try {
      console.log("Mise à jour du projet", { editingProject });
      
      const { data, error } = await supabase
        .from('projects')
        .update({
          name: editingProject.name,
          description: editingProject.description,
          client_id: editingProject.clientId
        })
        .eq('id', editingProject.id)
        .select();
        
      if (error) {
        console.error("Erreur Supabase:", error);
        throw error;
      }
      
      if (data) {
        console.log("Projet mis à jour avec succès:", data);
        
        // Recharger les projets
        loadData();
      }
      
      setIsEditDialogOpen(false);
    } catch (error) {
      console.error('Erreur lors de la mise à jour du projet:', error);
    }
  };
  
  // Gérer la suppression d'un projet
  const handleDeleteProject = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    
    if (!editingProject.id) return;
    
    try {
      console.log("Suppression du projet", { projectId: editingProject.id });
      
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', editingProject.id);
        
      if (error) {
        console.error("Erreur Supabase:", error);
        throw error;
      }
      
      console.log("Projet supprimé avec succès");
      
      // Recharger les projets
      loadData();
      
      setIsEditDialogOpen(false);
    } catch (error) {
      console.error('Erreur lors de la suppression du projet:', error);
    }
  };
  
  // Gérer la création d'un nouveau client
  const handleCreateClient = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    
    if (!newClient.name) {
      console.log("Nom du client manquant", { newClient });
      return;
    }
    
    if (!user) {
      console.log("Utilisateur non connecté");
      return;
    }
    
    try {
      console.log("Création du client", { newClient });
      
      const { data, error } = await supabase
        .from('clients')
        .insert({
          name: newClient.name,
          contact_name: newClient.contact,
          email: newClient.email,
          phone: newClient.phone,
          agent_id: user.id
        })
        .select();
        
      if (error) {
        console.error("Erreur Supabase:", error);
        throw error;
      }
      
      if (data) {
        console.log("Client créé avec succès:", data);
        
        // Ajouter le nouveau client à la liste et le sélectionner
        setClients(prev => [...prev, data[0]]);
        setSelectedClient(data[0]);
        
        // Mettre à jour l'ID du client dans le formulaire de projet
        setNewProject(prev => ({
          ...prev,
          clientId: data[0].id
        }));
      }
      
      // Réinitialiser le formulaire
      setNewClient({
        name: "",
        contact: "",
        email: "",
        phone: "",
      });
      
      setIsClientDialogOpen(false);
    } catch (error) {
      console.error('Erreur lors de la création du client:', error);
    }
  };

  // Ouvrir le dialogue de modification du projet
  const openEditDialog = (project: any) => {
    setEditingProject({
      id: project.id,
      name: project.name,
      description: project.description || "",
      clientId: project.client_id,
    });
    setIsEditDialogOpen(true);
  };

  // Filtrer les projets en fonction du client sélectionné
  const filteredProjects = !selectedClient || selectedClient.id === 'all'
    ? projects
    : projects.filter(project => project.client_id === selectedClient.id);

  return (
    <div>
      <div className="flex gap-6 mb-6">
        <div className="w-[70%]">
          <div className="flex justify-start items-center mb-6">
            <ClientSelector 
              clients={clients}
              selectedClient={selectedClient}
              setSelectedClient={setSelectedClient}
              onNewClient={() => setIsClientDialogOpen(true)}
            />
          </div>

          {isLoading ? (
            <div className="text-center py-8">Chargement des projets...</div>
          ) : projects.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">Aucun projet trouvé.</p>
              <ProjectDialog
                isOpen={isDialogOpen}
                setIsOpen={setIsDialogOpen}
                newProject={newProject}
                setNewProject={setNewProject}
                clients={clients}
                onCreateProject={handleCreateProject}
                onNewClient={() => setIsClientDialogOpen(true)}
              />
              <Button onClick={() => setIsDialogOpen(true)}>
                Créer un nouveau projet
              </Button>
            </div>
          ) : (
            <Tabs 
              value={activeTab} 
              onValueChange={setActiveTab}
              className="w-full"
            >
              <div className="sticky top-0 bg-white dark:bg-black z-10 py-2 border-b border-border/40">
                <div className="flex justify-between items-center">
                  <TabsList className="h-10 overflow-x-auto flex-1 justify-start">
                    {filteredProjects.map(project => (
                      <TabsTrigger 
                        key={project.id} 
                        value={project.id}
                        className="px-4 group relative"
                        onMouseEnter={() => setHoveredTab(project.id)}
                        onMouseLeave={() => setHoveredTab(null)}
                      >
                        {project.name}
                        {hoveredTab === project.id && (
                          <div className="absolute right-0 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100">
                            <Popover>
                              <PopoverTrigger asChild>
                                <div 
                                  className="h-7 w-7 p-0.5 inline-flex items-center justify-center rounded-sm hover:bg-accent cursor-pointer"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                  }}
                                >
                                  <MoreHorizontal className="h-4 w-4" />
                                </div>
                              </PopoverTrigger>
                              <PopoverContent className="w-48 p-2">
                                <div className="flex flex-col space-y-1">
                                  <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    className="justify-start"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      openEditDialog(project);
                                    }}
                                  >
                                    <Pencil className="mr-2 h-4 w-4" />
                                    Modifier
                                  </Button>
                                  <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    className="justify-start text-destructive hover:text-destructive"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setEditingProject({
                                        id: project.id,
                                        name: project.name,
                                        description: project.description || "",
                                        clientId: project.client_id,
                                      });
                                      handleDeleteProject(e);
                                    }}
                                  >
                                    <Trash className="mr-2 h-4 w-4" />
                                    Supprimer
                                  </Button>
                                </div>
                              </PopoverContent>
                            </Popover>
                          </div>
                        )}
                      </TabsTrigger>
                    ))}
                    <TabsTrigger 
                      value="new-project"
                      className="px-2 flex-shrink-0 text-primary"
                      onClick={() => setIsDialogOpen(true)}
                    >
                      <Plus className="h-4 w-4" />
                    </TabsTrigger>
                  </TabsList>
                  
                  <ProjectDialog
                    isOpen={isDialogOpen}
                    setIsOpen={setIsDialogOpen}
                    newProject={newProject}
                    setNewProject={setNewProject}
                    clients={clients}
                    onCreateProject={handleCreateProject}
                    onNewClient={() => setIsClientDialogOpen(true)}
                  />
                </div>
              </div>
            </Tabs>
          )}
        </div>
        
        <div className="flex-1 flex justify-end items-end">
          {activeTab && activeTab !== "new-project" && (
            <div className="sticky bottom-2 z-10">
              <div id="new-package-button-container" />
            </div>
          )}
        </div>
      </div>

      <ClientDialog
        isOpen={isClientDialogOpen}
        setIsOpen={setIsClientDialogOpen}
        newClient={newClient}
        setNewClient={setNewClient}
        onCreateClient={handleCreateClient}
      />

      <ProjectEditDialog
        isOpen={isEditDialogOpen}
        setIsOpen={setIsEditDialogOpen}
        project={editingProject}
        setProject={setEditingProject}
        clients={clients}
        onUpdateProject={handleUpdateProject}
        onDeleteProject={handleDeleteProject}
      />

      {!isLoading && projects.length > 0 && (
        <div className="w-full">
          <Tabs 
            value={activeTab} 
            onValueChange={setActiveTab}
            className="w-full"
          >
            {filteredProjects.map(project => (
              <TabsContent 
                key={project.id} 
                value={project.id}
                className="mt-0"
              >
                <PackageTable projectId={project.id} />
              </TabsContent>
            ))}
          </Tabs>
        </div>
      )}
    </div>
  );
} 