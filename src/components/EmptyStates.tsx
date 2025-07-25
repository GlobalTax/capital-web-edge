import React from 'react';
import { AlertCircle, FileX, Users, Mail, Search, Wifi } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EmptyStateProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export const EmptyState = ({ title, description, icon, action }: EmptyStateProps) => (
  <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
    <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-6">
      {icon || <FileX className="w-8 h-8 text-muted-foreground" />}
    </div>
    <h3 className="text-xl font-semibold text-foreground mb-2">{title}</h3>
    <p className="text-muted-foreground max-w-md mb-6">{description}</p>
    {action && (
      <Button onClick={action.onClick} variant="outline">
        {action.label}
      </Button>
    )}
  </div>
);

export const NoResultsState = ({ onReset }: { onReset: () => void }) => (
  <EmptyState
    icon={<Search className="w-8 h-8 text-muted-foreground" />}
    title="Sin resultados"
    description="No se encontraron resultados que coincidan con tu búsqueda. Intenta con términos diferentes."
    action={{
      label: "Limpiar filtros",
      onClick: onReset
    }}
  />
);

export const NoDataState = ({ onRetry }: { onRetry: () => void }) => (
  <EmptyState
    icon={<FileX className="w-8 h-8 text-muted-foreground" />}
    title="No hay datos disponibles"
    description="Aún no hay información para mostrar. Los datos aparecerán aquí una vez que estén disponibles."
    action={{
      label: "Actualizar",
      onClick: onRetry
    }}
  />
);

export const ErrorState = ({ onRetry }: { onRetry: () => void }) => (
  <EmptyState
    icon={<AlertCircle className="w-8 h-8 text-destructive" />}
    title="Error al cargar los datos"
    description="Ha ocurrido un problema al cargar la información. Por favor, inténtalo de nuevo."
    action={{
      label: "Reintentar",
      onClick: onRetry
    }}
  />
);

export const OfflineState = ({ onRetry }: { onRetry: () => void }) => (
  <EmptyState
    icon={<Wifi className="w-8 h-8 text-muted-foreground" />}
    title="Sin conexión"
    description="Parece que no tienes conexión a internet. Verifica tu conexión e inténtalo de nuevo."
    action={{
      label: "Reintentar",
      onClick: onRetry
    }}
  />
);

export const NoTeamMembersState = () => (
  <EmptyState
    icon={<Users className="w-8 h-8 text-muted-foreground" />}
    title="Equipo en construcción"
    description="Estamos trabajando en presentar a nuestro increíble equipo. ¡Pronto tendrás más información!"
  />
);

export const NoContactsState = () => (
  <EmptyState
    icon={<Mail className="w-8 h-8 text-muted-foreground" />}
    title="Buzón vacío"
    description="No has recibido ningún mensaje de contacto aún. Cuando lleguen, aparecerán aquí."
  />
);