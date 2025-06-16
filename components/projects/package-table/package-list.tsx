'use client';

import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Trash2, Edit, MoreVertical, Link as LinkIcon, Copy } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import { ImageGroupsSelector } from './image-groups-selector';

interface Model {
  id: string;
  first_name: string;
  last_name: string;
  gender: 'male' | 'female';
  height: number;
  bust: number;
  waist: number;
  hips: number;
  shared_image_groups?: string[];
}

interface Package {
  package_id: string;
  package_name: string;
  package_description?: string;
  package_status: string;
}

interface PackageListProps {
  packages: Package[];
  onDeletePackage?: (packageId: string) => void;
  onEditPackage?: (packageId: string) => void;
  onSharePackage?: (packageId: string) => void;
  onDuplicatePackage?: (packageId: string) => void;
  onUpdate?: () => void;
}

export function PackageList({ packages, onDeletePackage, onEditPackage, onSharePackage, onDuplicatePackage, onUpdate }: PackageListProps) {
  const [packageModels, setPackageModels] = useState<{ [key: string]: Model[] }>({});
  const [isLoading, setIsLoading] = useState<{ [key: string]: boolean }>({});
  const supabase = createClient();

  // Charger les mannequins pour chaque package
  useEffect(() => {
    async function loadPackageModels(packageId: string) {
      setIsLoading(prev => ({ ...prev, [packageId]: true }));

      try {
        const { data, error } = await supabase
          .rpc('get_package_models_with_groups', { package_uuid: packageId });

        if (error) throw error;

        setPackageModels(prev => ({
          ...prev,
          [packageId]: data || []
        }));
      } catch (error) {
        console.error(`Erreur lors du chargement des mannequins pour le package ${packageId}:`, error);
      } finally {
        setIsLoading(prev => ({ ...prev, [packageId]: false }));
      }
    }

    // Charger les mannequins pour chaque package
    packages.forEach(pkg => {
      loadPackageModels(pkg.package_id);
    });
  }, [packages, supabase]);

  // Obtenir la couleur du badge selon le statut
  const getStatusColor = (status: string) => {
    const statusMap: Record<string, string> = {
      pending: "gray",
      planned: "yellow",
      in_progress: "blue",
      completed: "green",
      cancelled: "red"
    };

    return statusMap[status] || "gray";
  };

  // Traduire le statut en français
  const translateStatus = (status: string) => {
    const translations: Record<string, string> = {
      pending: "En attente",
      planned: "Planifié",
      in_progress: "En cours",
      completed: "Terminé",
      cancelled: "Annulé"
    };

    return translations[status] || status;
  };

  if (packages.length === 0) {
    return (
      <div className="text-center text-muted-foreground py-8">
        Aucun package pour ce projet. Cliquez sur "Nouveau package" pour en créer un.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {packages.map((pkg) => (
        <div key={pkg.package_id} className="space-y-3">
          {/* En-tête avec titre, statut et menu */}
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <h3 className="text-lg font-medium">{pkg.package_name}</h3>
                <Badge variant="secondary" className={`bg-${getStatusColor(pkg.package_status)}-100 text-${getStatusColor(pkg.package_status)}-800`}>
                  {translateStatus(pkg.package_status)}
                </Badge>
              </div>
              {pkg.package_description && (
                <p className="text-sm text-muted-foreground">
                  {pkg.package_description}
                </p>
              )}
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onSharePackage?.(pkg.package_id)}>
                  <LinkIcon className="mr-2 h-4 w-4" />
                  Partager
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onDuplicatePackage?.(pkg.package_id)}>
                  <Copy className="mr-2 h-4 w-4" />
                  Itérer
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onEditPackage?.(pkg.package_id)}>
                  <Edit className="mr-2 h-4 w-4" />
                  Modifier
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={() => onDeletePackage?.(pkg.package_id)}
                  className="text-destructive"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Supprimer
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Table avec bordure */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nom</TableHead>
                  <TableHead>Genre</TableHead>
                  <TableHead>Mensurations</TableHead>
                  <TableHead className="w-12">Groupes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading[pkg.package_id] ? (
                  <TableRow key={`loading-${pkg.package_id}`}>
                    <TableCell colSpan={4} className="text-center">
                      Chargement des mannequins...
                    </TableCell>
                  </TableRow>
                ) : packageModels[pkg.package_id]?.length ? (
                  packageModels[pkg.package_id].map((model, index) => (
                    <TableRow key={`model-${pkg.package_id}-${index}-${model.id || 'undefined'}`}>
                      <TableCell>
                        {model.first_name} {model.last_name}
                      </TableCell>
                      <TableCell>
                        {model.gender === 'male' ? 'Homme' : 'Femme'}
                      </TableCell>
                      <TableCell>
                        {model.height}cm, {model.bust}-{model.waist}-{model.hips}
                      </TableCell>
                      <TableCell>
                        <ImageGroupsSelector
                          packageId={pkg.package_id}
                          modelId={model.id}
                          modelName={`${model.first_name} ${model.last_name}`}
                          currentSharedGroups={model.shared_image_groups}
                          onUpdate={onUpdate}
                        />
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow key={`empty-${pkg.package_id}`}>
                    <TableCell colSpan={4} className="text-center text-muted-foreground">
                      Aucun mannequin sélectionné pour ce package.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      ))}
    </div>
  );
}