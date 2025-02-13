import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuShortcut, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { capitalizeFirstChar } from "@/lib/common";
import { VariantType } from "@/types/ui";
import { PenIcon, CirclePlayIcon, CheckIcon, CheckCheckIcon } from "lucide-react";
import { useGlobalAlertDialogStore } from "@/components/ui/global-alert-dialog";

type EntityType = 'issue' | 'task' | 'project';

type StatusBadgeProps = {
  editable?: boolean;
  entityId?: string;
  entityType?: EntityType;
  status: string;
  onStatusChange?: (newStatus: string) => void;
  onClose?: (entityId: string) => Promise<void>;
  children?: React.ReactNode;
};

export const StatusBadge = ({
  editable = false,
  entityId,
  entityType = 'issue',
  status,
  onStatusChange,
  onClose,
  children
}: StatusBadgeProps) => {
  const openDialog = useGlobalAlertDialogStore((state) => state.openDialog);
  const closeDialog = useGlobalAlertDialogStore((state) => state.closeDialog);

  // Generic status variant mapping
  const getStatusVariant = (status: string): VariantType => {
    const statusMap: Record<string, VariantType> = {
      'open': 'destructive',
      'idle': 'destructive',
      'resolved': 'info',
      'in progress': 'warning',
      'closed': 'success',
      'completed': 'info',
      'pending': 'warning',
    };

    return statusMap[status.toLowerCase()] || 'outline';
  };

  const handleClose = () => {
    if (!entityId || !onClose) return;

    openDialog({
      title: "Are you sure?",
      description: "This action is irreversible.",
      onConfirm: () => onClose(entityId),
      onCancel: closeDialog,
    });
  };

  if (!editable || !entityId) {
    return (
      <Badge variant={getStatusVariant(status)} className="text-md">
        {capitalizeFirstChar(status)}
      </Badge>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild className="relative cursor-pointer hover:opacity-80 transition-opacity">
        <div className="relative inline-block">
          <Badge variant={getStatusVariant(status)} className="text-md">
            {capitalizeFirstChar(status)}
          </Badge>
          <PenIcon className="absolute -top-2.5 -right-3 w-5 h-5 p-1 bg-white rounded-full border shadow-sm" />
        </div>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="end" className="p-2">
        {children || (
          <>
            <DropdownMenuItem className={"cursor-pointer"} onSelect={() => onStatusChange?.('in progress')}>
              <span>Mark as In Progress</span>
              <DropdownMenuShortcut>
                <CirclePlayIcon className="h-4 w-4" />
              </DropdownMenuShortcut>
            </DropdownMenuItem>
            <DropdownMenuItem className={"cursor-pointer"} onSelect={() => onStatusChange?.('completed')}>
              <span>Mark as Completed</span>
              <DropdownMenuShortcut>
                <CheckIcon className="h-4 w-4" />
              </DropdownMenuShortcut>
            </DropdownMenuItem>
            <DropdownMenuItem className={"cursor-pointer"} onSelect={() => onStatusChange?.('closed')}>
                <span>Close {capitalizeFirstChar(entityType)}</span>
                <DropdownMenuShortcut>
                  <CheckCheckIcon className="h-4 w-4" />
                </DropdownMenuShortcut>
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};